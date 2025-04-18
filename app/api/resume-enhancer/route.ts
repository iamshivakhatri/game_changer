import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Import Google AI SDK
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google AI client with API version v1
const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function POST(req: Request) {
  try {
    console.log('📝 Resume enhancer API called');
    const { jobDescription, aiProvider, existingData } = await req.json();

    if (!jobDescription) {
      console.error('❌ Job description is missing');
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    if (!existingData) {
      console.error('❌ Existing resume data is missing');
      return NextResponse.json(
        { error: 'Existing resume data is required' },
        { status: 400 }
      );
    }

    console.log(`🤖 Selected AI Provider for enhancement: ${aiProvider}`);

    let enhancedData;

    if (aiProvider === 'openai') {
      console.log('🔄 Processing with OpenAI...');
      // Use OpenAI for enhancement
      enhancedData = await enhanceWithOpenAI(jobDescription, existingData);
    } else if (aiProvider === 'google') {
      console.log('🔄 Processing with Google AI Studio...');
      // Use Google AI for enhancement
      enhancedData = await enhanceWithGoogleAI(jobDescription, existingData);
    } else {
      // Default to OpenAI
      console.log('🔄 Defaulting to OpenAI...');
      enhancedData = await enhanceWithOpenAI(jobDescription, existingData);
    }

    console.log('✅ Resume data enhanced successfully');
    return NextResponse.json(enhancedData);
  } catch (error) {
    console.error('❌ Error enhancing resume data:', error);
    return NextResponse.json(
      { error: 'Failed to enhance resume with job description' },
      { status: 500 }
    );
  }
}

async function enhanceWithOpenAI(jobDescription: string, existingData: any) {
  console.log('📋 Starting OpenAI enhancement');

  // Extract existing experience, projects, and skills
  const { experience, projects, skills } = existingData;

  const prompt = `
    You are an expert resume enhancer focused on optimizing resumes for ATS (Applicant Tracking Systems).
    You will be provided with a job description and sections from an existing resume.
    Your task is to enhance only the bullet points and skills to better match keywords from the job description.
    
    Job Description:
    ${jobDescription}
    
    IMPORTANT GUIDELINES:
    1. DO NOT change job titles, company names, education details, or personal information
    2. ONLY modify bullet points in experience and projects to better match keywords in the job description
    3. For projects, you may update the technologies/languages to better match the job requirements
    4. Add or enhance skills to include keywords from the job description
    5. Make sure every bullet point starts with a strong action verb
    6. Keep bullet points concise and focused on achievements, metrics, and relevant skills
    7. Each bullet point should be a single statement (do not use multiple sentences)
    8. Ensure the keyword matching is natural and maintains the integrity of the original content
    9. Incorporate exact keywords from the job description where appropriate
    10. Add measurable achievements with percentages, numbers, or dollar amounts where possible
    
    Existing Experience Data (DO NOT CHANGE JOB TITLES OR COMPANIES):
    ${JSON.stringify(experience, null, 2)}
    
    Existing Projects Data (DO NOT CHANGE PROJECT NAMES):
    ${JSON.stringify(projects, null, 2)}
    
    Existing Skills Data:
    ${JSON.stringify(skills, null, 2)}
    
    Return the enhanced content in the following JSON format:
    {
      "enhancedExperience": [
        {
          "title": "[EXACT original title]",
          "company": "[EXACT original company]",
          "start_date": "[EXACT original start_date]",
          "end_date": "[EXACT original end_date]",
          "isEndPresent": [EXACT original boolean value],
          "detailed_experience": "Enhanced bullet 1.\\nEnhanced bullet 2.\\nEnhanced bullet 3."
        }
      ],
      "enhancedProjects": [
        {
          "name": "[EXACT original name]",
          "language": "Updated technologies if relevant",
          "description": "Enhanced bullet 1.\\nEnhanced bullet 2.\\nEnhanced bullet 3.",
          "github": "[EXACT original github]"
        }
      ],
      "enhancedSkills": {
        "languages": "Enhanced languages list with keywords from job",
        "frameworks": "Enhanced frameworks list with keywords from job"
      }
    }
    
    IMPORTANT: 
    1. Use "\\n" to separate bullet points in the detailed_experience and description fields.
    2. Each bullet point MUST start with a strong action verb and be ATS-optimized with keywords from the job.
    3. Make sure to include ALL original experience and project entries in your response.
    4. Do not rename or modify any field names in the JSON structure.
  `;

  console.log('🔍 Sending enhancement request to OpenAI');
  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      {
        role: "system",
        content: "You are an expert resume writer specializing in ATS optimization. You transform existing resume content to match job descriptions by improving bullet points and adding relevant keywords."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
  });

  // Parse the response text as JSON
  try {
    console.log('📤 Received enhancement response from OpenAI');
    const content = response.choices[0].message.content;
    if (!content) throw new Error("Empty response from OpenAI");

    console.log('🔄 Parsing JSON response');
    const parsedData = JSON.parse(content);
    console.log('✅ Successfully parsed OpenAI response');
    return parsedData;
  } catch (error) {
    console.error("❌ Error parsing OpenAI response:", error);
    throw new Error("Failed to parse AI response");
  }
}

