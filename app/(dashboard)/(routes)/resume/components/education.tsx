import * as React from "react"
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import  {useState, useEffect} from "react"
import { Textarea } from "@/components/ui/textarea"
import  DatePicker  from "./datepicker"

interface EducationProps {
    data: {
        type: string
    }
}

import { useGlobalContext } from "@/context/global-context"
import { set } from "date-fns"
import { Delete } from 'lucide-react';


export function Education({ data }: EducationProps) {
  const {addEducationData} = useGlobalContext();
  const [formCount, setFormCount] = React.useState(1);
  const [education, setEducation] = useState<Array<{university: string; major: string; gpa: string; level: string; graduation_date: string; coursework: string }>>([]);

  useEffect(() => {
    const loadEducationData = () => {
      const storedEducation = localStorage.getItem('education');
      if (storedEducation) {
        const parsedEducation = JSON.parse(storedEducation);
        setEducation(parsedEducation);
        setFormCount(Math.max(parsedEducation.length, 1));
      }
    };

    // Initial load
    loadEducationData();
    
    // Listen for storage events (triggered when AI generates data)
    const handleStorageChange = () => {
      loadEducationData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  const handleAddForm = () => {
    setFormCount(prevCount => prevCount + 1);
  };

  const handleChange = (index: number, key: string, value: string) => {
    if (key === 'graduation_date') {
      const date = new Date(value);
      const formattedDate = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      const updatedEducation = [...education];
    updatedEducation[index] = {...updatedEducation[index],  [key]: formattedDate};
    setEducation(updatedEducation);
    }else{
    const updatedEducation = [...education];
    updatedEducation[index] = {...updatedEducation[index],  [key]: value};
    setEducation(updatedEducation);

    }

    
  };

  const handleSaveEducation = () => {
    localStorage.setItem('education', JSON.stringify(education));
    addEducationData(education);
    toast.success('Education Added on Resume');

  };

  const handleDeleteAll = () => {
    localStorage.removeItem("education");
    setEducation([]);
    addEducationData([]);
  }

  return (
    <Card className="grid-cols-2 gap-x-4 gap-y-8">
      <CardHeader>
        <div className="flex justify-between">
        <CardTitle>{data.type}</CardTitle>
        <Delete  className="cursor-pointer" size={24} onClick={handleDeleteAll}  />
        </div>
      </CardHeader>
      <CardContent>
        {[...Array(formCount)].map((_, index) => (
          <form key={index} >
            <div className="grid w-full items-center gap-4 mb-5">
              <Label htmlFor="framework">University</Label>
              <Input
               id={`university-${index}`} 
               placeholder="Northern Kentucky University"
               onChange= {e => handleChange(index, 'university', e.target.value)}
               value={education[index]?.university || ""}
               />
               <div className="grid grid-cols-2 gap-x-2 gap-y-4">
                <div className="space-y-2">
                <Label htmlFor="framework">Major</Label>
               <Input 
               id={`major-${index}`} 
               placeholder="Computer Science" 
               onChange= {e => handleChange(index, 'major', e.target.value)}
               value={education[index]?.major || ""}

               />
               </div>
               <div className="space-y-2"> 
                <Label htmlFor="framework">GPA</Label>
               <Input
                id={`grade-${index}`}
                 placeholder="3.85"
                 onChange= {e => handleChange(index, 'gpa', e.target.value)}
                 value = {education[index]?.gpa || ""}


                 />
               </div>

               <div className="space-y-2">
                <Label htmlFor="framework">Level</Label>
               <Input 
               id={`level-${index}`} 
               placeholder="BS"
               onChange= {e => handleChange(index, 'level', e.target.value)}
               value = {education[index]?.level || ""}

               />
               </div>

               <div className="space-y-2 flex flex-col ml-auto">
                <Label htmlFor="framework">Graduation</Label>
                 <DatePicker
                  selectedDate={education[index]?.graduation_date|| undefined}
                  onSelectDate={date => handleChange(index, 'graduation_date', date as any)}
                />

               </div>
               
               </div>
                <Label htmlFor="framework">Relevant Coursework</Label>
               <Textarea 
               id={`course-description-${index}`}
                placeholder="Data Structure and Algorithm, Object Oriented Programming.." 
                onChange= {e => handleChange(index, 'coursework', e.target.value)}
                value = {education[index]?.coursework || ""}
                />
            </div>
          </form>
        ))}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button className="mr-1"onClick={handleAddForm}>+1</Button>
        <Button onClick={handleSaveEducation}>Save Education</Button>
      </CardFooter>
    </Card>
  )
}
