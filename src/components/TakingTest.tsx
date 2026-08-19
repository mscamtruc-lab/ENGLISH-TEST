import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, ChevronRight, ChevronLeft, Send, AlertTriangle, User, Award, Layers } from 'lucide-react';
import { TestExam, StudentInfo, StudentAnswers } from '../types';
import { MultipleChoiceRound } from './rounds/MultipleChoiceRound';
import { TrueFalseRound } from './rounds/TrueFalseRound';
import { DragDropRound } from './rounds/DragDropRound';
import { FillBlankRound } from './rounds/FillBlankRound';
import { soundManager } from '../utils/soundEffects';

interface TakingTestProps {
  test: TestExam;
  student: StudentInfo;
  onSubmitTest: (answers: StudentAnswers, timeSpentSeconds: number) => void;
  onCancelTest: () => void;
}

export const TakingTest: React.FC<TakingTestProps> = ({
  test,
  student,
  onSubmitTest,
  onCancelTest,
}) => {
  const [activeRound, setActiveRound] = useState<1 | 2 | 3 | 4>(1);
  const [secondsRemaining, setSecondsRemaining] = useState(test.durationMinutes * 60);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Student answers state
  const [answers, setAnswers] = useState<StudentAnswers>({
    multipleChoice: {},
    trueFalse: {},
    dragDrop: {},
    fillBlank: {},
  });

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit when time runs out!
          handleSubmitFinal();
          return 0;
        }
        return prev - 1;
      });
      setTimeSpentSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Multiple Choice handler
  const handleAnswerMCQ = (qId: string, optIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      multipleChoice: {
        ...prev.multipleChoice,
        [qId]: optIndex,
      },
    }));
  };

  // True / False handler
  const handleAnswerTF = (qId: string, isTrue: boolean) => {
    setAnswers((prev) => ({
      ...prev,
      trueFalse: {
        ...prev.trueFalse,
        [qId]: isTrue,
      },
    }));
  };

  // Drag & Drop handler
  const handleAnswerPair = (qId: string, leftPairId: string, rightPairId: string) => {
    setAnswers((prev) => {
      const qMatches = { ...(prev.dragDrop[qId] || {}) };
      // Remove any existing left or right conflict
      Object.keys(qMatches).forEach((k) => {
        if (qMatches[k] === rightPairId) {
          delete qMatches[k];
        }
      });
      qMatches[leftPairId] = rightPairId;

      return {
        ...prev,
        dragDrop: {
          ...prev.dragDrop,
          [qId]: qMatches,
        },
      };
    });
  };

  const handleRemovePair = (qId: string, leftPairId: string) => {
    setAnswers((prev) => {
      const qMatches = { ...(prev.dragDrop[qId] || {}) };
      delete qMatches[leftPairId];
      return {
        ...prev,
        dragDrop: {
          ...prev.dragDrop,
          [qId]: qMatches,
        },
      };
    });
  };

  // Fill in the Blank handler
  const handleAnswerBlank = (qId: string, blankId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      fillBlank: {
        ...prev.fillBlank,
        [qId]: {
          ...(prev.fillBlank[qId] || {}),
          [blankId]: text,
        },
      },
    }));
  };

  // Calculate completion percentage & counts
  const countAnsweredMCQ = Object.keys(answers.multipleChoice).length;
  const totalMCQ = test.rounds.multipleChoice.length;

  const countAnsweredTF = Object.keys(answers.trueFalse).length;
  const totalTF = test.rounds.trueFalse.length;

  let countAnsweredDD = 0;
  let totalDD = 0;
  test.rounds.dragDrop.forEach((q) => {
    totalDD += q.pairs.length;
    countAnsweredDD += Object.keys(answers.dragDrop[q.id] || {}).length;
  });

  let countAnsweredFB = 0;
  let totalFB = 0;
  test.rounds.fillBlank.forEach((q) => {
    totalFB += q.blanks.length;
    const qAnswers = answers.fillBlank[q.id] || {};
    q.blanks.forEach((b) => {
      if (qAnswers[b.id] && qAnswers[b.id].trim().length > 0) {
        countAnsweredFB++;
      }
    });
  });

  const totalAllItems = totalMCQ + totalTF + totalDD + totalFB;
  const answeredAllItems = countAnsweredMCQ + countAnsweredTF + countAnsweredDD + countAnsweredFB;
  const progressPercent = Math.round((answeredAllItems / (totalAllItems || 1)) * 100);

  const handleSubmitFinal = () => {
    soundManager.playRoundComplete();
    onSubmitTest(answers, timeSpentSeconds);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Sticky Test Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-4 sm:p-5 sticky top-18 z-30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Test & Student Info */}
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded-md">
                Lớp {student.className}
              </span>
              <span className="font-semibold text-xs text-slate-500">Học sinh: {student.name}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight mt-1 line-clamp-1">
              {test.title}
            </h2>
          </div>

          {/* Time & Submit Actions */}
          <div className="flex items-center justify-between md:justify-end space-x-3">
            {/* Timer countdown */}
            <div
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-mono font-bold text-sm sm:text-base border ${
                secondsRemaining < 120
                  ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer active:scale-98"
              id="btn-submit-test-header"
            >
              <Send className="w-4 h-4" />
              <span>Nộp bài</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3.5 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1.5">
            <span>Tiến độ hoàn thành: {answeredAllItems}/{totalAllItems} mục</span>
            <span className="text-indigo-600">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 4 Round Selector Tabs */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-4">
          <button
            onClick={() => setActiveRound(1)}
            className={`py-2 px-1 sm:px-3 rounded-xl border text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 cursor-pointer ${
              activeRound === 1
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : countAnsweredMCQ === totalMCQ && totalMCQ > 0
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            id="tab-round-1"
          >
            <span>Trò 1</span>
            <span className="hidden sm:inline font-normal text-[11px]">Trắc nghiệm</span>
            <span className="text-[10px] opacity-80">({countAnsweredMCQ}/{totalMCQ})</span>
          </button>

          <button
            onClick={() => setActiveRound(2)}
            className={`py-2 px-1 sm:px-3 rounded-xl border text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 cursor-pointer ${
              activeRound === 2
                ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                : countAnsweredTF === totalTF && totalTF > 0
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            id="tab-round-2"
          >
            <span>Trò 2</span>
            <span className="hidden sm:inline font-normal text-[11px]">Đúng / Sai</span>
            <span className="text-[10px] opacity-80">({countAnsweredTF}/{totalTF})</span>
          </button>

          <button
            onClick={() => setActiveRound(3)}
            className={`py-2 px-1 sm:px-3 rounded-xl border text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 cursor-pointer ${
              activeRound === 3
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : countAnsweredDD === totalDD && totalDD > 0
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            id="tab-round-3"
          >
            <span>Trò 3</span>
            <span className="hidden sm:inline font-normal text-[11px]">Kéo thả</span>
            <span className="text-[10px] opacity-80">({countAnsweredDD}/{totalDD})</span>
          </button>

          <button
            onClick={() => setActiveRound(4)}
            className={`py-2 px-1 sm:px-3 rounded-xl border text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 cursor-pointer ${
              activeRound === 4
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : countAnsweredFB === totalFB && totalFB > 0
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            id="tab-round-4"
          >
            <span>Trò 4</span>
            <span className="hidden sm:inline font-normal text-[11px]">Điền khuyết</span>
            <span className="text-[10px] opacity-80">({countAnsweredFB}/{totalFB})</span>
          </button>
        </div>
      </div>

      {/* Main Round Content */}
      <div className="transition-all duration-200">
        {activeRound === 1 && (
          <MultipleChoiceRound
            questions={test.rounds.multipleChoice}
            answers={answers.multipleChoice}
            onAnswer={handleAnswerMCQ}
          />
        )}

        {activeRound === 2 && (
          <TrueFalseRound
            questions={test.rounds.trueFalse}
            answers={answers.trueFalse}
            onAnswer={handleAnswerTF}
          />
        )}

        {activeRound === 3 && (
          <DragDropRound
            questions={test.rounds.dragDrop}
            answers={answers.dragDrop}
            onAnswerPair={handleAnswerPair}
            onRemovePair={handleRemovePair}
          />
        )}

        {activeRound === 4 && (
          <FillBlankRound
            questions={test.rounds.fillBlank}
            answers={answers.fillBlank}
            onAnswerBlank={handleAnswerBlank}
          />
        )}
      </div>

      {/* Round Navigation Bar at Bottom */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
        <button
          disabled={activeRound === 1}
          onClick={() => setActiveRound((prev) => (Math.max(1, prev - 1) as 1 | 2 | 3 | 4))}
          className={`flex items-center space-x-1 text-sm font-bold px-4 py-2 rounded-xl border transition-all ${
            activeRound === 1
              ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400'
              : 'border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer'
          }`}
          id="btn-prev-round"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Vòng trước</span>
        </button>

        <div className="text-xs font-semibold text-slate-500">
          Vòng {activeRound} / 4
        </div>

        {activeRound < 4 ? (
          <button
            onClick={() => setActiveRound((prev) => (Math.min(4, prev + 1) as 1 | 2 | 3 | 4))}
            className="flex items-center space-x-1 text-sm font-bold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all cursor-pointer shadow-xs"
            id="btn-next-round"
          >
            <span>Vòng kế tiếp</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => setShowSubmitConfirm(true)}
            className="flex items-center space-x-1.5 text-sm font-bold px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer shadow-xs"
            id="btn-final-submit-round"
          >
            <Send className="w-4 h-4" />
            <span>Nộp bài ngay</span>
          </button>
        )}
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Xác Nhận Nộp Bài Kiểm Tra?</h3>
              <p className="text-xs text-slate-600 mt-1">
                Học sinh: <strong className="text-slate-800">{student.name}</strong> - Lớp{' '}
                <strong className="text-slate-800">{student.className}</strong>
              </p>
            </div>

            {/* Answered summary */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Trò 1 (Trắc nghiệm):</span>
                <span className="font-bold text-indigo-700">{countAnsweredMCQ}/{totalMCQ} câu</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Trò 2 (Đúng / Sai):</span>
                <span className="font-bold text-sky-700">{countAnsweredTF}/{totalTF} câu</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Trò 3 (Kéo thả):</span>
                <span className="font-bold text-emerald-700">{countAnsweredDD}/{totalDD} cặp</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Trò 4 (Điền khuyết):</span>
                <span className="font-bold text-amber-700">{countAnsweredFB}/{totalFB} ô trống</span>
              </div>
            </div>

            {answeredAllItems < totalAllItems && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-xl flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Em còn <strong>{totalAllItems - answeredAllItems}</strong> câu chưa hoàn thành. Em có chắc muốn nộp bài luôn không?
                </span>
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
                id="btn-cancel-submit-modal"
              >
                Làm tiếp bài
              </button>
              <button
                type="button"
                onClick={handleSubmitFinal}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer shadow-xs"
                id="btn-confirm-submit-modal"
              >
                Đồng ý nộp bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
