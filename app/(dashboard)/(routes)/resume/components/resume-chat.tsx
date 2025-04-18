import React, { useState, useRef, useEffect } from 'react';
import { useGlobalContext } from "@/context/global-context";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Edit, Target, Clock, Search } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "react-hot-toast";

interface ResumeChatProps {
  onApplyChanges: (section: string, data: any) => void;
  activeSection?: { type: string, index: number } | null;
  jobRole?: string;
}

const ResumeChat: React.FC<ResumeChatProps> = ({ onApplyChanges, activeSection, jobRole }) => {
  const { 
    projectData,
    skillsData,
    experienceData,
    educationData,
    personalData,
  } = useGlobalContext();

  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant' | 'system', content: string }>>([
    { role: 'system', content: 'Ready to edit your resume.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update chat context when active section changes
  useEffect(() => {
    if (activeSection) {
      let actionPrompt = '';
      let sectionName = '';
      
      if (activeSection.type === 'experience' && experienceData && experienceData[activeSection.index]) {
        sectionName = experienceData[activeSection.index].company;
      } else if (activeSection.type === 'project' && projectData && projectData[activeSection.index]) {
        sectionName = projectData[activeSection.index].name;
      }
      
      if (sectionName) {
        setMessages([
          { role: 'system', content: 'Ready to edit your resume.' },
          { role: 'assistant', content: `I'll edit the ${sectionName} section. What changes would you like to make?` }
        ]);
      }
    }
  }, [activeSection, experienceData, projectData]);

  const getSuggestionButtons = () => {
    if (!activeSection) return null;
    
    let sectionName = '';
    if (activeSection.type === 'experience' && experienceData && experienceData[activeSection.index]) {
      sectionName = experienceData[activeSection.index].company;
    } else if (activeSection.type === 'project' && projectData && projectData[activeSection.index]) {
      sectionName = projectData[activeSection.index].name;
    }
    
    if (!sectionName) return null;
    
    return (
      <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
        <Button 
          variant="outline" 
          size="sm"
          className="whitespace-nowrap flex items-center gap-1"
          onClick={() => handleQuickAction("edit", sectionName)}
        >
          <Edit size={14} /> Edit {sectionName}
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="whitespace-nowrap flex items-center gap-1"
          onClick={() => handleQuickAction("improve", sectionName)}
        >
          <Search size={14} /> Improve wording
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="whitespace-nowrap flex items-center gap-1"
          onClick={() => handleQuickAction("shorten", sectionName)}
        >
          <Clock size={14} /> Shorten bullets
        </Button>
        {jobRole && (
          <Button 
            variant="outline" 
            size="sm"
            className="whitespace-nowrap flex items-center gap-1"
            onClick={() => handleQuickAction("tailor", sectionName, jobRole)}
          >
            <Target size={14} /> Tailor for {jobRole}
          </Button>
        )}
      </div>
    );
  };

  const handleQuickAction = (action: string, sectionName: string, role?: string) => {
    let message = '';
    
    switch (action) {
      case 'edit':
        message = `Edit the ${sectionName} section to be more impactful`;
        break;
      case 'improve':
        message = `Improve the language in the ${sectionName} section`;
        break;
      case 'shorten':
        message = `Shorten the ${sectionName} section while keeping key achievements`;
        break;
      case 'tailor':
        message = `Tailor the ${sectionName} section for a ${role} position`;
        break;
      default:
        message = `Edit the ${sectionName} section`;
    }
    
    setInput(message);
    handleSendMessage(message);
  };

  const handleSendMessage = async (overrideMessage?: string) => {
    const messageText = overrideMessage || input;
    if (!messageText.trim()) return;
    
    // Add user message to chat
    const userMessage = { role: 'user' as const, content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare request data
      const requestData: any = {
        message: messageText,
        resumeData: {
          experience: experienceData,
          projects: projectData,
          skills: skillsData,
          education: educationData,
          personal: personalData
        }
      };

      // Add selected section if available
      if (activeSection) {
        requestData.activeSection = activeSection;
      }

      // Send request to API
      const response = await fetch('/api/resume-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      
      // Add AI response to chat
      setMessages(prev => [...prev, { role: 'assistant', content: data.message || "I've updated your resume." }]);
      
      // If there are changes to apply, notify parent component
      if (data.changes) {
        onApplyChanges(data.section, data.changes);
        toast.success(`Updated ${data.section} successfully!`);
      }
    } catch (error) {
      console.error('Error in chat:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I've encountered an issue. Please try again." 
      }]);
      toast.error('Error updating your resume');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const visibleMessages = messages.filter(message => message.role !== 'system');

  return (
    <Card className="flex flex-col h-[500px]">
      <CardContent className="flex flex-col h-full p-4">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {visibleMessages.length === 0 && (
            <div className="text-center text-gray-500 my-8">
              Type a command to edit your resume or use the quick actions below.
            </div>
          )}
          
          {visibleMessages.map((message, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-blue-100 ml-auto max-w-[80%]' 
                  : 'bg-gray-100 mr-auto max-w-[80%]'
              }`}
            >
              {message.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {getSuggestionButtons()}
        
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter a command (e.g., 'Shorten the DelightMate experience')"
            className="resize-none"
            rows={2}
          />
          <Button 
            onClick={() => handleSendMessage()}
            disabled={isLoading || !input.trim()}
            className="mb-1"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumeChat; 