import React, { useState } from 'react';
import { Edit3, Sparkles, HelpCircle, Volume2 } from 'lucide-react';
import { FillBlankQuestion } from '../../types';
import { soundManager } from '../../utils/soundEffects';

interface FillBlankRoundProps {
  questions: FillBlankQuestion[];
  answers: Record<string, Record<string, string>>; // questionId -> { blankId: enteredText }
  onAnswerBlank: (questionId: string, blankId: string, text: string) => void;
}

export const FillBlankRound: React.FC<FillBlankRoundProps> = ({
  questions,
  answers,
  onAnswerBlank,
}) => {
  const [activeBlank, setActiveBlank] = useState<{ qId: string; blankId: string } | null>(null);

  const handleWordBankClick = (qId: string, word: string) => {
    if (activeBlank && activeBlank.qId === qId) {
      onAnswerBlank(qId, activeBlank.blankId, word);
      soundManager.playCorrect();
    } else {
      // Find the first unfilled blank for this question
      const q = questions.find((item) => item.id === qId);
      if (q) {
        const qAnswers = answers[qId] || {};
        const firstEmptyBlank = q.blanks.find((b) => !qAnswers[b.id]);
        if (firstEmptyBlank) {
          onAnswerBlank(qId, firstEmptyBlank.id, word);
          soundManager.playCorrect();
        }
      }
    }
  };

  const renderInteractivePassage = (q: FillBlankQuestion) => {
    const qAnswers = answers[q.id] || {};
    // Split by token [1], [2], etc.
    const parts = q.passage.split(/(\[\d+\])/g);

    return (
      <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 text-slate-800 text-base leading-loose font-medium">
        {parts.map((part, pIdx) => {
          const match = part.match(/\[(\d+)\]/);
          if (match) {
            const blankNumber = parseInt(match[1], 10);
            const blankObj = q.blanks.find((b) => b.blankIndex === blankNumber);
            if (!blankObj) return <span key={pIdx}>{part}</span>;

            const val = qAnswers[blankObj.id] || '';
            const isActive =
              activeBlank?.qId === q.id && activeBlank?.blankId === blankObj.id;

            return (
              <span key={pIdx} className="inline-block mx-1.5 align-middle">
                <span className="relative inline-flex items-center">
                  <span className="absolute -top-3 left-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 rounded-full z-10">
                    [{blankNumber}]
                  </span>
                  <input
                    type="text"
                    value={val}
                    onFocus={() => setActiveBlank({ qId: q.id, blankId: blankObj.id })}
                    onChange={(e) => onAnswerBlank(q.id, blankObj.id, e.target.value)}
                    placeholder={blankObj.hint || `Từ [${blankNumber}]`}
                    className={`min-w-[120px] max-w-[170px] px-3 py-1.5 text-sm font-semibold rounded-lg border-2 text-center transition-all bg-white shadow-2xs focus:outline-hidden ${
                      isActive
                        ? 'border-amber-500 ring-2 ring-amber-400/30'
                        : val
                        ? 'border-emerald-500 bg-emerald-50/30 text-emerald-950'
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                    id={`input-blank-${blankObj.id}`}
                  />
                </span>
              </span>
            );
          }
          return <span key={pIdx}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start space-x-3">
        <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
          4
        </div>
        <div>
          <h3 className="font-bold text-amber-950 text-base">
            Trò 4: Điền từ vào chỗ khuyết (Fill in the Blanks)
          </h3>
          <p className="text-xs sm:text-sm text-amber-800 mt-0.5">
            Nhập trực tiếp từ cần điền vào các ô <strong>[1], [2]</strong> hoặc nhấp chọn các từ gợi ý trong ngân hàng từ bên dưới.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {questions.map((q, qIdx) => {
          return (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs"
              id={`fb-card-${q.id}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="bg-amber-100 text-amber-800 text-xs font-extrabold px-2.5 py-1 rounded-lg">
                    Bài điền từ {qIdx + 1}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-1">{q.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{q.instruction}</p>
                </div>

                <button
                  type="button"
                  onClick={() => soundManager.speak(q.passage)}
                  title="Nghe đọc bài mẫu"
                  className="p-2 text-amber-700 hover:bg-amber-100/60 rounded-xl transition-colors shrink-0 cursor-pointer"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              {/* Interactive Passage */}
              {renderInteractivePassage(q)}

              {/* Word Bank Tags if available */}
              {q.wordBank && q.wordBank.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-600 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Ngân hàng từ gợi ý (Nhấp để điền nhanh vào ô đang chọn):</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {q.wordBank.map((word, wIdx) => (
                      <button
                        key={wIdx}
                        type="button"
                        onClick={() => handleWordBankClick(q.id, word)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-950 border border-slate-200 hover:border-amber-300 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer"
                        id={`btn-word-${q.id}-${wIdx}`}
                      >
                        + {word}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
