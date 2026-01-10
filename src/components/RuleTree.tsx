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
    premises={[<Latex key="p" math="[A]^1 \vdots B" />]}
    conclusion={<Latex math="A \to B" />}
    ruleName="→I"
    discharged="1"
  />
);

export const ImplElimRule: React.FC = () => (
  <RuleTree
    premises={[<Latex key="p1" math="A \to B" />, <Latex key="p2" math="A" />]}
    conclusion={<Latex math="B" />}
    ruleName="→E"
  />
);

export const AndIntroRule: React.FC = () => (
  <RuleTree
    premises={[<Latex key="p1" math="A" />, <Latex key="p2" math="B" />]}
    conclusion={<Latex math="A \land B" />}
    ruleName="∧I"
  />
);

export const AndElimLeftRule: React.FC = () => (
  <RuleTree
    premises={[<Latex key="p" math="A \land B" />]}
    conclusion={<Latex math="A" />}
    ruleName="∧E₁"
  />
);

export const AndElimRightRule: React.FC = () => (
  <RuleTree
    premises={[<Latex key="p" math="A \land B" />]}
    conclusion={<Latex math="B" />}
    ruleName="∧E₂"
  />
);

export const OrIntroLeftRule: React.FC = () => (
  <RuleTree
    premises={[<Latex key="p" math="A" />]}
    conclusion={<Latex math="A \lor B" />}
    ruleName="∨I₁"
  />
);

export const OrIntroRightRule: React.FC = () => (
  <RuleTree
    premises={[<Latex key="p" math="B" />]}
    conclusion={<Latex math="A \lor B" />}
    ruleName="∨I₂"
  />
);

export const OrElimRule: React.FC = () => (
  <RuleTree
    premises={[
      <Latex key="p1" math="A \lor B" />,
      <Latex key="p2" math="[A]^1 \vdots C" />,
      <Latex key="p3" math="[B]^2 \vdots C" />
    ]}
    conclusion={<Latex math="C" />}
    ruleName="∨E"
    discharged="1,2"
  />
);

export const NegIntroRule: React.FC = () => (
  <RuleTree
    premises={[<Latex key="p" math="[A]^1 \vdots \bot" />]}
    conclusion={<Latex math="\neg A" />}
    ruleName="¬I"
    discharged="1"
  />
);

export const NegElimRule: React.FC = () => (
  <RuleTree
    premises={[<Latex key="p1" math="A" />, <Latex key="p2" math="\neg A" />]}
    conclusion={<Latex math="\bot" />}
    ruleName="¬E"
  />
);

export const AbsurdRule: React.FC = () => (
  <RuleTree
    premises={[<Latex key="p" math="\bot" />]}
    conclusion={<Latex math="A" />}
    ruleName="⊥E"
  />
);

export const RAARule: React.FC = () => (
  <RuleTree
    premises={[<Latex key="p" math="[\neg A]^1 \vdots \bot" />]}
    conclusion={<Latex math="A" />}
    ruleName="RAA"
    discharged="1"
  />
);

export const AxiomRule: React.FC = () => (
  <RuleTree
    premises={[]}
    conclusion={<Latex math="A \in \Gamma" />}
    ruleName="Ax"
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
  'raa': RAARule,
  'axiom': AxiomRule,
};
