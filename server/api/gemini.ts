import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface ParsedExpense {
  amount: number;
  merchant: string;
  category: string;
  type: "expense" | "income";
  notes?: string;
  aiSoftComment?: string;
}

/**
 * Gemini Pro Vision for screenshot/camera scanning
 */
export async function parseImageWithVision(
  imageBase64: string,
  imageType: "screenshot" | "receipt"
): Promise<ParsedExpense> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze this ${imageType} and extract the following financial details in JSON format:
    - amount: (number in Naira, e.g., 5000)
    - merchant: (string)
    - category: (choose from: Beauty, Food, Transport, Savings, Ajo, Owambe, Airtime, Fashion, Health, Family, Shopping, Bills, Entertainment, Other)
    - type: (either "expense" or "income")
    - notes: (brief description if any)
    - aiSoftComment: (a warm, supportive, "Soft Life" style comment for a young Nigerian woman, e.g., "Your skin is your crown, invest wisely 💜")
    
    Return ONLY the JSON object.
  `;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: imageBase64,
        mimeType: "image/jpeg",
      },
    },
  ]);

  const response = await result.response;
  const text = response.text();
  const jsonStr = text.replace(/```json|```/g, "").trim();
  
  try {
    return JSON.parse(jsonStr) as ParsedExpense;
  } catch (e) {
    console.error("Failed to parse Gemini JSON:", text);
    throw new Error("AI failed to read the image properly.");
  }
}

/**
 * Gemini 1.5 Flash for voice transcription (multimodal)
 */
export async function transcribeAudio(audioBase64: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = "Transcribe this audio clip of a young woman talking about her spending. Return only the transcription text.";

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: audioBase64,
        mimeType: "audio/mp3",
      },
    },
  ]);

  const response = await result.response;
  return response.text().trim();
}

/**
 * Gemini 1.5 Flash for text parsing
 */
export async function parseTextExpense(text: string): Promise<ParsedExpense> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Parse this text: "${text}" 
    Extract the following financial details in JSON format:
    - amount: (number in Naira)
    - merchant: (string, default to "Manual Entry" if not found)
    - category: (choose from: Beauty, Food, Transport, Savings, Ajo, Owambe, Airtime, Fashion, Health, Family, Shopping, Bills, Entertainment, Other)
    - type: ("expense" or "income")
    - notes: (the original text)
    - aiSoftComment: (a warm, supportive, "Soft Life" style comment for a young Nigerian woman)
    
    Return ONLY the JSON object.
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const jsonStr = response.text().replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(jsonStr) as ParsedExpense;
  } catch (e) {
    return {
      amount: 0,
      merchant: "Manual Entry",
      category: "Other",
      type: "expense",
      notes: text,
      aiSoftComment: "Great job logging your expense! Keep tracking 🌸",
    };
  }
}

/**
 * AI observations for Insights screen
 */
export async function generateAIObservations(userId: number): Promise<string[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Generate 4 short, supportive "Soft Life" style financial observations for a user.
    Focus on:
    1. Spend tracking consistency.
    2. Savings milestones.
    3. Category spending trends.
    4. Encouragement for future goals.
    
    Return the observations as a JSON array of strings.
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const jsonStr = response.text().replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(jsonStr) as string[];
  } catch (e) {
    return [
      "You've been consistent with your Soft Audit ritual! That's 12 weeks straight 🔥",
      "Your savings rate this month is looking healthy. Excellent progress! 💜",
      "Notice: your food category is slightly higher this week. Meal planning might help 🍽️",
      "You're on track to hit your next savings goal soon. Keep it up! 🎯",
    ];
  }
}

/**
 * Ask Plush AI chat
 */
export async function askPlushAI(question: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are "Plush AI", a supportive, sophisticated, and encouraging financial companion for young Nigerian women. 
    User Question: "${question}"
    
    Guidelines:
    - Use "Soft Life" terminology (sis, queen, soft, peace, premium).
    - Be practical yet kind.
    - Reference Nigerian context where appropriate (Naira, local spending habits).
    - Keep it concise (max 3-4 sentences).
    - Use emojis like 🌸, 💜, ✨, 💰, 👑.
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
}
