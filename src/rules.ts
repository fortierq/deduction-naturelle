import { FormulaType } from "./formulas";

const introRuleSet = [
  "axiom",
  "imp-intro",
  "and-intro",
  "or-intro-left",
  "or-intro-right",
  "neg-intro",
  "te",
] as const;

const elimRuleSet = [
  "bot-elim",
  "imp-elim",
  "and-elim-left",
  "and-elim-right",
  "or-elim",
  "neg-elim",
  "raa",
] as const;

export const RULE_NAMES = [...introRuleSet, ...elimRuleSet] as const;

export type RuleName = (typeof RULE_NAMES)[number];

export const INTRO_RULES = introRuleSet;

export const ELIM_RULES = elimRuleSet;

export const RULES_REQUIRING_FORMULA_INPUT = [
  "imp-elim",
  "and-elim-left",
  "and-elim-right",
  "or-elim",
  "neg-elim",
] as const;

export type ModalRuleName = (typeof RULES_REQUIRING_FORMULA_INPUT)[number];
const modalRuleSet = new Set<RuleName>(RULES_REQUIRING_FORMULA_INPUT);

export const isModalRuleName = (rule: RuleName): rule is ModalRuleName =>
  modalRuleSet.has(rule);

export type RuleOperator =
  | Extract<FormulaType, "imp" | "and" | "or" | "neg">
  | "bot"
  | "raa"
  | "te";
export const RULE_OPERATORS: readonly RuleOperator[] = [
  "imp",
  "and",
  "or",
  "neg",
  "bot",
  "raa",
  "te",
];
