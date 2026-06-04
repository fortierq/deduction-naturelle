import { Formula } from "./formulas";
import { ProofNode } from "./proof";
import { Sequent } from "./sequent";

const DEFAULT_MAX_DEPTH = 18;
const DEFAULT_YIELD_AFTER_STEPS = 250;

class SolverAbortedError extends Error {
  constructor() {
    super("Proof search aborted");
    this.name = "SolverAbortedError";
  }
}

export interface ProofSearchProgress {
  expandedNodes: number;
  depth: number;
}

export interface ProofSearchOptions {
  maxDepth?: number;
  yieldAfterSteps?: number;
  signal?: AbortSignal;
  onProgress?: (progress: ProofSearchProgress) => void;
}

export interface ProofSearchResult {
  root: ProofNode | null;
  expandedNodes: number;
  depthReached: number;
  aborted: boolean;
}

const isExcludedMiddleFormula = (formula: Formula): boolean => {
  if (formula.type !== "or") {
    return false;
  }

  const { left, right } = formula;

  return (
    (right.type === "neg" && left.equals(right.inner)) ||
    (left.type === "neg" && right.equals(left.inner))
  );
};

const pause = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    globalThis.setTimeout(resolve, 0);
  });
};

const formulaKey = (formula: Formula): string => formula.toString();

const normalizeContext = (context: Formula[]): Formula[] => {
  const byKey = new Map<string, Formula>();

  context.forEach((formula) => {
    const key = formulaKey(formula);
    if (!byKey.has(key)) {
      byKey.set(key, formula);
    }
  });

  return [...byKey.entries()]
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([, formula]) => formula);
};

const sequentKey = (sequent: Sequent): string => {
  const context = normalizeContext(sequent.context)
    .map((formula) => formulaKey(formula))
    .join(",");

  return `${context}=>${formulaKey(sequent.goal)}`;
};

const cloneProofTree = (node: ProofNode): ProofNode => {
  const clone = node.clone();
  clone.premises = node.premises.map((premise) => cloneProofTree(premise));
  return clone;
};

const makeLeaf = (sequent: Sequent, rule: "axiom" | "te"): ProofNode => {
  const node = new ProofNode(sequent.clone());
  node.rule = rule;
  node.isComplete = true;
  return node;
};

const makeUnaryNode = (
  sequent: Sequent,
  rule:
    | "imp-intro"
    | "and-elim-left"
    | "and-elim-right"
    | "or-intro-left"
    | "or-intro-right"
    | "neg-intro"
    | "bot-elim"
    | "raa",
  premise: ProofNode,
  discharged?: { formula: Formula },
): ProofNode => {
  const node = new ProofNode(sequent.clone());
  node.rule = rule;
  node.premises = [premise];
  node.dischargedAssumption = discharged ?? null;
  return node;
};

const makeBinaryNode = (
  sequent: Sequent,
  rule: "imp-elim" | "and-intro" | "neg-elim",
  left: ProofNode,
  right: ProofNode,
): ProofNode => {
  const node = new ProofNode(sequent.clone());
  node.rule = rule;
  node.premises = [left, right];
  return node;
};

const makeOrElimNode = (
  sequent: Sequent,
  disjunctionProof: ProofNode,
  leftBranch: ProofNode,
  rightBranch: ProofNode,
  left: Formula,
  right: Formula,
): ProofNode => {
  const node = new ProofNode(sequent.clone());
  node.rule = "or-elim";
  node.premises = [disjunctionProof, leftBranch, rightBranch];
  node.dischargedAssumption = { left, right };
  return node;
};

const collectSubformulas = (formula: Formula, acc: Map<string, Formula>): void => {
  const key = formulaKey(formula);
  if (acc.has(key)) {
    return;
  }

  acc.set(key, formula);

  switch (formula.type) {
    case "neg":
      collectSubformulas(formula.inner, acc);
      break;
    case "and":
    case "or":
    case "imp":
      collectSubformulas(formula.left, acc);
      collectSubformulas(formula.right, acc);
      break;
    default:
      break;
  }
};

