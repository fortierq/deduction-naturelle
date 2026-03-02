import { RuleName } from './proof';

export type PanelRuleName =
  | 'impl-intro'
  | 'impl-elim'
  | 'and-intro'
  | 'and-elim-left'
  | 'and-elim-right'
  | 'or-intro-left'
  | 'or-intro-right'
  | 'or-elim'
  | 'neg-intro'
  | 'neg-elim'
  | 'absurd'
  | 'raa'
  | 'axiom';

export interface PanelRuleUi {
  imageSrc: string;
  widthPct: number;
  latexLabel: string;
}

type CanonicalRuleName =
  | 'axiom'
  | 'impl-intro'
  | 'impl-elim'
  | 'and-intro'
  | 'and-elim-left'
  | 'and-elim-right'
  | 'or-intro-left'
  | 'or-intro-right'
  | 'or-elim'
  | 'neg-intro'
  | 'neg-elim'
  | 'absurd'
  | 'raa';

const ruleLabelLatexByCanonicalRule: Record<CanonicalRuleName, string> = {
  'axiom': '\\mathrm{ax}',
  'impl-intro': '\\to_{i}',
  'impl-elim': '\\to_{e}',
  'and-intro': '\\wedge_{i}',
  'and-elim-left': '\\wedge_{e}^{g}',
  'and-elim-right': '\\wedge_{e}^{d}',
  'or-intro-left': '\\vee_{i}^{g}',
  'or-intro-right': '\\vee_{i}^{d}',
  'or-elim': '\\vee_{e}',
  'neg-intro': '\\neg_{i}',
  'neg-elim': '\\neg_{e}',
  'absurd': '\\bot_{e}',
  'raa': '\\mathrm{raa}'
};

const canonicalRuleByPanelRule: Record<PanelRuleName, CanonicalRuleName> = {
  'impl-intro': 'impl-intro',
  'impl-elim': 'impl-elim',
  'and-intro': 'and-intro',
  'and-elim-left': 'and-elim-left',
  'and-elim-right': 'and-elim-right',
  'or-intro-left': 'or-intro-left',
  'or-intro-right': 'or-intro-right',
  'or-elim': 'or-elim',
  'neg-intro': 'neg-intro',
  'neg-elim': 'neg-elim',
  'absurd': 'absurd',
  'raa': 'raa',
  'axiom': 'axiom'
};

const canonicalRuleByProofRule: Record<RuleName, CanonicalRuleName> = {
  'axiom': 'axiom',
  '→I': 'impl-intro',
  '→E': 'impl-elim',
  '∧I': 'and-intro',
  '∧E₁': 'and-elim-left',
  '∧E₂': 'and-elim-right',
  '∨I₁': 'or-intro-left',
  '∨I₂': 'or-intro-right',
  '∨E': 'or-elim',
  '¬I': 'neg-intro',
  '¬E': 'neg-elim',
  '⊥E': 'absurd',
  'raa': 'raa'
};

export const ruleLabelLatexByPanelRule: Record<PanelRuleName, string> = Object.fromEntries(
  Object.entries(canonicalRuleByPanelRule).map(([rule, canonicalRule]) => [
    rule,
    ruleLabelLatexByCanonicalRule[canonicalRule]
  ])
) as Record<PanelRuleName, string>;

export const ruleLabelLatexByProofRule: Record<RuleName, string> = Object.fromEntries(
  Object.entries(canonicalRuleByProofRule).map(([rule, canonicalRule]) => [
    rule,
    ruleLabelLatexByCanonicalRule[canonicalRule]
  ])
) as Record<RuleName, string>;

const panelRuleVisualByRule: Record<PanelRuleName, Pick<PanelRuleUi, 'imageSrc' | 'widthPct'>> = {
  'impl-intro': { imageSrc: 'assets/rules/imp_intro.png', widthPct: 58 },
  'impl-elim': { imageSrc: 'assets/rules/imp_elim.png', widthPct: 94 },
  'and-intro': { imageSrc: 'assets/rules/and_intro.png', widthPct: 72 },
  'and-elim-left': { imageSrc: 'assets/rules/and_elim_left.png', widthPct: 58 },
  'and-elim-right': { imageSrc: 'assets/rules/and_elim_right.png', widthPct: 58 },
  'or-intro-left': { imageSrc: 'assets/rules/or_intro_left.png', widthPct: 58 },
  'or-intro-right': { imageSrc: 'assets/rules/or_intro_right.png', widthPct: 58 },
  'or-elim': { imageSrc: 'assets/rules/or_elim.png', widthPct: 100 },
  'neg-intro': { imageSrc: 'assets/rules/neg_intro.png', widthPct: 46 },
  'neg-elim': { imageSrc: 'assets/rules/neg_elim.png', widthPct: 77 },
  'absurd': { imageSrc: 'assets/rules/bot_elim.png', widthPct: 37 },
  'raa': { imageSrc: 'assets/rules/raa.png', widthPct: 56 },
  'axiom': { imageSrc: 'assets/rules/axiom.png', widthPct: 46 }
};

export const panelRuleUiByRule: Record<PanelRuleName, PanelRuleUi> = Object.fromEntries(
  Object.entries(ruleLabelLatexByPanelRule).map(([rule, latexLabel]) => {
    const panelRule = rule as PanelRuleName;
    return [
      panelRule,
      {
        imageSrc: panelRuleVisualByRule[panelRule].imageSrc,
        widthPct: panelRuleVisualByRule[panelRule].widthPct,
        latexLabel
      }
    ];
  })
) as Record<PanelRuleName, PanelRuleUi>;
