import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getOpenAIAPIResponse = async (message) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"   // stable model, not overloaded like 2.5-flash
    });

    const result = await model.generateContent(message);
    return result.response.text();

  } catch (err) {
    console.log("Gemini Error:", err.message);

    // fallback to gemini-1.5-pro if flash is also down
    try {
      const fallback = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const result = await fallback.generateContent(message);
      return result.response.text();
    } catch (err2) {
      console.log("Gemini Fallback Error:", err2.message);
      return "Sorry, the AI service is temporarily unavailable. Please try again in a moment.";
    }
  }
};

export default getOpenAIAPIResponse;