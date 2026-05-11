import * as SQLite from 'expo-sqlite';

let db = null;

const getDb = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('aisolutions.db');
    await db.execAsync('PRAGMA journal_mode = WAL;');
  }
  return db;
};

// ========================
// DATABASE INITIALIZATION
// ========================
export const initDatabase = async () => {
  const database = await getDb();

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT DEFAULT '',
      company TEXT DEFAULT '',
      country TEXT DEFAULT '',
      date_of_birth TEXT DEFAULT '',
      gender TEXT DEFAULT '',
      profile_image TEXT DEFAULT '',
      role TEXT NOT NULL DEFAULT 'customer',
      is_verified INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      price REAL DEFAULT 0,
      description TEXT DEFAULT '',
      image_uri TEXT DEFAULT '',
      category TEXT DEFAULT 'Product', -- Product, Software
      testing_slots TEXT DEFAULT '',
      viewing_slots TEXT DEFAULT '',
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS demos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      demo_type TEXT DEFAULT '',
      date_time TEXT NOT NULL,
      location TEXT DEFAULT '',
      description TEXT DEFAULT '',
      image_uri TEXT DEFAULT '',
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      event_type TEXT DEFAULT '',
      date_time TEXT NOT NULL,
      location TEXT DEFAULT '',
      description TEXT DEFAULT '',
      image_uri TEXT DEFAULT '',
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT NOT NULL,
      item_id INTEGER NOT NULL,
      item_type TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT NOT NULL,
      item_id INTEGER NOT NULL,
      item_type TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT NOT NULL,
      user_name TEXT DEFAULT '',
      message TEXT NOT NULL,
      item_id INTEGER,
      item_type TEXT DEFAULT '',
      status TEXT DEFAULT 'open',
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT NOT NULL,
      user_name TEXT DEFAULT '',
      rating INTEGER NOT NULL DEFAULT 0,
      comment TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT NOT NULL,
      sender TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS login_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT NOT NULL,
      user_name TEXT DEFAULT '',
      logged_in_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      data TEXT DEFAULT '',
      response_time_ms INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS escalations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      assigned_to TEXT DEFAULT NULL,
      customer_unread INTEGER DEFAULT 0,
      sales_unread INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );
  `);

  // Migrations for existing tables
  // Migration logic (Individual try-catches are safer for SQLite)
  const addCol = async (table, col, type, def) => {
    try { await database.execAsync(`ALTER TABLE ${table} ADD COLUMN ${col} ${type} DEFAULT ${def};`); } catch (e) {}
  };

  await addCol('products', 'category', 'TEXT', "'Product'");
  await addCol('products', 'testing_slots', 'TEXT', "''");
  await addCol('products', 'viewing_slots', 'TEXT', "''");
  await addCol('products', 'image_uri', 'TEXT', "''");
  await addCol('products', 'price', 'REAL', '0');

  await addCol('demos', 'image_uri', 'TEXT', "''");
  await addCol('demos', 'price', 'REAL', '0');

  await addCol('events', 'image_uri', 'TEXT', "''");
  await addCol('events', 'price', 'REAL', '0');

  await addCol('inquiries', 'escalated_from_ai', 'INTEGER', '0');
  await addCol('inquiries', 'sales_rep_email', 'TEXT', "''");
  await addCol('bookings', 'slot_info', 'TEXT', "''");

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS ai_knowledge (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fact_category TEXT,
      fact_content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return database;
};

// ========================
// USERS
// ========================
export const createUser = async (user) => {
  const database = await getDb();
  try {
    const result = await database.runAsync(
      `INSERT INTO users (name, email, password, phone, company, country, role, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user.name, user.email, user.password, user.phone || '', user.company || '', user.country || '', user.role || 'customer', user.is_verified || 0]
    );
    return { success: true, id: result.lastInsertRowId };
  } catch (e) {
    if (e.message?.includes('UNIQUE constraint')) {
      return { success: false, message: 'Email already exists' };
    }
    console.error('createUser error:', e);
    return { success: false, message: 'Registration failed' };
  }
};

