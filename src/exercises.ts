// Exercise definitions

import { Formula, FormulaParser } from './formulas';

export type RuleType = '\\to_i' | '\\to_e' | '\\wedge_i' | '\\wedge_e' | '\\vee_i' | '\\vee_e' | '\\neg_i' | '\\neg_e' | '\\bot_e' | '\\mathrm{raa}';

export interface Exercise {
    id: number;
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
        id: 1,
        goal: "A -> A",
        hypotheses: [],
        difficulty: "easy",
        rules: ['\\to_i']
    },
    {
        id: 2,
        goal: "B",
        hypotheses: ["A -> B", "A"],
        difficulty: "easy",
        rules: ['\\to_e']
    },
    {
        id: 3,
        goal: "A",
        hypotheses: ["A & B"],
        difficulty: "easy",
        rules: ['\\wedge_e']
    },
    {
        id: 4,
        goal: "A & B",
        hypotheses: ["A", "B"],
        difficulty: "easy",
        rules: ['\\wedge_i']
    },
    {
        id: 5,
        goal: "A | B",
        hypotheses: ["A"],
        difficulty: "easy",
        rules: ['\\vee_i']
    },
    {
        id: 6,
        goal: "(A -> B) -> (B -> C) -> (A -> C)",
        hypotheses: [],
        difficulty: "medium",
        rules: ['\\to_i', '\\to_e']
    },
    {
        id: 7,
        goal: "(A & B) -> (B & A)",
        hypotheses: [],
        difficulty: "medium",
        rules: ['\\to_i', '\\wedge_i', '\\wedge_e']
    },
    {
        id: 8,
        goal: "A & B",
        hypotheses: ["A -> B", "A"],
        difficulty: "medium",
        rules: ['\\to_e', '\\wedge_i']
    },
    {
        id: 9,
        goal: "(A & B -> C) -> (A -> B -> C)",
        hypotheses: [],
        difficulty: "medium",
        rules: ['\\to_i', '\\to_e', '\\wedge_i']
    },
    {
        id: 10,
        goal: "(A -> B -> C) -> (A & B -> C)",
        hypotheses: [],
        difficulty: "medium",
        rules: ['\\to_i', '\\to_e', '\\wedge_e']
    },
    {
        id: 11,
        goal: "(A | B) -> (B | A)",
        hypotheses: [],
        difficulty: "medium",
        rules: ['\\to_i', '\\vee_i', '\\vee_e']
    },
    {
        id: 12,
        goal: "(A & (B | C)) -> ((A & B) | (A & C))",
        hypotheses: [],
        difficulty: "medium",
        rules: ['\\to_i', '\\wedge_i', '\\wedge_e', '\\vee_i', '\\vee_e']
    },
    {
        id: 13,
        goal: "(A -> B) -> (!B -> !A)",
        hypotheses: [],
        difficulty: "medium",
        rules: ['\\to_i', '\\to_e', '\\neg_i', '\\neg_e']
    },
    {
        id: 14,
        goal: "A -> !!A",
        hypotheses: [],
        difficulty: "medium",
        rules: ['\\to_i', '\\neg_i', '\\neg_e']
    },
    {
        id: 15,
        goal: "!A",
        hypotheses: ["A -> B", "!B"],
        difficulty: "medium",
        rules: ['\\to_e', '\\neg_i', '\\neg_e']
    },
    {
        id: 16,
        goal: "!!A -> A",
        hypotheses: [],
        difficulty: "hard",
        rules: ['\\to_i', '\\neg_e', '\\mathrm{raa}']
    },
    {
        id: 17,
        goal: "A | !A",
        hypotheses: [],
        difficulty: "hard",
        rules: ['\\vee_i', '\\neg_i', '\\neg_e', '\\mathrm{raa}']
    },
    {
        id: 18,
        goal: "((A -> B) -> A) -> A",
        hypotheses: [],
        difficulty: "hard",
        rules: ['\\to_i', '\\to_e', '\\bot_e', '\\mathrm{raa}']
    },
    {
        id: 19,
        goal: "!(A & B) -> (!A | !B)",
        hypotheses: [],
        difficulty: "hard",
        rules: ['\\to_i', '\\wedge_i', '\\vee_i', '\\neg_i', '\\neg_e', '\\mathrm{raa}']
    },
    {
        id: 20,
        goal: "!(A | B) -> (!A & !B)",
        hypotheses: [],
        difficulty: "hard",
        rules: ['\\to_i', '\\wedge_i', '\\vee_i', '\\neg_i', '\\neg_e']
    },
    {
        id: 21,
        goal: "(A -> B) -> (C -> D) -> (A | C) -> (B | D)",
        hypotheses: [],
        difficulty: "hard",
        rules: ['\\to_i', '\\to_e', '\\vee_i', '\\vee_e']
    },
    {
        id: 22,
        goal: "(A & !A) -> B",
        hypotheses: [],
        difficulty: "medium",
        rules: ['\\to_i', '\\wedge_e', '\\neg_e', '\\bot_e']
    },
    {
        id: 23,
        goal: "!(A -> B) -> A",
        hypotheses: [],
        difficulty: "hard",
        rules: ['\\to_i', '\\bot_e', '\\mathrm{raa}']
    },
    {
        id: 24,
        goal: "((A -> B) & (B -> C) & A) -> C",
        hypotheses: [],
        difficulty: "medium",
        rules: ['\\to_i', '\\to_e', '\\wedge_e']
    }
];

export const allRules: RuleType[] = ['\\to_i', '\\to_e', '\\wedge_i', '\\wedge_e', '\\vee_i', '\\vee_e', '\\neg_i', '\\neg_e', '\\bot_e', '\\mathrm{raa}'];

export function parseExercise(exercise: Exercise): ParsedExercise {
    return {
        ...exercise,
        goalFormula: FormulaParser.parse(exercise.goal),
        hypothesesFormulas: exercise.hypotheses.map(h => FormulaParser.parse(h))
    };
}
