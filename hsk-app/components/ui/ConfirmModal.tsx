// components/ui/ConfirmModal.tsx
'use client';

import { useEffect } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onCancel]);

  // 배경 스크롤 막기
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const confirmClass =
    variant === 'danger'
      ? 'bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-400'
      : 'bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-400';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 본문 */}
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-2">
            {title}
          </h2>
          <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="grid grid-cols-2 gap-2 p-4 pt-0">
          <button
            onClick={onCancel}
            className="py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`py-3 text-white font-bold rounded-xl transition ${confirmClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}