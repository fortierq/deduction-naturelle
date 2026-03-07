import React, { useEffect, useState } from 'react';
import { useLanguage } from '../i18n';

type TooltipPosition = 'right' | 'bottom' | 'top';

interface SyntaxHelpBadgeProps {
  text: string;
  tooltipPosition?: TooltipPosition;
}

const tooltipClassByPosition: Record<TooltipPosition, string> = {
  right: 'absolute left-full top-1/2 z-50 ml-2 w-56 -translate-y-1/2 rounded-lg border-2 border-slate-200 bg-white p-2 text-xs text-slate-700 shadow-lg dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200',
  bottom: 'absolute left-0 top-full z-50 mt-2 w-56 rounded-lg border-2 border-slate-200 bg-white p-2 text-xs text-slate-700 shadow-lg dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200',
  top: 'absolute left-1/2 bottom-full z-50 mb-2 w-56 -translate-x-1/2 rounded-lg border-2 border-slate-200 bg-white p-2 text-xs text-slate-700 shadow-lg dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
};

export const SyntaxHelpBadge: React.FC<SyntaxHelpBadgeProps> = ({ text, tooltipPosition = 'right' }) => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const timeoutId = window.setTimeout(() => {
      setIsOpen(false);
    }, 5000);
    return () => window.clearTimeout(timeoutId);
  }, [isOpen]);

  return (
    <div className="relative inline-flex shrink-0 items-center">
      <button
        type="button"
        className="modal-btn-cancel"
        aria-label={text}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {language === 'fr' ? 'Aide' : 'Help'}
      </button>
      {isOpen && (
        <div className={tooltipClassByPosition[tooltipPosition]}>
          {text}
        </div>
      )}
    </div>
  );
};