// Rule panel component showing all inference rules as trees

import React, { useState } from 'react';
import {
  ImplIntroRule, ImplElimRule,
  AndIntroRule, AndElimLeftRule, AndElimRightRule,
  OrIntroLeftRule, OrIntroRightRule, OrElimRule,
  NegIntroRule, NegElimRule, AbsurdRule, raaRule, AxiomRule
} from './RuleTree';
import { Latex } from './Latex';
import { useLanguage } from '../i18n';
import { panelRuleUiByRule, PanelRuleName } from '../ruleLabels';

interface RulePanelProps {
  onRuleClick: (rule: string) => void;
  className?: string;
  compact?: boolean;
  activeRule?: string;
}

interface RuleButtonProps {
  rule: PanelRuleName;
  label: string;
  title: string;
  ruleDisplay: React.FC;
  onClick: (rule: string) => void;
  compact?: boolean;
  isActive?: boolean;
}

const RuleButton: React.FC<RuleButtonProps> = ({
  rule,
  label,
  title,
  ruleDisplay: RuleDisplay,
  onClick,
  compact = false,
  isActive = false
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const ruleUi = panelRuleUiByRule[rule];
  const imageWidthPct = ruleUi.widthPct;
  const imageSrc = ruleUi.imageSrc;
  const latexLabel = ruleUi.latexLabel ?? label;

  if (compact) {
    return (
      <button
        className={`w-full p-0.5 border-2 rounded-lg transition-colors flex flex-col h-[7.5rem] ${isActive ? 'border-blue-500 text-blue-700 bg-blue-50 dark:border-slate-500 dark:text-slate-100 dark:bg-slate-700' : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:border-slate-500 dark:hover:text-slate-100 dark:hover:bg-slate-800'}`}
        title={title}
        onClick={() => onClick(rule)}
      >
        <div className="font-semibold text-slate-900 dark:text-slate-100 mb-0 flex justify-center">
          <Latex math={latexLabel} />
        </div>
        {imageSrc && (
          <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
            <img
              src={imageSrc}
              alt={title}
              className="h-auto max-h-14 object-contain dark:invert"
              style={{ width: `${imageWidthPct}%`, maxWidth: '100%' }}
              loading="lazy"
            />
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        className="rule-btn"
        title={title}
        onClick={() => onClick(rule)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Latex math={latexLabel} />
      </button>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-white dark:bg-slate-800 rounded-lg shadow-xl border-2 border-slate-200 dark:border-slate-700 z-50 whitespace-nowrap">
          <RuleDisplay />
        </div>
      )}
    </div>
  );
};

export const RulePanel: React.FC<RulePanelProps> = ({ onRuleClick, className = '', compact = false, activeRule }) => {
  const { t } = useLanguage();

  const introRules: Array<{ rule: PanelRuleName; label: string; title: string; display: React.FC }> = [
    { rule: 'impl-intro', label: '→i', title: t.implIntro, display: ImplIntroRule },
    { rule: 'and-intro', label: '∧i', title: t.andIntro, display: AndIntroRule },
    { rule: 'or-intro-left', label: '∨i₁', title: t.orIntroLeft, display: OrIntroLeftRule },
    { rule: 'or-intro-right', label: '∨i₂', title: t.orIntroRight, display: OrIntroRightRule },
    { rule: 'neg-intro', label: '¬i', title: t.negIntro, display: NegIntroRule }
  ];

  const eliminationRules: Array<{ rule: PanelRuleName; label: string; title: string; display: React.FC }> = [
    { rule: 'impl-elim', label: '→e', title: t.implElim, display: ImplElimRule },
    { rule: 'and-elim-left', label: '∧e₁', title: t.andElimLeft, display: AndElimLeftRule },
    { rule: 'and-elim-right', label: '∧e₂', title: t.andElimRight, display: AndElimRightRule },
    { rule: 'or-elim', label: '∨e', title: t.orElim, display: OrElimRule },
    { rule: 'neg-elim', label: '¬e', title: t.negElim, display: NegElimRule }
  ];

  const otherRules: Array<{ rule: PanelRuleName; label: string; title: string; display: React.FC }> = [
    { rule: 'axiom', label: 'Ax', title: t.axiom, display: AxiomRule },
    { rule: 'absurd', label: '⊥E', title: t.absurd, display: AbsurdRule },
    { rule: 'raa', label: 'raa', title: t.raa, display: raaRule }
  ];

  if (compact) {
    return (
      <div className={`bg-white dark:bg-slate-800 rounded-xl px-2 py-4 mb-4 ${className}`}>
        <div className="grid grid-cols-2 gap-4 items-start">
          <div>
            <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 text-xs uppercase tracking-wide text-center">{t.introductionRules}</h4>
            <div className="grid grid-cols-1 gap-2">
              {introRules.map(({ rule, label, title, display }) => (
                <RuleButton
                  key={rule}
                  rule={rule}
                  label={label}
                  title={title}
                  ruleDisplay={display}
                  onClick={onRuleClick}
                  compact
                  isActive={activeRule === rule}
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 text-xs uppercase tracking-wide text-center">{t.eliminationRules}</h4>
            <div className="grid grid-cols-1 gap-2">
              {eliminationRules.map(({ rule, label, title, display }) => (
                <RuleButton
                  key={rule}
                  rule={rule}
                  label={label}
                  title={title}
                  ruleDisplay={display}
                  onClick={onRuleClick}
                  compact
                  isActive={activeRule === rule}
                />
              ))}
            </div>
          </div>

          <div className="col-span-2 pt-2">
            <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 text-xs uppercase tracking-wide text-center">{t.otherRules}</h4>
            <div className="grid grid-cols-2 gap-2">
              {otherRules.map(({ rule, label, title, display }) => (
                <RuleButton
                  key={rule}
                  rule={rule}
                  label={label}
                  title={title}
                  ruleDisplay={display}
                  onClick={onRuleClick}
                  compact
                  isActive={activeRule === rule}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border-2 border-slate-200 dark:bg-slate-800 dark:border-2 dark:border-slate-700 rounded-xl p-6 mb-6 shadow-lg ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 text-sm uppercase tracking-wide">
            {t.introductionRules}
          </h4>
          <div className="flex flex-wrap gap-2">
            {introRules.map(({ rule, label, title, display }) => (
              <RuleButton
                key={rule}
                rule={rule}
                label={label}
                title={title}
                ruleDisplay={display}
                onClick={onRuleClick}
              />
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 text-sm uppercase tracking-wide">
            {t.eliminationRules}
          </h4>
          <div className="flex flex-wrap gap-2">
            {eliminationRules.map(({ rule, label, title, display }) => (
              <RuleButton
                key={rule}
                rule={rule}
                label={label}
                title={title}
                ruleDisplay={display}
                onClick={onRuleClick}
              />
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 text-sm uppercase tracking-wide">
            {t.otherRules}
          </h4>
          <div className="flex flex-wrap gap-2">
            {otherRules.map(({ rule, label, title, display }) => (
              <RuleButton
                key={rule}
                rule={rule}
                label={label}
                title={title}
                ruleDisplay={display}
                onClick={onRuleClick}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
