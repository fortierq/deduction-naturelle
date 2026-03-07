// Shared modal shell component

import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  hideTitle?: boolean;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white border-2 border-slate-200 dark:bg-slate-800 dark:border-2 dark:border-slate-700 rounded-xl p-6 max-w-md w-11/12 max-h-[80vh] overflow-y-auto shadow-2xl">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
};
