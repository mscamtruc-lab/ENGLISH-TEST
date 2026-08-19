import React, { useState, useMemo } from 'react';
import { Shuffle, Check, ArrowRightLeft, Link2, X, MoveHorizontal, Volume2 } from 'lucide-react';
import { DragDropQuestion } from '../../types';
import { soundManager } from '../../utils/soundEffects';

interface DragDropRoundProps {
  questions: DragDropQuestion[];
  answers: Record<string, Record<string, string>>; // questionId -> { pairId: matchedRightId }
  onAnswerPair: (questionId: string, leftPairId: string, rightPairId: string) => void;
  onRemovePair: (questionId: string, leftPairId: string) => void;
}

export const DragDropRound: React.FC<DragDropRoundProps> = ({
  questions,
  answers,
  onAnswerPair,
  onRemovePair,
}) => {
  // Selected state for click-to-pair mode
  const [selectedLeft, setSelectedLeft] = useState<{ qId: string; pairId: string } | null>(null);
  const [draggedLeftId, setDraggedLeftId] = useState<{ qId: string; pairId: string } | null>(null);

  // Randomly shuffle right items per question so they aren't pre-aligned
  const shuffledRightItems = useMemo(() => {
    const map: Record<string, { id: string; right: string }[]> = {};
    questions.forEach((q) => {
      // Deterministic but mixed pseudo-shuffle based on id
      const items = [...q.pairs.map((p) => ({ id: p.id, right: p.right }))];
      // Reverse or rotate
      items.sort((a, b) => b.id.localeCompare(a.id));
      map[q.id] = items;
    });
    return map;
  }, [questions]);

  const handleLeftClick = (qId: string, pairId: string) => {
    if (selectedLeft?.qId === qId && selectedLeft?.pairId === pairId) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft({ qId, pairId });
    }
  };

  const handleRightClick = (qId: string, rightPairId: string) => {
    if (selectedLeft && selectedLeft.qId === qId) {
      onAnswerPair(qId, selectedLeft.pairId, rightPairId);
      setSelectedLeft(null);
      soundManager.playCorrect();
    }
  };

  // Drag handlers
  const handleDragStart = (qId: string, pairId: string) => {
    setDraggedLeftId({ qId, pairId });
  };

  const handleDropOnRight = (qId: string, rightPairId: string) => {
    if (draggedLeftId && draggedLeftId.qId === qId) {
      onAnswerPair(qId, draggedLeftId.pairId, rightPairId);
      setDraggedLeftId(null);
      soundManager.playCorrect();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-start space-x-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
          3
        </div>
        <div>
          <h3 className="font-bold text-emerald-950 text-base">
            Trò 3: Kéo thả & Ghép cặp nội dung (Drag and Drop / Matching)
          </h3>
          <p className="text-xs sm:text-sm text-emerald-800 mt-0.5">
            <strong>Cách 1:</strong> Kéo mục bên trái và thả vào mục tương ứng bên phải. <br className="hidden sm:inline" />
            <strong>Cách 2:</strong> Nhấp chọn 1 ô bên trái rồi nhấp ô tương ứng bên phải để nối.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {questions.map((q, qIndex) => {
          const currentMatches = answers[q.id] || {};
          const matchedLeftKeys = Object.keys(currentMatches);
          const matchedRightValues = Object.values(currentMatches);

          return (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs"
              id={`dd-card-${q.id}`}
            >
              {/* Question Title & Instruction */}
              <div className="mb-4">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2.5 py-1 rounded-lg">
                  Bài ghép {qIndex + 1}
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1">{q.title}</h4>
                <p className="text-xs text-slate-600 mt-0.5">{q.instruction}</p>
              </div>

              {/* Matching Columns Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                {/* Left Column (Source items) */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                    Cột A (Từ / Cụm từ tiếng Anh)
                  </div>
                  {q.pairs.map((pair, pIdx) => {
                    const matchedRightId = currentMatches[pair.id];
                    const isSelected =
                      selectedLeft?.qId === q.id && selectedLeft?.pairId === pair.id;
                    const matchedPairObj = q.pairs.find((p) => p.id === matchedRightId);

                    return (
                      <div
                        key={pair.id}
                        draggable
                        onDragStart={() => handleDragStart(q.id, pair.id)}
                        onClick={() => handleLeftClick(q.id, pair.id)}
                        className={`p-3.5 rounded-xl border-2 transition-all cursor-grab active:cursor-grabbing select-none relative flex items-center justify-between ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/80 shadow-md ring-2 ring-indigo-500/20'
                            : matchedRightId
                            ? 'border-emerald-400 bg-emerald-50/50'
                            : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-slate-100/60'
                        }`}
                        id={`dd-left-${pair.id}`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center shadow-2xs">
                            {pIdx + 1}
                          </span>
                          <span className="font-semibold text-sm text-slate-900">{pair.left}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              soundManager.speak(pair.left);
                            }}
                            title="Nghe phát âm"
                            className="p-1 text-slate-400 hover:text-emerald-700 transition-colors"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <MoveHorizontal className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Column (Target items) */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                    Cột B (Nghĩa / Nửa câu ghép)
                  </div>
                  {(shuffledRightItems[q.id] || []).map((item, rIdx) => {
                    // Check if this right item is already matched with any left item
                    const matchedLeftId = Object.keys(currentMatches).find(
                      (lId) => currentMatches[lId] === item.id
                    );
                    const matchedLeftPair = q.pairs.find((p) => p.id === matchedLeftId);

                    return (
                      <div
                        key={item.id}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDropOnRight(q.id, item.id)}
                        onClick={() => handleRightClick(q.id, item.id)}
                        className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer select-none flex items-center justify-between ${
                          matchedLeftId
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold shadow-xs'
                            : selectedLeft?.qId === q.id
                            ? 'border-dashed border-indigo-400 bg-indigo-50/40 hover:bg-indigo-100/50'
                            : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50 text-slate-700'
                        }`}
                        id={`dd-right-${item.id}`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">
                            {String.fromCharCode(65 + rIdx)}
                          </span>
                          <span className="text-sm">{item.right}</span>
                        </div>

                        {matchedLeftPair && (
                          <div className="flex items-center space-x-2">
                            <span className="bg-emerald-200/80 text-emerald-900 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
                              <Link2 className="w-3 h-3" />
                              <span>Nối với: {matchedLeftPair.left}</span>
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemovePair(q.id, matchedLeftPair.id);
                              }}
                              title="Gỡ nối cặp này"
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded-md transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
