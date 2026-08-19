import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// File-based persistence storage directory
const DATA_DIR = path.join(process.cwd(), 'data');
const RESULTS_FILE = path.join(DATA_DIR, 'results.json');
const CUSTOM_TESTS_FILE = path.join(DATA_DIR, 'custom_tests.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadData<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw) as T;
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

function saveData<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// In-memory + file sync cache
let storedResults: any[] = loadData(RESULTS_FILE, []);
let storedCustomTests: any[] = loadData(CUSTOM_TESTS_FILE, []);

// Initial sample test results if empty, so the teacher can see the dashboard stats immediately!
if (storedResults.length === 0) {
  storedResults = [
    {
      id: 'res-sample-1',
      testId: 'grade6-unit1-school',
      testTitle: 'Kiểm tra Thường xuyên Tiếng Anh 6 - Unit 1: My New School & Friends',
      grade: 6,
      studentName: 'Nguyễn Hoàng Nam',
      className: '6A1',
      studentCode: 'HS-60101',
      submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      timeSpentSeconds: 540,
      totalScore: 9.5,
      maxScore: 10.0,
      percentage: 95,
      roundScores: {
        multipleChoice: { correct: 4, total: 4, score: 2.5, maxScore: 2.5 },
        trueFalse: { correct: 3, total: 3, score: 2.5, maxScore: 2.5 },
        dragDrop: { correct: 8, total: 8, score: 2.5, maxScore: 2.5 },
        fillBlank: { correct: 3, total: 4, score: 2.0, maxScore: 2.5 },
      },
      answers: {
        multipleChoice: { 'g6-mcq-1': 1, 'g6-mcq-2': 2, 'g6-mcq-3': 1, 'g6-mcq-4': 0 },
        trueFalse: { 'g6-tf-1': true, 'g6-tf-2': false, 'g6-tf-3': true },
        dragDrop: {
          'g6-dd-1': { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' },
          'g6-dd-2': { p5: 'p5', p6: 'p6', p7: 'p7', p8: 'p8' },
        },
        fillBlank: {
          'g6-fb-1': { b1: 'goes', b2: 'play' },
          'g6-fb-2': { b3: 'on', b4: 'in' },
        },
      },
      gradeClassification: 'Xuất sắc',
      feedback: 'Tuyệt vời! Em nắm rất vững kiến thức và hoàn thành xuất sắc các phần kiểm tra!',
    },
    {
      id: 'res-sample-2',
      testId: 'grade7-unit2-healthy-community',
      testTitle: 'Kiểm tra Thường xuyên Tiếng Anh 7 - Unit 2 & 3: Healthy Living & Community Service',
      grade: 7,
      studentName: 'Trần Thị Mai Linh',
      className: '7A2',
      studentCode: 'HS-70215',
      submittedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      timeSpentSeconds: 610,
      totalScore: 8.8,
      maxScore: 10.0,
      percentage: 88,
      roundScores: {
        multipleChoice: { correct: 4, total: 4, score: 2.5, maxScore: 2.5 },
        trueFalse: { correct: 2, total: 3, score: 1.7, maxScore: 2.5 },
        dragDrop: { correct: 4, total: 4, score: 2.5, maxScore: 2.5 },
        fillBlank: { correct: 2, total: 2, score: 2.1, maxScore: 2.5 },
      },
      answers: {
        multipleChoice: { 'g7-mcq-1': 0, 'g7-mcq-2': 1, 'g7-mcq-3': 2, 'g7-mcq-4': 0 },
        trueFalse: { 'g7-tf-1': false, 'g7-tf-2': true, 'g7-tf-3': true },
        dragDrop: { 'g7-dd-1': { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' } },
        fillBlank: { 'g7-fb-1': { b1: 'felt', b2: 'exercise' } },
      },
      gradeClassification: 'Giỏi',
      feedback: 'Rất tốt! Em có vốn từ vựng phong phú và kỹ năng làm bài rất tốt!',
    },
    {
      id: 'res-sample-3',
      testId: 'grade8-unit3-teenagers-countryside',
      testTitle: 'Kiểm tra Thường xuyên Tiếng Anh 8 - Unit 2 & 3: Life in the Countryside & Teen Life',
      grade: 8,
      studentName: 'Lê Quốc Bảo',
      className: '8B1',
      studentCode: 'HS-80104',
      submittedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      timeSpentSeconds: 720,
      totalScore: 7.2,
      maxScore: 10.0,
      percentage: 72,
      roundScores: {
        multipleChoice: { correct: 3, total: 4, score: 1.9, maxScore: 2.5 },
        trueFalse: { correct: 1, total: 2, score: 1.3, maxScore: 2.5 },
        dragDrop: { correct: 4, total: 4, score: 2.5, maxScore: 2.5 },
        fillBlank: { correct: 1, total: 2, score: 1.5, maxScore: 2.5 },
      },
      answers: {
        multipleChoice: { 'g8-mcq-1': 0, 'g8-mcq-2': 1, 'g8-mcq-3': 1, 'g8-mcq-4': 1 },
        trueFalse: { 'g8-tf-1': false, 'g8-tf-2': false },
        dragDrop: { 'g8-dd-1': { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' } },
        fillBlank: { 'g8-fb-1': { b1: 'faster', b2: 'more easily' } },
      },
      gradeClassification: 'Khá',
      feedback: 'Khá tốt! Hãy chú ý kỹ hơn ở các phần kéo thả và điền từ để đạt điểm cao hơn nhé.',
    },
    {
      id: 'res-sample-4',
      testId: 'grade9-unit4-past-wonders',
      testTitle: 'Kiểm tra Thường xuyên Tiếng Anh 9 - Unit 4 & 5: Life in the Past & Wonders of Viet Nam',
      grade: 9,
      studentName: 'Phạm Thu Trang',
      className: '9A3',
      studentCode: 'HS-90312',
      submittedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      timeSpentSeconds: 650,
      totalScore: 9.2,
      maxScore: 10.0,
      percentage: 92,
      roundScores: {
        multipleChoice: { correct: 4, total: 4, score: 2.5, maxScore: 2.5 },
        trueFalse: { correct: 2, total: 2, score: 2.5, maxScore: 2.5 },
        dragDrop: { correct: 4, total: 4, score: 2.5, maxScore: 2.5 },
        fillBlank: { correct: 1, total: 2, score: 1.7, maxScore: 2.5 },
      },
      answers: {
        multipleChoice: { 'g9-mcq-1': 0, 'g9-mcq-2': 1, 'g9-mcq-3': 0, 'g9-mcq-4': 0 },
        trueFalse: { 'g9-tf-1': true, 'g9-tf-2': false },
        dragDrop: { 'g9-dd-1': { p1: 'p1', p2: 'p2', p3: 'p3', p4: 'p4' } },
        fillBlank: { 'g9-fb-1': { b1: 'used', b2: 'spoke' } },
      },
      gradeClassification: 'Xuất sắc',
      feedback: 'Tuyệt vời! Em nắm rất vững kiến thức và hoàn thành xuất sắc các phần kiểm tra!',
    },
  ];
  saveData(RESULTS_FILE, storedResults);
}

// REST API Routes

// 1. Get All Results
app.get('/api/results', (req, res) => {
  res.json({ success: true, data: storedResults });
});

// 2. Save New Result
app.post('/api/results', (req, res) => {
  try {
    const newResult = req.body;
    if (!newResult || !newResult.studentName || !newResult.className) {
      return res.status(400).json({ success: false, error: 'Thiếu thông tin học sinh' });
    }
    const resultToSave = {
      ...newResult,
      id: newResult.id || `res-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      submittedAt: newResult.submittedAt || new Date().toISOString(),
    };
    storedResults.unshift(resultToSave);
    saveData(RESULTS_FILE, storedResults);
    res.json({ success: true, data: resultToSave });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Delete Result by ID
app.delete('/api/results/:id', (req, res) => {
  const { id } = req.params;
  storedResults = storedResults.filter((r) => r.id !== id);
  saveData(RESULTS_FILE, storedResults);
  res.json({ success: true, message: 'Đã xóa kết quả thành công' });
});

// 4. Clear All Results
app.delete('/api/results', (req, res) => {
  storedResults = [];
  saveData(RESULTS_FILE, storedResults);
  res.json({ success: true, message: 'Đã xóa toàn bộ kết quả' });
});

// 5. Get Custom Tests
app.get('/api/custom-tests', (req, res) => {
  res.json({ success: true, data: storedCustomTests });
});

// 6. Save Custom Test
app.post('/api/custom-tests', (req, res) => {
  try {
    const newTest = req.body;
    if (!newTest || !newTest.title || !newTest.grade) {
      return res.status(400).json({ success: false, error: 'Thiếu thông tin đề kiểm tra' });
    }
    const testToSave = {
      ...newTest,
      id: newTest.id || `test-custom-${Date.now()}`,
      createdAt: newTest.createdAt || new Date().toISOString().split('T')[0],
    };
    storedCustomTests.unshift(testToSave);
    saveData(CUSTOM_TESTS_FILE, storedCustomTests);
    res.json({ success: true, data: testToSave });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Delete Custom Test
app.delete('/api/custom-tests/:id', (req, res) => {
  const { id } = req.params;
  storedCustomTests = storedCustomTests.filter((t) => t.id !== id);
  saveData(CUSTOM_TESTS_FILE, storedCustomTests);
  res.json({ success: true, message: 'Đã xóa đề kiểm tra' });
});

// 8. AI Test Generation with Gemini
app.post('/api/generate-ai-test', async (req, res) => {
  try {
    const { grade = 7, topic = 'Unit 4: Music and Arts', duration = 15 } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Chưa cấu hình GEMINI_API_KEY trong hệ thống.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `Bạn là chuyên gia khảo thí Tiếng Anh bậc Trung học cơ sở (THCS) theo chương trình GDPT 2018 Việt Nam (Global Success / Friends Plus / i-Learn Smart World).
Hãy tạo 1 đề kiểm tra đánh giá thường xuyên môn Tiếng Anh Lớp ${grade} về chủ đề "${topic}".
Đề kiểm tra bắt buộc phải có đầy đủ cấu trúc 4 vòng (4 Trò chơi/Dạng thức):
- Vòng 1 (multipleChoice): 4 câu trắc nghiệm 4 lựa chọn (A, B, C, D) kiểm tra ngữ pháp/từ vựng/phát âm/giao tiếp. correctAnswer là index (0 cho A, 1 cho B, 2 cho C, 3 cho D). Có audioText để đọc câu hỏi và explanation chi tiết tiếng Việt.
- Vòng 2 (trueFalse): 2-3 câu trắc nghiệm Đúng/Sai kèm theo 1 đoạn văn đọc hiểu ngắn tiếng Anh (passage) khoảng 60-80 từ phù hợp học sinh Lớp ${grade}.
- Vòng 3 (dragDrop): 1-2 câu kéo thả nối từ vựng/cụm từ (pairs) giữa tiếng Anh và tiếng Việt hoặc định nghĩa, mỗi câu gồm 4 cặp ghép (left, right).
- Vòng 4 (fillBlank): 1-2 đoạn văn hoặc câu có chỗ trống dạng [1], [2] với danh sách wordBank gợi ý và acceptedAnswers cho từng ô trống.

Trả về kết quả chuẩn định dạng JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            unit: { type: Type.STRING },
            topic: { type: Type.STRING },
            description: { type: Type.STRING },
            durationMinutes: { type: Type.INTEGER },
            rounds: {
              type: Type.OBJECT,
              properties: {
                multipleChoice: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      question: { type: Type.STRING },
                      options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      correctAnswer: { type: Type.INTEGER },
                      explanation: { type: Type.STRING },
                      audioText: { type: Type.STRING },
                    },
                    required: ['id', 'question', 'options', 'correctAnswer'],
                  },
                },
                trueFalse: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      statement: { type: Type.STRING },
                      isTrue: { type: Type.BOOLEAN },
                      passage: { type: Type.STRING },
                      explanation: { type: Type.STRING },
                    },
                    required: ['id', 'statement', 'isTrue'],
                  },
                },
                dragDrop: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      instruction: { type: Type.STRING },
                      pairs: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            left: { type: Type.STRING },
                            right: { type: Type.STRING },
                          },
                          required: ['id', 'left', 'right'],
                        },
                      },
                      explanation: { type: Type.STRING },
                    },
                    required: ['id', 'title', 'instruction', 'pairs'],
                  },
                },
                fillBlank: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      instruction: { type: Type.STRING },
                      passage: { type: Type.STRING },
                      wordBank: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      blanks: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            blankIndex: { type: Type.INTEGER },
                            acceptedAnswers: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING },
                            },
                            hint: { type: Type.STRING },
                          },
                          required: ['id', 'blankIndex', 'acceptedAnswers'],
                        },
                      },
                      explanation: { type: Type.STRING },
                    },
                    required: ['id', 'title', 'instruction', 'passage', 'blanks'],
                  },
                },
              },
              required: ['multipleChoice', 'trueFalse', 'dragDrop', 'fillBlank'],
            },
          },
          required: ['title', 'unit', 'topic', 'description', 'durationMinutes', 'rounds'],
        },
      },
    });

    const rawJson = response.text?.trim() || '{}';
    const parsedData = JSON.parse(rawJson);

    const generatedTest = {
      ...parsedData,
      id: `ai-test-${Date.now()}`,
      grade: Number(grade),
      durationMinutes: Number(duration) || 15,
      createdAt: new Date().toISOString().split('T')[0],
    };

    // Store in custom tests as well
    storedCustomTests.unshift(generatedTest);
    saveData(CUSTOM_TESTS_FILE, storedCustomTests);

    res.json({ success: true, data: generatedTest });
  } catch (err: any) {
    console.error('Error generating AI test:', err);
    res.status(500).json({ success: false, error: err.message || 'Lỗi khi tạo đề kiểm tra' });
  }
});

// Vite & Static middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduEnglish THCS Server is running on port ${PORT}`);
  });
}

startServer();
