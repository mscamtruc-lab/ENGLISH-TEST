export interface StudentInfo {
  name: string;
  className: string;
  grade: 6 | 7 | 8 | 9;
  studentCode?: string;
}

export interface MultipleChoiceQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0, 1, 2, 3
  explanation?: string;
  audioText?: string;
}

export interface TrueFalseQuestion {
  id: string;
  statement: string;
  isTrue: boolean;
  passage?: string;
  explanation?: string;
}

export interface DragDropPair {
  id: string;
  left: string; // e.g. "Take photos", "Solar energy", "Recycle", "Ancient town"
  right: string; // e.g. "Chụp ảnh", "Năng lượng mặt trời", "Tái chế", "Phố cổ"
}

export interface DragDropQuestion {
  id: string;
  title: string;
  instruction: string;
  pairs: DragDropPair[];
  explanation?: string;
}

export interface BlankItem {
  id: string;
  blankIndex: number;
  acceptedAnswers: string[]; // e.g. ["environment", "the environment"]
  hint?: string;
}

export interface FillBlankQuestion {
  id: string;
  title: string;
  instruction: string;
  passage: string; // text containing tokens like [1], [2], [3]
  blanks: BlankItem[];
  wordBank?: string[]; // optional list of suggested words
  explanation?: string;
}

export interface TestRounds {
  multipleChoice: MultipleChoiceQuestion[];
  trueFalse: TrueFalseQuestion[];
  dragDrop: DragDropQuestion[];
  fillBlank: FillBlankQuestion[];
}

export interface TestExam {
  id: string;
  title: string;
  grade: 6 | 7 | 8 | 9;
  unit: string;
  topic: string;
  description: string;
  durationMinutes: number;
  createdAt: string;
  rounds: TestRounds;
}

export interface StudentAnswers {
  multipleChoice: Record<string, number>; // questionId -> chosen index
  trueFalse: Record<string, boolean>; // questionId -> boolean
  dragDrop: Record<string, Record<string, string>>; // questionId -> { pairId: matchedRightId }
  fillBlank: Record<string, Record<string, string>>; // questionId -> { blankId: enteredText }
}

export interface RoundScoreDetail {
  correct: number;
  total: number;
  score: number; // calculated score out of max for this round
  maxScore: number;
}

export interface RoundScores {
  multipleChoice: RoundScoreDetail;
  trueFalse: RoundScoreDetail;
  dragDrop: RoundScoreDetail;
  fillBlank: RoundScoreDetail;
}

export type GradeClassification = 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Trung bình' | 'Cần cố gắng';

export interface TestResult {
  id: string;
  testId: string;
  testTitle: string;
  grade: 6 | 7 | 8 | 9;
  studentName: string;
  className: string;
  studentCode?: string;
  submittedAt: string;
  timeSpentSeconds: number;
  totalScore: number; // 0.0 - 10.0
  maxScore: number; // 10.0
  percentage: number; // 0 - 100
  roundScores: RoundScores;
  answers: StudentAnswers;
  gradeClassification: GradeClassification;
  feedback?: string;
}

export type AppView = 'home' | 'student-login' | 'select-test' | 'taking-test' | 'test-result' | 'teacher-dashboard';
