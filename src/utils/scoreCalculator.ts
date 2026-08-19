import { TestExam, StudentAnswers, RoundScores, GradeClassification } from '../types';

export function normalizeAnswer(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ');
}

export function checkBlankAnswer(userAnswer: string, acceptedAnswers: string[]): boolean {
  if (!userAnswer) return false;
  const normalizedUser = normalizeAnswer(userAnswer);
  return acceptedAnswers.some(ans => normalizeAnswer(ans) === normalizedUser);
}

export function calculateTestScore(test: TestExam, answers: StudentAnswers): {
  totalScore: number;
  maxScore: number;
  percentage: number;
  roundScores: RoundScores;
  gradeClassification: GradeClassification;
  feedback: string;
} {
  // Round 1: Multiple Choice (Max 2.5 pts)
  const mcqQuestions = test.rounds.multipleChoice;
  let mcqCorrect = 0;
  mcqQuestions.forEach(q => {
    if (answers.multipleChoice[q.id] === q.correctAnswer) {
      mcqCorrect++;
    }
  });
  const mcqTotal = mcqQuestions.length;
  const mcqScore = mcqTotal > 0 ? (mcqCorrect / mcqTotal) * 2.5 : 2.5;

  // Round 2: True/False (Max 2.5 pts)
  const tfQuestions = test.rounds.trueFalse;
  let tfCorrect = 0;
  tfQuestions.forEach(q => {
    if (answers.trueFalse[q.id] === q.isTrue) {
      tfCorrect++;
    }
  });
  const tfTotal = tfQuestions.length;
  const tfScore = tfTotal > 0 ? (tfCorrect / tfTotal) * 2.5 : 2.5;

  // Round 3: Drag & Drop / Matching (Max 2.5 pts)
  const ddQuestions = test.rounds.dragDrop;
  let ddPairsTotal = 0;
  let ddPairsCorrect = 0;
  ddQuestions.forEach(q => {
    const qAnswers = answers.dragDrop[q.id] || {};
    q.pairs.forEach(pair => {
      ddPairsTotal++;
      if (qAnswers[pair.id] === pair.id) {
        ddPairsCorrect++;
      }
    });
  });
  const ddScore = ddPairsTotal > 0 ? (ddPairsCorrect / ddPairsTotal) * 2.5 : 2.5;

  // Round 4: Fill in the Blank (Max 2.5 pts)
  const fbQuestions = test.rounds.fillBlank;
  let fbBlanksTotal = 0;
  let fbBlanksCorrect = 0;
  fbQuestions.forEach(q => {
    const qAnswers = answers.fillBlank[q.id] || {};
    q.blanks.forEach(blank => {
      fbBlanksTotal++;
      const userText = qAnswers[blank.id] || '';
      if (checkBlankAnswer(userText, blank.acceptedAnswers)) {
        fbBlanksCorrect++;
      }
    });
  });
  const fbScore = fbBlanksTotal > 0 ? (fbBlanksCorrect / fbBlanksTotal) * 2.5 : 2.5;

  const rawTotalScore = mcqScore + tfScore + ddScore + fbScore;
  const totalScore = Math.round(rawTotalScore * 10) / 10;
  const maxScore = 10.0;
  const percentage = Math.round((totalScore / maxScore) * 100);

  let gradeClassification: GradeClassification = 'Cần cố gắng';
  let feedback = 'Em cần ôn luyện thêm các từ vựng và ngữ pháp trọng tâm nhé!';

  if (totalScore >= 9.0) {
    gradeClassification = 'Xuất sắc';
    feedback = 'Tuyệt vời! Em nắm rất vững kiến thức và hoàn thành xuất sắc các phần kiểm tra!';
  } else if (totalScore >= 8.0) {
    gradeClassification = 'Giỏi';
    feedback = 'Rất tốt! Em có vốn từ vựng phong phú và kỹ năng làm bài rất tốt!';
  } else if (totalScore >= 6.5) {
    gradeClassification = 'Khá';
    feedback = 'Khá tốt! Hãy chú ý kỹ hơn ở các phần kéo thả và điền từ để đạt điểm cao hơn nhé.';
  } else if (totalScore >= 5.0) {
    gradeClassification = 'Trung bình';
    feedback = 'Đạt yêu cầu. Em hãy xem lại các câu trả lời sai để củng cố kiến thức nhé.';
  }

  return {
    totalScore,
    maxScore,
    percentage,
    roundScores: {
      multipleChoice: {
        correct: mcqCorrect,
        total: mcqTotal,
        score: Math.round(mcqScore * 10) / 10,
        maxScore: 2.5,
      },
      trueFalse: {
        correct: tfCorrect,
        total: tfTotal,
        score: Math.round(tfScore * 10) / 10,
        maxScore: 2.5,
      },
      dragDrop: {
        correct: ddPairsCorrect,
        total: ddPairsTotal,
        score: Math.round(ddScore * 10) / 10,
        maxScore: 2.5,
      },
      fillBlank: {
        correct: fbBlanksCorrect,
        total: fbBlanksTotal,
        score: Math.round(fbScore * 10) / 10,
        maxScore: 2.5,
      },
    },
    gradeClassification,
    feedback,
  };
}
