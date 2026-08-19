import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2, XCircle, RotateCcw, ArrowLeft, Printer, Eye, ChevronDown, ChevronUp, Share2, Sparkles, BookOpen, Layers } from 'lucide-react';
import { TestResult, TestExam } from '../types';
import { soundManager } from '../utils/soundEffects';

interface TestResultViewProps {
  result: TestResult;
  test: TestExam;
  onRetake: () => void;
  onSelectAnotherTest: () => void;
}

export const TestResultView: React.FC<TestResultViewProps> = ({
  result,
  test,
  onRetake,
  onSelectAnotherTest,
}) => {
  const [showDetailedReview, setShowDetailedReview] = useState(true);

  useEffect(() => {
    // Launch celebratory confetti
    try {
      if (result.totalScore >= 7.0) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch {
      // Ignore
    }
  }, [result]);

  const getBadgeStyle = (classification: string) => {
    switch (classification) {
      case 'Xuất sắc':
        return 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400/30';
      case 'Giỏi':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 ring-2 ring-emerald-400/30';
      case 'Khá':
        return 'bg-sky-100 text-sky-900 border-sky-300 ring-2 ring-sky-400/30';
      case 'Trung bình':
        return 'bg-slate-100 text-slate-900 border-slate-300';
      default:
        return 'bg-rose-100 text-rose-900 border-rose-300';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 print:p-0 print:m-0">
      {/* Printable / Viewable Certificate Result Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden print:shadow-none print:border-none">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600 p-6 sm:p-8 text-white text-center relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md mb-3 shadow-inner">
            <Award className="w-9 h-9 text-amber-300" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Kết Quả Kiểm Tra Đánh Giá Thường Xuyên
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base mt-1 max-w-xl mx-auto font-medium">
            {test.title}
          </p>
        </div>

        {/* Student Info & Score Overview */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400 block">
                Thông tin học sinh
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">{result.studentName}</h3>
              <p className="text-sm font-semibold text-indigo-700">
                Lớp {result.className} • Khối {result.grade} THCS
                {result.studentCode && ` • SBD: ${result.studentCode}`}
              </p>
            </div>

            {/* Classification Badge */}
            <div className="flex items-center space-x-3">
              <div className={`px-4 py-2 rounded-2xl border text-center ${getBadgeStyle(result.gradeClassification)}`}>
                <span className="text-[11px] block font-bold uppercase tracking-wider opacity-80">
                  Xếp loại
                </span>
                <span className="text-base font-extrabold">{result.gradeClassification}</span>
              </div>
            </div>
          </div>

          {/* Main Scores Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-5 rounded-2xl border border-indigo-100 text-center flex flex-col justify-center">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Điểm Tổng Kết (Thang 10)
              </span>
              <div className="text-4xl font-black text-indigo-900 my-1">
                {result.totalScore.toFixed(1)}
                <span className="text-lg font-bold text-indigo-400">/10.0</span>
              </div>
              <span className="text-xs text-indigo-600 font-medium">Tương đương {result.percentage}%</span>
            </div>

            <div className="bg-gradient-to-br from-sky-50 to-sky-100/50 p-5 rounded-2xl border border-sky-100 text-center flex flex-col justify-center">
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                Thời Gian Làm Bài
              </span>
              <div className="text-3xl font-black text-sky-900 my-1">
                {Math.floor(result.timeSpentSeconds / 60)}p {result.timeSpentSeconds % 60}s
              </div>
              <span className="text-xs text-sky-600 font-medium">Thời lượng đề: {test.durationMinutes} phút</span>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 rounded-2xl border border-emerald-100 text-center flex flex-col justify-center">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Lời Nhận Xét
              </span>
              <p className="text-xs sm:text-sm font-medium text-emerald-950 mt-1.5 leading-relaxed">
                "{result.feedback}"
              </p>
            </div>
          </div>

          {/* 4 Rounds breakdown cards */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Điểm chi tiết theo từng dạng thức (4 Trò chơi):
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Round 1 */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-center">
                <span className="text-[11px] font-bold text-indigo-700 block">Trò 1: Trắc nghiệm</span>
                <span className="text-lg font-extrabold text-slate-900">
                  {result.roundScores.multipleChoice.score.toFixed(1)}
                  <span className="text-xs font-normal text-slate-500">/2.5 đ</span>
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Đúng {result.roundScores.multipleChoice.correct}/{result.roundScores.multipleChoice.total} câu
                </span>
              </div>

              {/* Round 2 */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-center">
                <span className="text-[11px] font-bold text-sky-700 block">Trò 2: Đúng / Sai</span>
                <span className="text-lg font-extrabold text-slate-900">
                  {result.roundScores.trueFalse.score.toFixed(1)}
                  <span className="text-xs font-normal text-slate-500">/2.5 đ</span>
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Đúng {result.roundScores.trueFalse.correct}/{result.roundScores.trueFalse.total} câu
                </span>
              </div>

              {/* Round 3 */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-center">
                <span className="text-[11px] font-bold text-emerald-700 block">Trò 3: Kéo thả</span>
                <span className="text-lg font-extrabold text-slate-900">
                  {result.roundScores.dragDrop.score.toFixed(1)}
                  <span className="text-xs font-normal text-slate-500">/2.5 đ</span>
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Đúng {result.roundScores.dragDrop.correct}/{result.roundScores.dragDrop.total} cặp
                </span>
              </div>

              {/* Round 4 */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-center">
                <span className="text-[11px] font-bold text-amber-700 block">Trò 4: Điền khuyết</span>
                <span className="text-lg font-extrabold text-slate-900">
                  {result.roundScores.fillBlank.score.toFixed(1)}
                  <span className="text-xs font-normal text-slate-500">/2.5 đ</span>
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Đúng {result.roundScores.fillBlank.correct}/{result.roundScores.fillBlank.total} ô
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-6 border-t border-slate-100 print:hidden">
            <div className="flex items-center space-x-2">
              <button
                onClick={onSelectAnotherTest}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                id="btn-select-other-test"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Chọn đề kiểm tra khác</span>
              </button>

              <button
                onClick={onRetake}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold text-xs sm:text-sm hover:bg-indigo-100 transition-colors cursor-pointer"
                id="btn-retake-test"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Làm lại đề này</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                id="btn-print-certificate"
              >
                <Printer className="w-4 h-4" />
                <span>In phiếu điểm</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Review Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden print:hidden">
        <button
          onClick={() => setShowDetailedReview(!showDetailedReview)}
          className="w-full p-5 sm:p-6 flex items-center justify-between bg-slate-50/80 hover:bg-slate-100/80 transition-colors text-left cursor-pointer border-b border-slate-200"
          id="btn-toggle-detailed-review"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Xem Lại Chi Tiết Từng Câu Hỏi & Lời Giải</h3>
              <p className="text-xs text-slate-500">Đối chiếu câu trả lời của em với đáp án chính xác và giải thích ngữ pháp.</p>
            </div>
          </div>
          {showDetailedReview ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {showDetailedReview && (
          <div className="p-6 space-y-8 divide-y divide-slate-100">
            {/* Round 1 Review */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-indigo-700 uppercase tracking-wider flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                <span>Trò 1: Trắc nghiệm khách quan</span>
              </h4>
              <div className="space-y-4">
                {test.rounds.multipleChoice.map((q, idx) => {
                  const userChoice = result.answers.multipleChoice[q.id];
                  const isCorrect = userChoice === q.correctAnswer;
                  const optionLetters = ['A', 'B', 'C', 'D'];

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border ${
                        isCorrect ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-sm text-slate-900">
                          Câu {idx + 1}: {q.question}
                        </span>
                        {isCorrect ? (
                          <span className="text-emerald-700 text-xs font-bold flex items-center space-x-1 shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Đúng</span>
                          </span>
                        ) : (
                          <span className="text-rose-700 text-xs font-bold flex items-center space-x-1 shrink-0">
                            <XCircle className="w-4 h-4" />
                            <span>Chưa đúng</span>
                          </span>
                        )}
                      </div>

                      <div className="mt-2 text-xs space-y-1">
                        <div className="text-slate-600">
                          Em đã chọn:{' '}
                          <strong className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                            {userChoice !== undefined ? `${optionLetters[userChoice]}. ${q.options[userChoice]}` : 'Chưa chọn'}
                          </strong>
                        </div>
                        {!isCorrect && (
                          <div className="text-slate-700 font-medium">
                            Đáp án đúng:{' '}
                            <strong className="text-emerald-700">
                              {optionLetters[q.correctAnswer]}. {q.options[q.correctAnswer]}
                            </strong>
                          </div>
                        )}
                        {q.explanation && (
                          <div className="mt-2 bg-white p-2.5 rounded-lg text-slate-600 border border-slate-200 italic">
                            💡 Giải thích: {q.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Round 2 Review */}
            <div className="pt-6 space-y-4">
              <h4 className="font-bold text-sm text-sky-700 uppercase tracking-wider flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                <span>Trò 2: Trắc nghiệm Đúng / Sai</span>
              </h4>
              <div className="space-y-4">
                {test.rounds.trueFalse.map((q, idx) => {
                  const userChoice = result.answers.trueFalse[q.id];
                  const isCorrect = userChoice === q.isTrue;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border ${
                        isCorrect ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-sm text-slate-900">
                          Nhận định {idx + 1}: {q.statement}
                        </span>
                        {isCorrect ? (
                          <span className="text-emerald-700 text-xs font-bold flex items-center space-x-1 shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Đúng</span>
                          </span>
                        ) : (
                          <span className="text-rose-700 text-xs font-bold flex items-center space-x-1 shrink-0">
                            <XCircle className="w-4 h-4" />
                            <span>Chưa đúng</span>
                          </span>
                        )}
                      </div>

                      <div className="mt-2 text-xs space-y-1">
                        <div className="text-slate-600">
                          Em chọn:{' '}
                          <strong className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                            {userChoice !== undefined ? (userChoice ? 'TRUE (Đúng)' : 'FALSE (Sai)') : 'Chưa chọn'}
                          </strong>{' '}
                          | Đáp án đúng: <strong className="text-emerald-700">{q.isTrue ? 'TRUE' : 'FALSE'}</strong>
                        </div>
                        {q.explanation && (
                          <div className="mt-2 bg-white p-2.5 rounded-lg text-slate-600 border border-slate-200 italic">
                            💡 Giải thích: {q.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Round 3 Review */}
            <div className="pt-6 space-y-4">
              <h4 className="font-bold text-sm text-emerald-700 uppercase tracking-wider flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>Trò 3: Kéo thả & Ghép cặp</span>
              </h4>
              <div className="space-y-4">
                {test.rounds.dragDrop.map((q) => {
                  const qAnswers = result.answers.dragDrop[q.id] || {};

                  return (
                    <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <h5 className="font-bold text-sm text-slate-900">{q.title}</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {q.pairs.map((pair) => {
                          const matchedRightId = qAnswers[pair.id];
                          const isPairCorrect = matchedRightId === pair.id;
                          const chosenPairObj = q.pairs.find((p) => p.id === matchedRightId);

                          return (
                            <div
                              key={pair.id}
                              className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                                isPairCorrect
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                                  : 'bg-rose-50 border-rose-200 text-rose-950'
                              }`}
                            >
                              <div>
                                <span className="font-bold">{pair.left}</span>
                                <div className="text-[11px] opacity-80">
                                  Đáp án chuẩn: {pair.right}
                                </div>
                              </div>
                              {isPairCorrect ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : (
                                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Round 4 Review */}
            <div className="pt-6 space-y-4">
              <h4 className="font-bold text-sm text-amber-700 uppercase tracking-wider flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                <span>Trò 4: Điền từ vào ô khuyết</span>
              </h4>
              <div className="space-y-4">
                {test.rounds.fillBlank.map((q) => {
                  const qAnswers = result.answers.fillBlank[q.id] || {};

                  return (
                    <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <h5 className="font-bold text-sm text-slate-900">{q.title}</h5>
                      <div className="space-y-2 mt-2">
                        {q.blanks.map((b) => {
                          const userText = qAnswers[b.id] || '';
                          const isCorrect = b.acceptedAnswers.some(
                            (ans) => ans.trim().toLowerCase() === userText.trim().toLowerCase()
                          );

                          return (
                            <div
                              key={b.id}
                              className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                                isCorrect
                                  ? 'bg-emerald-50 border-emerald-200'
                                  : 'bg-rose-50 border-rose-200'
                              }`}
                            >
                              <div>
                                <span className="font-bold text-slate-800">Ô trống [{b.blankIndex}]: </span>
                                <span>Em đã điền: </span>
                                <strong className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                                  "{userText || '(Chưa điền)'}"
                                </strong>
                                {!isCorrect && (
                                  <span className="text-slate-600 ml-2">
                                    (Đáp án chấp nhận: <strong>{b.acceptedAnswers.join(' / ')}</strong>)
                                  </span>
                                )}
                              </div>
                              {isCorrect ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : (
                                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
