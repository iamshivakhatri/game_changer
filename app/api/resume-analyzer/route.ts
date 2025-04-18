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
    console.log('📝 Resume analyzer API called');
    const { jobDescription, aiProvider, existingData } = await req.json();
    console.log(`🤖 Selected AI Provider: ${aiProvider}`);

    if (!jobDescription) {
      console.error('❌ Job description is missing');
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    let resumeData;

    if (aiProvider === 'openai') {
      console.log('🔄 Processing with OpenAI...');
      // Use OpenAI for analysis
      resumeData = await analyzeWithOpenAI(jobDescription, existingData);
    } else if (aiProvider === 'google') {
      console.log('🔄 Processing with Google AI Studio...');
      // Use Google AI for analysis
      resumeData = await analyzeWithGoogleAI(jobDescription, existingData);
    } else {
      // Default to OpenAI
      console.log('🔄 Defaulting to OpenAI...');
      resumeData = await analyzeWithOpenAI(jobDescription, existingData);
    }

    console.log('✅ Resume data generated successfully');
    return NextResponse.json(resumeData);
  } catch (error) {
    console.error('❌ Error analyzing resume data:', error);
    return NextResponse.json(
      { error: 'Failed to analyze job description' },
      { status: 500 }
    );
  }
}

async function analyzeWithOpenAI(jobDescription: string, existingData: any = null) {
  console.log('📋 Starting OpenAI analysis');
  
  let prompt;
  
  if (existingData) {
    // If user already has existing data, use it as a base and only enhance bullet points
    prompt = `
    You are a professional resume enhancer tasked with optimizing a resume for ATS compatibility based on a job description.
    
    Job Description:
    ${jobDescription}
    
    Existing Resume Data (DO NOT CHANGE personal info, job titles, companies, dates, education details, project names):
    ${JSON.stringify(existingData, null, 2)}
    
    IMPORTANT GUIDELINES:
    1. DO NOT change personal information (name, email, phone, location, links)
    2. DO NOT change education details (university, major, graduation date, GPA)
    3. DO NOT change job titles, company names, or employment dates
    4. DO NOT change project names or GitHub links
    5. ONLY enhance the bullet points in experience and projects to better match keywords from the job description
    6. Make sure every bullet point starts with a strong action verb
    7. Include measurable achievements and metrics where reasonable
    8. Keep bullet points concise and focused on achievements and relevant skills
    9. Each bullet point should be a single statement/sentence
    10. Ensure keyword matching is natural and maintains the integrity of the original content
    
    Return the enhanced resume in exactly the same JSON format as the input, with the same structure and fields.
    IMPORTANT: For detailed_experience and description fields, separate bullet points with "\\n".
    `;
  } else {
    // If no existing data, generate a new resume (existing prompt)
    prompt = `
    Analyze this job description and generate a comprehensive, ATS-optimized resume content structured in JSON format:
    
    Job Description:
    ${jobDescription}
    
    Please generate detailed resume content with:
    - At least 3 well-developed work experiences with specific achievements and metrics
    - At least 3 substantial projects with technical details
    - Comprehensive skills section with multiple languages and frameworks
    - Education details with relevant coursework

    Make sure to:
    1. Include EXACT keyword matches from the job description for maximum ATS compatibility
    2. Use strong action verbs at the start of EACH bullet point
    3. Format each experience and project bullet point as a SEPARATE item
    4. Include measurable achievements and metrics (%, $, numbers) wherever possible
    5. Highlight technical skills that directly match the job requirements
    6. Include industry-standard terminology and tools mentioned in the job description
    7. Create realistic but impressive work experiences that would make a candidate competitive
    8. IMPORTANT: Each bullet point in experiences and projects must start with a strong action verb
    9. IMPORTANT: Each bullet point should be ONLY ONE sentence and contain a specific accomplishment
    
    Return a JSON object with the following structure:
    {
      "personal": {
        "name": "John Doe",
        "email": "johndoe@example.com",
        "phone": "+1 123 456 7890",
        "city": "New York",
        "state": "NY",
        "github": "github.com/johndoe",
        "linkedin": "linkedin.com/in/johndoe",
        "website": "johndoe.com"
      },
      "education": [
        {
          "university": "Massachusetts Institute of Technology",
          "major": "Mechanical Engineering",
          "gpa": "3.8",
          "level": "Bachelor",
          "graduation_date": "May 2017",
          "coursework": "Embedded Systems, Control Systems, IC Engines, Software Development, Data Analysis, Basic Statistics"
        }
      ],
      "experience": [
        {
          "title": "Embedded Software Engineer",
          "company": "General Motors",
          "start_date": "Jan 2017",
          "end_date": "Dec 2021",
          "detailed_experience": "Developed and optimized embedded software solutions by writing efficient hand-coded algorithms in C/C++ for real time systems.\\nImplemented model-based controls reducing system latency by 40% and improving overall performance.\\nDiagnosed and resolved over 200 critical bug reports, increasing system stability by 30%.\\nCollaborated with cross-functional teams to deliver features aligned with business goals and timelines.\\nOptimized memory usage by 25% through innovative code restructuring and algorithm improvements.",
          "isEndPresent": false
        }
      ],
      "projects": [
        {
          "name": "Engine Control Module",
          "language": "C/C++, MATLAB Simulink",
          "description": "Developed an Engine Control Module that performs complex algorithms providing emission control, diagnostics, and other performance related tasks.\\nImplemented turbocharger control algorithms for optimal engine performance, reducing fuel consumption by 15%.\\nDesigned exhaust gas recirculation (EGR) systems for emissions reduction, meeting EPA standards.\\nBuilt fuel delivery and ignition systems monitoring components with real-time data visualization.",
          "github": "GitHub"
        }
      ],
      "skills": {
        "languages": "C/C++, MATLAB Simulink, Python, Java, JavaScript",
        "frameworks": "AUTOSAR, React, Node.js, TensorFlow, PyTorch"
      }
    }
    
    IMPORTANT FORMATTING: For 'detailed_experience' in experiences and 'description' in projects, separate each bullet point with the newline character '\\n'. Each bullet point must:
    1. Be on a separate line
    2. Start with an action verb
    3. Include at least one specific accomplishment with metrics when possible
    4. Contain at least one exact keyword match from the job description
    
    Make all content realistic, detailed, and highly relevant to the specific job description. Each experience should include multiple detailed bullet points showing expertise and measurable achievements. Each project should demonstrate relevant technical skills with specific contributions and outcomes. Include at least 5-8 languages and frameworks in the skills section, prioritizing those mentioned in the job description.
  `;
  }

  console.log('🔍 Sending request to OpenAI');
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a professional resume writer specializing in creating ATS-optimized resumes for technical positions. Your expertise is in identifying key requirements in job descriptions and creating tailored content that will pass both ATS filters and impress human reviewers."
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
    console.log('📤 Received response from OpenAI');
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

async function analyzeWithGoogleAI(jobDescription: string, existingData: any = null) {
  console.log('📋 Starting Google AI analysis');
  
  try {
    // Setup Google AI Studio model (using Gemini 1.5 Pro)
    const model = googleAI.getGenerativeModel({
      model: "gemini-1.5-pro",
    });

    let prompt;
    
    if (existingData) {
      // If user already has existing data, use it as a base and only enhance bullet points
      prompt = `
      You are a professional resume enhancer tasked with optimizing a resume for ATS compatibility based on a job description.
      
      Job Description:
      ${jobDescription}
      
      Existing Resume Data (DO NOT CHANGE personal info, job titles, companies, dates, education details, project names):
      ${JSON.stringify(existingData, null, 2)}
      
      IMPORTANT GUIDELINES:
      1. DO NOT change personal information (name, email, phone, city, state, links)
      2. DO NOT change education details (university, major, graduation date, GPA)
      3. DO NOT change job titles, company names, or employment dates
      4. DO NOT change project names or GitHub links
      5. ONLY enhance the bullet points in experience and projects to better match keywords from the job description
      6. Make sure every bullet point starts with a strong action verb
      7. Include measurable achievements and metrics where reasonable
      8. Keep bullet points concise and focused on achievements and relevant skills
      9. Each bullet point should be a single statement/sentence
      10. Ensure keyword matching is natural and maintains the integrity of the original content
      
      Return the enhanced resume in exactly the same JSON format as the input, with the same structure and fields.
      IMPORTANT: For detailed_experience and description fields, separate bullet points with "\\n".
      
      VERY IMPORTANT: Your response must be ONLY the JSON object - no other text, no explanations, just the JSON.
      `;
    } else {
      // If no existing data, use the existing prompt for generating a new resume
      prompt = `
      Analyze this job description and generate a comprehensive, ATS-optimized resume content structured in JSON format:
      
      Job Description:
      ${jobDescription}
      
      Please generate detailed resume content with:
      - At least 3 well-developed work experiences with specific achievements and metrics
      - At least 3 substantial projects with technical details
      - Comprehensive skills section with multiple languages and frameworks
      - Education details with relevant coursework

      Make sure to:
      1. Include EXACT keyword matches from the job description for maximum ATS compatibility
      2. Use strong action verbs at the start of EACH bullet point
      3. Format each experience and project bullet point as a SEPARATE item
      4. Include measurable achievements and metrics (%, $, numbers) wherever possible
      5. Highlight technical skills that directly match the job requirements
      6. Include industry-standard terminology and tools mentioned in the job description
      7. Create realistic but impressive work experiences that would make a candidate competitive
      8. IMPORTANT: Each bullet point in experiences and projects must start with a strong action verb
      9. IMPORTANT: Each bullet point should be ONLY ONE sentence and contain a specific accomplishment
      
      Return a JSON object with the following structure:
      {
        "personal": {
          "name": "John Doe",
          "email": "johndoe@example.com",
          "phone": "+1 123 456 7890",
          "city": "New York",
          "state": "NY",
          "github": "github.com/johndoe",
          "linkedin": "linkedin.com/in/johndoe",
          "website": "johndoe.com"
        },
        "education": [
          {
            "university": "Massachusetts Institute of Technology",
            "major": "Mechanical Engineering",
            "gpa": "3.8",
            "level": "Bachelor",
            "graduation_date": "May 2017",
            "coursework": "Embedded Systems, Control Systems, IC Engines, Software Development, Data Analysis, Basic Statistics"
          }
        ],
        "experience": [
          {
            "title": "Embedded Software Engineer",
            "company": "General Motors",
            "start_date": "Jan 2017",
            "end_date": "Dec 2021",
            "detailed_experience": "Developed and optimized embedded software solutions by writing efficient hand-coded algorithms in C/C++ for real time systems.\\nImplemented model-based controls reducing system latency by 40% and improving overall performance.\\nDiagnosed and resolved over 200 critical bug reports, increasing system stability by 30%.\\nCollaborated with cross-functional teams to deliver features aligned with business goals and timelines.\\nOptimized memory usage by 25% through innovative code restructuring and algorithm improvements.",
            "isEndPresent": false
          }
        ],
        "projects": [
          {
            "name": "Engine Control Module",
            "language": "C/C++, MATLAB Simulink",
            "description": "Developed an Engine Control Module that performs complex algorithms providing emission control, diagnostics, and other performance related tasks.\\nImplemented turbocharger control algorithms for optimal engine performance.\\nDesigned exhaust gas recirculation (EGR) systems for emissions reduction.\\nBuilt fuel delivery and ignition systems monitoring components.",
            "github": "GitHub"
          }
        ],
        "skills": {
          "languages": "C/C++, MATLAB Simulink, Python, Java, JavaScript",
          "frameworks": "AUTOSAR, React, Node.js, TensorFlow, PyTorch"
        }
      }
      
      IMPORTANT FORMATTING: For 'detailed_experience' in experiences and 'description' in projects, separate each bullet point with the newline character '\\n'. Each bullet point must:
      1. Be on a separate line
      2. Start with an action verb
      3. Include at least one specific accomplishment with metrics when possible
      4. Contain at least one exact keyword match from the job description
      
      Make all content realistic, detailed, and highly relevant to the specific job description. Each experience should include multiple detailed bullet points showing expertise and measurable achievements. Each project should demonstrate relevant technical skills with specific contributions and outcomes. Include at least 5-8 languages and frameworks in the skills section, prioritizing those mentioned in the job description.
    `;
    }

    console.log('🔍 Sending request to Google AI Studio');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('📤 Received response from Google AI Studio');

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
    return {
      message: "Error with Google AI Studio: " + error.message,
      personal: { name: "John Doe", email: "johndoe@example.com", phone: "+1 123 456 7890", city: "New York", state: "NY", github: "github.com/johndoe", linkedin: "linkedin.com/in/johndoe", website: "johndoe.com" },
      education: [{ university: "Massachusetts Institute of Technology", major: "Mechanical Engineering", gpa: "3.8", level: "Bachelor", graduation_date: "May 2017", coursework: "Embedded Systems, Control Systems, IC Engines, Software Development, Data Analysis, Basic Statistics" }],
      experience: [],
      projects: [],
      skills: { languages: "C/C++, MATLAB Simulink", frameworks: "AUTOSAR" }
    };
  }
} 