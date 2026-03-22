/**
 * OpenAI API Integration (Mock Implementation)
 * Replace with real API calls when you have an OpenAI API key
 */

export interface ParsedExpense {
  amount: number;
  merchant: string;
  category: string;
  type: "expense" | "income";
  notes?: string;
  aiSoftComment?: string;
}

/**
 * Mock GPT-4o Vision for screenshot/camera scanning
 * In production: Send image to OpenAI Vision API
 */
export async function parseImageWithVision(
  imageBase64: string,
  imageType: "screenshot" | "receipt"
): Promise<ParsedExpense> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock responses based on image type
  if (imageType === "receipt") {
    return {
      amount: 8500,
      merchant: "Shoprite Supermarket",
      category: "groceries",
      type: "expense",
      notes: "Weekly groceries",
      aiSoftComment: "You're doing great on your grocery budget! 🌸",
    };
  }

  // Screenshot mock
  return {
    amount: 2500,
    merchant: "Uber",
    category: "transportation",
    type: "expense",
    notes: "Ride to office",
    aiSoftComment: "Consider carpooling next time to save more 💜",
  };
}

/**
 * Mock Whisper API for voice transcription
 * In production: Send audio to OpenAI Whisper API
 */
export async function transcribeAudio(audioBase64: string): Promise<string> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Mock transcriptions
  const mockTranscriptions = [
    "Spent five thousand naira on lunch at Lekki",
    "Paid two thousand for transport to the office",
    "Bought groceries for eight thousand five hundred naira",
    "Spent three thousand on coffee and snacks",
  ];

  return mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
}

/**
 * Mock GPT-4o for text parsing
 * In production: Send text to OpenAI GPT-4o API
 */
export async function parseTextExpense(text: string): Promise<ParsedExpense> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Simple mock parsing logic
  const amountMatch = text.match(/(\d+(?:,\d{3})*(?:\.\d{2})?)/);
  const amount = amountMatch ? parseInt(amountMatch[1].replace(/,/g, "")) * 100 : 5000; // in kobo

  let category = "other";
  const lowerText = text.toLowerCase();
  if (lowerText.includes("food") || lowerText.includes("eat") || lowerText.includes("lunch"))
    category = "food";
  if (lowerText.includes("transport") || lowerText.includes("uber") || lowerText.includes("taxi"))
    category = "transportation";
  if (lowerText.includes("shop") || lowerText.includes("buy") || lowerText.includes("store"))
    category = "shopping";
  if (lowerText.includes("bill") || lowerText.includes("utility"))
    category = "utilities";

  return {
    amount,
    merchant: "Manual Entry",
    category,
    type: "expense",
    notes: text,
    aiSoftComment: "Great job logging your expense! Keep tracking 🌸",
  };
}

/**
 * Mock AI observations for Insights screen
 */
export async function generateAIObservations(userId: number): Promise<string[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1200));

  return [
    "Your spending on food is 15% higher than last week. Consider meal planning 🍽️",
    "You've been consistent with your Soft Audit ritual! That's 12 weeks straight 🔥",
    "Your savings rate this month is 28%, up from 22% last month. Excellent progress! 💜",
    "You're on track to hit your Emergency Fund goal by June. Keep it up! 🎯",
  ];
}

/**
 * Mock Ask Plush AI chat
 */
export async function askPlushAI(question: string): Promise<string> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const responses: Record<string, string> = {
    "how can i save more": "Start by tracking every expense for a week. You'll be surprised where your money goes! Then set a realistic savings goal and automate transfers. 🌸",
    "what's a good emergency fund": "Aim for 3-6 months of living expenses. Start with ₦50k if you can, then build from there. Every naira counts! 💜",
    "how do i pay off debt": "The snowball method (smallest debt first) or avalanche (highest interest first) both work. Pick one and stay consistent. You've got this! 💪",
    "should i invest": "Yes! Even ₦1,000 monthly in a fixed deposit or mutual fund builds wealth over time. Start small, start now. 📈",
    default: "That's a great question! Remember, financial wellness is a journey, not a destination. Be patient with yourself and celebrate small wins. 🌸",
  };

  const lowerQuestion = question.toLowerCase();
  for (const [key, response] of Object.entries(responses)) {
    if (lowerQuestion.includes(key)) {
      return response;
    }
  }

  return responses.default;
}
