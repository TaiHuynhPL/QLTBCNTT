import React from 'react';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmText = 'Xác nhận', cancelText = 'Hủy' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xs animate-fadeIn">
        {title && <h3 className="text-lg font-bold mb-2 text-gray-800">{title}</h3>}
        <div className="text-gray-600 mb-6">{message}</div>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
