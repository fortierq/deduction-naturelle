import { Formula } from "./formulas";

export type NotationRule =
  | {
      type: "formula";
      formula: Formula;
    }
  | {
      type: "set";
      formulas: Formula[];
    };

const FORMULA_PRECEDENCE = {
  var: 100,
  bot: 100,
  neg: 90,
  and: 70,
  or: 60,
  imp: 50,
} as const;

export const renderFormulaWithNotationLatex = (
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

export const renderContextWithNotationLatex = (
  context: Formula[],
  notationRule?: NotationRule | null,
): string => {
  if (notationRule?.type !== "set") {
    return context
      .map((formula) => renderFormulaWithNotationLatex(formula, notationRule))
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
      .map((formula) => renderFormulaWithNotationLatex(formula, notationRule))
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

    renderedContext.push(renderFormulaWithNotationLatex(formula, notationRule));
  });

  return renderedContext.join(", ");
};

export const renderNotationDefinitionLatex = (
  notationRule?: NotationRule | null,
): string | null => {
  if (!notationRule) {
    return null;
  }

  if (notationRule.type === "formula") {
    return `\\varphi = ${notationRule.formula.toLatex()}`;
  }

  return `\\Gamma = ${notationRule.formulas
    .map((formula) => formula.toLatex())
    .join(", ")}`;
};
