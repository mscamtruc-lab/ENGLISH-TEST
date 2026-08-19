import React, { useState } from 'react';
import { Clock, HelpCircle, Layers, CheckCircle2, Play, Sparkles, Filter, BookmarkCheck } from 'lucide-react';
import { TestExam, StudentInfo } from '../types';

interface TestSelectorProps {
  student: StudentInfo;
  tests: TestExam[];
  onSelectTest: (test: TestExam) => void;
  onEditStudent: () => void;
}

export const TestSelector: React.FC<TestSelectorProps> = ({
  student,
  tests,
  onSelectTest,
  onEditStudent,
}) => {
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<number | 'all'>(student.grade);

  const filteredTests = tests.filter((t) => {
    if (selectedGradeFilter === 'all') return true;
    return t.grade === selectedGradeFilter;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Student Welcome Card */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-sky-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Học sinh: {student.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Phòng Kiểm Tra & Đánh Giá Tiếng Anh
            </h1>
            <p className="text-indigo-100 text-sm sm:text-base mt-1 max-w-2xl">
              Lớp <span className="font-bold underline">{student.className}</span> • Khối {student.grade} THCS. Hãy chọn một đề kiểm tra bên dưới để bắt đầu làm bài.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={onEditStudent}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              id="btn-edit-student-info"
            >
              Đổi thông tin
            </button>
          </div>
        </div>
      </div>

      {/* Grade Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Danh Sách Bộ Đề Kiểm Tra</h2>
          <p className="text-xs text-slate-500">Mỗi đề gồm đầy đủ 4 trò chơi / dạng thức: Trắc nghiệm, Đúng/Sai, Kéo thả, Điền khuyết.</p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setSelectedGradeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedGradeFilter === 'all'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="filter-all-grades"
          >
            Tất cả khối
          </button>
          {([6, 7, 8, 9] as const).map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGradeFilter(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedGradeFilter === g
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              id={`filter-grade-${g}`}
            >
              Khối {g} {student.grade === g && '⭐'}
            </button>
          ))}
        </div>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredTests.map((test) => {
          const totalQuestions =
            test.rounds.multipleChoice.length +
            test.rounds.trueFalse.length +
            test.rounds.dragDrop.length +
            test.rounds.fillBlank.length;

          const isRecommended = test.grade === student.grade;

          return (
            <div
              key={test.id}
              className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden relative group hover:shadow-xl ${
                isRecommended
                  ? 'border-indigo-300 ring-2 ring-indigo-500/20 shadow-md'
                  : 'border-slate-200 hover:border-indigo-200 shadow-xs'
              }`}
              id={`test-card-${test.id}`}
            >
              {/* Header */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 font-extrabold text-xs px-2.5 py-1 rounded-lg">
                      Tiếng Anh {test.grade}
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-lg">
                      {test.unit}
                    </span>
                  </div>
                  {isRecommended && (
                    <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
                      <span>Đúng khối {student.grade}</span>
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-lg text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                  {test.title}
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1">Chủ đề: {test.topic}</p>
                <p className="text-sm text-slate-600 mt-2.5 leading-relaxed line-clamp-2">
                  {test.description}
                </p>

                {/* 4 Rounds pill overview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-100">
                  <div className="bg-slate-50 p-2 rounded-lg text-center">
                    <span className="text-[11px] text-slate-500 block font-medium">Trò 1</span>
                    <span className="text-xs font-bold text-indigo-700">
                      {test.rounds.multipleChoice.length} Trắc nghiệm
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg text-center">
                    <span className="text-[11px] text-slate-500 block font-medium">Trò 2</span>
                    <span className="text-xs font-bold text-sky-700">
                      {test.rounds.trueFalse.length} Đúng / Sai
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg text-center">
                    <span className="text-[11px] text-slate-500 block font-medium">Trò 3</span>
                    <span className="text-xs font-bold text-emerald-700">
                      {test.rounds.dragDrop.length} Kéo thả
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg text-center">
                    <span className="text-[11px] text-slate-500 block font-medium">Trò 4</span>
                    <span className="text-xs font-bold text-amber-700">
                      {test.rounds.fillBlank.length} Điền khuyết
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs font-medium text-slate-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{test.durationMinutes} phút</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Layers className="w-4 h-4 text-slate-400" />
                    <span>Thang 10 điểm</span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectTest(test)}
                  className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-4 py-2 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer group-hover:scale-102"
                  id={`btn-start-${test.id}`}
                >
                  <span>Bắt đầu</span>
                  <Play className="w-4 h-4 fill-white" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTests.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Chưa có đề kiểm tra cho khối này</h3>
          <p className="text-xs text-slate-500 mt-1">Giáo viên có thể sử dụng tính năng tạo đề tự động bằng AI trong Dashboard.</p>
        </div>
      )}
    </div>
  );
};
