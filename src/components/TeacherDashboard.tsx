import React, { useState, useMemo } from 'react';
import {
  Users,
  Award,
  TrendingUp,
  Download,
  Printer,
  Trash2,
  Search,
  Filter,
  Eye,
  Sparkles,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  ArrowUpDown,
  RefreshCw,
  Lock,
  Unlock,
} from 'lucide-react';
import { TestResult, TestExam, GradeClassification } from '../types';
import { GoogleDriveManager } from './GoogleDriveManager';

interface TeacherDashboardProps {
  results: TestResult[];
  tests: TestExam[];
  onDeleteResult: (id: string) => void;
  onClearAllResults: () => void;
  onRefreshData: () => void;
  onAddCustomTest: (test: TestExam) => void;
  onImportResults?: (importedResults: TestResult[]) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  results,
  tests,
  onDeleteResult,
  onClearAllResults,
  onRefreshData,
  onAddCustomTest,
  onImportResults,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedTestId, setSelectedTestId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'score-desc' | 'score-asc' | 'name'>('date-desc');

  // Detail Modal
  const [viewingResult, setViewingResult] = useState<TestResult | null>(null);

  // AI Generator Modal
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiGrade, setAiGrade] = useState<number>(7);
  const [aiTopic, setAiTopic] = useState('Unit 3: Community Services & Volunteering');
  const [aiDuration, setAiDuration] = useState<number>(15);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiSuccessMsg, setAiSuccessMsg] = useState('');

  // Extract unique classes for filter
  const uniqueClasses = useMemo(() => {
    const set = new Set<string>();
    results.forEach((r) => {
      if (r.className) set.add(r.className);
    });
    return Array.from(set).sort();
  }, [results]);

  // Filtered and sorted results
  const filteredResults = useMemo(() => {
    return results
      .filter((r) => {
        if (selectedGrade !== 'all' && r.grade.toString() !== selectedGrade) return false;
        if (selectedClass !== 'all' && r.className !== selectedClass) return false;
        if (selectedTestId !== 'all' && r.testId !== selectedTestId) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = r.studentName.toLowerCase().includes(q);
          const matchClass = r.className.toLowerCase().includes(q);
          const matchCode = r.studentCode ? r.studentCode.toLowerCase().includes(q) : false;
          if (!matchName && !matchClass && !matchCode) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        }
        if (sortBy === 'score-desc') {
          return b.totalScore - a.totalScore;
        }
        if (sortBy === 'score-asc') {
          return a.totalScore - b.totalScore;
        }
        if (sortBy === 'name') {
          return a.studentName.localeCompare(b.studentName);
        }
        return 0;
      });
  }, [results, selectedGrade, selectedClass, selectedTestId, searchQuery, sortBy]);

  // Overall Statistics
  const stats = useMemo(() => {
    const total = filteredResults.length;
    if (total === 0) {
      return {
        total: 0,
        avgScore: 0,
        passRate: 0,
        excellentCount: 0,
        goodCount: 0,
        fairCount: 0,
        avgMCQ: 0,
        avgTF: 0,
        avgDD: 0,
        avgFB: 0,
      };
    }

    const sumScore = filteredResults.reduce((acc, r) => acc + r.totalScore, 0);
    const avgScore = Math.round((sumScore / total) * 10) / 10;
    const passedCount = filteredResults.filter((r) => r.totalScore >= 5.0).length;
    const passRate = Math.round((passedCount / total) * 100);

    const excellentCount = filteredResults.filter((r) => r.gradeClassification === 'Xuất sắc').length;
    const goodCount = filteredResults.filter((r) => r.gradeClassification === 'Giỏi').length;
    const fairCount = filteredResults.filter((r) => r.gradeClassification === 'Khá').length;

    const avgMCQ =
      Math.round(
        (filteredResults.reduce((acc, r) => acc + (r.roundScores?.multipleChoice?.score || 0), 0) /
          total) *
          10
      ) / 10;
    const avgTF =
      Math.round(
        (filteredResults.reduce((acc, r) => acc + (r.roundScores?.trueFalse?.score || 0), 0) / total) *
          10
      ) / 10;
    const avgDD =
      Math.round(
        (filteredResults.reduce((acc, r) => acc + (r.roundScores?.dragDrop?.score || 0), 0) / total) *
          10
      ) / 10;
    const avgFB =
      Math.round(
        (filteredResults.reduce((acc, r) => acc + (r.roundScores?.fillBlank?.score || 0), 0) / total) *
          10
      ) / 10;

    return {
      total,
      avgScore,
      passRate,
      excellentCount,
      goodCount,
      fairCount,
      avgMCQ,
      avgTF,
      avgDD,
      avgFB,
    };
  }, [filteredResults]);

  // Export to CSV with UTF-8 BOM
  const handleExportCSV = () => {
    if (filteredResults.length === 0) return;

    const headers = [
      'STT',
      'Họ và tên học sinh',
      'Lớp',
      'Khối',
      'Số báo danh',
      'Bài kiểm tra',
      'Điểm tổng kết (Thang 10)',
      'Phần trăm (%)',
      'Xếp loại',
      'Trò 1 (Trắc nghiệm)',
      'Trò 2 (Đúng/Sai)',
      'Trò 3 (Kéo thả)',
      'Trò 4 (Điền khuyết)',
      'Thời gian làm (giây)',
      'Ngày nộp',
    ];

    const rows = filteredResults.map((r, idx) => [
      idx + 1,
      `"${r.studentName.replace(/"/g, '""')}"`,
      `"${r.className}"`,
      r.grade,
      `"${r.studentCode || ''}"`,
      `"${r.testTitle.replace(/"/g, '""')}"`,
      r.totalScore,
      `${r.percentage}%`,
      `"${r.gradeClassification}"`,
      r.roundScores?.multipleChoice?.score ?? '',
      r.roundScores?.trueFalse?.score ?? '',
      r.roundScores?.dragDrop?.score ?? '',
      r.roundScores?.fillBlank?.score ?? '',
      r.timeSpentSeconds,
      `"${new Date(r.submittedAt).toLocaleString('vi-VN')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Bang_Diem_Tieng_Anh_THCS_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // AI Test Generation Submit
  const handleGenerateAiTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingAi(true);
    setAiError('');
    setAiSuccessMsg('');

    try {
      const res = await fetch('/api/generate-ai-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: aiGrade,
          topic: aiTopic,
          duration: aiDuration,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        onAddCustomTest(json.data);
        setAiSuccessMsg(`Đã tạo thành công đề kiểm tra Lớp ${aiGrade}: "${json.data.title}"!`);
        setTimeout(() => {
          setShowAiModal(false);
          setAiSuccessMsg('');
        }, 1500);
      } else {
        setAiError(json.error || 'Không thể tạo đề kiểm tra bằng AI.');
      }
    } catch (err: any) {
      setAiError(err.message || 'Lỗi kết nối tới máy chủ khi tạo đề.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header Dashboard Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-indigo-300 mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Cổng Quản Trị Giáo Viên THCS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Bảng Theo Dõi & Đánh Giá Thường Xuyên
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-1 max-w-2xl">
            Lưu trữ, quản lý điểm số, phân tích năng lực học sinh qua 4 dạng thức kiểm tra Tiếng Anh (Trắc nghiệm, Đúng/Sai, Kéo thả, Điền khuyết).
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
            id="btn-open-ai-generator"
          >
            <Sparkles className="w-4 h-4" />
            <span>Tạo đề AI theo Unit</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={filteredResults.length === 0}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
            id="btn-export-excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất file Excel/CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer"
            id="btn-print-teacher-table"
          >
            <Printer className="w-4 h-4" />
            <span>In bảng điểm</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Submissions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Lượt Nộp</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.total} bài</div>
            <span className="text-[11px] text-slate-500">Đã lưu trữ trên hệ thống</span>
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Điểm Trung Bình</span>
            <div className="text-2xl font-black text-amber-700 mt-0.5">
              {stats.avgScore} <span className="text-sm font-normal text-slate-400">/10.0</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold">Tỉ lệ đạt: {stats.passRate}%</span>
          </div>
        </div>

        {/* Excellent / Good */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Xuất Sắc & Giỏi</span>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">
              {stats.excellentCount + stats.goodCount} HS
            </div>
            <span className="text-[11px] text-slate-500">
              {stats.total > 0
                ? `${Math.round(((stats.excellentCount + stats.goodCount) / stats.total) * 100)}% toàn trường`
                : '0%'}
            </span>
          </div>
        </div>

        {/* Round Average breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-center">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Điểm TB 4 dạng thức (/2.5đ):
          </span>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Trò 1 (TN):</span>
              <span className="font-bold text-indigo-700">{stats.avgMCQ}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Trò 2 (Đ/S):</span>
              <span className="font-bold text-sky-700">{stats.avgTF}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Trò 3 (Kéo):</span>
              <span className="font-bold text-emerald-700">{stats.avgDD}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Trò 4 (Điền):</span>
              <span className="font-bold text-amber-700">{stats.avgFB}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên học sinh, lớp, mã số..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Grade Filter */}
            <div className="flex items-center space-x-1">
              <span className="text-xs font-semibold text-slate-600">Khối:</span>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Tất cả khối (6-9)</option>
                <option value="6">Khối 6</option>
                <option value="7">Khối 7</option>
                <option value="8">Khối 8</option>
                <option value="9">Khối 9</option>
              </select>
            </div>

            {/* Class Filter */}
            <div className="flex items-center space-x-1">
              <span className="text-xs font-semibold text-slate-600">Lớp:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Tất cả lớp</option>
                {uniqueClasses.map((c) => (
                  <option key={c} value={c}>
                    Lớp {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort by */}
            <div className="flex items-center space-x-1">
              <span className="text-xs font-semibold text-slate-600">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="date-desc">Mới nhất trước</option>
                <option value="score-desc">Điểm cao nhất</option>
                <option value="score-asc">Điểm thấp nhất</option>
                <option value="name">Tên A-Z</option>
              </select>
            </div>

            {/* Refresh */}
            <button
              onClick={onRefreshData}
              title="Tải lại dữ liệu"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Danh Sách Kết Quả Học Sinh</h2>
            <p className="text-xs text-slate-500">Hiển thị {filteredResults.length} / {results.length} bài kiểm tra.</p>
          </div>

          {results.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Thầy/Cô có chắc chắn muốn xóa toàn bộ lịch sử điểm số không?')) {
                  onClearAllResults();
                }
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa toàn bộ kết quả</span>
            </button>
          )}
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">STT</th>
                <th className="py-3.5 px-4">Họ và Tên Học Sinh</th>
                <th className="py-3.5 px-3">Lớp</th>
                <th className="py-3.5 px-3">Khối</th>
                <th className="py-3.5 px-4">Tên Bài Kiểm Tra</th>
                <th className="py-3.5 px-4 text-center">Điểm Tổng (10đ)</th>
                <th className="py-3.5 px-3 text-center">Xếp Loại</th>
                <th className="py-3.5 px-4 text-center hidden md:table-cell">Điểm 4 Trò (/2.5đ)</th>
                <th className="py-3.5 px-4">Thời Gian Nộp</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResults.map((r, index) => {
                return (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-400">{index + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{r.studentName}</div>
                      {r.studentCode && <span className="text-[11px] font-normal text-slate-400">SBD: {r.studentCode}</span>}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md text-xs">
                        {r.className}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 font-medium">Khối {r.grade}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium max-w-[200px] truncate" title={r.testTitle}>
                      {r.testTitle}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-base font-extrabold text-indigo-900">
                        {r.totalScore.toFixed(1)}
                      </span>
                      <span className="text-xs text-slate-400">/10</span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          r.gradeClassification === 'Xuất sắc'
                            ? 'bg-amber-100 text-amber-900'
                            : r.gradeClassification === 'Giỏi'
                            ? 'bg-emerald-100 text-emerald-900'
                            : r.gradeClassification === 'Khá'
                            ? 'bg-sky-100 text-sky-900'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {r.gradeClassification}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center hidden md:table-cell text-xs text-slate-600">
                      <div className="flex items-center justify-center space-x-1.5">
                        <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[11px] font-semibold" title="Trò 1: Trắc nghiệm">
                          T1: {r.roundScores?.multipleChoice?.score ?? '-'}
                        </span>
                        <span className="bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded text-[11px] font-semibold" title="Trò 2: Đúng/Sai">
                          T2: {r.roundScores?.trueFalse?.score ?? '-'}
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[11px] font-semibold" title="Trò 3: Kéo thả">
                          T3: {r.roundScores?.dragDrop?.score ?? '-'}
                        </span>
                        <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-[11px] font-semibold" title="Trò 4: Điền khuyết">
                          T4: {r.roundScores?.fillBlank?.score ?? '-'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(r.submittedAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setViewingResult(r)}
                          title="Xem chi tiết bài nộp"
                          className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Xóa kết quả của học sinh ${r.studentName}?`)) {
                              onDeleteResult(r.id);
                            }
                          }}
                          title="Xóa kết quả này"
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredResults.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-400">
                    Chưa tìm thấy kết quả nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Google Drive Cloud Integration Section */}
      <GoogleDriveManager
        results={results}
        tests={tests}
        onImportResults={(importedResults) => {
          if (onImportResults) onImportResults(importedResults);
        }}
        onImportTest={onAddCustomTest}
      />

      {/* AI Test Generation Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Tạo Đề Kiểm Tra Tự Động Bằng AI</h3>
                <p className="text-xs text-slate-500">Sử dụng Gemini AI để tạo đề 4 dạng thức chuẩn GDPT 2018.</p>
              </div>
            </div>

            <form onSubmit={handleGenerateAiTest} className="space-y-4">
              {aiError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl">
                  {aiError}
                </div>
              )}
              {aiSuccessMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-xl font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{aiSuccessMsg}</span>
                </div>
              )}

              {/* Grade */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Khối Lớp:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[6, 7, 8, 9].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setAiGrade(g)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        aiGrade === g
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Khối {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="ai-topic-input">
                  Chủ Đề & Bài Học (Unit / Topic):
                </label>
                <input
                  id="ai-topic-input"
                  type="text"
                  required
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Ví dụ: Unit 5: Natural Wonders of the World..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Thời Gian Làm Bài (Phút):</label>
                <select
                  value={aiDuration}
                  onChange={(e) => setAiDuration(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={10}>10 phút (Kiểm tra nhanh)</option>
                  <option value={15}>15 phút (Đánh giá thường xuyên)</option>
                  <option value={20}>20 phút</option>
                  <option value={45}>45 phút (Kiểm tra định kỳ)</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  disabled={isGeneratingAi}
                  onClick={() => setShowAiModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingAi}
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                  id="btn-confirm-generate-ai"
                >
                  {isGeneratingAi ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang tạo đề...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Bắt đầu tạo đề</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Individual Result Details Modal */}
      {viewingResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs uppercase font-bold text-indigo-600 tracking-wider">
                  Chi Tiết Bài Nộp Của Học Sinh
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">{viewingResult.studentName}</h3>
                <p className="text-xs text-slate-500">
                  Lớp {viewingResult.className} • Khối {viewingResult.grade} • Nộp lúc:{' '}
                  {new Date(viewingResult.submittedAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-indigo-700">{viewingResult.totalScore.toFixed(1)}/10.0</div>
                <span className="text-xs font-bold text-slate-600">{viewingResult.gradeClassification}</span>
              </div>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-indigo-50 p-2.5 rounded-xl">
                <span className="text-slate-500 block">Trò 1 (TN)</span>
                <span className="font-bold text-indigo-900 text-sm">
                  {viewingResult.roundScores?.multipleChoice?.score ?? '-'} đ
                </span>
              </div>
              <div className="bg-sky-50 p-2.5 rounded-xl">
                <span className="text-slate-500 block">Trò 2 (Đ/S)</span>
                <span className="font-bold text-sky-900 text-sm">
                  {viewingResult.roundScores?.trueFalse?.score ?? '-'} đ
                </span>
              </div>
              <div className="bg-emerald-50 p-2.5 rounded-xl">
                <span className="text-slate-500 block">Trò 3 (Kéo thả)</span>
                <span className="font-bold text-emerald-900 text-sm">
                  {viewingResult.roundScores?.dragDrop?.score ?? '-'} đ
                </span>
              </div>
              <div className="bg-amber-50 p-2.5 rounded-xl">
                <span className="text-slate-500 block">Trò 4 (Điền khuyết)</span>
                <span className="font-bold text-amber-900 text-sm">
                  {viewingResult.roundScores?.fillBlank?.score ?? '-'} đ
                </span>
              </div>
            </div>

            {/* Test info */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-800">{viewingResult.testTitle}</div>
              <div className="text-slate-600">Thời gian làm bài: {Math.floor(viewingResult.timeSpentSeconds / 60)} phút {viewingResult.timeSpentSeconds % 60} giây</div>
              <div className="text-slate-600 italic">Nhận xét: "{viewingResult.feedback}"</div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewingResult(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
