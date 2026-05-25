import React from 'react';
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';

export type AssignmentPDFQuestion = {
  number: number;
  text: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  marks: number;
  type: string;
  answer?: string;
};

export type AssignmentPDFSection = {
  title: string;
  instruction: string;
  questions: AssignmentPDFQuestion[];
};

export type AssignmentPDFData = {
  assignmentId: string;
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maxMarks: number;
  sections: AssignmentPDFSection[];
  answerKey: Array<{
    questionNumber: number;
    answer: string;
  }>;
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 44,
    paddingHorizontal: 36,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#111111',
    backgroundColor: '#FFFFFF'
  },
  header: {
    textAlign: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB'
  },
  schoolName: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 6
  },
  subjectLine: {
    fontSize: 13,
    fontWeight: 500,
    color: '#374151'
  },
  infoRow: {
    marginTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB'
  },
  infoText: {
    fontSize: 11,
    fontWeight: 600
  },
  notice: {
    marginTop: 14,
    fontSize: 11,
    fontWeight: 700
  },
  studentGrid: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  field: {
    width: '100%',
    marginBottom: 10
  },
  fieldLine: {
    marginTop: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#111111',
    borderBottomStyle: 'solid'
  },
  section: {
    marginTop: 22
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 6
  },
  instruction: {
    textAlign: 'center',
    fontSize: 10,
    fontStyle: 'italic',
    color: '#4B5563',
    marginBottom: 10,
    lineHeight: 1.35
  },
  subsection: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 10
  },
  question: {
    marginBottom: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8
  },
  questionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  questionText: {
    width: '82%',
    fontSize: 11,
    lineHeight: 1.45
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
    fontSize: 8,
    fontWeight: 700
  },
  easy: {
    borderColor: '#A7F3D0',
    backgroundColor: '#ECFDF5',
    color: '#047857'
  },
  moderate: {
    borderColor: '#FED7AA',
    backgroundColor: '#FFF7ED',
    color: '#C2410C'
  },
  challenging: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    color: '#B91C1C'
  },
  marks: {
    marginTop: 5,
    fontSize: 9,
    color: '#6B7280'
  },
  endPaper: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: 700
  },
  answerKey: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB'
  },
  answerKeyTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 8
  },
  answerRow: {
    marginBottom: 5,
    flexDirection: 'row'
  },
  answerNumber: {
    width: 18,
    fontWeight: 700
  },
  answerText: {
    flex: 1,
    lineHeight: 1.4
  }
});

function difficultyStyle(difficulty: AssignmentPDFQuestion['difficulty']) {
  switch (difficulty) {
    case 'Easy':
      return styles.easy;
    case 'Moderate':
      return styles.moderate;
    case 'Challenging':
      return styles.challenging;
  }
}

export function AssignmentPDF({ paper }: { paper: AssignmentPDFData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.schoolName}>{paper.schoolName}</Text>
          <Text style={styles.subjectLine}>
            {paper.subject} - {paper.className}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoText}>Time Allowed: {paper.timeAllowed}</Text>
          <Text style={styles.infoText}>Maximum Marks: {paper.maxMarks}</Text>
        </View>

        <Text style={styles.notice}>All questions are compulsory unless stated otherwise.</Text>

        <View style={styles.studentGrid}>
          <View style={styles.field}>
            <Text>Name: __________________</Text>
          </View>
          <View style={styles.field}>
            <Text>Roll Number: __________________</Text>
          </View>
          <View style={styles.field}>
            <Text>Class: X Section: __________</Text>
          </View>
        </View>

        {paper.sections.map((section, sectionIndex) => (
          <View key={`${section.title}-${sectionIndex}`} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.instruction}>{section.instruction}</Text>
            <Text style={styles.subsection}>Short Answer Questions</Text>

            {section.questions.map((question) => (
              <View key={`${section.title}-${question.number}`} style={styles.question}>
                <View style={styles.questionTop}>
                  <Text style={styles.questionText}>
                    {question.number}. {question.text} ({question.marks} marks)
                  </Text>
                  <Text style={[styles.badge, difficultyStyle(question.difficulty)]}>[{question.difficulty}]</Text>
                </View>
              </View>
            ))}

            {sectionIndex === paper.sections.length - 1 ? (
              <Text style={styles.endPaper}>End of Question Paper</Text>
            ) : null}
          </View>
        ))}

        <View style={styles.answerKey}>
          <Text style={styles.answerKeyTitle}>Answer Key:</Text>
          {paper.answerKey.map((entry) => (
            <View key={entry.questionNumber} style={styles.answerRow}>
              <Text style={styles.answerNumber}>{entry.questionNumber}.</Text>
              <Text style={styles.answerText}>{entry.answer}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
