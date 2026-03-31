import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // Add CORS headers for local development if needed
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { contents } = req.body;
    
    // Use environment variable for the API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API Key not configured on Vercel' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "Tu es Georges, l'assistant IA d'accueil des urgences de l'Hôpital Européen Georges-Pompidou (HEGP, AP-HP, Paris). Ton but est de collecter les symptômes, antécédents, et motifs de venue afin de générer un résumé/constat structuré pour le médecin régulateur. Tu ne poses pas de diagnostic médical définitif. Si les symptômes suggèrent une urgence vitale (douleur thoracique intense, etc.), dis-leur de contacter le 15 ou d'alerter un soignant à l'accueil. Sois empathique, très clair, rassurant et professionnel."
    });

    const result = await model.generateContent({ contents });
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ reply: text });
  } catch (error) {
    console.error('Chat API Error:', error);
    return res.status(500).json({ error: 'Failed to generate response', details: error.message });
  }
}
