// Shared modal shell component

import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  hideTitle?: boolean;
  onEnterKey?: () => void;
  onEscapeKey?: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  hideTitle = false,
  onEnterKey,
  onEscapeKey,
  children,
}) => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        (onEscapeKey ?? onClose)();
        return;
      }

      if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        const target = event.target;
        if (
          target instanceof HTMLElement &&
          (target.tagName === "TEXTAREA" || target.isContentEditable)
        ) {
          return;
        }

        onEnterKey?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onEnterKey, onEscapeKey]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white border-2 border-slate-200 dark:bg-slate-800 dark:border-2 dark:border-slate-700 rounded-xl p-6 max-w-md w-11/12 max-h-[80vh] overflow-y-auto shadow-2xl">
        {!hideTitle && (
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            {title}
          </h3>
        )}
        {children}
      </div>
    </div>
  );
};
