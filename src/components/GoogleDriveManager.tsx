import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CloudUpload,
  CloudDownload,
  FolderSync,
  HardDrive,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  FileText,
  Database,
  Plus,
  Lock,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  getAccessToken,
  getOrCreateAppFolder,
  listAppDriveFiles,
  uploadFileToDrive,
  downloadFileContent,
  deleteDriveFile,
  DriveFileItem,
} from '../services/googleDriveService';
import { TestExam, TestResult } from '../types';

interface GoogleDriveManagerProps {
  results: TestResult[];
  tests: TestExam[];
  onImportResults: (importedResults: TestResult[]) => void;
  onImportTest: (test: TestExam) => void;
}

export const GoogleDriveManager: React.FC<GoogleDriveManagerProps> = ({
  results,
  tests,
  onImportResults,
  onImportTest,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Destructive delete confirmation modal
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);

  // Auto-clear message
  useEffect(() => {
    if (feedbackMsg) {
      const t = setTimeout(() => setFeedbackMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [feedbackMsg]);

  // Init Auth on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        loadFolderAndFiles(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
        setDriveFiles([]);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const loadFolderAndFiles = async (accessToken: string) => {
    setIsLoadingFiles(true);
    try {
      const fId = await getOrCreateAppFolder(accessToken);
      setFolderId(fId);
      const files = await listAppDriveFiles(accessToken, fId);
      setDriveFiles(files);
    } catch (err: any) {
      console.error('Error loading Drive folder:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setFeedbackMsg(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        await loadFolderAndFiles(res.accessToken);
        setFeedbackMsg({
          type: 'success',
          text: `Đã kết nối Google Drive thành công với tài khoản ${res.user.email}!`,
        });
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Đăng nhập Google Drive thất bại hoặc đã bị hủy.',
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    setUser(null);
    setToken(null);
    setDriveFiles([]);
    setFeedbackMsg({ type: 'success', text: 'Đã ngắt kết nối Google Drive.' });
  };

  // 1. Backup Results to Drive
  const handleBackupResultsToDrive = async () => {
    if (!token) {
      setFeedbackMsg({ type: 'error', text: 'Vui lòng đăng nhập Google Drive trước.' });
      return;
    }

    setIsProcessing(true);
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `Bang_Diem_EduEnglish_${dateStr}_${Date.now().toString().slice(-4)}.json`;
      const content = JSON.stringify({
        exportedAt: new Date().toISOString(),
        totalStudents: results.length,
        results: results,
      }, null, 2);

      const fId = folderId || (await getOrCreateAppFolder(token));
      await uploadFileToDrive(token, fileName, content, 'application/json', fId);

      setFeedbackMsg({
        type: 'success',
        text: `Đã sao lưu ${results.length} kết quả học sinh lên Google Drive (${fileName})!`,
      });
      await loadFolderAndFiles(token);
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Lỗi khi sao lưu bảng điểm lên Google Drive.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Backup Tests to Drive
  const handleBackupTestsToDrive = async () => {
    if (!token) {
      setFeedbackMsg({ type: 'error', text: 'Vui lòng đăng nhập Google Drive trước.' });
      return;
    }

    setIsProcessing(true);
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `Bo_De_Kiem_Tra_THCS_${dateStr}.json`;
      const content = JSON.stringify({
        exportedAt: new Date().toISOString(),
        totalTests: tests.length,
        tests: tests,
      }, null, 2);

      const fId = folderId || (await getOrCreateAppFolder(token));
      await uploadFileToDrive(token, fileName, content, 'application/json', fId);

      setFeedbackMsg({
        type: 'success',
        text: `Đã lưu toàn bộ ${tests.length} bộ đề kiểm tra lên Google Drive (${fileName})!`,
      });
      await loadFolderAndFiles(token);
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Lỗi khi lưu bộ đề lên Google Drive.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Import / Restore file from Drive
  const handleImportFile = async (file: DriveFileItem) => {
    if (!token) return;
    setIsProcessing(true);
    try {
      const textContent = await downloadFileContent(token, file.id);
      const parsed = JSON.parse(textContent);

      if (parsed.results && Array.isArray(parsed.results)) {
        onImportResults(parsed.results);
        setFeedbackMsg({
          type: 'success',
          text: `Đã nhập thành công ${parsed.results.length} kết quả điểm từ Google Drive!`,
        });
      } else if (parsed.tests && Array.isArray(parsed.tests)) {
        parsed.tests.forEach((t: TestExam) => onImportTest(t));
        setFeedbackMsg({
          type: 'success',
          text: `Đã nhập thành công ${parsed.tests.length} bộ đề thi từ Google Drive!`,
        });
      } else if (parsed.title && parsed.rounds) {
        onImportTest(parsed as TestExam);
        setFeedbackMsg({
          type: 'success',
          text: `Đã nhập thành công đề thi: "${parsed.title}" từ Google Drive!`,
        });
      } else {
        throw new Error('Định dạng tệp không khớp với cấu trúc đề hoặc bảng điểm của ứng dụng.');
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Không thể nhập dữ liệu từ tệp này.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. Delete file with explicit confirmation
  const handleConfirmDelete = async () => {
    if (!fileToDelete || !token) return;
    setIsProcessing(true);
    try {
      const success = await deleteDriveFile(token, fileToDelete.id);
      if (success) {
        setFeedbackMsg({
          type: 'success',
          text: `Đã xóa tệp "${fileToDelete.name}" khỏi Google Drive.`,
        });
        await loadFolderAndFiles(token);
      } else {
        throw new Error('Không thể xóa tệp từ Google Drive.');
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Lỗi khi xóa tệp trên Google Drive.',
      });
    } finally {
      setIsProcessing(false);
      setFileToDelete(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-rose-200/80 shadow-xs p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-rose-100 pb-5">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-800 to-red-600 text-white flex items-center justify-center shadow-xs">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-rose-950">Lưu Trữ & Đồng Bộ Google Drive</h2>
            <p className="text-xs text-rose-900/60">
              Sao lưu bảng điểm học sinh và đồng bộ đề kiểm tra trực tiếp vào Google Drive cá nhân.
            </p>
          </div>
        </div>

        {/* Auth status or Google Sign-in button */}
        <div>
          {user ? (
            <div className="flex items-center space-x-3 bg-rose-50/70 border border-rose-200 rounded-2xl p-2 sm:px-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Google User'}
                  className="w-8 h-8 rounded-full border border-rose-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-rose-700 text-white font-bold text-xs flex items-center justify-center">
                  {(user.displayName || user.email || 'G').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left leading-tight hidden sm:block">
                <span className="text-xs font-bold text-rose-950 block">{user.displayName || 'Giáo viên'}</span>
                <span className="text-[11px] text-rose-800/70">{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                title="Đăng xuất Google Drive"
                className="p-1.5 text-rose-700 hover:text-rose-900 hover:bg-rose-200/50 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Official Styled Google Sign-In Button */
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="inline-flex items-center justify-center space-x-3 px-4 py-2.5 bg-white hover:bg-rose-50 border border-rose-300 text-rose-950 rounded-xl shadow-xs transition-all font-semibold text-xs sm:text-sm active:scale-98 cursor-pointer disabled:opacity-50"
              id="btn-google-drive-login"
            >
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>{isSigningIn ? 'Đang kết nối...' : 'Kết nối Google Drive'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Feedback alerts */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center space-x-2 animate-in fade-in duration-150 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Quick Drive Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Backup Results */}
        <div className="bg-gradient-to-br from-[#fff7f7] to-[#fdeded] p-5 rounded-2xl border border-rose-200/80 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-rose-900 font-bold text-sm">
              <Database className="w-4 h-4 text-rose-700" />
              <span>Sao Lưu Bảng Điểm Lên Drive</span>
            </div>
            <p className="text-xs text-rose-900/70">
              Lưu toàn bộ {results.length} bài kiểm tra học sinh thành tệp an toàn trên thư mục Google Drive.
            </p>
          </div>

          <button
            onClick={handleBackupResultsToDrive}
            disabled={!user || isProcessing}
            className="w-full py-2.5 px-4 bg-rose-800 hover:bg-rose-900 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-xs transition-all cursor-pointer"
            id="btn-backup-results-drive"
          >
            <CloudUpload className="w-4 h-4" />
            <span>{isProcessing ? 'Đang tải lên...' : 'Sao lưu ngay lên Drive'}</span>
          </button>
        </div>

        {/* Backup Exam Sets */}
        <div className="bg-gradient-to-br from-[#fff7f7] to-[#fdeded] p-5 rounded-2xl border border-rose-200/80 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-rose-900 font-bold text-sm">
              <FileText className="w-4 h-4 text-rose-700" />
              <span>Lưu Bộ Đề Kiểm Tra Lên Drive</span>
            </div>
            <p className="text-xs text-rose-900/70">
              Lưu trữ danh sách {tests.length} đề thi 4 dạng thức để tái sử dụng trên mọi thiết bị.
            </p>
          </div>

          <button
            onClick={handleBackupTestsToDrive}
            disabled={!user || isProcessing}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-800 to-red-700 hover:from-rose-900 hover:to-red-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-xs transition-all cursor-pointer"
            id="btn-backup-tests-drive"
          >
            <FolderSync className="w-4 h-4" />
            <span>{isProcessing ? 'Đang lưu...' : 'Lưu bộ đề vào Drive'}</span>
          </button>
        </div>
      </div>

      {/* Drive File Explorer Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HardDrive className="w-4 h-4 text-rose-800" />
            <h3 className="text-sm font-bold text-rose-950">
              Tệp Đã Lưu Trên Thư Mục Google Drive ({driveFiles.length})
            </h3>
          </div>

          {user && (
            <button
              onClick={() => token && loadFolderAndFiles(token)}
              disabled={isLoadingFiles}
              title="Làm mới danh sách Drive"
              className="text-xs text-rose-800 hover:text-rose-950 font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
              <span>Tải lại</span>
            </button>
          )}
        </div>

        {/* File Table */}
        {!user ? (
          <div className="bg-rose-50/50 border border-dashed border-rose-300/80 rounded-2xl p-8 text-center space-y-3">
            <Cloud className="w-10 h-10 text-rose-400 mx-auto" />
            <div className="text-sm font-bold text-rose-950">Chưa kết nối Google Drive</div>
            <p className="text-xs text-rose-800/70 max-w-sm mx-auto">
              Đăng nhập tài khoản Google để xem và tải các tệp đề thi, bảng điểm đã sao lưu từ Google Drive.
            </p>
            <button
              onClick={handleSignIn}
              className="px-4 py-2 bg-rose-800 hover:bg-rose-900 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              Đăng nhập Google
            </button>
          </div>
        ) : (
          <div className="border border-rose-200/80 rounded-2xl overflow-hidden bg-white">
            {driveFiles.length === 0 ? (
              <div className="p-8 text-center text-xs text-rose-800/70">
                {isLoadingFiles
                  ? 'Đang tải dữ liệu từ Google Drive...'
                  : 'Thư mục trên Google Drive chưa có tệp sao lưu nào. Hãy bấm "Sao lưu ngay" ở trên để bắt đầu.'}
              </div>
            ) : (
              <div className="divide-y divide-rose-100">
                {driveFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-rose-50/40 transition-colors"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-rose-100/70 text-rose-800 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-xs sm:text-sm text-rose-950 truncate" title={file.name}>
                          {file.name}
                        </div>
                        <div className="text-[11px] text-rose-800/60">
                          {file.modifiedTime
                            ? new Date(file.modifiedTime).toLocaleString('vi-VN')
                            : 'Không rõ ngày'}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleImportFile(file)}
                        disabled={isProcessing}
                        title="Đồng bộ / Nhập dữ liệu từ tệp này vào ứng dụng"
                        className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200/80 text-rose-950 font-bold text-xs rounded-lg flex items-center space-x-1 transition-colors cursor-pointer"
                      >
                        <CloudDownload className="w-3.5 h-3.5 text-rose-800" />
                        <span>Nhập vào App</span>
                      </button>

                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Mở trực tiếp trên Google Drive"
                          className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}

                      <button
                        onClick={() => setFileToDelete(file)}
                        title="Xóa tệp khỏi Google Drive"
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mandatory Explicit Confirmation Dialog for Destructive Operations */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Xác Nhận Xóa Tệp Trên Google Drive?</h3>
              <p className="text-xs text-slate-600 mt-1">
                Thầy/Cô có chắc chắn muốn xóa tệp <strong className="text-rose-900">"{fileToDelete.name}"</strong> khỏi tài khoản Google Drive của mình không?
              </p>
              <p className="text-[11px] text-slate-400 mt-1 italic">Hành động này không thể hoàn tác.</p>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
                id="btn-confirm-drive-delete"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
