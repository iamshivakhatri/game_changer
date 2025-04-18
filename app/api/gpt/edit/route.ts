import OpenAI from "openai";
import { NextResponse } from "next/server";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, instruction } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (!instruction) {
      return NextResponse.json(
        { error: "Instruction is required" },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",  // Using gpt-4o as specified
      messages: [
        {
          role: "system",
          content: `You are a professional resume editor that helps edit resume content according to specific user instructions.

IMPORTANT FORMATTING INSTRUCTIONS:
1. DO NOT add any dash (-) or bullet characters (•) at the beginning of lines
2. Each point must be on a separate line with a line break between points
3. Preserve the original line-by-line structure where possible
4. DO NOT add any prefix characters to lines
5. If the original content has bullet points, just edit the text after the bullet points
6. Follow the user's instructions carefully while maintaining professionalism and clarity
7. Return content in the same format as received (separate lines for separate points)`
        },
        {
          role: "user",
          content: `Here is my resume content:\n\n${content}\n\nPlease edit it according to this instruction: ${instruction}\n\nMaintain proper line breaks for each point.`
        }
      ],
      temperature: 0.7,
    });

    let editedContent = response.choices[0]?.message?.content || '';
    
    // Clean up any accidental dash prefixes and ensure line breaks
    editedContent = editedContent
      .replace(/^[-•]\s*/gm, '')  // Remove any leading dashes or bullets
      .replace(/[\r\n]+/g, '\n')   // Normalize line breaks
      .trim();

    return NextResponse.json({ result: editedContent });
  } catch (error) {
    console.error("Error editing content:", error);
    return NextResponse.json(
      { error: "Failed to edit content" },
      { status: 500 }
    );
  }
} 