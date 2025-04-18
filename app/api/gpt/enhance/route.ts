import OpenAI from "openai";
import { NextResponse } from "next/server";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",  // Using gpt-4o as specified
      messages: [
        {
          role: "system",
          content: `You are a professional resume editor that enhances resume content to be more impactful, clearer, and more professional. 

IMPORTANT FORMATTING INSTRUCTIONS:
1. DO NOT add any dash (-) or bullet characters (•) at the beginning of lines
2. Each point should be on a separate line
3. Preserve the original line-by-line structure
4. Focus on using strong action verbs, quantifiable achievements, and professional language
5. DO NOT add any prefix characters
6. If the original content has bullet points, just enhance the text after the bullet points
7. Maintain the same number of lines/points as the original content`
        },
        {
          role: "user",
          content: `Please enhance the following resume content to make it more impactful and professional:\n\n${content}`
        }
      ],
      temperature: 0.7,
    });

    let enhancedContent = response.choices[0]?.message?.content || '';
    
    // Clean up any accidental dash prefixes and ensure line breaks
    enhancedContent = enhancedContent
      .replace(/^[-•]\s*/gm, '')  // Remove any leading dashes or bullets
      .replace(/[\r\n]+/g, '\n')   // Normalize line breaks
      .trim();

    return NextResponse.json({ result: enhancedContent });
  } catch (error) {
    console.error("Error enhancing content:", error);
    return NextResponse.json(
      { error: "Failed to enhance content" },
      { status: 500 }
    );
  }
} 