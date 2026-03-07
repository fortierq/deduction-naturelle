// Exercise definitions

import { Formula, FormulaParser } from './formulas';
import { RuleOperator } from './rules';

export type RuleType = RuleOperator;

export interface Exercise {
    goal: string;
    hypotheses: string[];
    difficulty: 'easy' | 'medium' | 'hard';
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
        rules: ['impl']
    },
    {
        goal: "B",
        hypotheses: ["A -> B", "A"],
        difficulty: "easy",
        rules: ['impl']
    },
    {
        goal: "A",
        hypotheses: ["A & B"],
        difficulty: "easy",
        rules: ['and']
    },
    {
        goal: "A & B",
        hypotheses: ["A", "B"],
        difficulty: "easy",
        rules: ['and']
    },
    {
        goal: "A | B",
        hypotheses: ["A"],
        difficulty: "easy",
        rules: ['or']
    },
    {
        goal: "(A -> B) -> (B -> C) -> (A -> C)",
        hypotheses: [],
        difficulty: "medium",
        rules: ['impl']
    },
    {
        goal: "(A & B) -> (B & A)",
        hypotheses: [],
        difficulty: "medium",
        rules: ['impl', 'and']
    },
    {
        goal: "A & B",
        hypotheses: ["A -> B", "A"],
        difficulty: "medium",
        rules: ['impl', 'and']
    },
    {
        goal: "(A & B -> C) -> (A -> B -> C)",
        hypotheses: [],
        difficulty: "medium",
        rules: ['impl', 'and']
    },
    {
        goal: "(A -> B -> C) -> (A & B -> C)",
        hypotheses: [],
        difficulty: "medium",
        rules: ['impl', 'and']
    },
    {
        goal: "A",
        hypotheses: ["A | 0"],
        difficulty: "medium",
        rules: ['or', 'absurd']
    },
    {
        goal: "(A | B) -> (B | A)",
        hypotheses: [],
        difficulty: "medium",
        rules: ['impl', 'or']
    },
    {
        goal: "(A & (B | C)) -> ((A & B) | (A & C))",
        hypotheses: [],
        difficulty: "medium",
        rules: ['impl', 'and', 'or']
    },
    {
        goal: "(A -> B) -> (!B -> !A)",
        hypotheses: [],
        difficulty: "medium",
        rules: ['impl', 'neg']
    },
    {
        goal: "A -> !!A",
        hypotheses: [],
        difficulty: "medium",
        rules: ['impl', 'neg']
    },
    {
        goal: "!A",
        hypotheses: ["A -> B", "!B"],
        difficulty: "medium",
        rules: ['impl', 'neg']
    },
    {
        goal: "!!A -> A",
        hypotheses: [],
        difficulty: "hard",
        rules: ['impl', 'neg', 'raa']
    },
    {
        goal: "A | !A",
        hypotheses: [],
        difficulty: "hard",
        rules: ['or', 'neg', 'raa']
    },
    {
        goal: "((A -> B) -> A) -> A",
        hypotheses: [],
        difficulty: "hard",
        rules: ['impl', 'absurd', 'raa']
    },
    {
        goal: "!(A & B) -> (!A | !B)",
        hypotheses: [],
        difficulty: "hard",
        rules: ['impl', 'and', 'or', 'neg', 'raa']
    },
    {
        goal: "!(A | B) -> (!A & !B)",
        hypotheses: [],
        difficulty: "medium",
        rules: ['impl', 'and', 'or', 'neg']
    },
    {
        goal: "(A -> B) -> (C -> D) -> (A | C) -> (B | D)",
        hypotheses: [],
        difficulty: "hard",
        rules: ['impl', 'or']
    },
    {
        goal: "(A & !A) -> B",
        hypotheses: [],
        difficulty: "medium",
        rules: ['impl', 'and', 'neg', 'absurd']
    },
    {
        goal: "!(A -> B) -> A",
        hypotheses: [],
        difficulty: "hard",
        rules: ['impl', 'absurd', 'raa']
    },
    {
        goal: "((A -> B) & (B -> C) & A) -> C",
        hypotheses: [],
        difficulty: "medium",
        rules: ['impl', 'and']
    }
];

export function parseExercise(exercise: Exercise): ParsedExercise {
    return {
        ...exercise,
        goalFormula: FormulaParser.parse(exercise.goal),
        hypothesesFormulas: exercise.hypotheses.map(h => FormulaParser.parse(h))
    };
}

export function getExerciseKey(exercise: Exercise): string {
    return [
        exercise.goal,
        exercise.hypotheses.join('|'),
        exercise.difficulty,
        exercise.rules.join('|')
    ].join('::');
}