export const getUserByEmail = async (email) => {
  const database = await getDb();
  return await database.getFirstAsync('SELECT * FROM users WHERE email = ?', [email]);
};

export const getUsers = async () => {
  const database = await getDb();
  return await database.getAllAsync('SELECT * FROM users ORDER BY created_at DESC');
};

export const getUsersByRole = async (role) => {
  const database = await getDb();
  return await database.getAllAsync('SELECT * FROM users WHERE role = ? ORDER BY created_at DESC', [role]);
};

export const updateUser = async (email, fields) => {
  const database = await getDb();
  const sets = [];
  const vals = [];
  Object.keys(fields).forEach(key => {
    if (key !== 'email' && key !== 'id') {
      sets.push(`${key} = ?`);
      vals.push(fields[key]);
    }
  });
  if (sets.length === 0) return;
  vals.push(email);
  await database.runAsync(`UPDATE users SET ${sets.join(', ')} WHERE email = ?`, vals);
};

export const deleteUser = async (email) => {
  const database = await getDb();
  await database.runAsync('DELETE FROM users WHERE email = ?', [email]);
};

export const verifyUser = async (email) => {
  const database = await getDb();
  await database.runAsync('UPDATE users SET is_verified = 1 WHERE email = ?', [email]);
};

// ========================
// PRODUCTS
// ========================
export const createProduct = async (product) => {
  const database = await getDb();
  const result = await database.runAsync(
    `INSERT INTO products (title, price, description, image_uri, category, testing_slots, viewing_slots, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [product.title || '', product.price || 0, product.description || '', product.image_uri || '', product.category || 'Product', product.testing_slots || '', product.viewing_slots || '', product.created_by || '']
  );
  return result.lastInsertRowId;
};

export const getProducts = async () => {
  const database = await getDb();
  return await database.getAllAsync('SELECT * FROM products ORDER BY created_at DESC');
};

export const updateProduct = async (id, product) => {
  const database = await getDb();
  await database.runAsync(
    'UPDATE products SET title = ?, description = ?, price = ?, category = ?, image_uri = ?, testing_slots = ?, viewing_slots = ? WHERE id = ?',
    [product.title || '', product.description || '', product.price || 0, product.category || 'Product', product.image_uri || '', product.testing_slots || '', product.viewing_slots || '', id]
  );
};

export const deleteProduct = async (id) => {
  const database = await getDb();
  await database.runAsync('DELETE FROM products WHERE id = ?', [id]);
  await database.runAsync('DELETE FROM bookings WHERE item_id = ? AND item_type = ?', [id, 'product']);
  await database.runAsync('DELETE FROM likes WHERE item_id = ? AND item_type = ?', [id, 'product']);
};

// ========================
// DEMOS
// ========================
export const createDemo = async (demo) => {
  const database = await getDb();
  const result = await database.runAsync(
    `INSERT INTO demos (name, demo_type, date_time, location, description, image_uri, created_by, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [demo.name || '', demo.demo_type || 'Demo', demo.date_time || '', demo.location || '', demo.description || '', demo.image_uri || '', demo.created_by || '', demo.price || 0]
  );
  return result.lastInsertRowId;
};

export const getDemos = async () => {
  const database = await getDb();
  return await database.getAllAsync('SELECT * FROM demos ORDER BY date_time ASC');
};

export const updateDemo = async (id, demo) => {
  const database = await getDb();
  await database.runAsync(
    'UPDATE demos SET name = ?, description = ?, price = ?, demo_type = ?, image_uri = ?, location = ?, date_time = ? WHERE id = ?',
    [demo.name || '', demo.description || '', demo.price || 0, demo.demo_type || 'Demo', demo.image_uri || '', demo.location || '', demo.date_time || '', id]
  );
};

export const deleteDemo = async (id) => {
  const database = await getDb();
  await database.runAsync('DELETE FROM demos WHERE id = ?', [id]);
  await database.runAsync('DELETE FROM bookings WHERE item_id = ? AND item_type = ?', [id, 'demo']);
};

// ========================
// EVENTS
// ========================
export const createEvent = async (event) => {
  const database = await getDb();
  const result = await database.runAsync(
    `INSERT INTO events (name, event_type, date_time, location, description, image_uri, created_by, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [event.name || '', event.event_type || 'Event', event.date_time || '', event.location || '', event.description || '', event.image_uri || '', event.created_by || '', event.price || 0]
  );
  return result.lastInsertRowId;
};

export const getEvents = async () => {
  const database = await getDb();
  return await database.getAllAsync('SELECT * FROM events ORDER BY date_time ASC');
};

export const updateEvent = async (id, event) => {
  const database = await getDb();
  await database.runAsync(
    'UPDATE events SET name = ?, description = ?, price = ?, event_type = ?, image_uri = ?, location = ?, date_time = ? WHERE id = ?',
    [event.name || '', event.description || '', event.price || 0, event.event_type || 'Event', event.image_uri || '', event.location || '', event.date_time || '', id]
  );
};

export const deleteEvent = async (id) => {
  const database = await getDb();
  await database.runAsync('DELETE FROM events WHERE id = ?', [id]);
  await database.runAsync('DELETE FROM bookings WHERE item_id = ? AND item_type = ?', [id, 'event']);
};

// ========================
// BOOKINGS
// ========================
export const addBooking = async (userEmail, itemId, itemType, slotInfo = '') => {
  const database = await getDb();
  const existing = await database.getFirstAsync(
    'SELECT * FROM bookings WHERE user_email = ? AND item_id = ? AND item_type = ?',
    [userEmail, itemId, itemType]
  );
  if (existing) return { success: false, message: 'You have already expressed interest in this.' };
  await database.runAsync(
    'INSERT INTO bookings (user_email, item_id, item_type, slot_info) VALUES (?, ?, ?, ?)',
    [userEmail, itemId, itemType, slotInfo]
  );
  return { success: true, message: 'Interest confirmed! Sales will contact you.' };
};

export const getBookingsForItem = async (itemId, itemType) => {
  const database = await getDb();
  return await database.getAllAsync(
    'SELECT * FROM bookings WHERE item_id = ? AND item_type = ?', [itemId, itemType]
  );
};

export const getUserBookings = async (userEmail) => {
  const database = await getDb();
  return await database.getAllAsync(
    'SELECT * FROM bookings WHERE user_email = ? ORDER BY created_at DESC', [userEmail]
  );
};

export const getBookingCount = async (itemId, itemType) => {
  const database = await getDb();
  const result = await database.getFirstAsync(
    'SELECT COUNT(*) as count FROM bookings WHERE item_id = ? AND item_type = ?', [itemId, itemType]
  );
  return result?.count || 0;
};

export const getTotalBookings = async () => {
  const database = await getDb();
  const result = await database.getFirstAsync('SELECT COUNT(*) as count FROM bookings');
  return result?.count || 0;
};

// ========================
// LIKES
// ========================
export const toggleLike = async (userEmail, itemId, itemType) => {
  const database = await getDb();
  const existing = await database.getFirstAsync(
    'SELECT * FROM likes WHERE user_email = ? AND item_id = ? AND item_type = ?',
    [userEmail, itemId, itemType]
  );
  if (existing) {
    await database.runAsync('DELETE FROM likes WHERE id = ?', [existing.id]);
    return false; // unliked
  } else {
    await database.runAsync(
      'INSERT INTO likes (user_email, item_id, item_type) VALUES (?, ?, ?)',
      [userEmail, itemId, itemType]
    );
    return true; // liked
  }
};

export const getLikesCount = async (itemId, itemType) => {
  const database = await getDb();
  const result = await database.getFirstAsync(
    'SELECT COUNT(*) as count FROM likes WHERE item_id = ? AND item_type = ?', [itemId, itemType]
  );
  return result?.count || 0;
};

export const isLikedByUser = async (userEmail, itemId, itemType) => {
  const database = await getDb();
  const result = await database.getFirstAsync(
    'SELECT * FROM likes WHERE user_email = ? AND item_id = ? AND item_type = ?',
    [userEmail, itemId, itemType]
  );
  return !!result;
};

// ========================
// INQUIRIES
// ========================
export const submitInquiry = async (inquiry) => {
  const database = await getDb();
  await database.runAsync(
    `INSERT INTO inquiries (user_email, user_name, message, item_id, item_type) VALUES (?, ?, ?, ?, ?)`,
    [inquiry.user_email, inquiry.user_name || '', inquiry.message, inquiry.item_id || null, inquiry.item_type || '']
  );
};

export const getInquiries = async () => {
  const database = await getDb();
  return await database.getAllAsync('SELECT * FROM inquiries ORDER BY created_at DESC');
};

export const updateInquiryStatus = async (id, status) => {
  const database = await getDb();
  await database.runAsync('UPDATE inquiries SET status = ? WHERE id = ?', [status, id]);
};

// ========================
// FEEDBACK
// ========================
export const submitFeedback = async (feedback) => {
  const database = await getDb();
  await database.runAsync(
    `INSERT INTO feedback (user_email, user_name, rating, comment) VALUES (?, ?, ?, ?)`,
    [feedback.user_email, feedback.user_name || '', feedback.rating, feedback.comment || '']
  );
};

export const getAllFeedback = async () => {
  const database = await getDb();
  return await database.getAllAsync('SELECT * FROM feedback ORDER BY created_at DESC');
};

export const getAverageRating = async () => {
  const database = await getDb();
  const result = await database.getFirstAsync('SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM feedback');
  return { average: result?.avg_rating ? parseFloat(result.avg_rating).toFixed(1) : '0', count: result?.count || 0 };
};

// ========================
// CHAT HISTORY
// ========================
export const saveChatMessage = async (userEmail, sender, message) => {
  const database = await getDb();
  await database.runAsync(
    'INSERT INTO chat_messages (user_email, sender, message) VALUES (?, ?, ?)',
    [userEmail, sender, message]
  );
};

export const getChatHistory = async (userEmail) => {
  const database = await getDb();
  return await database.getAllAsync(
    'SELECT * FROM chat_messages WHERE user_email = ? ORDER BY created_at ASC', [userEmail]
  );
};

export const getAllChatHistories = async () => {
  const database = await getDb();
  return await database.getAllAsync(
    'SELECT DISTINCT user_email FROM chat_messages ORDER BY user_email'
  );
};

export const getTotalAIResponses = async () => {
  const database = await getDb();
  const result = await database.getFirstAsync("SELECT COUNT(*) as count FROM chat_messages WHERE sender = 'ai'");
  return result?.count || 0;
};

// ========================
// LOGIN HISTORY
// ========================
export const logLogin = async (email, name) => {
  const database = await getDb();
  await database.runAsync(
    'INSERT INTO login_history (user_email, user_name) VALUES (?, ?)',
    [email, name || '']
  );
};

export const getLoginHistory = async () => {
  const database = await getDb();
  return await database.getAllAsync('SELECT * FROM login_history ORDER BY logged_in_at DESC');
};

// ========================
// ANALYTICS
// ========================
export const logAnalytics = async (type, data, responseTimeMs) => {
  const database = await getDb();
  await database.runAsync(
    'INSERT INTO analytics (type, data, response_time_ms) VALUES (?, ?, ?)',
    [type, data || '', responseTimeMs || 0]
  );
};

export const getAnalytics = async () => {
  const database = await getDb();
  return await database.getAllAsync('SELECT * FROM analytics ORDER BY created_at DESC');
};

export const getAvgResponseTime = async () => {
  const database = await getDb();
  const result = await database.getFirstAsync(
    "SELECT AVG(response_time_ms) as avg_ms FROM analytics WHERE type = 'CHAT_SPEED' AND response_time_ms > 0"
  );
  return result?.avg_ms ? (result.avg_ms / 1000).toFixed(2) : '0.00';
};

// ========================
// ESCALATIONS
// ========================
export const createSupportTicket = async (userEmail, userName, message = 'Requested a Live Agent') => {
  const database = await getDb();
  
  // 1. Create Escalation Ticket
  const existingEsc = await database.getFirstAsync(
    "SELECT * FROM escalations WHERE user_email = ? AND status != 'closed'", [userEmail]
  );
  if (!existingEsc) {
    await database.runAsync('INSERT INTO escalations (user_email) VALUES (?)', [userEmail]);
  }

  // 2. Create Enquiry Record for Sales Reps
  await database.runAsync(
    'INSERT INTO inquiries (user_email, user_name, message, item_type) VALUES (?, ?, ?, ?)',
    [userEmail, userName || userEmail, message, 'LIVE_SUPPORT']
  );
};

export const getAllBookings = async () => {
  const database = await getDb();
  return await database.getAllAsync('SELECT * FROM bookings ORDER BY created_at DESC');
};

export const getAvailableTickets = async () => {
  const database = await getDb();
  return await database.getAllAsync(
    "SELECT * FROM escalations WHERE status = 'pending' AND assigned_to IS NULL ORDER BY created_at DESC"
  );
};

export const pickupChat = async (id, repEmail) => {
  const database = await getDb();
  await database.runAsync(
    "UPDATE escalations SET assigned_to = ?, status = 'active' WHERE id = ?",
    [repEmail, id]
  );
};

export const updateUnread = async (userEmail, role, reset = false) => {
  const database = await getDb();
  const col = role === 'sales' ? 'sales_unread' : 'customer_unread';
  if (reset) {
    await database.runAsync(`UPDATE escalations SET ${col} = 0 WHERE user_email = ?`, [userEmail]);
  } else {
    await database.runAsync(`UPDATE escalations SET ${col} = ${col} + 1 WHERE user_email = ?`, [userEmail]);
  }
};

export const isEscalated = async (userEmail) => {
  const database = await getDb();
  const result = await database.getFirstAsync(
    "SELECT * FROM escalations WHERE user_email = ? AND status != 'closed'", [userEmail]
  );
  return result;
};

export const resolveEscalation = async (userEmail) => {
  const database = await getDb();
  await database.runAsync("UPDATE escalations SET status = 'resolved' WHERE user_email = ? AND status = 'pending'", [userEmail]);
};

// ========================
// STATS FOR DASHBOARDS
// ========================
export const getSalesStats = async () => {
  const database = await getDb();
  const eventsRSVP = await database.getFirstAsync("SELECT COUNT(*) as count FROM bookings WHERE item_type = 'event'");
  const demosScheduled = await database.getFirstAsync("SELECT COUNT(*) as count FROM bookings WHERE item_type = 'demo'");
  const productsReserved = await database.getFirstAsync("SELECT COUNT(*) as count FROM bookings WHERE item_type = 'product'");
  const totalProducts = await database.getFirstAsync('SELECT COUNT(*) as count FROM products');
  const totalDemos = await database.getFirstAsync('SELECT COUNT(*) as count FROM demos');
  const totalEvents = await database.getFirstAsync('SELECT COUNT(*) as count FROM events');
  const totalInquiries = await database.getFirstAsync('SELECT COUNT(*) as count FROM inquiries');

  return {
    eventsRSVP: eventsRSVP?.count || 0,
    demosScheduled: demosScheduled?.count || 0,
    productsReserved: productsReserved?.count || 0,
    totalProducts: totalProducts?.count || 0,
    totalDemos: totalDemos?.count || 0,
    totalEvents: totalEvents?.count || 0,
    totalInquiries: totalInquiries?.count || 0,
  };
};

export const getAdminStats = async () => {
  const database = await getDb();
  const totalUsers = await database.getFirstAsync('SELECT COUNT(*) as count FROM users');
  const aiResponses = await getTotalAIResponses();
  const avgResponse = await getAvgResponseTime();
  const feedbackStats = await getAverageRating();

  return {
    totalUsers: totalUsers?.count || 0,
    aiResponses,
    avgResponseTime: avgResponse,
    feedbackAvg: feedbackStats.average,
    feedbackCount: feedbackStats.count,
  };
};

// Weekly booking data for charts
export const getWeeklyBookings = async () => {
  const database = await getDb();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const row = await database.getFirstAsync(
      `SELECT COUNT(*) as count FROM bookings WHERE date(created_at) = date('now', '-${i} days', 'localtime')`
    );
    const dayIndex = new Date(Date.now() - i * 86400000).getDay();
    result.push({ day: days[dayIndex], count: row?.count || 0 });
  }
  return result;
};

// ========================
// UNIFIED FEED & TRENDING
// ========================
export const searchItems = async (queryStr, filter = 'All') => {
  const database = await getDb();
  const searchLower = `%${queryStr.toLowerCase()}%`;
  let results = [];

  const query = (table, typeCol, nameCol) => `
    SELECT id, ${nameCol} as title, description, price, ${typeCol} as category, image_uri, created_at, '${table}' as source_table 
    FROM ${table} 
    WHERE (${nameCol} LIKE ? OR description LIKE ?)
  `;

  if (filter === 'All' || filter === 'Product' || filter === 'Software') {
    let prods = await database.getAllAsync(query('products', 'category', 'title'), [searchLower, searchLower]);
    if (filter !== 'All') prods = prods.filter(p => p.category === filter);
    results = [...results, ...prods];
  }
  
  if (filter === 'All' || filter === 'Demo') {
    const demos = await database.getAllAsync(query('demos', "'Demo'", 'name'), [searchLower, searchLower]);
    results = [...results, ...demos];
  }

  if (filter === 'All' || filter === 'Event') {
    const evts = await database.getAllAsync(query('events', "'Event'", 'name'), [searchLower, searchLower]);
    results = [...results, ...evts];
  }

  return results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

export const getAllItemsBySalesrep = async (email) => {
  const database = await getDb();
  
  const prods = await database.getAllAsync('SELECT id, title, description, price, category, image_uri, created_at, created_by, "product" as type FROM products WHERE created_by = ?', [email]);
  const demos = await database.getAllAsync('SELECT id, name as title, description, price, "Demo" as category, image_uri, created_at, created_by, "demo" as type FROM demos WHERE created_by = ?', [email]);
  const events = await database.getAllAsync('SELECT id, name as title, description, price, "Event" as category, image_uri, created_at, created_by, "event" as type FROM events WHERE created_by = ?', [email]);

  return [...prods, ...demos, ...events].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

export const getTrendingItems = async (createdByEmail = null) => {
  const database = await getDb();
  
  // Calculate a score: likes * 1 + bookings * 2
  const query = (table, nameCol) => `
    SELECT ${table}.id, ${table}.${nameCol} as title, '${table}' as source_table, 
           ${table}.image_uri,
           ((SELECT COUNT(*) FROM likes WHERE item_id = ${table}.id AND item_type = '${table}') * 1 +
            (SELECT COUNT(*) FROM bookings WHERE item_id = ${table}.id AND item_type = '${table}') * 2) as engagement_score
    FROM ${table}
    ${createdByEmail ? `WHERE created_by = '${createdByEmail}'` : `WHERE 1=1`}
    ORDER BY engagement_score DESC
    LIMIT 5
  `;

  const trendingProds = await database.getAllAsync(query('products', 'title'));
  const trendingDemos = await database.getAllAsync(query('demos', 'name'));

  return [...trendingProds, ...trendingDemos].sort((a, b) => b.engagement_score - a.engagement_score).slice(0, 5);
};

export const getBookingsCountForItem = async (itemId, table) => {
  const database = await getDb();
  const row = await database.getFirstAsync(
    'SELECT COUNT(*) as count FROM bookings WHERE item_id = ? AND item_type = ?',
    [itemId, table]
  );
  return row?.count || 0;
};

export const getEscalatedChats = async () => {
  const database = await getDb();
  return await database.getAllAsync('SELECT * FROM escalations ORDER BY created_at DESC');
};

// ========================
// AI LEARNING SYSTEM
// ========================
export const saveFact = async (category, content) => {
  const database = await getDb();
  await database.runAsync(
    'INSERT INTO ai_knowledge (fact_category, fact_content) VALUES (?, ?)',
    [category, content]
  );
};

export const getFacts = async () => {
  const database = await getDb();
  return await database.getAllAsync('SELECT * FROM ai_knowledge ORDER BY created_at DESC');
};

export const deleteFact = async (id) => {
  const database = await getDb();
  await database.runAsync('DELETE FROM ai_knowledge WHERE id = ?', [id]);
};

