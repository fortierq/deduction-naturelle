import { RuleName } from './rules';

export type PanelRuleName = RuleName;

export interface PanelRuleUi {
  imageSrc: string;
  widthPct: number;
  latexLabel: string;
}

export const ruleLabelLatexByPanelRule: Record<PanelRuleName, string> = {
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

export const ruleLabelLatexByProofRule: Record<RuleName, string> = ruleLabelLatexByPanelRule;

const ruleImageSrc = (fileName: string): string => `${import.meta.env.BASE_URL}assets/rules/${fileName}`;

const panelRuleVisualByRule: Record<PanelRuleName, Pick<PanelRuleUi, 'imageSrc' | 'widthPct'>> = {
  'impl-intro': { imageSrc: ruleImageSrc('imp_intro.png'), widthPct: 58 },
  'impl-elim': { imageSrc: ruleImageSrc('imp_elim.png'), widthPct: 94 },
  'and-intro': { imageSrc: ruleImageSrc('and_intro.png'), widthPct: 72 },
  'and-elim-left': { imageSrc: ruleImageSrc('and_elim_left.png'), widthPct: 58 },
  'and-elim-right': { imageSrc: ruleImageSrc('and_elim_right.png'), widthPct: 58 },
  'or-intro-left': { imageSrc: ruleImageSrc('or_intro_left.png'), widthPct: 58 },
  'or-intro-right': { imageSrc: ruleImageSrc('or_intro_right.png'), widthPct: 58 },
  'or-elim': { imageSrc: ruleImageSrc('or_elim.png'), widthPct: 100 },
  'neg-intro': { imageSrc: ruleImageSrc('neg_intro.png'), widthPct: 46 },
  'neg-elim': { imageSrc: ruleImageSrc('neg_elim.png'), widthPct: 77 },
  'absurd': { imageSrc: ruleImageSrc('bot_elim.png'), widthPct: 39 },
  'raa': { imageSrc: ruleImageSrc('raa.png'), widthPct: 56 },
  'axiom': { imageSrc: ruleImageSrc('axiom.png'), widthPct: 46 }
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
