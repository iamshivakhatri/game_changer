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
          content: `You are a professional resume editor that specializes in making resume content more concise while preserving key achievements and impact.

IMPORTANT FORMATTING INSTRUCTIONS:
1. DO NOT add any dash (-) or bullet characters (•) at the beginning of lines
2. Each point must be on a separate line with a line break between points
3. Preserve the original line-by-line structure, just make each line shorter
4. DO NOT add any prefix characters to lines
5. If the original content has bullet points, just shorten the text after the bullet points
6. Return fewer words per line, but keep approximately the same number of lines`
        },
        {
          role: "user",
          content: `Please shorten the following resume content while maintaining its key points and professional impact. Keep each point on a separate line:\n\n${content}`
        }
      ],
      temperature: 0.7,
    });

    let shortenedContent = response.choices[0]?.message?.content || '';
    
    // Clean up any accidental dash prefixes and ensure line breaks
    shortenedContent = shortenedContent
      .replace(/^[-•]\s*/gm, '')  // Remove any leading dashes or bullets
      .replace(/[\r\n]+/g, '\n')   // Normalize line breaks
      .trim();

    return NextResponse.json({ result: shortenedContent });
  } catch (error) {
    console.error("Error shortening content:", error);
    return NextResponse.json(
      { error: "Failed to shorten content" },
      { status: 500 }
    );
  }
} 