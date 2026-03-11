/// <reference types="vite/client" />
import { RuleName } from "./rules";

export type PanelRuleName = RuleName;

export interface PanelRuleUi {
  imageSrc: string;
  widthPct: number;
  latexLabel: string;
}

const ruleImageSrc = (rule: PanelRuleName): string => {
  const fileName = `${rule.replace(/-/g, "_")}.png`;

  return `${import.meta.env.BASE_URL}assets/rules/${fileName}`;
};

interface PanelRuleSpec {
  widthPct: number;
  latexLabel: string;
}

const panelRuleSpecByRule: Record<PanelRuleName, PanelRuleSpec> = {
  axiom: { widthPct: 46, latexLabel: "\\mathrm{ax}" },
  te: { widthPct: 59, latexLabel: "\\mathrm{te}" },
  "imp-intro": { widthPct: 58, latexLabel: "\\to_{i}" },
  "imp-elim": { widthPct: 94, latexLabel: "\\to_{e}" },
  "and-intro": { widthPct: 72, latexLabel: "\\wedge_{i}" },
  "and-elim-left": { widthPct: 58, latexLabel: "\\wedge_{e}^{g}" },
  "and-elim-right": { widthPct: 58, latexLabel: "\\wedge_{e}^{d}" },
  "or-intro-left": { widthPct: 58, latexLabel: "\\vee_{i}^{g}" },
  "or-intro-right": { widthPct: 58, latexLabel: "\\vee_{i}^{d}" },
  "or-elim": { widthPct: 100, latexLabel: "\\vee_{e}" },
  "neg-intro": { widthPct: 46, latexLabel: "\\neg_{i}" },
  "neg-elim": { widthPct: 78, latexLabel: "\\neg_{e}" },
  "bot-elim": { widthPct: 40, latexLabel: "\\bot_{e}" },
  raa: { widthPct: 56, latexLabel: "\\mathrm{raa}" },
};

export const ruleLabelLatexByPanelRule: Record<PanelRuleName, string> =
  Object.fromEntries(
    Object.entries(panelRuleSpecByRule).map(([rule, spec]) => [
      rule,
      spec.latexLabel,
    ]),
  ) as Record<PanelRuleName, string>;

export const ruleLabelLatexByProofRule: Record<RuleName, string> =
  ruleLabelLatexByPanelRule;

export const panelRuleUiByRule: Record<PanelRuleName, PanelRuleUi> =
  Object.fromEntries(
    Object.entries(panelRuleSpecByRule).map(([rule, spec]) => {
      const panelRule = rule as PanelRuleName;
      return [
        panelRule,
        {
          imageSrc: ruleImageSrc(panelRule),
          widthPct: spec.widthPct,
          latexLabel: spec.latexLabel,
        },
      ];
    }),
  ) as Record<PanelRuleName, PanelRuleUi>;
