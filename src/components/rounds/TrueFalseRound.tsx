import React from 'react';
import { Volume2, CheckCircle2, XCircle, BookOpen } from 'lucide-react';
import { TrueFalseQuestion } from '../../types';
import { soundManager } from '../../utils/soundEffects';

interface TrueFalseRoundProps {
  questions: TrueFalseQuestion[];
  answers: Record<string, boolean>;
  onAnswer: (questionId: string, isTrue: boolean) => void;
}

export const TrueFalseRound: React.FC<TrueFalseRoundProps> = ({
  questions,
  answers,
  onAnswer,
}) => {
  // Check if any question has a reading passage to show at top
  const firstPassage = questions.find((q) => q.passage)?.passage;

  const handleSpeakPassage = () => {
    if (firstPassage) {
      soundManager.speak(firstPassage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 sm:p-5 flex items-start space-x-3">
        <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
          2
        </div>
        <div>
          <h3 className="font-bold text-sky-950 text-base">
            Trò 2: Trắc nghiệm khách quan Đúng / Sai (True or False)
          </h3>
          <p className="text-xs sm:text-sm text-sky-800 mt-0.5">
            Đọc kỹ đoạn văn hoặc nhận định và xác định xem từng câu là <strong>TRUE (Đúng)</strong> hay <strong>FALSE (Sai)</strong>.
          </p>
        </div>
      </div>

      {/* Reading passage card if present */}
      {firstPassage && (
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5 sm:p-6 relative">
          <div className="flex items-center justify-between mb-3 border-b border-amber-200/60 pb-2.5">
            <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
              <BookOpen className="w-4 h-4 text-amber-700" />
              <span>Đoạn Văn Đọc Hiểu (Reading Passage)</span>
            </div>
            <button
              type="button"
              onClick={handleSpeakPassage}
              title="Nghe toàn bộ đoạn văn"
              className="flex items-center space-x-1 text-xs font-semibold bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              id="btn-speak-passage"
            >
              <Volume2 className="w-4 h-4" />
              <span>Nghe bài đọc</span>
            </button>
          </div>
          <p className="text-slate-800 text-sm sm:text-base leading-relaxed italic font-serif">
            "{firstPassage}"
          </p>
        </div>
      )}

      {/* Questions list */}
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const userAnswer = answers[q.id];

          return (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              id={`tf-card-${q.id}`}
            >
              <div className="flex items-start space-x-3">
                <span className="bg-sky-100 text-sky-800 text-xs font-extrabold px-2.5 py-1 rounded-lg shrink-0 mt-0.5">
                  Nhận định {idx + 1}
                </span>
                <p className="text-slate-900 font-medium text-sm sm:text-base leading-snug">
                  {q.statement}
                </p>
              </div>

              {/* True / False Selection Buttons */}
              <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => {
                    onAnswer(q.id, true);
                    soundManager.playCorrect();
                  }}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
                    userAnswer === true
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs scale-102 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/40'
                  }`}
                  id={`btn-tf-true-${q.id}`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>TRUE (Đúng)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onAnswer(q.id, false);
                    soundManager.playCorrect();
                  }}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
                    userAnswer === false
                      ? 'bg-rose-600 border-rose-600 text-white shadow-xs scale-102 ring-2 ring-rose-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-rose-300 hover:bg-rose-50/40'
                  }`}
                  id={`btn-tf-false-${q.id}`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>FALSE (Sai)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
