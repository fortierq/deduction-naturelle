// MathJax rendering component

import React from "react";
import { MathJax } from "better-react-mathjax";

interface LatexProps {
  math: string;
  inline?: boolean;
  className?: string;
}

export const Latex: React.FC<LatexProps> = ({
  math,
  inline = true,
  className = "",
}) => {
  const formula = inline ? `\\(${math}\\)` : `\\[${math}\\]`;
  return (
    <MathJax className={className} inline={inline} dynamic>
      {formula}
    </MathJax>
  );
};
