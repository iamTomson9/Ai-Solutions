import { GoogleGenerativeAI } from '@google/generative-ai';
import * as DB from './DatabaseService';

const API_KEY = 'AIzaSyA_USijCUaJeFUfp5DLCwBvw3D8aMMfJKE';
const genAI = new GoogleGenerativeAI(API_KEY);

export const GeminiService = {
  getChatSession: async (userEmail) => {
    try {
      const products = await DB.getProducts();
      const demos = await DB.getDemos();
      const facts = await DB.getFacts();

      const context = `You are the AI-Solution Assistant. 
User: ${userEmail}
Inventory: ${products.slice(0, 5).map(p => p.title).join(', ')}
Demos: ${demos.slice(0, 3).map(d => d.name).join(', ')}
Rules: ${facts.map(f => f.fact_content).join(' ')}`;

      // Switching back to 1.5-Flash for higher quota stability
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: {
          parts: [{ text: context }],
        }
      });

      return model.startChat({
        history: [],
        generationConfig: { maxOutputTokens: 800 },
      });
    } catch (e) {
      console.error("Gemini Failover Error:", e);
      // Final stable fallback
      const stable = genAI.getGenerativeModel({ model: "gemini-pro" });
      return stable.startChat({ history: [] });
    }
  }
};