const buildFormulaPool = (goal: Formula, context: Formula[]): Formula[] => {
  const formulas = new Map<string, Formula>();

  collectSubformulas(goal, formulas);
  context.forEach((formula) => collectSubformulas(formula, formulas));
  formulas.set(formulaKey(Formula.bot()), Formula.bot());

  return [...formulas.values()].sort((left, right) =>
    formulaKey(left).localeCompare(formulaKey(right)),
  );
};

const prioritizeFormulas = (candidates: Formula[], context: Formula[]): Formula[] => {
  const normalizedContext = normalizeContext(context);
  const inContext = new Set(normalizedContext.map((formula) => formulaKey(formula)));
  const negatedInContext = new Set(
    normalizedContext
      .filter((formula) => formula.type === "neg")
      .map((formula) => formulaKey(formula.inner)),
  );

  return [...candidates].sort((left, right) => {
    const leftKey = formulaKey(left);
    const rightKey = formulaKey(right);
    const leftScore = Number(inContext.has(leftKey)) * 2 + Number(negatedInContext.has(leftKey));
    const rightScore = Number(inContext.has(rightKey)) * 2 + Number(negatedInContext.has(rightKey));

    if (leftScore !== rightScore) {
      return rightScore - leftScore;
    }

    return leftKey.localeCompare(rightKey);
  });
};

class ProofSearcher {
  private readonly maxDepth: number;
  private readonly yieldAfterSteps: number;
  private readonly signal?: AbortSignal;
  private readonly onProgress?: (progress: ProofSearchProgress) => void;
  private readonly formulaPool: Formula[];
  private readonly cache = new Map<string, ProofNode | null>();
  private expandedNodes = 0;
  private sinceLastYield = 0;

  constructor(
    private readonly rootGoal: Formula,
    private readonly rootContext: Formula[],
    options: ProofSearchOptions,
  ) {
    this.maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH;
    this.yieldAfterSteps = options.yieldAfterSteps ?? DEFAULT_YIELD_AFTER_STEPS;
    this.signal = options.signal;
    this.onProgress = options.onProgress;
    this.formulaPool = buildFormulaPool(rootGoal, rootContext);
  }

  async search(): Promise<ProofSearchResult> {
    const initialSequent = new Sequent(
      this.rootContext.map((formula) => formula.clone()),
      this.rootGoal.clone(),
    );

    try {
      for (let depth = 1; depth <= this.maxDepth; depth += 1) {
        this.cache.clear();
        const root = await this.prove(initialSequent, depth, new Set<string>(), depth);
        if (root) {
          return {
            root,
            expandedNodes: this.expandedNodes,
            depthReached: depth,
            aborted: false,
          };
        }
      }

      return {
        root: null,
        expandedNodes: this.expandedNodes,
        depthReached: this.maxDepth,
        aborted: false,
      };
    } catch (error) {
      if (error instanceof SolverAbortedError) {
        return {
          root: null,
          expandedNodes: this.expandedNodes,
          depthReached: this.maxDepth,
          aborted: true,
        };
      }

      throw error;
    }
  }

  private async step(depth: number): Promise<void> {
    if (this.signal?.aborted) {
      throw new SolverAbortedError();
    }

    this.expandedNodes += 1;
    this.sinceLastYield += 1;

    if (this.expandedNodes % 100 === 0) {
      this.onProgress?.({
        expandedNodes: this.expandedNodes,
        depth,
      });
    }

    if (this.sinceLastYield >= this.yieldAfterSteps) {
      this.sinceLastYield = 0;
      await pause();
    }
  }

  private async prove(
    sequent: Sequent,
    depth: number,
    trail: Set<string>,
    currentDepth: number,
  ): Promise<ProofNode | null> {
    await this.step(currentDepth);

    if (depth <= 0) {
      return null;
    }

    const canonicalKey = sequentKey(sequent);
    const cacheKey = `${depth}:${canonicalKey}`;

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      return cached ? cloneProofTree(cached) : null;
    }

