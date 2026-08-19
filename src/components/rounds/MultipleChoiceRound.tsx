import React from 'react';
import { Volume2, CheckCircle, HelpCircle } from 'lucide-react';
import { MultipleChoiceQuestion } from '../../types';
import { soundManager } from '../../utils/soundEffects';

interface MultipleChoiceRoundProps {
  questions: MultipleChoiceQuestion[];
  answers: Record<string, number>;
  onAnswer: (questionId: string, optionIndex: number) => void;
}

export const MultipleChoiceRound: React.FC<MultipleChoiceRoundProps> = ({
  questions,
  answers,
  onAnswer,
}) => {
  const optionLabels = ['A', 'B', 'C', 'D'];

  const handleSpeak = (text: string) => {
    soundManager.speak(text);
  };

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 sm:p-5 flex items-start space-x-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
          1
        </div>
        <div>
          <h3 className="font-bold text-indigo-950 text-base">
            Trò 1: Trắc nghiệm khách quan nhiều lựa chọn (Multiple Choice)
          </h3>
          <p className="text-xs sm:text-sm text-indigo-800 mt-0.5">
            Đọc kỹ từng câu hỏi, nhấp biểu tượng chiếc loa để nghe phát âm và chọn 1 đáp án đúng nhất (A, B, C hoặc D).
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, qIndex) => {
          const selectedOption = answers[q.id];

          return (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all"
              id={`mcq-card-${q.id}`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start space-x-3">
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-extrabold px-2.5 py-1 rounded-lg shrink-0 mt-0.5">
                    Câu {qIndex + 1}
                  </span>
                  <h4 className="text-slate-900 font-semibold text-base leading-snug">
                    {q.question}
                  </h4>
                </div>

                {q.audioText && (
                  <button
                    type="button"
                    onClick={() => handleSpeak(q.audioText || q.question)}
                    title="Nghe phát âm câu hỏi"
                    className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-xl transition-colors shrink-0 cursor-pointer"
                    id={`btn-speak-${q.id}`}
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {q.options.map((opt, optIndex) => {
                  const isSelected = selectedOption === optIndex;

                  return (
                    <button
                      key={optIndex}
                      type="button"
                      onClick={() => {
                        onAnswer(q.id, optIndex);
                        soundManager.playCorrect();
                      }}
                      className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-xs ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50 text-slate-700'
                      }`}
                      id={`opt-${q.id}-${optIndex}`}
                    >
                      <div className="flex items-center space-x-3">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {optionLabels[optIndex] || optIndex + 1}
                        </span>
                        <span className="text-sm">{opt}</span>
                      </div>

                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
