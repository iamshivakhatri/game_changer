import React, { useState, useRef, useEffect } from 'react';
import { useGlobalContext } from "@/context/global-context";
import { Button } from "@/components/ui/button";
import { FileText, Maximize, Minimize, MessageSquare } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "react-hot-toast";

interface InteractiveResumeProps {
  togglePdfView: () => void;
}

const InteractiveResume: React.FC<InteractiveResumeProps> = ({ togglePdfView }) => {
  const { 
    projectData,
    skillsData,
    experienceData,
    educationData,
    personalData,
    font,
    fontSize,
    addPersonalData,
    addEducationData,
    addExperienceData,
    addProjectData,
    addSkillsData
  } = useGlobalContext();

  // State for tracking selected section
  const [selectedSection, setSelectedSection] = useState<{
    type: 'personal' | 'education' | 'experience' | 'project' | 'skill';
    index: number;
  } | null>(null);

  // State for chat dialog
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  // State to track whether content has been edited
  const [hasBeenEdited, setHasBeenEdited] = useState(false);

  // Format bullet points for display
  const formatBulletPoints = (text: string, isEditable = false) => {
    return text
      .split('\n')
      .filter(line => line.trim())
      .map((line, index) => (
        <div key={index} className="flex items-start mb-2 w-full">
          <span className="mr-1 text-bullet">•</span>
          <span 
            className="flex-1 ml-1 flex-wrap w-95 text-bullet-content"
            onDoubleClick={isEditable ? (e) => handleDoubleClick(e, 'bullet', index, line) : undefined}
            suppressContentEditableWarning={true}
          >
            {line.trim()}
          </span>
        </div>
      ));
  };

  // Handle double click for inline editing
  const handleDoubleClick = (
    e: React.MouseEvent, 
    fieldType: string, 
    index: number, 
    currentContent: string,
    sectionType?: 'personal' | 'education' | 'experience' | 'project' | 'skill',
    fieldName?: string
  ) => {
    const target = e.target as HTMLElement;
    target.contentEditable = 'true';
    target.focus();
    
    // Add blur event to save changes
    target.onblur = () => {
      target.contentEditable = 'false';
      const newContent = target.textContent || '';
      
      if (newContent !== currentContent) {
        updateContent(sectionType || '', fieldName || '', newContent, index, fieldType);
        setHasBeenEdited(true);
      }
    };

    // Save on Enter key press
    target.onkeydown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        target.blur();
      }
    };
  };

  // Update content in global context
  const updateContent = (
    sectionType: string, 
    fieldName: string, 
    newContent: string, 
    index: number, 
    fieldType: string
  ) => {
    if (sectionType === 'personal') {
      const updatedData = [...personalData];
      updatedData[index] = {
        ...updatedData[index],
        [fieldName]: newContent
      };
      addPersonalData(updatedData);
    } 
    else if (sectionType === 'education') {
      const updatedData = [...educationData];
      updatedData[index] = {
        ...updatedData[index],
        [fieldName]: newContent
      };
      addEducationData(updatedData);
    }
    else if (sectionType === 'experience') {
      const updatedData = [...experienceData];
      if (fieldType === 'bullet') {
        // Handle bullet point editing for experience
        const bulletPoints = updatedData[index].detailed_experience.split('\n');
        bulletPoints[index] = newContent;
        updatedData[index].detailed_experience = bulletPoints.join('\n');
      } else {
        updatedData[index] = {
          ...updatedData[index],
          [fieldName]: newContent
        };
      }
      addExperienceData(updatedData);
    }
    else if (sectionType === 'project') {
      const updatedData = [...projectData];
      if (fieldType === 'bullet') {
        // Handle bullet point editing for projects
        const bulletPoints = updatedData[index].description.split('\n');
        bulletPoints[index] = newContent;
        updatedData[index].description = bulletPoints.join('\n');
      } else {
        updatedData[index] = {
          ...updatedData[index],
          [fieldName]: newContent
        };
      }
      addProjectData(updatedData);
    }
    else if (sectionType === 'skill') {
      const updatedData = [...skillsData];
      updatedData[index] = {
        ...updatedData[index],
        [fieldName]: newContent
      };
      addSkillsData(updatedData);
    }
  };

  // Handle section click for selection
  const handleSectionClick = (
    type: 'personal' | 'education' | 'experience' | 'project' | 'skill',
    index: number
  ) => {
    setSelectedSection({ type, index });
  };

  // Get content based on selected section
  const getSelectedSectionContent = () => {
    if (!selectedSection) return '';
    
    const { type, index } = selectedSection;
    
    switch (type) {
      case 'personal':
        return `Name: ${personalData[index]?.name}\nEmail: ${personalData[index]?.email}\nPhone: ${personalData[index]?.phone}\nLocation: ${personalData[index]?.city}, ${personalData[index]?.state}\nLinks: ${personalData[index]?.github} | ${personalData[index]?.linkedin} | ${personalData[index]?.website}`;
      
      case 'education':
        return `${educationData[index]?.university}\n${educationData[index]?.level} in ${educationData[index]?.major}\nGraduation: ${educationData[index]?.graduation_date}\nCoursework: ${educationData[index]?.coursework}`;
      
      case 'experience':
        return `${experienceData[index]?.title} at ${experienceData[index]?.company}\n${experienceData[index]?.start_date} - ${experienceData[index]?.isEndPresent ? 'Present' : experienceData[index]?.end_date}\n\n${experienceData[index]?.detailed_experience}`;
      
      case 'project':
        return `${projectData[index]?.name} (${projectData[index]?.language})\nGitHub: ${projectData[index]?.github}\n\n${projectData[index]?.description}`;
      
      case 'skill':
        return `Technical Skills: ${skillsData[index]?.languages}\nFrameworks: ${skillsData[index]?.frameworks}`;
      
      default:
        return '';
    }
  };

  // Handle enhance action - immediate execution
  const handleEnhance = async () => {
    if (!selectedSection) return;
    
    const { type, index } = selectedSection;
    toast.loading("Enhancing content...");
    
    try {
      if (type === 'experience') {
        // Enhance experience
        const exp = experienceData[index];
        
        // Enhanced bullet points
        const bulletPoints = exp.detailed_experience.split('\n')
          .filter(p => p.trim())
          .map(p => p.replace(/^•\s*/, '').trim())
          .map(p => {
            // Add action verbs and make more impactful
            if (!p.startsWith("Led") && !p.startsWith("Managed") && !p.startsWith("Developed")) {
              return `• Led efforts to ${p}`;
            }
            return `• ${p}`;
          });
        
        // Update the experience data
        const updatedData = [...experienceData];
        updatedData[index] = {
          ...updatedData[index],
          detailed_experience: bulletPoints.join('\n')
        };
        addExperienceData(updatedData);
        setHasBeenEdited(true);
        toast.dismiss();
        toast.success("Content enhanced!");
      } 
      else if (type === 'project') {
        // Enhance project
        const project = projectData[index];
        
        // Enhanced bullet points
        const bulletPoints = project.description.split('\n')
          .filter(p => p.trim())
          .map(p => p.replace(/^•\s*/, '').trim())
          .map(p => {
            // Add technical emphasis
            if (!p.includes("implemented") && !p.includes("developed") && !p.includes("created")) {
              return `• Successfully implemented ${p} with significant performance improvements`;
            }
            return `• ${p} resulting in improved efficiency`;
          });
        
        // Update the project data
        const updatedData = [...projectData];
        updatedData[index] = {
          ...updatedData[index],
          description: bulletPoints.join('\n')
        };
        addProjectData(updatedData);
        setHasBeenEdited(true);
        toast.dismiss();
        toast.success("Content enhanced!");
      }
      else {
        toast.dismiss();
        toast.error("Enhancement not supported for this section type");
      }
    } catch (error) {
      console.error('Error enhancing content:', error);
      toast.dismiss();
      toast.error("Failed to enhance content");
    }
  };

  // Handle shorten action - immediate execution
  const handleShorten = async () => {
    if (!selectedSection) return;
    
    const { type, index } = selectedSection;
    toast.loading("Shortening content...");
    
    try {
      if (type === 'experience') {
        // Shorten experience
        const exp = experienceData[index];
        
        // Shortened bullet points
        const bulletPoints = exp.detailed_experience.split('\n')
          .filter(p => p.trim())
          .slice(0, Math.max(3, Math.floor(exp.detailed_experience.split('\n').length / 2)))
          .map(p => p.replace(/^•\s*/, '').trim())
          .map(p => {
            // Make points more concise
            const words = p.split(' ');
            return `• ${words.slice(0, Math.min(10, words.length)).join(' ')}${words.length > 10 ? '...' : ''}`;
          });
        
        // Update the experience data
        const updatedData = [...experienceData];
        updatedData[index] = {
          ...updatedData[index],
          detailed_experience: bulletPoints.join('\n')
        };
        addExperienceData(updatedData);
        setHasBeenEdited(true);
        toast.dismiss();
        toast.success("Content shortened!");
      } 
      else if (type === 'project') {
        // Shorten project
        const project = projectData[index];
        
        // Shortened bullet points
        const bulletPoints = project.description.split('\n')
          .filter(p => p.trim())
          .slice(0, Math.min(3, project.description.split('\n').length))
          .map(p => p.replace(/^•\s*/, '').trim())
          .map(p => {
            // Make points more concise
            const words = p.split(' ');
            return `• ${words.slice(0, Math.min(8, words.length)).join(' ')}${words.length > 8 ? '...' : ''}`;
          });
        
        // Update the project data
        const updatedData = [...projectData];
        updatedData[index] = {
          ...updatedData[index],
          description: bulletPoints.join('\n')
        };
        addProjectData(updatedData);
        setHasBeenEdited(true);
        toast.dismiss();
        toast.success("Content shortened!");
      }
      else {
        toast.dismiss();
        toast.error("Shortening not supported for this section type");
      }
    } catch (error) {
      console.error('Error shortening content:', error);
      toast.dismiss();
      toast.error("Failed to shorten content");
    }
  };

  // Handle chat action
  const handleChat = () => {
    if (!selectedSection) return;
    
    // Only show dialog for chat function
    const content = getSelectedSectionContent();
    setChatPrompt(`Here is my ${selectedSection.type} content:\n\n${content}\n\nI'd like advice on how to improve it.`);
    setChatResponse('');
    setChatDialogOpen(true);
  };

  // Process chat response
  const processChatResponse = async () => {
    if (!selectedSection) return;
    
    setIsChatLoading(true);
    
    try {
      // In a real app, you would call your API here
      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setChatResponse("Here's my feedback on your content:\n\n" +
        "1. Your experience description is well-structured.\n" +
        "2. Consider quantifying your achievements with metrics.\n" +
        "3. Use more action verbs at the beginning of each bullet point.\n" +
        "4. Highlight specific technologies or methodologies you used.\n" +
        "5. Make sure to emphasize the impact of your work.");
    } catch (error) {
      console.error('Error processing chat request:', error);
      setChatResponse('An error occurred while processing your request. Please try again.');
    } finally {
      setIsChatLoading(false);
    }
  };

  // Safe PDF toggle handler that works even after edits
  const handlePdfViewToggle = () => {
    // Store current resume data in localStorage before toggling
    if (hasBeenEdited) {
      localStorage.setItem('resumeDataBeforePdf', JSON.stringify({
        personalData,
        educationData,
        experienceData,
        projectData,
        skillsData
      }));
    }
    
    togglePdfView();
  };

  return (
    <div className="relative">
      {/* PDF-like styles similar to MyDocument */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Carlito:wght@400;700&display=swap');
        
        .resume-container {
          font-family: ${font || 'Carlito, sans-serif'};
          color: #000000;
          padding: 40px 53px 27px 53px; /* Converted from pt to px (30pt*1.3333, 40pt*1.3333, 20pt*1.3333) */
          border: 1px solid #ddd;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          background-color: white;
          width: 816px; /* 612pt * 1.3333 */
          height: 1056px; /* 792pt * 1.3333 */
          position: relative;
          overflow-y: auto;
          box-sizing: border-box;
        }

        .section-header {
          color: maroon;
          font-weight: bold;
          font-size: 18.6px; /* 14pt * 1.3333 */
          margin-bottom: 2.7px; /* 2pt * 1.3333 */
          display: flex;
          align-items: center;
        }

        .horizontal-line {
          flex-grow: 1;
          border-bottom: 1px solid maroon;
          margin-left: 6.7px; /* 5pt * 1.3333 */
        }

        .name-header {
          font-size: 29.3px; /* 22pt * 1.3333 */
          font-weight: bold;
          margin-bottom: 2.7px; /* 2pt * 1.3333 */
        }
        
        .section {
          margin-bottom: 6.7px; /* 5pt * 1.3333 */
          flex-grow: 1;
        }
        
        .text-header {
          font-size: 16px; /* 12pt * 1.3333 */
          font-weight: bold;
        }
        
        .text-normal {
          font-size: ${fontSize ? `${fontSize * 1.3333}px` : '14px'}; /* 10.5pt * 1.3333 */
          margin-bottom: 2.7px; /* 2pt * 1.3333 */
        }
        
        .text-bold {
          font-size: ${fontSize ? `${fontSize * 1.3333}px` : '14px'}; /* 10.5pt * 1.3333 */
          font-weight: bold;
        }
        
        .section-horizontal {
          display: flex;
          flex-direction: row;
          font-size: 14px; /* 10.5pt * 1.3333 */
          gap: 5.3px; /* 4pt * 1.3333 */
        }
        
        .top-line {
          display: flex;
          justify-content: space-between;
          width: 100%;
          font-weight: bold;
        }
        
        .skill-container {
          display: flex;
          justify-content: flex-start;
          margin-bottom: 6.7px; /* 5pt * 1.3333 */
        }
        
        .bold-label {
          font-family: 'Carlito', sans-serif;
          font-weight: bold;
          font-size: 14px; /* 10.5pt * 1.3333 */
        }
        
        .value {
          font-family: 'Carlito', sans-serif;
          font-size: 14px; /* 10.5pt * 1.3333 */
          flex-wrap: wrap;
          max-width: 90%;
          word-break: break-word;
        }
        
        .text-bullet {
          font-size: 14px; /* 10.5pt * 1.3333 */
          margin-right: 4px; /* 3pt * 1.3333 */
        }
        
        .text-bullet-content {
          font-size: 14px; /* 10.5pt * 1.3333 */
          margin-left: 6.7px; /* 5pt * 1.3333 */
          flex-wrap: wrap;
          width: 95%;
        }

        .resume-container {
          line-height: 1;
        }

        .selected-section {
          border: 2px solid #4a90e2;
          border-radius: 4px;
          padding: 4px;
          margin: -4px;
          position: relative;
        }

        [contenteditable=true]:focus {
          outline: none;
          border-bottom: 1px dotted #999;
        }

      `}</style>

      <div className="bg-white p-0 rounded-lg shadow-md w-full mx-auto my-4 relative">
        <div className="absolute top-4 right-4 z-10">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePdfViewToggle}
            className="flex items-center gap-1"
          >
            <FileText size={16} />
            PDF View
          </Button>
        </div>

        {/* Action buttons for selected section */}
        {selectedSection && (
          <div className="absolute right-[-120px] top-1/4 flex flex-col gap-2 z-20">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleEnhance}
              className="flex items-center gap-1 w-full"
            >
              <Maximize size={16} />
              Enhance
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleShorten}
              className="flex items-center gap-1 w-full"
            >
              <Minimize size={16} />
              Shorten
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleChat}
              className="flex items-center gap-1 w-full"
            >
              <MessageSquare size={16} />
              Chat
            </Button>
          </div>
        )}

        <div className="resume-container">
          {/* Header */}
          <div 
            className={`flex justify-between mb-6.7 ${selectedSection?.type === 'personal' && selectedSection?.index === 0 ? 'selected-section' : ''}`}
            onClick={() => handleSectionClick('personal', 0)}
          >
            <div>
              <h1 
                className="name-header"
                onDoubleClick={(e) => handleDoubleClick(e, 'text', 0, personalData[0]?.name || '', 'personal', 'name')}
              >
                {personalData[0]?.name}
              </h1>
              <div className="section-horizontal">
                <span 
                  onDoubleClick={(e) => handleDoubleClick(e, 'text', 0, personalData[0]?.phone || '', 'personal', 'phone')}
                >
                  {personalData[0]?.phone}
                </span>
                <span 
                  onDoubleClick={(e) => handleDoubleClick(e, 'text', 0, personalData[0]?.city || '', 'personal', 'city')}
                >
                  {personalData[0]?.city},
                </span>
                <span 
                  onDoubleClick={(e) => handleDoubleClick(e, 'text', 0, personalData[0]?.state || '', 'personal', 'state')}
                >
                  {personalData[0]?.state}
                </span>
                <span 
                  onDoubleClick={(e) => handleDoubleClick(e, 'text', 0, personalData[0]?.email || '', 'personal', 'email')}
                >
                  {personalData[0]?.email}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span 
                className="text-normal text-right"
                onDoubleClick={(e) => handleDoubleClick(e, 'text', 0, personalData[0]?.website || '', 'personal', 'website')}
              >
                {personalData[0]?.website}
              </span>
              <span 
                className="text-normal text-right"
                onDoubleClick={(e) => handleDoubleClick(e, 'text', 0, personalData[0]?.github || '', 'personal', 'github')}
              >
                {personalData[0]?.github}
              </span>
              <span 
                className="text-normal text-right"
                onDoubleClick={(e) => handleDoubleClick(e, 'text', 0, personalData[0]?.linkedin || '', 'personal', 'linkedin')}
              >
                {personalData[0]?.linkedin}
              </span>
            </div>
          </div>

          {/* Education Section */}
          <section className="section">
            <div className="section-header">
              <span>Education</span>
              <div className="horizontal-line"></div>
            </div>
            {educationData?.map((edu, index) => (
              <div 
                key={index}
                className={`${selectedSection?.type === 'education' && selectedSection?.index === index ? 'selected-section' : ''}`}
                onClick={() => handleSectionClick('education', index)}
              >
                <div className="top-line">
                  <span 
                    className="text-header"
                    onDoubleClick={(e) => handleDoubleClick(e, 'text', index, edu.university, 'education', 'university')}
                  >
                    {edu.university}
                  </span>
                  <span 
                    className="text-bold"
                    onDoubleClick={(e) => handleDoubleClick(e, 'text', index, `${edu.major}, ${edu.level}`, 'education', 'major')}
                  >
                    {edu.major}, {edu.level}
                  </span>
                  <span 
                    className="text-normal"
                    onDoubleClick={(e) => handleDoubleClick(e, 'text', index, edu.graduation_date, 'education', 'graduation_date')}
                  >
                    {edu.graduation_date}
                  </span>
                </div>
                <div 
                  className="text-normal"
                  onDoubleClick={(e) => handleDoubleClick(e, 'text', index, edu.coursework, 'education', 'coursework')}
                >
                  Coursework: {edu.coursework}
                </div>
              </div>
            ))}
          </section>

          {/* Experience Section */}
          <section className="section">
            <div className="section-header">
              <span>Work Experience</span>
              <div className="horizontal-line"></div>
            </div>
            {experienceData?.map((exp, index) => (
              <div 
                key={index}
                className={`${selectedSection?.type === 'experience' && selectedSection?.index === index ? 'selected-section' : ''}`}
                onClick={() => handleSectionClick('experience', index)}
              >
                <div className="top-line">
                  <span 
                    className="text-header"
                    onDoubleClick={(e) => handleDoubleClick(e, 'text', index, exp.title, 'experience', 'title')}
                  >
                    {exp.title}
                  </span>
                  <span 
                    className="text-bold"
                    onDoubleClick={(e) => handleDoubleClick(e, 'text', index, exp.company, 'experience', 'company')}
                  >
                    {exp.company}
                  </span>
                  <span 
                    className="text-normal"
                    onDoubleClick={(e) => handleDoubleClick(e, 'text', index, `${exp.start_date} - ${exp.isEndPresent ? 'Present' : exp.end_date}`, 'experience', 'start_date')}
                  >
                    {exp.start_date} - {exp.isEndPresent ? 'Present' : exp.end_date}
                  </span>
                </div>
                <div className="mt-1">
                  {formatBulletPoints(exp.detailed_experience, true)}
                </div>
              </div>
            ))}
          </section>

          {/* Projects Section */}
          <section className="section">
            <div className="section-header">
              <span>Projects</span>
              <div className="horizontal-line"></div>
            </div>
            {projectData?.map((project, index) => (
              <div 
                key={index}
                className={`${selectedSection?.type === 'project' && selectedSection?.index === index ? 'selected-section' : ''}`}
                onClick={() => handleSectionClick('project', index)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex">
                    <span 
                      className="text-header"
                      onDoubleClick={(e) => handleDoubleClick(e, 'text', index, project.name, 'project', 'name')}
                    >
                      {project.name} -
                    </span>
                    <span 
                      className="text-normal ml-1"
                      onDoubleClick={(e) => handleDoubleClick(e, 'text', index, project.language, 'project', 'language')}
                    >
                      {project.language}
                    </span>
                  </div>
                  <a 
                    href={project.github} 
                    className="underline text-normal" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onDoubleClick={(e) => {
                      e.preventDefault();
                      handleDoubleClick(e, 'text', index, project.github, 'project', 'github');
                    }}
                  >
                    GitHub
                  </a>
                </div>
                <div className="mt-1">
                  {formatBulletPoints(project.description, true)}
                </div>
              </div>
            ))}
          </section>

          {/* Skills Section */}
          <section className="section">
            <div className="section-header">
              <span>Skills</span>
              <div className="horizontal-line"></div>
            </div>
            {skillsData?.map((skill, index) => (
              <div 
                key={index}
                className={`${selectedSection?.type === 'skill' && selectedSection?.index === index ? 'selected-section' : ''}`}
                onClick={() => handleSectionClick('skill', index)}
              >
                <div className="skill-container">
                  <span className="bold-label">Technical Skills: </span>
                  <span 
                    className="value"
                    onDoubleClick={(e) => handleDoubleClick(e, 'text', index, skill.languages, 'skill', 'languages')}
                  >
                    {skill.languages}
                  </span>
                </div>
                <div className="skill-container">
                  <span className="bold-label">Frameworks: </span>
                  <span 
                    className="value"
                    onDoubleClick={(e) => handleDoubleClick(e, 'text', index, skill.frameworks, 'skill', 'frameworks')}
                  >
                    {skill.frameworks}
                  </span>
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>

      {/* Chat Dialog - Only for chat function */}
      <Dialog open={chatDialogOpen} onOpenChange={setChatDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Chat About Content
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">Your prompt:</label>
              <Textarea 
                value={chatPrompt} 
                onChange={(e) => setChatPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            {chatResponse && (
              <div className="mt-4">
                <label className="text-sm font-medium mb-2 block">Response:</label>
                <div className="p-3 bg-muted rounded-md whitespace-pre-wrap">
                  {chatResponse}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setChatDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={processChatResponse} 
              disabled={isChatLoading}
            >
              {isChatLoading ? 'Processing...' : 'Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InteractiveResume;