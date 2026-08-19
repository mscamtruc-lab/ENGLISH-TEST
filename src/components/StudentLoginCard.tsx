import React, { useState } from 'react';
import { User, School, Sparkles, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import { StudentInfo } from '../types';

interface StudentLoginCardProps {
  initialData?: StudentInfo | null;
  onSaveStudent: (student: StudentInfo) => void;
}

const COMMON_CLASSES: Record<number, string[]> = {
  6: ['6A1', '6A2', '6A3', '6A4', '6B1', '6B2', '6C1'],
  7: ['7A1', '7A2', '7A3', '7A4', '7B1', '7B2', '7C1'],
  8: ['8A1', '8A2', '8A3', '8A4', '8B1', '8B2', '8C1'],
  9: ['9A1', '9A2', '9A3', '9A4', '9B1', '9B2', '9C1'],
};

export const StudentLoginCard: React.FC<StudentLoginCardProps> = ({
  initialData,
  onSaveStudent,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [grade, setGrade] = useState<6 | 7 | 8 | 9>(initialData?.grade || 6);
  const [className, setClassName] = useState(initialData?.className || '6A1');
  const [isCustomClass, setIsCustomClass] = useState(false);
  const [customClassName, setCustomClassName] = useState('');
  const [studentCode, setStudentCode] = useState(initialData?.studentCode || '');
  const [error, setError] = useState('');

  const handleGradeChange = (newGrade: 6 | 7 | 8 | 9) => {
    setGrade(newGrade);
    if (!isCustomClass) {
      setClassName(COMMON_CLASSES[newGrade][0] || `${newGrade}A1`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập Họ và tên của em.');
      return;
    }
    const finalClass = isCustomClass ? customClassName.trim() : className.trim();
    if (!finalClass) {
      setError('Vui lòng chọn hoặc nhập tên Lớp.');
      return;
    }

    setError('');
    const studentInfo: StudentInfo = {
      name: name.trim(),
      grade,
      className: finalClass,
      studentCode: studentCode.trim() || undefined,
    };
    onSaveStudent(studentInfo);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-600 via-sky-600 to-teal-500 p-6 text-white text-center relative">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md mb-3 shadow-inner">
          <School className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Đăng Nhập Kiểm Tra Tiếng Anh</h2>
        <p className="text-indigo-100 text-sm mt-1 max-w-xs mx-auto">
          Điền thông tin học sinh để bắt đầu bài kiểm tra và lưu lại kết quả đánh giá.
        </p>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-2.5 rounded-xl flex items-center space-x-2">
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="student-name">
            Họ và tên học sinh <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-5 h-5" />
            </div>
            <input
              id="student-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn An"
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
            />
          </div>
        </div>

        {/* Grade Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Khối lớp <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {([6, 7, 8, 9] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => handleGradeChange(g)}
                className={`py-2.5 px-3 rounded-xl border text-sm font-bold transition-all flex flex-col items-center justify-center ${
                  grade === g
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs scale-102'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
                id={`btn-grade-${g}`}
              >
                <span>Khối {g}</span>
                <span className={`text-[10px] font-normal ${grade === g ? 'text-indigo-100' : 'text-slate-400'}`}>
                  Lớp {g}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Class Selection */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-semibold text-slate-700" htmlFor="student-class">
              Lớp học <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setIsCustomClass(!isCustomClass)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
            >
              {isCustomClass ? 'Chọn từ danh sách có sẵn' : 'Nhập tên lớp khác'}
            </button>
          </div>

          {isCustomClass ? (
            <input
              type="text"
              value={customClassName}
              onChange={(e) => setCustomClassName(e.target.value)}
              placeholder={`Ví dụ: ${grade}A5, ${grade}/2, ${grade} Song ngữ...`}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-medium"
            />
          ) : (
            <select
              id="student-class"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-medium"
            >
              {COMMON_CLASSES[grade].map((c) => (
                <option key={c} value={c}>
                  Lớp {c}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Student Code (Optional) */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="student-code">
            Mã học sinh / Số báo danh <span className="text-xs font-normal text-slate-500">(Không bắt buộc)</span>
          </label>
          <input
            id="student-code"
            type="text"
            value={studentCode}
            onChange={(e) => setStudentCode(e.target.value)}
            placeholder={`Ví dụ: HS-${grade}0125 hoặc SBD 08`}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm"
          />
        </div>

        {/* 4 Formats Highlights */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-700 block mb-2">Cấu trúc 4 vòng kiểm tra:</span>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
              <span>Trò 1: Trắc nghiệm</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0"></span>
              <span>Trò 2: Đúng / Sai</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span>Trò 3: Kéo thả</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
              <span>Trò 4: Điền khuyết</span>
            </div>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-base cursor-pointer"
          id="btn-start-test-login"
        >
          <span>Vào Phòng Kiểm Tra</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
