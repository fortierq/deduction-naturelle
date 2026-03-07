// Proof tree display component with proper inference lines

import React, { useRef, useEffect, useState } from "react";
import { ProofNode } from "../proof";
import { Formula } from "../formulas";
import { NotationRule } from "../notation";
import { Latex } from "./Latex";
import { ruleLabelLatexByProofRule } from "../ruleLabels";

const FORMULA_PRECEDENCE = {
  var: 100,
  bot: 100,
  neg: 90,
  and: 70,
  or: 60,
  imp: 50,
} as const;

interface ProofNodeDisplayProps {
  node: ProofNode;
  selectedNode: ProofNode | null;
  onNodeClick: (node: ProofNode) => void;
  notationRule?: NotationRule | null;
}

const renderFormulaLatex = (
  formula: Formula,
  notationRule?: NotationRule | null,
): string => {
  const renderWithPrecedence = (
    currentFormula: Formula,
    parentPrecedence: number,
  ): string => {
    if (
      notationRule?.type === "formula" &&
      currentFormula.equals(notationRule.formula)
    ) {
      return "\\varphi";
    }

    const currentPrecedence = FORMULA_PRECEDENCE[currentFormula.type];
    let result: string;

    switch (currentFormula.type) {
      case "var":
        result = currentFormula.name;
        break;
      case "bot":
        result = "\\bot";
        break;
      case "neg":
        result = `\\neg ${renderWithPrecedence(currentFormula.inner, currentPrecedence)}`;
        break;
      case "and":
        result = `${renderWithPrecedence(currentFormula.left, currentPrecedence)} \\land ${renderWithPrecedence(currentFormula.right, currentPrecedence + 1)}`;
        break;
      case "or":
        result = `${renderWithPrecedence(currentFormula.left, currentPrecedence)} \\lor ${renderWithPrecedence(currentFormula.right, currentPrecedence + 1)}`;
        break;
      case "imp":
        result = `${renderWithPrecedence(currentFormula.left, currentPrecedence + 1)} \\to ${renderWithPrecedence(currentFormula.right, currentPrecedence)}`;
        break;
      default:
        result = "?";
        break;
    }

    if (currentPrecedence < parentPrecedence) {
      return `(${result})`;
    }

    return result;
  };

  return renderWithPrecedence(formula, 0);
};

const renderContextLatex = (
  context: Formula[],
  notationRule?: NotationRule | null,
): string => {
  if (notationRule?.type !== "set") {
    return context
      .map((formula) => renderFormulaLatex(formula, notationRule))
      .join(", ");
  }

  const matchedIndices: number[] = [];
  const usedTargets = new Array(notationRule.formulas.length).fill(false);

  context.forEach((formula, index) => {
    const targetIndex = notationRule.formulas.findIndex(
      (target, candidateIndex) =>
        !usedTargets[candidateIndex] && formula.equals(target),
    );

    if (targetIndex >= 0) {
      usedTargets[targetIndex] = true;
      matchedIndices.push(index);
    }
  });

  if (usedTargets.some((used) => !used)) {
    return context
      .map((formula) => renderFormulaLatex(formula, notationRule))
      .join(", ");
  }

  const matchedIndexSet = new Set(matchedIndices);
  const renderedContext: string[] = [];
  let insertedGamma = false;

  context.forEach((formula, index) => {
    if (matchedIndexSet.has(index)) {
      if (!insertedGamma) {
        renderedContext.push("\\Gamma");
        insertedGamma = true;
      }
      return;
    }

    renderedContext.push(renderFormulaLatex(formula, notationRule));
  });

  return renderedContext.join(", ");
};

const SequentDisplay: React.FC<{
  context: Formula[];
  goal: Formula;
  isSelected: boolean;
  isComplete: boolean;
  isAxiom: boolean;
  onClick: () => void;
  notationRule?: NotationRule | null;
}> = ({
  context,
  goal,
  isSelected,
  isComplete,
  isAxiom,
  onClick,
  notationRule,
}) => {
  let className = "node-sequent";
  if (isSelected) className += " selected";
  if (isAxiom) className += " axiom";
  else if (isComplete) className += " completed";
  else className += " open-goal";

  const contextLatex =
    context.length > 0 ? renderContextLatex(context, notationRule) + " " : "";
  const sequentLatex = `${contextLatex}\\vdash ${renderFormulaLatex(goal, notationRule)}`;

  return (
    <div
      className={className}
      onPointerDown={(e) => e.preventDefault()}
      onMouseDown={(e) => e.preventDefault()}
      onDoubleClick={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      onClick={onClick}
    >
      <Latex math={sequentLatex} className="select-none" />
    </div>
  );
};

export const ProofNodeDisplay: React.FC<ProofNodeDisplayProps> = ({
  node,
  selectedNode,
  onNodeClick,
  notationRule,
}) => {
  const premisesRef = useRef<HTMLDivElement>(null);
  const conclusionRef = useRef<HTMLDivElement>(null);
  const [lineWidth, setLineWidth] = useState<number>(0);

  useEffect(() => {
    // Calculate the width needed for the inference line
    const updateLineWidth = () => {
      const premisesWidth = premisesRef.current?.scrollWidth || 0;
      const conclusionWidth = conclusionRef.current?.scrollWidth || 0;
      // Line should span the max of premises and conclusion, with some padding
      setLineWidth(Math.max(premisesWidth, conclusionWidth, 80));
    };

    updateLineWidth();
    // Use ResizeObserver to handle dynamic content
    const observer = new ResizeObserver(updateLineWidth);
    if (premisesRef.current) observer.observe(premisesRef.current);
    if (conclusionRef.current) observer.observe(conclusionRef.current);

    return () => observer.disconnect();
  }, [node.premises, node.sequent]);

  const getRuleLabel = () => {
    if (!node.rule) return { ruleLatex: "" };
    const ruleLatex =
      ruleLabelLatexByProofRule[node.rule] ?? `\\mathrm{${node.rule}}`;
    return { ruleLatex };
  };

  const ruleLabel = getRuleLabel();

  return (
    <div className="proof-node">
      {/* Premises */}
      {node.premises.length > 0 && (
        <div ref={premisesRef} className="node-premises">
          {node.premises.map((premise) => (
            <ProofNodeDisplay
              key={premise.id}
              node={premise}
              selectedNode={selectedNode}
              onNodeClick={onNodeClick}
              notationRule={notationRule}
            />
          ))}
        </div>
      )}

      {/* Inference line */}
      {node.rule && (
        <div className="node-line-container">
          <div className="flex justify-center">
            <div className="relative inline-flex items-center">
              <div
                className="h-px bg-slate-700 dark:bg-slate-300"
                style={{ width: `${lineWidth}px`, minWidth: "110px" }}
              />
              <span className="absolute left-full ml-1.5 sm:ml-2 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-bold whitespace-nowrap">
                <Latex math={ruleLabel.ruleLatex} />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Conclusion (the sequent) */}
      <div ref={conclusionRef}>
        <SequentDisplay
          context={node.sequent.context}
          goal={node.sequent.goal}
          isSelected={node === selectedNode}
          isComplete={node.isComplete || !!node.rule}
          isAxiom={node.rule === "axiom"}
          onClick={() => onNodeClick(node)}
          notationRule={notationRule}
        />
      </div>
    </div>
  );
};
