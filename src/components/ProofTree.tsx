// Proof tree display component with proper inference lines

import React, { useRef, useEffect, useState } from 'react';
import { ProofNode } from '../proof';
import { Formula } from '../formulas';
import { Latex } from './Latex';
import { ruleLabelLatexByProofRule } from '../ruleLabels';

interface ProofNodeDisplayProps {
  node: ProofNode;
  selectedNode: ProofNode | null;
  onNodeClick: (node: ProofNode) => void;
}

const SequentDisplay: React.FC<{ 
  context: Formula[]; 
  goal: Formula;
  isSelected: boolean;
  isComplete: boolean;
  isAxiom: boolean;
  onClick: () => void;
}> = ({ context, goal, isSelected, isComplete, isAxiom, onClick }) => {
  let className = 'node-sequent';
  if (isSelected) className += ' selected';
  if (isAxiom) className += ' axiom';
  else if (isComplete) className += ' completed';
  else className += ' open-goal';

  const contextLatex = context.length > 0 
    ? context.map(f => f.toLatex()).join(', ') + ' '
    : '';
  const sequentLatex = `${contextLatex}\\vdash ${goal.toLatex()}`;

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

export const ProofNodeDisplay: React.FC<ProofNodeDisplayProps> = ({ node, selectedNode, onNodeClick }) => {
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
    if (!node.rule) return { ruleLatex: '' };
    const ruleLatex = ruleLabelLatexByProofRule[node.rule] ?? `\\mathrm{${node.rule}}`;
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
                style={{ width: `${lineWidth}px`, minWidth: '110px' }}
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
          isAxiom={node.rule === 'axiom'}
          onClick={() => onNodeClick(node)}
        />
      </div>
    </div>
  );
};
