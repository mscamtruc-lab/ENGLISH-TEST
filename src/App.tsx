import React, { useState, useEffect } from 'react';
import {
  StudentInfo,
  TestExam,
  TestResult,
  StudentAnswers,
  AppView,
} from './types';
import { DEFAULT_TESTS } from './data/defaultTests';
import { calculateTestScore } from './utils/scoreCalculator';
import { Navbar } from './components/Navbar';
import { StudentLoginCard } from './components/StudentLoginCard';
import { TestSelector } from './components/TestSelector';
import { TakingTest } from './components/TakingTest';
import { TestResultView } from './components/TestResultView';
import { TeacherDashboard } from './components/TeacherDashboard';
import { TeacherAuthModal } from './components/TeacherAuthModal';

const STORAGE_KEY_STUDENT = 'edu_english_student_info';
const STORAGE_KEY_RESULTS = 'edu_english_results_cache';
const STORAGE_KEY_CUSTOM_TESTS = 'edu_english_custom_tests';

export default function App() {
  // 1. Student State
  const [student, setStudent] = useState<StudentInfo | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STUDENT);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 2. Tests State (Built-in + Custom)
  const [tests, setTests] = useState<TestExam[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_TESTS);
      if (saved) {
        const custom = JSON.parse(saved);
        return [...custom, ...DEFAULT_TESTS];
      }
    } catch {
      // Fallback
    }
    return DEFAULT_TESTS;
  });

  // 3. Results History State
  const [results, setResults] = useState<TestResult[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RESULTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 4. Navigation & Active Session State
  const [currentView, setCurrentView] = useState<AppView>(() => {
    return student ? 'select-test' : 'student-login';
  });
  const [activeTest, setActiveTest] = useState<TestExam | null>(null);
  const [lastResult, setLastResult] = useState<TestResult | null>(null);

  // 5. Teacher Auth State
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isTeacherMode, setIsTeacherMode] = useState(false);

  // Fetch results and custom tests from backend on load
  const fetchBackendData = async () => {
    try {
      // Fetch results
      const resResults = await fetch('/api/results');
      if (resResults.ok) {
        const jsonResults = await resResults.json();
        if (jsonResults.success && Array.isArray(jsonResults.data)) {
          setResults(jsonResults.data);
          localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(jsonResults.data));
        }
      }

      // Fetch custom tests
      const resTests = await fetch('/api/custom-tests');
      if (resTests.ok) {
        const jsonTests = await resTests.json();
        if (jsonTests.success && Array.isArray(jsonTests.data)) {
          const combined = [...jsonTests.data, ...DEFAULT_TESTS];
          setTests(combined);
          localStorage.setItem(STORAGE_KEY_CUSTOM_TESTS, JSON.stringify(jsonTests.data));
        }
      }
    } catch {
      // Local fallback in case server is not reached
    }
  };

  useEffect(() => {
    fetchBackendData();
  }, []);

  // Save student handler
  const handleSaveStudent = (newStudent: StudentInfo) => {
    setStudent(newStudent);
    localStorage.setItem(STORAGE_KEY_STUDENT, JSON.stringify(newStudent));
    setCurrentView('select-test');
  };

  // Start test handler
  const handleSelectTest = (test: TestExam) => {
    setActiveTest(test);
    setCurrentView('taking-test');
  };

  // Submit test handler
  const handleSubmitTest = async (answers: StudentAnswers, timeSpentSeconds: number) => {
    if (!activeTest || !student) return;

    const evaluation = calculateTestScore(activeTest, answers);

    const newResult: TestResult = {
      id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      testId: activeTest.id,
      testTitle: activeTest.title,
      grade: student.grade,
      studentName: student.name,
      className: student.className,
      studentCode: student.studentCode,
      submittedAt: new Date().toISOString(),
      timeSpentSeconds,
      totalScore: evaluation.totalScore,
      maxScore: evaluation.maxScore,
      percentage: evaluation.percentage,
      roundScores: evaluation.roundScores,
      answers,
      gradeClassification: evaluation.gradeClassification,
      feedback: evaluation.feedback,
    };

    setLastResult(newResult);
    setCurrentView('test-result');

    // Update local state
    const updatedResults = [newResult, ...results];
    setResults(updatedResults);
    localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(updatedResults));

    // Save to Server
    try {
      await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newResult),
      });
    } catch (err) {
      console.error('Error saving result to server:', err);
    }
  };

  // Delete result handler
  const handleDeleteResult = async (id: string) => {
    const updated = results.filter((r) => r.id !== id);
    setResults(updated);
    localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(updated));

    try {
      await fetch(`/api/results/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting result:', err);
    }
  };

  // Clear all results
  const handleClearAllResults = async () => {
    setResults([]);
    localStorage.removeItem(STORAGE_KEY_RESULTS);

    try {
      await fetch('/api/results', { method: 'DELETE' });
    } catch (err) {
      console.error('Error clearing results:', err);
    }
  };

  // Add custom AI or manual test
  const handleAddCustomTest = (newTest: TestExam) => {
    setTests((prev) => [newTest, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#fcf2f2] text-stone-900 flex flex-col font-sans antialiased selection:bg-rose-800 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        student={student}
        isTeacherMode={isTeacherMode}
        onOpenTeacherModal={() => setIsTeacherModalOpen(true)}
        onExitTeacherMode={() => {
          setIsTeacherMode(false);
          setCurrentView(student ? 'select-test' : 'student-login');
        }}
        onChangeStudent={() => setCurrentView('student-login')}
        onGoHome={() => {
          if (isTeacherMode) {
            setIsTeacherMode(false);
          }
          setCurrentView(student ? 'select-test' : 'student-login');
        }}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* VIEW 1: Teacher Dashboard */}
        {isTeacherMode ? (
          <TeacherDashboard
            results={results}
            tests={tests}
            onDeleteResult={handleDeleteResult}
            onClearAllResults={handleClearAllResults}
            onRefreshData={fetchBackendData}
            onAddCustomTest={handleAddCustomTest}
          />
        ) : (
          <>
            {/* VIEW 2: Student Login / Information Setup */}
            {currentView === 'student-login' && (
              <div className="py-6 animate-in fade-in duration-200">
                <StudentLoginCard
                  initialData={student}
                  onSaveStudent={handleSaveStudent}
                />
              </div>
            )}

            {/* VIEW 3: Test Selector */}
            {currentView === 'select-test' && student && (
              <div className="animate-in fade-in duration-200">
                <TestSelector
                  student={student}
                  tests={tests}
                  onSelectTest={handleSelectTest}
                  onEditStudent={() => setCurrentView('student-login')}
                />
              </div>
            )}

            {/* VIEW 4: Active Test Taking */}
            {currentView === 'taking-test' && activeTest && student && (
              <div className="animate-in fade-in duration-200">
                <TakingTest
                  test={activeTest}
                  student={student}
                  onSubmitTest={handleSubmitTest}
                  onCancelTest={() => setCurrentView('select-test')}
                />
              </div>
            )}

            {/* VIEW 5: Test Result & Detailed Review */}
            {currentView === 'test-result' && lastResult && activeTest && (
              <div className="animate-in fade-in duration-200">
                <TestResultView
                  result={lastResult}
                  test={activeTest}
                  onRetake={() => setCurrentView('taking-test')}
                  onSelectAnotherTest={() => setCurrentView('select-test')}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Teacher Authentication Modal */}
      <TeacherAuthModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        onSuccess={() => {
          setIsTeacherModalOpen(false);
          setIsTeacherMode(true);
          fetchBackendData();
        }}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 EduEnglish THCS - Hệ Thống Kiểm Tra Đánh Giá Thường Xuyên Môn Tiếng Anh (Lớp 6, 7, 8, 9).</p>
          <p className="text-slate-400">4 Dạng thức: Trắc nghiệm • Đúng/Sai • Kéo thả • Điền khuyết</p>
        </div>
      </footer>
    </div>
  );
}