async function enhanceWithGoogleAI(jobDescription: string, existingData: any) {
  console.log('📋 Starting Google AI enhancement');

  try {
    // Extract existing experience, projects, and skills
    const { experience, projects, skills } = existingData;
    console.log('🔍 Existing data:', { experience, projects, skills });

    // Setup Google AI Studio model (using Gemini 1.5 Pro)
    const model = googleAI.getGenerativeModel({
      model: "gemini-1.5-pro",
    });

    // const prompt = `
    // You are an expert resume enhancer focused on optimizing resumes for ATS (Applicant Tracking Systems).
    // You will be provided with a job description and sections from an existing resume.
    // Your task is to enhance only the bullet points and skills to better match keywords from the job description.

    // Job Description:
    // ${jobDescription}

    // IMPORTANT GUIDELINES:
    // 1. DO NOT change job titles, company names, education details, or personal information
    // 2. ONLY modify bullet points in experience and projects to better match keywords in the job description
    // 3. For projects, you may update the technologies/languages to better match the job requirements
    // 4. Add or enhance skills to include keywords from the job description
    // 5. Make sure every bullet point starts with a strong action verb
    // 6. Keep bullet points concise and focused on achievements, metrics, and relevant skills
    // 7. Each bullet point should be a single statement (do not use multiple sentences)
    // 8. Ensure the keyword matching is natural and maintains the integrity of the original content
    // 9. Incorporate exact keywords from the job description where appropriate
    // 10. Add measurable achievements with percentages, numbers, or dollar amounts where possible

    // Existing Experience Data (DO NOT CHANGE JOB TITLES OR COMPANIES):
    // ${JSON.stringify(experience, null, 2)}

    // Existing Projects Data (DO NOT CHANGE PROJECT NAMES):
    // ${JSON.stringify(projects, null, 2)}

    // Existing Skills Data:
    // ${JSON.stringify(skills, null, 2)}

    // Return the enhanced content in the following JSON format:
    // {
    //   "enhancedExperience": [
    //     {
    //       "title": "[EXACT original title]",
    //       "company": "[EXACT original company]",
    //       "start_date": "[EXACT original start_date]",
    //       "end_date": "[EXACT original end_date]",
    //       "isEndPresent": [EXACT original boolean value],
    //       "detailed_experience": "Enhanced bullet 1.\\nEnhanced bullet 2.\\nEnhanced bullet 3."
    //     }
    //   ],
    //   "enhancedProjects": [
    //     {
    //       "name": "[EXACT original name]",
    //       "language": "Updated technologies if relevant",
    //       "description": "Enhanced bullet 1.\\nEnhanced bullet 2.\\nEnhanced bullet 3.",
    //       "github": "[EXACT original github]"
    //     }
    //   ],
    //   "enhancedSkills": {
    //     "languages": "Enhanced languages list with keywords from job",
    //     "frameworks": "Enhanced frameworks list with keywords from job"
    //   }
    // }

    // IMPORTANT: Use "\\n" to separate bullet points in the detailed_experience and description fields.
    // Each bullet point MUST start with a strong action verb and be ATS-optimized with keywords from the job.

    // VERY IMPORTANT:
    // 1. Return ONLY the JSON object - no explanations, no other text.
    // 2. Make sure to include ALL original experience and project entries in your response.
    // 3. Do not rename or modify any field names in the JSON structure.
    // `;

    const prompt = `
      You are an expert resume enhancer focused on optimizing resumes for ATS (Applicant Tracking Systems).
      You will be provided with a job description and sections from an existing resume.
      Your task is to enhance ONLY the bullet points and skills to better match keywords from the job description.

      Job Description:
      ${jobDescription}

      CRITICAL INSTRUCTIONS - READ CAREFULLY:
      1. YOU MUST PRESERVE EXACTLY AS-IS WITHOUT ANY CHANGES:
        - All job titles
        - All company names
        - All project names
        - All dates (start_date and end_date)
        - All isEndPresent boolean values
        - All github URLs
        - Personal information of any kind

      2. YOU ARE ONLY AUTHORIZED TO MODIFY:
        - Bullet points in the detailed_experience fields
        - Bullet points in the project description fields
        - Technologies/languages in project language fields
        - Skills lists in the skills section

      3. For each original entry in experience and projects, there MUST be a corresponding entry in the output with:
        - IDENTICAL title/name
        - IDENTICAL company name
        - IDENTICAL dates
        - IDENTICAL isEndPresent value
        - IDENTICAL github URL (for projects)

      BULLET POINT ENHANCEMENT GUIDELINES:
      1. Make sure every bullet point starts with a strong action verb and should have minimum of 15 and maximum of 17 words in a single line.
      2. Keep bullet points concise and focused on achievements, metrics, and relevant skills
      3. Each bullet point should be a single statement (do not use multiple sentences)
      4. Ensure the keyword matching is natural and maintains the integrity of the original content
      5. Incorporate exact keywords from the job description where appropriate
      6. Add measurable achievements with percentages, numbers, or dollar amounts where possible

      Existing Experience Data (DO NOT ALTER ANY IDENTIFYING INFORMATION):
      ${JSON.stringify(experience, null, 2)}

      Existing Projects Data (DO NOT ALTER PROJECT NAMES OR DATES):
      ${JSON.stringify(projects, null, 2)}

      Existing Skills Data:
      ${JSON.stringify(skills, null, 2)}

      Return the enhanced content in the following JSON format:
      {
        "enhancedExperience": [
          {
            "title": "[MUST BE EXACTLY THE SAME AS ORIGINAL title]",
            "company": "[MUST BE EXACTLY THE SAME AS ORIGINAL company]",
            "start_date": "[MUST BE EXACTLY THE SAME AS ORIGINAL start_date]",
            "end_date": "[MUST BE EXACTLY THE SAME AS ORIGINAL end_date]",
            "isEndPresent": [MUST BE EXACTLY THE SAME AS ORIGINAL boolean value],
            "detailed_experience": "Enhanced bullet 1.\\nEnhanced bullet 2.\\nEnhanced bullet 3."
          }
        ],
        "enhancedProjects": [
          {
            "name": "[MUST BE EXACTLY THE SAME AS ORIGINAL name]",
            "language": "Updated technologies if relevant to job description",
            "description": "Enhanced bullet 1.\\nEnhanced bullet 2.\\nEnhanced bullet 3.",
            "github": "[MUST BE EXACTLY THE SAME AS ORIGINAL github]"
          }
        ],
        "enhancedSkills": {
          "languages": "Enhanced languages list with keywords from job",
          "frameworks": "Enhanced frameworks list with keywords from job"
        }
      }

      VERIFICATION INSTRUCTIONS:
      1. Before returning the result, verify that NO job titles, company names, project names, or dates have been changed
      2. Confirm that ALL entries from the original data are present in the enhanced data
      3. Ensure ONLY bullet points and skills have been modified

      IMPORTANT: Use "\\n" to separate bullet points in the detailed_experience and description fields.
      Each bullet point MUST start with a strong action verb and be ATS-optimized with keywords from the job.

      RETURN ONLY THE JSON OBJECT - no explanations, no other text.
      `;


    console.log('🔍 Sending enhancement request to Google AI Studio');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('📤 Received enhancement response from Google AI Studio');

    // Extract the JSON from the response
    // First, try to parse directly
    try {
      console.log('🔄 Parsing JSON response');
      const parsedData = JSON.parse(text);
      console.log('✅ Successfully parsed Google AI response');
      return parsedData;
    } catch (error) {
      // If direct parsing fails, try to extract JSON from text
      console.log('⚠️ Direct JSON parse failed, attempting to extract JSON from text');
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const jsonStr = jsonMatch[0];
          const parsedData = JSON.parse(jsonStr);
          console.log('✅ Successfully extracted and parsed JSON from response text');
          return parsedData;
        } catch (error) {
          console.error('❌ Failed to extract valid JSON from response text');
          throw new Error('Failed to extract valid JSON from Google AI response');
        }
      } else {
        console.error('❌ No JSON object found in response text');
        throw new Error('No JSON object found in Google AI response');
      }
    }
  } catch (error: any) {
    console.error('❌ Error using Google AI Studio:', error);

    // Return a basic error response with some empty structures
    return {
      message: "Error with Google AI Studio: " + error.message,
      enhancedExperience: [],
      enhancedProjects: [],
      enhancedSkills: { languages: "", frameworks: "" }
    };
  }
} 