    if (trail.has(canonicalKey)) {
      return null;
    }

    trail.add(canonicalKey);

    try {
      const directProof = await this.tryDirectProofs(sequent, depth, trail, currentDepth);
      if (directProof) {
        this.cache.set(cacheKey, cloneProofTree(directProof));
        return directProof;
      }

      const eliminationProof = await this.tryEliminationProofs(
        sequent,
        depth,
        trail,
        currentDepth,
      );

      this.cache.set(cacheKey, eliminationProof ? cloneProofTree(eliminationProof) : null);
      return eliminationProof;
    } finally {
      trail.delete(canonicalKey);
    }
  }

  private async tryDirectProofs(
    sequent: Sequent,
    depth: number,
    trail: Set<string>,
    currentDepth: number,
  ): Promise<ProofNode | null> {
    if (sequent.hasInContext(sequent.goal)) {
      return makeLeaf(sequent, "axiom");
    }

    if (isExcludedMiddleFormula(sequent.goal)) {
      return makeLeaf(sequent, "te");
    }

    switch (sequent.goal.type) {
      case "imp": {
        const antecedent = sequent.goal.left;
        const consequent = sequent.goal.right;
        const premiseSequent = sequent.addToContext(antecedent).withGoal(consequent);
        const premise = await this.prove(premiseSequent, depth - 1, trail, currentDepth + 1);
        if (!premise) {
          return null;
        }

        return makeUnaryNode(sequent, "imp-intro", premise, {
          formula: antecedent.clone(),
        });
      }

      case "and": {
        const leftProof = await this.prove(
          sequent.withGoal(sequent.goal.left),
          depth - 1,
          trail,
          currentDepth + 1,
        );
        if (!leftProof) {
          return null;
        }

        const rightProof = await this.prove(
          sequent.withGoal(sequent.goal.right),
          depth - 1,
          trail,
          currentDepth + 1,
        );
        if (!rightProof) {
          return null;
        }

        return makeBinaryNode(sequent, "and-intro", leftProof, rightProof);
      }

      case "or": {
        const leftProof = await this.prove(
          sequent.withGoal(sequent.goal.left),
          depth - 1,
          trail,
          currentDepth + 1,
        );
        if (leftProof) {
          return makeUnaryNode(sequent, "or-intro-left", leftProof);
        }

        const rightProof = await this.prove(
          sequent.withGoal(sequent.goal.right),
          depth - 1,
          trail,
          currentDepth + 1,
        );
        if (rightProof) {
          return makeUnaryNode(sequent, "or-intro-right", rightProof);
        }

        return null;
      }

      case "neg": {
        const premiseSequent = sequent
          .addToContext(sequent.goal.inner)
          .withGoal(Formula.bot());
        const premise = await this.prove(premiseSequent, depth - 1, trail, currentDepth + 1);
        if (!premise) {
          return null;
        }

        return makeUnaryNode(sequent, "neg-intro", premise, {
          formula: sequent.goal.inner.clone(),
        });
      }

      default:
        return null;
    }
  }

  private async tryEliminationProofs(
    sequent: Sequent,
    depth: number,
    trail: Set<string>,
    currentDepth: number,
  ): Promise<ProofNode | null> {
    const implicationCandidates = this.prioritizeImplicationCandidates(sequent.goal);

    for (const implication of implicationCandidates) {
      const implicationProof = await this.prove(
        sequent.withGoal(implication),
        depth - 1,
        trail,
        currentDepth + 1,
      );
      if (!implicationProof) {
        continue;
      }

      const antecedentProof = await this.prove(
        sequent.withGoal(implication.left),
        depth - 1,
        trail,
        currentDepth + 1,
      );
      if (!antecedentProof) {
        continue;
      }

      return makeBinaryNode(sequent, "imp-elim", implicationProof, antecedentProof);
    }

    const conjunctionCandidates = this.prioritizeConjunctionCandidates(sequent.goal);

    for (const conjunction of conjunctionCandidates) {
      const premise = await this.prove(
        sequent.withGoal(conjunction),
        depth - 1,
        trail,
        currentDepth + 1,
      );
      if (!premise) {
        continue;
      }

      if (conjunction.left.equals(sequent.goal)) {
        return makeUnaryNode(sequent, "and-elim-left", premise);
      }

      return makeUnaryNode(sequent, "and-elim-right", premise);
    }

    const disjunctionCandidates = this.prioritizeDisjunctionCandidates(sequent.context);

    for (const disjunction of disjunctionCandidates) {
      const disjunctionProof = await this.prove(
        sequent.withGoal(disjunction),
        depth - 1,
        trail,
        currentDepth + 1,
      );
      if (!disjunctionProof) {
        continue;
      }

      const leftBranch = await this.prove(
        sequent.addToContext(disjunction.left),
        depth - 1,
        trail,
        currentDepth + 1,
      );
      if (!leftBranch) {
        continue;
      }

      const rightBranch = await this.prove(
        sequent.addToContext(disjunction.right),
        depth - 1,
        trail,
        currentDepth + 1,
      );
      if (!rightBranch) {
        continue;
      }

      return makeOrElimNode(
        sequent,
        disjunctionProof,
        leftBranch,
        rightBranch,
        disjunction.left,
        disjunction.right,
      );
    }

    if (sequent.goal.type === "bot") {
      const contradiction = await this.tryContradiction(sequent, depth, trail, currentDepth);
      if (contradiction) {
        return contradiction;
      }
    } else {
      const bottomProof = await this.prove(
        sequent.withGoal(Formula.bot()),
        depth - 1,
        trail,
        currentDepth + 1,
      );
      if (bottomProof) {
        return makeUnaryNode(sequent, "bot-elim", bottomProof);
      }

      const raaPremise = await this.prove(
        sequent.addToContext(Formula.neg(sequent.goal)).withGoal(Formula.bot()),
        depth - 1,
        trail,
        currentDepth + 1,
      );

      if (raaPremise) {
        return makeUnaryNode(sequent, "raa", raaPremise, {
          formula: Formula.neg(sequent.goal).clone(),
        });
      }
    }

    return null;
  }

  private async tryContradiction(
    sequent: Sequent,
    depth: number,
    trail: Set<string>,
    currentDepth: number,
  ): Promise<ProofNode | null> {
    const candidates = prioritizeFormulas(this.formulaPool, sequent.context);

    for (const candidate of candidates) {
      const positiveProof = await this.prove(
        sequent.withGoal(candidate),
        depth - 1,
        trail,
        currentDepth + 1,
      );
      if (!positiveProof) {
        continue;
      }

      const negativeProof = await this.prove(
        sequent.withGoal(Formula.neg(candidate)),
        depth - 1,
        trail,
        currentDepth + 1,
      );
      if (!negativeProof) {
        continue;
      }

      return makeBinaryNode(sequent, "neg-elim", positiveProof, negativeProof);
    }

    return null;
  }

  private prioritizeImplicationCandidates(goal: Formula): Formula[] {
    return prioritizeFormulas(
      this.formulaPool.filter(
        (formula): formula is Formula =>
          formula.type === "imp" && formula.right.equals(goal),
      ),
      this.rootContext,
    );
  }

  private prioritizeConjunctionCandidates(goal: Formula): Formula[] {
    return prioritizeFormulas(
      this.formulaPool.filter(
        (formula): formula is Formula =>
          formula.type === "and" &&
          (formula.left.equals(goal) || formula.right.equals(goal)),
      ),
      this.rootContext,
    );
  }

  private prioritizeDisjunctionCandidates(context: Formula[]): Formula[] {
    return prioritizeFormulas(
      normalizeContext(context).filter(
        (formula): formula is Formula => formula.type === "or",
      ),
      context,
    );
  }
}

export const solveProof = async (
  goal: Formula,
  hypotheses: Formula[],
  options: ProofSearchOptions = {},
): Promise<ProofSearchResult> => {
  const searcher = new ProofSearcher(goal, hypotheses, options);
  return searcher.search();
};