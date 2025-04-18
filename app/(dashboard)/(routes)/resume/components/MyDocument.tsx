import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Link } from '@react-pdf/renderer';

// Register fonts
try {
  Font.register({
    family: 'Carlito',
    fonts: [
      { src: 'https://fonts.gstatic.com/s/carlito/v3/3Jn9SDPw3m-pk039PDA.ttf' },
      { src: 'https://fonts.gstatic.com/s/carlito/v3/3Jn4SDPw3m-pk039BIykaX0.ttf', fontWeight: 'bold' }
    ],
  });

  Font.register({
    family: 'Roboto',
    fonts: [
      { src: 'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxP.ttf' }, // regular
      { src: 'https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmWUlfBBc9.ttf', fontWeight: 'bold' }, // bold
    ],
  });
} catch (err) {
  console.error('Failed to register fonts:', err);
}

interface MyDocumentProps {
  projectData: any[];
  skillsData: any[];
  experienceData: any[];
  educationData: any[];
  personalData: any[];
  font: string;
  fontSize: number;
}

const MyDocument: React.FC<MyDocumentProps> = ({
  projectData,
  skillsData,
  experienceData,
  educationData,
  personalData,
  font,
  fontSize,
}) => {
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      paddingLeft: 40,
      paddingRight: 40,
      paddingTop: 30,
      paddingBottom: 20,
      fontFamily: font || 'Carlito', // Use passed font family or default to Carlito
      width: 1000,
      scale: 1.2,
    },
    outerSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5,
    },
    innerSectionLeft: {
      fontSize: 10,
    },
    innerSectionRight: {
      fontSize: fontSize,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
    },
    textRight: {
      textAlign: 'right',
    },
    section: {
      marginBottom: 5,
      flexGrow: 1,
    },
    sectionHorizontal: {
      display: 'flex',
      flexDirection: 'row',
      fontSize: 10.5,
      gap: 4
    },
    header: {
      fontSize: 22,
      marginBottom: 2,
    },
    subHeaderContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },
    subHeader: {
      color: 'maroon',
      fontSize: 14,
      marginBottom: 2,
      marginRight: 5,
      fontWeight: 'bold',
    },
    horizontalLine: {
      borderBottomWidth: 1,
      borderBottomColor: 'maroon',
      flexGrow: 1,
    },
    text: {
      fontSize: fontSize || 10.5, // Use passed font size or default to 10.5
      marginBottom: 2,
      fontWeight: 'normal',
    },
    textHeader: {
      fontSize: 12,
      fontWeight: 'bold',
    },
    topLine: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginLeft: 0,
      marginRight: 0,
      paddingLeft: 0,
      paddingRight: 0,
      fontWeight: 'bold',
      width: '100%',
    },
    skillContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      marginBottom: 5,
    },
    boldLabel: {
      fontFamily: 'Carlito',
      fontWeight: 'bold',
      fontSize: 10.5,
    },
    // value: {
    //   fontFamily: 'Carlito',
    //   fontSize: 12,
    // },
    value: {
      fontFamily: 'Carlito',
      fontSize: 10.5,
      flexWrap: 'wrap',
      maxWidth: '90%', // Prevents overflow
      wordBreak: 'break-word', // Ensures long words break properly
    },
    
    textBold: {
      fontSize: 10.5,
      fontWeight: 'bold',
    },
    bullet: {
      fontSize: 10.5,
      marginRight: 3,
    },
    bulletText: {
      flex: 1,
      fontSize: 10.5,
      marginLeft: 5,
      flexWrap: 'wrap',
      width: '95%',
    },
    link: {
      fontSize: fontSize || 10.5, // Use passed font size or default to 10.5
      textDecoration: 'underline',
      color: 'black',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: 'black',
    },
  });


  return (
    // <Document>
    <div>
      <Page size={{ width: 612, height: 792 }} style={styles.page}>
        <View style={styles.outerSection}>
          <View style={styles.innerSectionLeft}>
            <Text style={styles.header}>{personalData[0]?.name}</Text>
            <View style={styles.sectionHorizontal}>
              <Text>{personalData[0]?.phone}</Text>
              <Text>{personalData[0]?.city},</Text>
              <Text>{personalData[0]?.state}</Text>
              <Text>{personalData[0]?.email}</Text>
            </View>
          </View>


        <View style={styles.innerSectionRight}>
          <Text style={styles.textRight}>{personalData[0]?.website}</Text>
          <Text style={styles.textRight}>{personalData[0]?.github}</Text>
          <Text style={styles.textRight}>{personalData[0]?.linkedin}</Text>
        </View>


        </View>

        <View style={styles.section}>
          <View style={styles.subHeaderContainer}>
            <Text style={styles.subHeader}>Education</Text>
            <View style={styles.horizontalLine} />
          </View>
          {educationData?.map((education, index) => (
            <View key={index}>
              <View style={styles.topLine}>
                <Text style={styles.textHeader}>{education?.university}</Text>
                <Text style={styles.textBold}>{education?.major}, {education.level}</Text>
                <Text style={styles.text}>{education?.graduation_date}</Text>
              </View>
              <Text style={styles.text}>Coursework: {education?.coursework}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.subHeaderContainer}>
            <Text style={styles.subHeader}>Work Experience</Text>
            <View style={styles.horizontalLine} />
          </View>
          {experienceData.map((experience, index) => (
            <View key={index}>
              <View style={styles.topLine}>
                <Text style={styles.textHeader}>{experience?.title}</Text>
                <Text style={styles.textBold}>{experience?.company}</Text>
                <Text style={styles.text}>{experience?.start_date} - {experience?.isEndPresent ? 'Present' : experience?.end_date}</Text>
              </View>
              {experience.detailed_experience && experience.detailed_experience.split('\n').map((line: string, i: number) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 2, width: '100%' }}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{line.trim()}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.subHeaderContainer}>
            <Text style={styles.subHeader}>Projects</Text>
            <View style={styles.horizontalLine} />
          </View>
          {projectData && projectData?.map((project, index) => (
            
            <View key={index}>
              <View style={styles.row}>
                <View style={{flexDirection: 'row'}}>
                <Text style={styles.textHeader}>{project?.name} -</Text>
                <Text style={styles.text}> {project?.language}</Text>
                </View>
                <Link style={styles.link} src={project?.github}>
                GitHub
                </Link>
              </View>
              
              {project.description && project.description.split('\n').map((line: string, i: number) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 2, width: '100%' }}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{line.trim()}</Text>
                </View>
              ))}



            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.subHeaderContainer}>
            <Text style={styles.subHeader}>Skills</Text>
            <View style={styles.horizontalLine} />
          </View>
          {skillsData && skillsData?.map((skill, index) => (
            <View key={index}>
              <View style={styles.skillContainer}>
                <Text style={styles.boldLabel}>Technical Skills: </Text>
                <Text style={styles.value}>{skill?.languages}</Text>
              </View>
              <View style={styles.skillContainer}>
                <Text style={styles.boldLabel}>Frameworks: </Text>
                <Text style={styles.value}>{skill?.frameworks}</Text>
              </View>
            </View>
          ))}
        </View>
      </Page>
      </div>
    // </Document>
  );
};

export default MyDocument;
