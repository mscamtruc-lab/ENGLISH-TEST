import React, { useState } from 'react';
import { BookOpen, Volume2, VolumeX, ShieldCheck, UserCheck, Sparkles, LogOut } from 'lucide-react';
import { StudentInfo } from '../types';
import { soundManager } from '../utils/soundEffects';

interface NavbarProps {
  student: StudentInfo | null;
  onOpenTeacherModal: () => void;
  isTeacherMode: boolean;
  onExitTeacherMode: () => void;
  onChangeStudent: () => void;
  onGoHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  student,
  onOpenTeacherModal,
  isTeacherMode,
  onExitTeacherMode,
  onChangeStudent,
  onGoHome,
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());

  const handleToggleMute = () => {
    const nextMuted = soundManager.toggleMute();
    setIsMuted(nextMuted);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#fff9f9]/95 backdrop-blur border-b border-rose-200/70 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={onGoHome}
          className="flex items-center space-x-3 text-left group focus:outline-hidden cursor-pointer"
          id="btn-brand-logo"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-900 via-rose-800 to-red-700 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-rose-950 tracking-tight">EduEnglish THCS</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-rose-100/70 text-rose-900 border border-rose-200">
                GDPT 2018
              </span>
            </div>
            <p className="text-xs text-rose-900/60 hidden sm:block">Đánh giá thường xuyên 4 Dạng thức Tiếng Anh</p>
          </div>
        </button>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleMute}
            title={isMuted ? 'Bật âm thanh hiệu ứng' : 'Tắt âm thanh'}
            className="p-2 text-rose-900/70 hover:text-rose-950 hover:bg-rose-100/50 rounded-lg transition-colors cursor-pointer"
            id="btn-sound-toggle"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-500" /> : <Volume2 className="w-5 h-5 text-emerald-700" />}
          </button>

          {/* Student Status Badge if logged in */}
          {student && !isTeacherMode && (
            <div className="flex items-center bg-rose-50/80 border border-rose-200 text-rose-950 rounded-lg px-3 py-1.5 space-x-2 text-sm">
              <UserCheck className="w-4 h-4 text-rose-800 shrink-0" />
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-rose-950 text-xs sm:text-sm">{student.name}</span>
                <span className="text-[11px] text-rose-800 font-semibold">Lớp {student.className}</span>
              </div>
              <button
                onClick={onChangeStudent}
                title="Đổi thông tin học sinh"
                className="text-xs text-rose-700 hover:text-rose-950 underline ml-1 hover:cursor-pointer font-bold"
                id="btn-change-student"
              >
                Đổi
              </button>
            </div>
          )}

          {/* Teacher Mode Button or Exit */}
          {isTeacherMode ? (
            <button
              onClick={onExitTeacherMode}
              className="flex items-center space-x-1.5 bg-rose-800 hover:bg-rose-900 text-white font-medium text-xs sm:text-sm px-3.5 py-2 rounded-lg shadow-xs transition-colors cursor-pointer"
              id="btn-exit-teacher"
            >
              <LogOut className="w-4 h-4" />
              <span>Thoát Dashboard Giáo viên</span>
            </button>
          ) : (
            <button
              onClick={onOpenTeacherModal}
              className="flex items-center space-x-1.5 bg-rose-50 hover:bg-rose-100/80 text-rose-950 font-medium text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-rose-200/80 transition-colors cursor-pointer"
              id="btn-open-teacher"
            >
              <ShieldCheck className="w-4 h-4 text-rose-800" />
              <span>Dành cho Giáo viên</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
