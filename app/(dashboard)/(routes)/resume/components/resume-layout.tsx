// "use client";
// import React, { useState } from "react";
// import { useGlobalContext } from "@/context/global-context";
// import MyDocument from "./MyDocument";
// import EditableResume from "./editable-resume";
// import InteractiveResume from "./interactive-resume";
// import dynamic from "next/dynamic";
// import { Button } from "@/components/ui/button";
// import { ArrowLeft, FileText, Eye } from "lucide-react";

// interface ResumeLayoutProps {
//   data: {
//     name: string;
//     email: string;
//     // Add more fields as needed
//   };
// }

// const PDFViewer = dynamic(() => import("@react-pdf/renderer").then(mod => mod.PDFViewer), { ssr: false });

// const ResumeLayout: React.FC<ResumeLayoutProps> = ({ data }) => {
//   const { projectData, skillsData, experienceData, educationData, personalData, font, fontSize } = useGlobalContext();
//   const [showPdfView, setShowPdfView] = useState(false);  // Default to interactive view
//   const [showPdfWrapper, setShowPdfWrapper] = useState(true); // Toggle between PDF UI and plain content

//   const toggleView = () => {
//     setShowPdfView(!showPdfView);
//   };

//   const togglePdfWrapper = () => {
//     setShowPdfWrapper(!showPdfWrapper);
//   };

//   return (
//     <div className="md:w-full md:flex md:justify-center mx-auto">
//       <div className={`w-full ${showPdfView ? 'max-w-4xl' : 'max-w-[21cm]'}`}>
//         {showPdfView ? ( 
//           <>
//           <div className="relative">
//             <div className="z-10 flex gap-2 mb-2">
//               <Button 
//                 onClick={toggleView}
//                 variant="outline"
//                 className="flex items-center gap-1 bg-white border-black"
//               >
//                 <ArrowLeft size={16} />
//                 Back to Edit View
//               </Button>
//             </div>
            
//             <style jsx global>{`
//               .react-pdf__Document {
//                 display: flex;
//                 flex-direction: column;
//                 align-items: center;
//               }
//               .react-pdf__Page {
//                 margin: 1em 0;
//                 box-shadow: 0 5px 15px rgba(0,0,0,0.1);
//                 border: 1px solid #ddd;
//               }
//               .mobile-viewer {
//                 height: 100vh !important;
//                 width: 100% !important;
//                 margin: 0 !important;
//                 padding-top: 5px !important;
//               }
//             `}</style>
            

//               <PDFViewer className="mobile-viewer">
//                 <MyDocument 
//                   projectData={projectData}
//                   skillsData={skillsData}
//                   experienceData={experienceData}
//                   educationData={educationData}
//                   personalData={personalData}
//                   font={font}
//                   fontSize={fontSize}
//                 />
//               </PDFViewer>
//               </>
//               ) : (
//               <InteractiveResume togglePdfView={toggleView} /> 
//         )}
//       </div>
//     </div>
//   );
// };


// export default ResumeLayout;


"use client";

import React, { useState } from "react";
import { useGlobalContext } from "@/context/global-context";
import MyDocument from "./MyDocument";
import EditableResume from "./editable-resume";
import InteractiveResume from "./interactive-resume";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Eye } from "lucide-react";

interface ResumeLayoutProps {
  data: {
    name: string;
    email: string;
    // Add more fields as needed
  };
}

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false }
);

const ResumeLayout: React.FC<ResumeLayoutProps> = ({ data }) => {
  const {
    projectData,
    skillsData,
    experienceData,
    educationData,
    personalData,
    font,
    fontSize,
  } = useGlobalContext();

  const [showPdfView, setShowPdfView] = useState(false); // Default to interactive view
  const [showPdfWrapper, setShowPdfWrapper] = useState(true); // Toggle between PDF UI and plain content

  const toggleView = () => {
    setShowPdfView((prev) => !prev);
  };

  const togglePdfWrapper = () => {
    setShowPdfWrapper((prev) => !prev);
  };

  return (
    <div className="md:w-3/4 md:flex md:justify-center mx-auto">
      <div className={`w-full ${showPdfView ? "max-w-4xl" : "max-w-[21cm]"}`}>
        {showPdfView ? (
          <>
            <div className="relative">
              <div className="z-10 flex gap-2 mb-2">
                <Button
                  onClick={toggleView}
                  variant="outline"
                  className="flex items-center gap-1 bg-white border-black"
                >
                  <ArrowLeft size={16} />
                  Back to Edit View
                </Button>
              </div>

              <style jsx global>{`
                .react-pdf__Document {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                }
                .react-pdf__Page {
                  margin: 1em 0;
                  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                  border: 1px solid #ddd;
                }
                .mobile-viewer {
                  height: 100vh !important;
                  width: 100% !important;
                  margin: 0 !important;
                  padding-top: 5px !important;
                }
              `}</style>

              <PDFViewer className="mobile-viewer">
                <MyDocument
                  projectData={projectData}
                  skillsData={skillsData}
                  experienceData={experienceData}
                  educationData={educationData}
                  personalData={personalData}
                  font={font}
                  fontSize={fontSize}
                />
              </PDFViewer>
            </div>
          </>
        ) : (
          <InteractiveResume togglePdfView={toggleView} />
        )}
      </div>
    </div>
  );
};

export default ResumeLayout;
