// Exercise definitions

import { Formula, FormulaParser } from "./formulas";
import { RuleOperator } from "./rules";

export type RuleType = RuleOperator;

export interface Exercise {
  goal: string;
  hypotheses: string[];
  difficulty: "easy" | "medium" | "hard";
  rules: RuleType[];
}

export interface ParsedExercise extends Exercise {
  goalFormula: Formula;
  hypothesesFormulas: Formula[];
}

export const exercises: Exercise[] = [
  {
    goal: "A -> A",
    hypotheses: [],
    difficulty: "easy",
    rules: ["imp"],
  },
  {
    goal: "B",
    hypotheses: ["A -> B", "A"],
    difficulty: "easy",
    rules: ["imp"],
  },
  {
    goal: "A",
    hypotheses: ["A & B"],
    difficulty: "easy",
    rules: ["and"],
  },
  {
    goal: "A & B",
    hypotheses: ["A", "B"],
    difficulty: "easy",
    rules: ["and"],
  },
  {
    goal: "A | B",
    hypotheses: ["A"],
    difficulty: "easy",
    rules: ["or"],
  },
  {
    goal: "(A -> B) -> (B -> C) -> (A -> C)",
    hypotheses: [],
    difficulty: "medium",
    rules: ["imp"],
  },
  {
    goal: "(A & B) -> (B & A)",
    hypotheses: [],
    difficulty: "medium",
    rules: ["imp", "and"],
  },
  {
    goal: "A & B",
    hypotheses: ["A -> B", "A"],
    difficulty: "medium",
    rules: ["imp", "and"],
  },
  {
    goal: "(A & B -> C) -> (A -> B -> C)",
    hypotheses: [],
    difficulty: "medium",
    rules: ["imp", "and"],
  },
  {
    goal: "(A -> B -> C) -> (A & B -> C)",
    hypotheses: [],
    difficulty: "medium",
    rules: ["imp", "and"],
  },
  {
    goal: "A",
    hypotheses: ["A | 0"],
    difficulty: "medium",
    rules: ["or", "bot"],
  },
  {
    goal: "(A | B) -> (B | A)",
    hypotheses: [],
    difficulty: "medium",
    rules: ["imp", "or"],
  },
  {
    goal: "(A & (B | C)) -> ((A & B) | (A & C))",
    hypotheses: [],
    difficulty: "medium",
    rules: ["imp", "and", "or"],
  },
  {
    goal: "(A -> B) -> (!B -> !A)",
    hypotheses: [],
    difficulty: "medium",
    rules: ["imp", "neg"],
  },
  {
    goal: "A -> !!A",
    hypotheses: [],
    difficulty: "medium",
    rules: ["imp", "neg"],
  },
  {
    goal: "!A",
    hypotheses: ["A -> B", "!B"],
    difficulty: "medium",
    rules: ["imp", "neg"],
  },
  {
    goal: "((A -> B) & (B -> C) & A) -> C",
    hypotheses: [],
    difficulty: "medium",
    rules: ["imp", "and"],
  },
  {
    goal: "(A & !A) -> B",
    hypotheses: [],
    difficulty: "medium",
    rules: ["imp", "and", "neg", "bot"],
  },
  {
    goal: "!!A -> A",
    hypotheses: [],
    difficulty: "hard",
    rules: ["imp", "neg", "raa"],
  },
  {
    goal: "A | !A",
    hypotheses: [],
    difficulty: "hard",
    rules: ["or", "neg", "raa"],
  },
  {
    goal: "((A -> B) -> A) -> A",
    hypotheses: [],
    difficulty: "hard",
    rules: ["imp", "bot", "raa"],
  },
  {
    goal: "(A -> B) -> (C -> D) -> (A | C) -> (B | D)",
    hypotheses: [],
    difficulty: "hard",
    rules: ["imp", "or"],
  },
  {
    goal: "!(A -> B) -> A",
    hypotheses: [],
    difficulty: "hard",
    rules: ["imp", "bot", "raa"],
  },
  {
    goal: "!(A & B)",
    hypotheses: ["!A | !B"],
    difficulty: "hard",
    rules: ["and", "or", "neg"],
  },
  {
    goal: "!A & !B",
    hypotheses: ["!(A | B)"],
    difficulty: "hard",
    rules: ["and", "or", "neg"],
  },
  {
    goal: "!(A | B)",
    hypotheses: ["!A & !B"],
    difficulty: "hard",
    rules: ["and", "or", "neg"],
  },
  {
    goal: "!A | !B",
    hypotheses: ["!(A & B)"],
    difficulty: "hard",
    rules: ["and", "or", "neg", "te"],
  },
];

export function parseExercise(exercise: Exercise): ParsedExercise {
  return {
    ...exercise,
    goalFormula: FormulaParser.parse(exercise.goal),
    hypothesesFormulas: exercise.hypotheses.map((h) => FormulaParser.parse(h)),
  };
}

export function getExerciseKey(exercise: Exercise): string {
  return [
    exercise.goal,
    exercise.hypotheses.join("|"),
    exercise.difficulty,
    exercise.rules.join("|"),
  ].join("::");
}
