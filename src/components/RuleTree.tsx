// Rule tree display component - shows inference rules as proper trees

import React from 'react';
import { Latex } from './Latex';

interface RuleTreeProps {
  premises: React.ReactNode[];
  conclusion: React.ReactNode;
  ruleName: string;
  discharged?: string;
}

export const RuleTree: React.FC<RuleTreeProps> = ({ premises, conclusion, ruleName, discharged }) => {
  return (
    <div className="rule-tree">
      {premises.length > 0 && (
        <div className="rule-tree-premises">
          {premises.map((premise, i) => (
            <div key={i}>{premise}</div>
          ))}
        </div>
      )}
      <div className="rule-tree-line">
        <div className="rule-tree-bar" />
        <span className="rule-tree-name">
          {ruleName}
          {discharged && <span className="text-slate-500 ml-1">[{discharged}]</span>}
        </span>
      </div>
      <div className="rule-tree-conclusion">{conclusion}</div>
    </div>
  );
};

// Predefined rule displays using LaTeX
export const ImplIntroRule: React.FC = () => (
  <RuleTree
    premises={[<Latex key="p" math="[X]^1 \vdots Y" />]}
    conclusion={<Latex math="X \to Y" />}
    ruleName="impl-intro"
    discharged="1"
  />
);

export const ImplElimRule: React.FC = () => (
  <RuleTree
    premises={[<Latex key="p1" math="X \to Y" />, <Latex key="p2" math="X" />]}
    conclusion={<Latex math="Y" />}
    ruleName="impl-elim"
  />
);

export const AndIntroRule: React.FC = () => (
  <RuleTree
    premises={[<Latex key="p1" math="X" />, <Latex key="p2" math="Y" />]}
    conclusion={<Latex math="X \land Y" />}
    ruleName="and-intro"
  />
);

export const AndElimLeftRule: React.FC = () => (
  <RuleTree
    premises={[<Latex key="p" math="X \land Y" />]}
    conclusion={<Latex math="X" />}
    ruleName="and-elim-left"
  />
);

export const AndElimRightRule: React.FC = () => (
  <RuleTree
    premises={[<Latex key="p" math="X \land Y" />]}
    conclusion={<Latex math="Y" />}
    ruleName="and-elim-right"
  />
);

export const OrIntroLeftRule: React.FC = () => (
  <RuleTree
    premises={[<Latex key="p" math="X" />]}
    conclusion={<Latex math="X \lor Y" />}
    ruleName="or-intro-left"
  />
);

export const OrIntroRightRule: React.FC = () => (
  <RuleTree
    premises={[<Latex key="p" math="Y" />]}
    conclusion={<Latex math="X \lor Y" />}
    ruleName="or-intro-right"
  />
);

export const OrElimRule: React.FC = () => (
  <RuleTree
    premises={[
      <Latex key="p1" math="X \lor Y" />,
      <Latex key="p2" math="[X]^1 \vdots Z" />,
      <Latex key="p3" math="[Y]^2 \vdots Z" />
    ]}
    conclusion={<Latex math="Z" />}
    ruleName="or-elim"
    discharged="1,2"
  />
);

export const NegIntroRule: React.FC = () => (
  <RuleTree
    premises={[<Latex key="p" math="[X]^1 \vdots \bot" />]}
    conclusion={<Latex math="\neg X" />}
    ruleName="neg-intro"
    discharged="1"
  />
);

export const NegElimRule: React.FC = () => (
  <RuleTree
    premises={[<Latex key="p1" math="X" />, <Latex key="p2" math="\neg X" />]}
    conclusion={<Latex math="\bot" />}
    ruleName="neg-elim"
  />
);

export const AbsurdRule: React.FC = () => (
  <RuleTree
    premises={[<Latex key="p" math="\bot" />]}
    conclusion={<Latex math="X" />}
    ruleName="absurd"
  />
);

export const raaRule: React.FC = () => (
  <RuleTree
    premises={[<Latex key="p" math="[\neg X]^1 \vdots \bot" />]}
    conclusion={<Latex math="X" />}
    ruleName="raa"
    discharged="1"
  />
);

export const AxiomRule: React.FC = () => (
  <RuleTree
    premises={[]}
    conclusion={<Latex math="X \in \Gamma" />}
    ruleName="axiom"
  />
);

// Map rule names to their display components
export const ruleDisplays: Record<string, React.FC> = {
  'impl-intro': ImplIntroRule,
  'impl-elim': ImplElimRule,
  'and-intro': AndIntroRule,
  'and-elim-left': AndElimLeftRule,
  'and-elim-right': AndElimRightRule,
  'or-intro-left': OrIntroLeftRule,
  'or-intro-right': OrIntroRightRule,
  'or-elim': OrElimRule,
  'neg-intro': NegIntroRule,
  'neg-elim': NegElimRule,
  'absurd': AbsurdRule,
  'raa': raaRule,
  'axiom': AxiomRule,
};
