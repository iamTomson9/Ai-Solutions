import * as DB from './DatabaseService';

const INTENTS = {
  GREETING: ['hi', 'hello', 'hey', 'greetings', 'yo', 'sup'],
  CONFIRM: ['yes', 'yeah', 'sure', 'ok', 'okay', 'yep', 'proceed', 'book', 'reserve', 'schedule'],
  NEGATE: ['no', 'nope', 'cancel', 'stop', 'dont'],
  DEMO: ['demo', 'walkthrough', 'schedule', 'time', 'slot', 'viewing'],
  PRODUCT: ['product', 'software', 'app', 'tool', 'solution'],
  PRICE: ['price', 'cost', 'pula', 'much', 'pay'],
  HUMAN: ['human', 'sales', 'rep', 'person', 'agent', 'help']
};

export const LocalAIService = {
  processMessage: async (userText, history = []) => {
    const text = userText.toLowerCase();
    const tokens = text.replace(/[^\w\s]/gi, '').split(/\s+/);
    
    // Get last AI message for context
    const lastAImsg = history.filter(m => m.sender === 'ai').slice(-1)[0]?.message?.toLowerCase() || '';
    
    // Context Detection
    const wasDiscussingDemos = lastAImsg.includes('demo') || lastAImsg.includes('schedule');
    const wasDiscussingProducts = lastAImsg.includes('product') || lastAImsg.includes('innovation');

    // Score Intents
    const scores = { GREETING: 0, CONFIRM: 0, NEGATE: 0, DEMO: 0, PRODUCT: 0, PRICE: 0, HUMAN: 0 };
    tokens.forEach(token => {
      Object.keys(INTENTS).forEach(intent => {
        if (INTENTS[intent].some(kw => token.includes(kw) || kw.includes(token) && token.length > 2)) {
          scores[intent] += 1;
        }
      });
    });

    const topIntent = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    const topScore = scores[topIntent];

    // --- CONTEXTUAL LOGIC (The "Memory" Brain) ---
    
    // 1. Handling "Yes" or "Confirm" based on context
    if (topIntent === 'CONFIRM' || (text.includes('yes') && topScore < 2)) {
      if (wasDiscussingDemos) {
        return "Excellent choice. I am preparing your demo reservation in our local registry. Would you like me to notify a Sales Representative to confirm your specific slot?";
      }
      if (wasDiscussingProducts) {
        return "Understood. I've marked your interest in these solutions. Shall I provide the full technical specifications or the pricing breakdown?";
      }
      return "I've noted your confirmation. What would you like to proceed with exactly?";
    }

    if (topIntent === 'NEGATE') {
      return "No problem at all. I've cleared that from our current focus. What else can I help you discover in our innovation vault?";
    }

    // 2. Handling "Price" based on context
    if (topIntent === 'PRICE' || (text.includes('how much') && (wasDiscussingProducts || wasDiscussingDemos))) {
      const products = await DB.getProducts();
      let res = "Based on our previous topic, here is the pricing overview:\n\n";
      products.slice(0, 3).forEach(p => {
        res += `• **${p.title}**: P${p.price}\n`;
      });
      return res;
    }

    // --- Standard Intent Logic ---
    if (topIntent === 'GREETING') {
      return "Hello again! I'm keeping track of our session. We can continue exploring our Demos and Products, or I can answer any specific questions you have.";
    }

    if (topIntent === 'HUMAN') {
      return "I understand. Sometimes a human touch is best. I am escalating this conversation to our Sales team right now. [TRANSFER_TO_HUMAN]";
    }

    if (topIntent === 'DEMO') {
      const demos = await DB.getDemos();
      let res = "I've pulled the latest schedules. Here are the Demos we can discuss:\n\n";
      demos.slice(0, 3).forEach(d => {
        res += `• **${d.name}** (${d.date_time})\n`;
      });
      res += "\nDoes one of these look like something you'd like to book?";
      return res;
    }

    if (topIntent === 'PRODUCT') {
      const products = await DB.getProducts();
      let res = "Our local vault contains these top-tier solutions:\n\n";
      products.slice(0, 3).forEach(p => {
        res += `• **${p.title}**\n`;
      });
      res += "\nWould you like to see the pricing or book a demo for one of these?";
      return res;
    }

    return "I'm following along, but I need a bit more detail to complete that task. Are we looking to **book** a demo or get **pricing** for a product?";
  }
};
