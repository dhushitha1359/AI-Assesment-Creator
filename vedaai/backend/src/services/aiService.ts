import Groq from "groq-sdk";

let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is missing from environment variables. Add it to your .env file.");
    }
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

export async function generateQuestionPaper(prompt: string): Promise<string> {
  const client = getGroqClient();

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile", // ← updated model
    messages: [
      {
        role: "system",
        content:
          "You are an AI that generates exam question papers. Return ONLY valid JSON. No markdown. No code blocks. No explanation. Raw JSON only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
  });

  const text = response.choices[0]?.message?.content || "{}";
  console.log("🤖 Groq raw response:", text);
  return text;
}