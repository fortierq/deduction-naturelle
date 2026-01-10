// Rule panel component showing all inference rules as trees

import React, { useState } from 'react';
import { 
  ImplIntroRule, ImplElimRule, 
  AndIntroRule, AndElimLeftRule, AndElimRightRule,
  OrIntroLeftRule, OrIntroRightRule, OrElimRule,
  NegIntroRule, NegElimRule, AbsurdRule, RAARule, AxiomRule
} from './RuleTree';
import { useLanguage } from '../i18n';

interface RulePanelProps {
  onRuleClick: (rule: string) => void;
}

interface RuleButtonProps {
  rule: string;
  label: string;
  title: string;
  ruleDisplay: React.FC;
  onClick: (rule: string) => void;
}

const RuleButton: React.FC<RuleButtonProps> = ({ rule, label, title, ruleDisplay: RuleDisplay, onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        className="rule-btn"
        title={title}
        onClick={() => onClick(rule)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {label}
      </button>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-white rounded-lg shadow-xl border-2 border-slate-200 z-50 whitespace-nowrap">
          <RuleDisplay />
        </div>
      )}
    </div>
  );
};

export const RulePanel: React.FC<RulePanelProps> = ({ onRuleClick }) => {
  const { t } = useLanguage();
  
  return (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
      <h3 className="text-xl font-bold text-slate-800 mb-4">{t.inferenceRules}</h3>
      <p className="text-sm text-slate-500 mb-4">{t.hoverToSeeTree}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h4 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">
            {t.introductionRules}
          </h4>
          <div className="flex flex-wrap gap-2">
            <RuleButton 
              rule="impl-intro" 
              label="→I" 
              title={t.implIntro}
              ruleDisplay={ImplIntroRule}
              onClick={onRuleClick}
            />
            <RuleButton 
              rule="and-intro" 
              label="∧I" 
              title={t.andIntro}
              ruleDisplay={AndIntroRule}
              onClick={onRuleClick}
            />
            <RuleButton 
              rule="or-intro-left" 
              label="∨I₁" 
              title={t.orIntroLeft}
              ruleDisplay={OrIntroLeftRule}
              onClick={onRuleClick}
            />
            <RuleButton 
              rule="or-intro-right" 
              label="∨I₂" 
              title={t.orIntroRight}
              ruleDisplay={OrIntroRightRule}
              onClick={onRuleClick}
            />
            <RuleButton 
              rule="neg-intro" 
              label="¬I" 
              title={t.negIntro}
              ruleDisplay={NegIntroRule}
              onClick={onRuleClick}
            />
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">
            {t.eliminationRules}
          </h4>
          <div className="flex flex-wrap gap-2">
            <RuleButton 
              rule="impl-elim" 
              label="→E" 
              title={t.implElim}
              ruleDisplay={ImplElimRule}
              onClick={onRuleClick}
            />
            <RuleButton 
              rule="and-elim-left" 
              label="∧E₁" 
              title={t.andElimLeft}
              ruleDisplay={AndElimLeftRule}
              onClick={onRuleClick}
            />
            <RuleButton 
              rule="and-elim-right" 
              label="∧E₂" 
              title={t.andElimRight}
              ruleDisplay={AndElimRightRule}
              onClick={onRuleClick}
            />
            <RuleButton 
              rule="or-elim" 
              label="∨E" 
              title={t.orElim}
              ruleDisplay={OrElimRule}
              onClick={onRuleClick}
            />
            <RuleButton 
              rule="neg-elim" 
              label="¬E" 
              title={t.negElim}
              ruleDisplay={NegElimRule}
              onClick={onRuleClick}
            />
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">
            {t.otherRules}
          </h4>
          <div className="flex flex-wrap gap-2">
            <RuleButton 
              rule="axiom" 
              label="Ax" 
              title={t.axiom}
              ruleDisplay={AxiomRule}
              onClick={onRuleClick}
            />
            <RuleButton 
              rule="absurd" 
              label="⊥E" 
              title={t.absurd}
              ruleDisplay={AbsurdRule}
              onClick={onRuleClick}
            />
            <RuleButton 
              rule="raa" 
              label="RAA" 
              title={t.raa}
              ruleDisplay={RAARule}
              onClick={onRuleClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
