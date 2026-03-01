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

interface RulePanelProps {
  onRuleClick: (rule: string) => void;
  className?: string;
  compact?: boolean;
  showRuleTrees?: boolean;
}

interface RuleButtonProps {
  rule: string;
  label: string;
  title: string;
  ruleDisplay: React.FC;
  onClick: (rule: string) => void;
  compact?: boolean;
  imageSrc?: string;
  showRuleTree?: boolean;
}

const ruleImageByRule: Record<string, string> = {
  'impl-intro': 'assets/rules/imp_intro.png',
  'impl-elim': 'assets/rules/imp_elim.png',
  'and-intro': 'assets/rules/and_intro.png',
  'and-elim-left': 'assets/rules/and_elim_left.png',
  'and-elim-right': 'assets/rules/and_elim_right.png',
  'or-intro-left': 'assets/rules/or_intro_left.png',
  'or-intro-right': 'assets/rules/or_intro_right.png',
  'or-elim': 'assets/rules/or_elim.png',
  'neg-intro': 'assets/rules/neg_intro.png',
  'neg-elim': 'assets/rules/neg_elim.png',
  'absurd': 'assets/rules/bot_elim.png',
  'raa': 'assets/rules/raa.png',
  'axiom': 'assets/rules/axiom.png'
};

export const ruleRelativeWidthPct: Record<string, number> = {
  'impl-intro': 58,
  'impl-elim': 94,
  'and-intro': 72,
  'and-elim-left': 58,
  'and-elim-right': 58,
  'or-intro-left': 58,
  'or-intro-right': 58,
  'or-elim': 100,
  'neg-intro': 46,
  'neg-elim': 77,
  'absurd': 37,
  'raa': 56,
  'axiom': 46
};

const ruleLabelLatexByRule: Record<string, string> = {
  'impl-intro': '\\to_{i}',
  'impl-elim': '\\to_{e}',
  'and-intro': '\\wedge_{i}',
  'and-elim-left': '\\wedge_{e}^{1}',
  'and-elim-right': '\\wedge_{e}^{2}',
  'or-intro-left': '\\vee_{i}^{1}',
  'or-intro-right': '\\vee_{i}^{2}',
  'or-elim': '\\vee_{e}',
  'neg-intro': '\\neg_{i}',
  'neg-elim': '\\neg_{e}',
  'absurd': '\\bot_{e}',
  'raa': '\\mathrm{raa}',
  'axiom': '\\mathrm{ax}'
};

const RuleButton: React.FC<RuleButtonProps> = ({
  rule,
  label,
  title,
  ruleDisplay: RuleDisplay,
  onClick,
  compact = false,
  imageSrc,
  showRuleTree = true
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const imageWidthPct = ruleRelativeWidthPct[rule] ?? 100;
  const latexLabel = ruleLabelLatexByRule[rule] ?? label;

  if (compact) {
    return (
      <button
        className={`w-full p-0.5 border-2 border-slate-300 dark:border-slate-700 rounded-lg hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:border-slate-500 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors flex flex-col ${showRuleTree ? 'h-[7.5rem]' : 'h-10 justify-center'}`}
        title={title}
        onClick={() => onClick(rule)}
      >
        <div className="font-semibold text-slate-900 dark:text-slate-100 mb-0 flex justify-center">
          <Latex math={latexLabel} />
        </div>
        {showRuleTree && imageSrc && (
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

export const RulePanel: React.FC<RulePanelProps> = ({ onRuleClick, className = '', compact = false, showRuleTrees = true }) => {
  const { t } = useLanguage();

  const introRules = [
    { rule: 'impl-intro', label: '→i', title: t.implIntro, display: ImplIntroRule },
    { rule: 'and-intro', label: '∧i', title: t.andIntro, display: AndIntroRule },
    { rule: 'or-intro-left', label: '∨i₁', title: t.orIntroLeft, display: OrIntroLeftRule },
    { rule: 'or-intro-right', label: '∨i₂', title: t.orIntroRight, display: OrIntroRightRule },
    { rule: 'neg-intro', label: '¬i', title: t.negIntro, display: NegIntroRule }
  ];

  const eliminationRules = [
    { rule: 'impl-elim', label: '→e', title: t.implElim, display: ImplElimRule },
    { rule: 'and-elim-left', label: '∧e₁', title: t.andElimLeft, display: AndElimLeftRule },
    { rule: 'and-elim-right', label: '∧e₂', title: t.andElimRight, display: AndElimRightRule },
    { rule: 'or-elim', label: '∨e', title: t.orElim, display: OrElimRule },
    { rule: 'neg-elim', label: '¬e', title: t.negElim, display: NegElimRule }
  ];

  const otherRules = [
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
                  imageSrc={ruleImageByRule[rule]}
                  showRuleTree={showRuleTrees}
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
                  imageSrc={ruleImageByRule[rule]}
                  showRuleTree={showRuleTrees}
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
                  imageSrc={ruleImageByRule[rule]}
                  showRuleTree={showRuleTrees}
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
