// Modal component for formula input and hypothesis selection

import React, { useState, useEffect, useRef } from 'react';
import { Formula, FormulaParser } from '../formulas';
import { useLanguage } from '../i18n';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl p-6 max-w-md w-11/12 max-h-[80vh] overflow-y-auto shadow-2xl">
        <h3 className="text-xl font-bold text-slate-800 mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
};

interface FormulaInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  placeholder: string;
  onSubmit: (formula: Formula) => void;
  onError: (message: string) => void;
}

export const FormulaInputModal: React.FC<FormulaInputModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  placeholder,
  onSubmit,
  onError
}) => {
  const { t } = useLanguage();
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    try {
      const formula = FormulaParser.parse(value);
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
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <label className="block text-slate-700 mb-2">{description}</label>
      <input
        ref={inputRef}
        type="text"
        className="modal-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <p className="text-sm text-slate-500 mt-2">
        Syntax: Use -&gt; for →, &amp; for ∧, | for ∨, ! or ¬ for negation, bot or ⊥ for falsum
      </p>
      <div className="flex gap-3 justify-end mt-4">
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
      <div className="flex gap-3 justify-end mt-4">
        <button className="modal-btn-cancel" onClick={onClose}>{t.cancel}</button>
      </div>
    </Modal>
  );
};
