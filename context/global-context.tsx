"use client";

import React, { createContext, useContext, Dispatch, SetStateAction, useState, useEffect, ReactNode } from 'react';

type ProjectDataType = {
  name: string;
  language: string;
  description: string;
};

type UserData = {
  userId: string;
  score: number;
};

type Skill = {
  languages: string;
  frameworks: string;

};

type Experience = {
  title: string;
  company: string;
  start_date: string;
  end_date: string;
  detailed_experience: string;

};

type Education = {
  university: string;
  major: string;
  gpa: string;
  level: string;
  graduation_date: string;
  coursework: string;
};

type Personal = {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  github: string;
  linkedin: string;
  website: string;
};



type GlobalContextType = {
  userId: string;
  setUserId: Dispatch<SetStateAction<string>>;
  projectData: ProjectDataType[];
  addProjectData: (projects: ProjectDataType[]) => void;
  userData: UserData[];
  addUserData: (userData: UserData) => void;
  setUserData: Dispatch<SetStateAction<UserData[]>>;

  // skills
  skillsData: Skill[];
  addSkillsData: (skills: Skill[]) => void;

  // Experience
  experienceData: Experience[];
  addExperienceData: (experience: Experience[]) => void;

  // Education
  educationData: Education[];
  addEducationData: (education: Education[]) => void;

  //Personal
  personalData: Personal[];
  addPersonalData: (personal: Personal[]) => void;

};

const GlobalContext = createContext<GlobalContextType>({
  userId: '',
  setUserId: () => {},
  projectData: [],
  addProjectData: () => {},
  userData: [],
  addUserData: () => {},
  setUserData: () => {},
  skillsData: [],
  addSkillsData: () => {},

  experienceData: [],
  addExperienceData: () => {},

  educationData: [],
  addEducationData: () => {},

  personalData: [],
  addPersonalData: () => {},
});

export const useGlobalContext = () => useContext(GlobalContext);

type GlobalContextProviderProps = {
  children: ReactNode;
};

export const GlobalContextProvider: React.FC<GlobalContextProviderProps> = ({ children }) => {
  const [userId, setUserId] = useState('');
  const [projectData, setProjectData] = useState<ProjectDataType[]>([]);
  const [userData, setUserData] = useState<UserData[]>([]);
  const [skillsData, setSkillsData] = useState<Skill[]>([]);
  const [experienceData, setExperienceData] = useState<Experience[]>([]);
  const [educationData, setEducationData] = useState<Education[]>([]);
  const [personalData, setPersonalData] = useState<Personal[]>([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedProjectData = localStorage.getItem('projectData');
    console.log('This is the storedProjectData:', storedProjectData);
    if (storedProjectData) {
      setProjectData(JSON.parse(storedProjectData));
    
    }

    const storedSkillsData = localStorage.getItem('skillsData');
    if (storedSkillsData) {
      setSkillsData(JSON.parse(storedSkillsData));
    }

    const storedExperienceData = localStorage.getItem('experienceData');
    if (storedExperienceData) {
      setExperienceData(JSON.parse(storedExperienceData));
    }

    const storedEducationData = localStorage.getItem('educationData');
    if (storedEducationData) {
      setEducationData(JSON.parse(storedEducationData));
    }

    const storedPersonalData = localStorage.getItem('personalData');
    console.log('This is the storedPersonalData:', storedPersonalData)
    if (storedPersonalData) {
      setPersonalData(JSON.parse(storedPersonalData));
    }

    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);



  const addProjectData = (projects: ProjectDataType[]) => {
    setProjectData(projects);
    localStorage.setItem('projectData', JSON.stringify(projects));
  };

  const addUserData = (userDataItem: UserData) => {
    setUserData((prevData) => [...prevData, userDataItem]);
    localStorage.setItem('userData', JSON.stringify([...userData, userDataItem]));
  };

  const addSkillsData = (skills: Skill[]) => {
    setSkillsData(skills);
    localStorage.setItem('skillsData', JSON.stringify(skills));

  }

  const addExperienceData = (experience: Experience[]) => {
    setExperienceData(experience);
    localStorage.setItem('experienceData', JSON.stringify(experience));

  }

  const addEducationData = (education: Education[]) => {
    setEducationData(education);
    localStorage.setItem('educationData', JSON.stringify(education));

  }

  const addPersonalData = (personal: Personal[]) => {
    setPersonalData(personal);
    localStorage.setItem('personalData', JSON.stringify(personal));

  }


  return (
    <GlobalContext.Provider value={{ 
      userId, setUserId, projectData, addProjectData, userData, addUserData, setUserData,
      skillsData, addSkillsData , experienceData, addExperienceData, educationData, addEducationData
      , personalData, addPersonalData
      
      }}>
      {children}
    </GlobalContext.Provider>
  );
};
