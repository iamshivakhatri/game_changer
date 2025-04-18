import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ResumeData {
  experience: any[];
  projects: any[];
  skills: any;
  education: any[];
  personal: any[];
}

interface RequestData {
  message: string;
  resumeData: ResumeData;
  activeSection?: {
    type: string;
    index: number;
  };
}

export async function POST(req: Request) {
  try {
    console.log('📝 Resume chat API called');
    const data: RequestData = await req.json();
    
    const { message, resumeData, activeSection } = data;

    if (!message) {
      console.error('❌ Message is missing');
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!resumeData) {
      console.error('❌ Resume data is missing');
      return NextResponse.json(
        { error: 'Resume data is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Processing message: ${message.substring(0, 50)}...`);

    // Check if message mentions a specific section by name when activeSection isn't provided
    let targetSection = activeSection;
    
    if (!targetSection) {
      // Look for specific section mentions in the message
      targetSection = findTargetSection(message, resumeData);
    }

    if (targetSection) {
      console.log(`🔍 Target section identified: ${targetSection.type} at index ${targetSection.index}`);
      return await processSectionEdit(message, resumeData, targetSection);
    } else {
      // Handle general resume chat
      return await processGeneralChat(message, resumeData);
    }
  } catch (error) {
    console.error('❌ Error in resume chat:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

function findTargetSection(message: string, resumeData: ResumeData) {
  const lowercaseMessage = message.toLowerCase();
  
  // Check for experience mentions
  for (let i = 0; i < resumeData.experience.length; i++) {
    const exp = resumeData.experience[i];
    const companyLower = exp.company.toLowerCase();
    const titleLower = exp.title.toLowerCase();
    
    if (lowercaseMessage.includes(companyLower) || lowercaseMessage.includes(titleLower)) {
      return { type: 'experience', index: i };
    }
  }
  
  // Check for project mentions
  for (let i = 0; i < resumeData.projects.length; i++) {
    const project = resumeData.projects[i];
    const nameLower = project.name.toLowerCase();
    
    if (lowercaseMessage.includes(nameLower)) {
      return { type: 'project', index: i };
    }
  }
  
  return null;
}

async function processSectionEdit(message: string, resumeData: ResumeData, activeSection: { type: string; index: number }) {
  const { type, index } = activeSection;
  
  let sectionContent;
  let promptType;
  
  if (type === 'experience' && resumeData.experience?.[index]) {
    sectionContent = resumeData.experience[index];
    promptType = 'experience entry';
  } else if (type === 'project' && resumeData.projects?.[index]) {
    sectionContent = resumeData.projects[index];
    promptType = 'project entry';
  } else {
    return NextResponse.json({ 
      message: `I've edited the requested section.`,
      error: "Section not found"
    });
  }

  // Determine the editing goal based on message
  let editGoal = "Improve";
  if (message.toLowerCase().includes("shorten")) {
    editGoal = "Shorten";
  } else if (message.toLowerCase().includes("improve")) {
    editGoal = "Improve";
  } else if (message.toLowerCase().includes("tailor")) {
    editGoal = "Tailor";
  }

  const prompt = `
    You are an expert resume writer directly editing a specific ${promptType} on a resume.
    
    Here is the current content for this ${type}:
    ${JSON.stringify(sectionContent, null, 2)}
    
    The user wants to: "${message}"
    Your task: ${editGoal} this ${type} entry.
    
    IMPORTANT GUIDELINES:
    1. DO NOT provide advice or explanations, just make the edit directly
    2. DO NOT change job titles, company names, education details, or project names
    3. For experience entries, ONLY modify the bullet points in detailed_experience
    4. For project entries, you may update the bullet points in description and the technologies/languages
    5. Make sure every bullet point starts with a strong action verb
    6. Keep bullet points concise and focused on achievements, metrics, and relevant skills
    7. Each bullet point should be a single statement with minimum of 15 and maximum of 17 words in a single line
    8. Add measurable achievements with percentages, numbers, or dollar amounts where possible
    9. Ensure bullet points are separated by \\n character
    
    Return ONLY a JSON object that contains:
    1. A "message" field simply stating "I've updated the [section name]"
    2. A "section" field with the name of the section ("experience" or "project")
    3. A "changes" field with the updated data object for ONLY this entry
  `;

  try {
    console.log('🤖 Sending to OpenAI for section edit');
    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: "You are an expert resume editor that directly modifies content without providing explanations or advice."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Empty response from OpenAI");

    console.log('✅ Received response from OpenAI for section edit');
    try {
      const parsedData = JSON.parse(content);
      // Ensure message is direct and simple
      parsedData.message = `I've updated the ${type === 'experience' ? sectionContent.company : sectionContent.name} section.`;
      return NextResponse.json(parsedData);
    } catch (error) {
      console.error("❌ Error parsing OpenAI response:", error);
      return NextResponse.json({ 
        message: `I've updated the ${type === 'experience' ? sectionContent.company : sectionContent.name} section.`,
        section: type,
        changes: sectionContent
      });
    }
  } catch (error) {
    console.error("❌ Error with OpenAI:", error);
    return NextResponse.json({ 
      message: `I wasn't able to update that section. Please try again.`
    }, { status: 500 });
  }
}

async function processGeneralChat(message: string, resumeData: ResumeData) {
  // Determine if the message is likely requesting a full resume modification
  const fullResumeKeywords = [
    'entire resume', 'whole resume', 'all sections', 'all of my resume',
    'shorten resume', 'shorten it', 'condense', 'make it shorter',
    'edit everything', 'improve overall', 'full resume'
  ];
  
  const isFullResumeEdit = fullResumeKeywords.some(keyword => 
    message.toLowerCase().includes(keyword.toLowerCase())
  );

  let prompt;
  
  if (isFullResumeEdit) {
    prompt = `
      You are an expert resume writer directly editing an entire resume.
      
      Here is the current resume content:
      ${JSON.stringify(resumeData, null, 2)}
      
      The user wants to: "${message}"
      
      IMPORTANT GUIDELINES:
      1. DO NOT provide advice or explanations, just make the edits directly
      2. DO NOT change job titles, company names, education details, or project names
      3. For experience entries, ONLY modify the bullet points in detailed_experience
      4. For project entries, you may update the bullet points in description and the technologies/languages
      5. Make sure every bullet point starts with a strong action verb
      6. Keep bullet points concise and focused on achievements, metrics, and relevant skills
      7. Each bullet point should be a single statement with minimum of 15 and maximum of 17 words in a single line
      8. Add measurable achievements with percentages, numbers, or dollar amounts where possible
      9. Ensure bullet points are separated by \\n character
      
      Return ONLY a JSON object that contains:
      1. A "message" field simply stating "I've updated your entire resume"
      2. A "section" field with "full" 
      3. A "changes" field with the complete updated resume data
    `;
  } else {
    prompt = `
      You are an expert resume writer directly editing a resume.
      
      Here is the current resume content:
      ${JSON.stringify(resumeData, null, 2)}
      
      The user wants to: "${message}"
      
      IMPORTANT GUIDELINES:
      1. DO NOT provide advice or explanations, just make the edits directly
      2. Look for which specific section the user wants to modify and focus on that
      3. If no specific section is mentioned, make a reasonable edit to improve the overall resume
      4. DO NOT change job titles, company names, education details, or project names
      5. Make sure every bullet point starts with a strong action verb
      6. Keep bullet points concise and focused on achievements, metrics, and relevant skills
      7. Each bullet point should be a single statement with minimum of 15 and maximum of 17 words in a single line
      
      Return ONLY a JSON object with:
      1. A "message" field simply stating what you updated (e.g. "I've updated your experience section")
      2. A "section" field with "full" or the specific section type you modified
      3. A "changes" field with the updated data
    `;
  }

  try {
    console.log('🤖 Sending to OpenAI for general chat');
    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: "You are an expert resume editor that directly modifies content without providing explanations or advice."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Empty response from OpenAI");

    console.log('✅ Received response from OpenAI for general chat');
    try {
      const parsedData = JSON.parse(content);
      // Ensure message is direct and simple
      if (isFullResumeEdit) {
        parsedData.message = "I've updated your entire resume.";
      } else if (!parsedData.message || parsedData.message.length > 50) {
        parsedData.message = "I've made the requested changes to your resume.";
      }
      return NextResponse.json(parsedData);
    } catch (error) {
      console.error("❌ Error parsing OpenAI response:", error);
      return NextResponse.json({ 
        message: "I've made the requested changes to your resume.",
        error: "Could not parse response"
      });
    }
  } catch (error) {
    console.error("❌ Error with OpenAI:", error);
    return NextResponse.json({ 
      message: "I wasn't able to update your resume. Please try again."
    }, { status: 500 });
  }
} 