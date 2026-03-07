// Rule panel component showing all inference rules as trees

import React from "react";
import { Latex } from "./Latex";
import { useLanguage } from "../i18n";
import { panelRuleUiByRule, PanelRuleName } from "../ruleLabels";
import { ELIM_RULES, INTRO_RULES } from "../rules";

interface RulePanelProps {
  onRuleClick: (rule: PanelRuleName) => void;
  className?: string;
  activeRule?: string;
}

interface RuleButtonProps {
  rule: PanelRuleName;
  onClick: (rule: PanelRuleName) => void;
  isActive?: boolean;
}

const RuleButton: React.FC<RuleButtonProps> = ({
  rule,
  onClick,
  isActive = false,
}) => {
  const ruleUi = panelRuleUiByRule[rule];
  const imageWidthPct = ruleUi.widthPct;
  const imageSrc = ruleUi.imageSrc;
  const latexLabel = ruleUi.latexLabel;

  return (
    <button
      className={`w-full p-0.5 border-2 rounded-lg transition-colors flex flex-col h-[7.5rem] ${isActive ? "border-blue-500 text-blue-700 bg-blue-50 dark:border-slate-500 dark:text-slate-100 dark:bg-slate-700" : "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800 hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:border-slate-500 dark:hover:text-slate-100 dark:hover:bg-slate-700"}`}
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
            style={{ width: `${imageWidthPct}%`, maxWidth: "100%" }}
            loading="lazy"
          />
        </div>
      )}
    </button>
  );
};

export const RulePanel: React.FC<RulePanelProps> = ({
  onRuleClick,
  className = "",
  activeRule,
}) => {
  const { t } = useLanguage();

  const renderRuleGroup = (title: string, rules: readonly PanelRuleName[]) => (
    <div>
      <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 text-xs uppercase tracking-wide text-center">
        {title}
      </h4>
      <div className={`grid gap-3 grid-cols-1`}>
        {rules.map((rule) => (
          <RuleButton
            key={rule}
            rule={rule}
            onClick={onRuleClick}
            isActive={activeRule === rule}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-xl px-2 mb-4 ${className}`}
    >
      <div className="grid grid-cols-2 gap-3">
        {renderRuleGroup(t.introductionRules, INTRO_RULES)}
        {renderRuleGroup(t.eliminationRules, ELIM_RULES)}
      </div>
    </div>
  );
};
