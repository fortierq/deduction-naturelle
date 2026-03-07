// Rule panel component showing all inference rules as trees

import React from 'react';
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
  onClick: (rule: string) => void;
  compact?: boolean;
  isActive?: boolean;
}

const RuleButton: React.FC<RuleButtonProps> = ({
  rule,
  onClick,
  compact = false,
  isActive = false
}) => {
  const ruleUi = panelRuleUiByRule[rule];
  const imageWidthPct = ruleUi.widthPct;
  const imageSrc = ruleUi.imageSrc;
  const latexLabel = ruleUi.latexLabel;

  if (compact) {
    return (
      <button
        className={`w-full p-0.5 border-2 rounded-lg transition-colors flex flex-col h-[7.5rem] ${isActive ? 'border-blue-500 text-blue-700 bg-blue-50 dark:border-slate-500 dark:text-slate-100 dark:bg-slate-700' : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:border-slate-500 dark:hover:text-slate-100 dark:hover:bg-slate-800'}`}
        onClick={() => onClick(rule)}
      >
        <div className="font-semibold text-slate-900 dark:text-slate-100 mb-0 flex justify-center">
          <Latex math={latexLabel} />
        </div>
        {imageSrc && (
          <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
            <img
              src={imageSrc}
              alt={rule}
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
    <button
      className="rule-btn"
      onClick={() => onClick(rule)}
    >
      <Latex math={latexLabel} />
    </button>
  );
};

export const RulePanel: React.FC<RulePanelProps> = ({ onRuleClick, className = '', compact = false, activeRule }) => {
  const { t } = useLanguage();

  const introRules: PanelRuleName[] = [
    'impl-intro',
    'and-intro',
    'or-intro-left',
    'or-intro-right',
    'neg-intro'
  ];

  const eliminationRules: PanelRuleName[] = [
    'impl-elim',
    'and-elim-left',
    'and-elim-right',
    'or-elim',
    'neg-elim'
  ];

  const otherRules: PanelRuleName[] = ['axiom', 'absurd', 'raa'];

  if (compact) {
    return (
      <div className={`bg-white dark:bg-slate-800 rounded-xl px-2 py-4 mb-4 ${className}`}>
        <div className="grid grid-cols-2 gap-4 items-start">
          <div>
            <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 text-xs uppercase tracking-wide text-center">{t.introductionRules}</h4>
            <div className="grid grid-cols-1 gap-2">
              {introRules.map((rule) => (
                <RuleButton
                  key={rule}
                  rule={rule}
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
              {eliminationRules.map((rule) => (
                <RuleButton
                  key={rule}
                  rule={rule}
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
              {otherRules.map((rule) => (
                <RuleButton
                  key={rule}
                  rule={rule}
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
            {introRules.map((rule) => (
              <RuleButton
                key={rule}
                rule={rule}
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
            {eliminationRules.map((rule) => (
              <RuleButton
                key={rule}
                rule={rule}
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
            {otherRules.map((rule) => (
              <RuleButton
                key={rule}
                rule={rule}
                onClick={onRuleClick}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
