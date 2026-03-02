// Modal component for formula input and hypothesis selection

import React, { useState, useEffect, useRef } from 'react';
import { Formula, FormulaParser } from '../formulas';
import { useLanguage } from '../i18n';
import { Latex } from './Latex';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleAsLatex?: boolean;
  hideTitle?: boolean;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, titleAsLatex = false, hideTitle = false, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white border-2 border-slate-200 dark:bg-slate-800 dark:border-2 dark:border-slate-700 rounded-xl p-6 max-w-md w-11/12 max-h-[80vh] overflow-y-auto shadow-2xl">
        {!hideTitle && (
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            {titleAsLatex ? <Latex math={title} /> : title}
          </h3>
        )}
        {children}
      </div>
    </div>
  );
};

interface FormulaInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  imageSrc?: string;
  imageWidthPct?: number;
  selectionHint?: string;
  placeholder: string;
  formulaTemplate?: string;
  variableNames?: string[];
  onSubmit: (formula: Formula) => void;
  onError: (message: string) => void;
}

export const FormulaInputModal: React.FC<FormulaInputModalProps> = ({
  isOpen,
  onClose,
  title,
  imageSrc,
  imageWidthPct = 100,
  selectionHint,
  placeholder,
  formulaTemplate,
  variableNames,
  onSubmit,
  onError
}) => {
  const { t } = useLanguage();
  const [value, setValue] = useState('');
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const firstVariableInputRef = useRef<HTMLInputElement>(null);
  const resolvedVariableNames = variableNames ?? [];
  const usesVariableInputs = resolvedVariableNames.length > 0;

  useEffect(() => {
    if (isOpen) {
      setValue('');
      if (usesVariableInputs) {
        const nextValues: Record<string, string> = {};
        resolvedVariableNames.forEach((variableName) => {
          nextValues[variableName] = '';
        });
        setVariableValues(nextValues);
        setTimeout(() => firstVariableInputRef.current?.focus(), 100);
      } else {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  }, [isOpen, usesVariableInputs, resolvedVariableNames]);

  const handleSubmit = () => {
    try {
      let formulaText = value;

      if (usesVariableInputs) {
        const template = formulaTemplate ?? placeholder;
        formulaText = template;

        for (const variableName of resolvedVariableNames) {
          const variableValue = (variableValues[variableName] ?? '').trim();
          if (!variableValue) {
            onError(`${t.invalidFormula}: ${variableName}`);
            return;
          }
          formulaText = formulaText.split(`{${variableName}}`).join(`(${variableValue})`);
        }
      }

      const formula = FormulaParser.parse(formulaText);
      onSubmit(formula);
      onClose();
    } catch (e) {
      onError(t.invalidFormula + ': ' + (e as Error).message);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} titleAsLatex hideTitle>
      {imageSrc && (
        <div className="mb-4 flex justify-center">
          <img
            src={imageSrc}
            alt=""
            aria-hidden="true"
            className="max-h-24 w-auto object-contain dark:invert"
            style={{ width: `${imageWidthPct}%`, maxWidth: '100%' }}
            loading="lazy"
          />
        </div>
      )}
      {selectionHint && (
        <div className="text-sm text-slate-700 dark:text-slate-300 mb-2">
          <Latex math={selectionHint} />
        </div>
      )}
      {usesVariableInputs ? (
        <div className={resolvedVariableNames.length === 2 ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
          {resolvedVariableNames.map((variableName, index) => (
            <div key={variableName}>
              <label className="block text-sm text-slate-700 dark:text-slate-300 mb-1">{variableName}</label>
              <input
                ref={index === 0 ? firstVariableInputRef : undefined}
                type="text"
                className="modal-input"
                placeholder={variableName}
                value={variableValues[variableName] ?? ''}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setVariableValues(prev => ({
                    ...prev,
                    [variableName]: nextValue
                  }));
                }}
                onKeyDown={handleKeyDown}
              />
            </div>
          ))}
        </div>
      ) : (
        <input
          ref={inputRef}
          type="text"
          className="modal-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      )}
      <p className="text-sm text-slate-500 mt-2 dark:text-slate-400">
        {t.customSequentSyntaxHelp}
      </p>
      <div className="flex gap-3 justify-center mt-4">
        <button className="modal-btn-cancel" onClick={onClose}>{t.cancel}</button>
        <button className="modal-btn-confirm" onClick={handleSubmit}>{t.confirm}</button>
      </div>
    </Modal>
  );
};

interface HypothesisSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  hypotheses: Formula[];
  onSelect: (formula: Formula) => void;
}

export const HypothesisSelectModal: React.FC<HypothesisSelectModalProps> = ({
  isOpen,
  onClose,
  title,
  hypotheses,
  onSelect
}) => {
  const { t } = useLanguage();
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-slate-700 mb-3">Select a hypothesis:</p>
      {hypotheses.map((hyp, index) => (
        <button
          key={index}
          className="hypothesis-option"
          onClick={() => {
            onSelect(hyp);
            onClose();
          }}
        >
          {hyp.toDisplayString()}
        </button>
      ))}
      <div className="flex gap-3 justify-center mt-4">
        <button className="modal-btn-cancel" onClick={onClose}>{t.cancel}</button>
      </div>
    </Modal>
  );
};
