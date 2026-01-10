// Exercise definitions

import { Formula, FormulaParser } from './formulas';

export type RuleType = '→I' | '→E' | '∧I' | '∧E' | '∨I' | '∨E' | '¬I' | '¬E' | '⊥E' | 'RAA';

export interface Exercise {
    id: number;
    title: string;
    description: string;
    goal: string;
    hypotheses: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    hint: string;
    rules: RuleType[];
}

export interface ParsedExercise extends Exercise {
    goalFormula: Formula;
    hypothesesFormulas: Formula[];
}

export const exercises: Exercise[] = [
    {
        id: 1,
        title: "Identity",
        description: "Prove that A implies A",
        goal: "A -> A",
        hypotheses: [],
        difficulty: "easy",
        hint: "Use implication introduction, then axiom",
        rules: ['→I']
    },
    {
        id: 2,
        title: "Modus Ponens",
        description: "From A → B and A, derive B",
        goal: "B",
        hypotheses: ["A -> B", "A"],
        difficulty: "easy",
        hint: "Use implication elimination",
        rules: ['→E']
    },
    {
        id: 3,
        title: "Conjunction Elimination",
        description: "From A ∧ B, derive A",
        goal: "A",
        hypotheses: ["A & B"],
        difficulty: "easy",
        hint: "Use conjunction elimination left",
        rules: ['∧E']
    },
    {
        id: 4,
        title: "Conjunction Introduction",
        description: "From A and B, derive A ∧ B",
        goal: "A & B",
        hypotheses: ["A", "B"],
        difficulty: "easy",
        hint: "Use conjunction introduction",
        rules: ['∧I']
    },
    {
        id: 5,
        title: "Disjunction Introduction",
        description: "From A, derive A ∨ B",
        goal: "A | B",
        hypotheses: ["A"],
        difficulty: "easy",
        hint: "Use disjunction introduction left",
        rules: ['∨I']
    },
    {
        id: 6,
        title: "Hypothetical Syllogism",
        description: "Chain two implications",
        goal: "(A -> B) -> (B -> C) -> (A -> C)",
        hypotheses: [],
        difficulty: "medium",
        hint: "Use implication introduction three times, then elimination",
        rules: ['→I', '→E']
    },
    {
        id: 7,
        title: "Conjunction Commutativity",
        description: "Prove that conjunction is commutative",
        goal: "(A & B) -> (B & A)",
        hypotheses: [],
        difficulty: "medium",
        hint: "Introduce the implication, eliminate the conjunction, then reintroduce",
        rules: ['→I', '∧I', '∧E']
    },
    {
        id: 8,
        title: "Disjunction from Implication",
        description: "From A → B and A, derive A ∨ B",
        goal: "A | B",
        hypotheses: ["A -> B", "A"],
        difficulty: "medium",
        hint: "You can derive B, then introduce the disjunction",
        rules: ['→E', '∨I']
    },
    {
        id: 9,
        title: "Currying",
        description: "Transform a binary function to curried form",
        goal: "(A & B -> C) -> (A -> B -> C)",
        hypotheses: [],
        difficulty: "medium",
        hint: "Introduce implications step by step",
        rules: ['→I', '→E', '∧I']
    },
    {
        id: 10,
        title: "Uncurrying",
        description: "Transform a curried function to binary form",
        goal: "(A -> B -> C) -> (A & B -> C)",
        hypotheses: [],
        difficulty: "medium",
        hint: "Use conjunction elimination to get the arguments",
        rules: ['→I', '→E', '∧E']
    },
    {
        id: 11,
        title: "Disjunction Commutativity",
        description: "Prove that disjunction is commutative",
        goal: "(A | B) -> (B | A)",
        hypotheses: [],
        difficulty: "medium",
        hint: "Use disjunction elimination with case analysis",
        rules: ['→I', '∨I', '∨E']
    },
    {
        id: 12,
        title: "Distribution (∧ over ∨)",
        description: "Distribute conjunction over disjunction",
        goal: "(A & (B | C)) -> ((A & B) | (A & C))",
        hypotheses: [],
        difficulty: "medium",
        hint: "Eliminate conjunction, then do case analysis on the disjunction",
        rules: ['→I', '∧I', '∧E', '∨I', '∨E']
    },
    {
        id: 13,
        title: "Contraposition (one direction)",
        description: "Prove one direction of contraposition",
        goal: "(A -> B) -> (¬B -> ¬A)",
        hypotheses: [],
        difficulty: "medium",
        hint: "Use negation introduction and elimination",
        rules: ['→I', '→E', '¬I', '¬E']
    },
    {
        id: 14,
        title: "Double Negation Introduction",
        description: "Prove that A implies ¬¬A",
        goal: "A -> ¬¬A",
        hypotheses: [],
        difficulty: "medium",
        hint: "Use negation introduction: assume ¬A and derive ⊥",
        rules: ['→I', '¬I', '¬E']
    },
    {
        id: 15,
        title: "Modus Tollens",
        description: "From A → B and ¬B, derive ¬A",
        goal: "¬A",
        hypotheses: ["A -> B", "¬B"],
        difficulty: "medium",
        hint: "Assume A, derive B, then use ¬B to get ⊥",
        rules: ['→E', '¬I', '¬E']
    },
    {
        id: 16,
        title: "Double Negation Elimination",
        description: "Prove that ¬¬A implies A (requires classical logic)",
        goal: "¬¬A -> A",
        hypotheses: [],
        difficulty: "hard",
        hint: "Use RAA: assume ¬A and derive ⊥ from ¬¬A and ¬A",
        rules: ['→I', '¬E', 'RAA']
    },
    {
        id: 17,
        title: "Excluded Middle",
        description: "Prove the law of excluded middle (requires classical logic)",
        goal: "A | ¬A",
        hypotheses: [],
        difficulty: "hard",
        hint: "Use RAA at the top level, then work with ¬(A ∨ ¬A)",
        rules: ['∨I', '¬I', '¬E', 'RAA']
    },
    {
        id: 18,
        title: "Peirce's Law",
        description: "Prove Peirce's Law (requires classical logic)",
        goal: "((A -> B) -> A) -> A",
        hypotheses: [],
        difficulty: "hard",
        hint: "Use RAA and work backwards from ¬A",
        rules: ['→I', '→E', '⊥E', 'RAA']
    },
    {
        id: 19,
        title: "De Morgan (¬(A ∧ B) → ¬A ∨ ¬B)",
        description: "Prove one of De Morgan's laws (requires classical logic)",
        goal: "¬(A & B) -> (¬A | ¬B)",
        hypotheses: [],
        difficulty: "hard",
        hint: "Use RAA and negation rules extensively",
        rules: ['→I', '∧I', '∨I', '¬I', '¬E', 'RAA']
    },
    {
        id: 20,
        title: "De Morgan (¬(A ∨ B) → ¬A ∧ ¬B)",
        description: "Prove the other De Morgan's law",
        goal: "¬(A | B) -> (¬A & ¬B)",
        hypotheses: [],
        difficulty: "hard",
        hint: "Use negation introduction for each conjunct",
        rules: ['→I', '∧I', '∨I', '¬I', '¬E']
    },
    {
        id: 21,
        title: "Constructive Dilemma",
        description: "A complex reasoning pattern",
        goal: "(A -> B) -> (C -> D) -> (A | C) -> (B | D)",
        hypotheses: [],
        difficulty: "hard",
        hint: "Use disjunction elimination on A ∨ C",
        rules: ['→I', '→E', '∨I', '∨E']
    },
    {
        id: 22,
        title: "Explosion (Ex Falso)",
        description: "From a contradiction, derive anything",
        goal: "(A & ¬A) -> B",
        hypotheses: [],
        difficulty: "medium",
        hint: "Use negation elimination to get ⊥, then ex falso",
        rules: ['→I', '∧E', '¬E', '⊥E']
    },
    {
        id: 23,
        title: "Negation of Implication",
        description: "Prove that ¬(A → B) implies A (requires classical logic)",
        goal: "¬(A -> B) -> A",
        hypotheses: [],
        difficulty: "hard",
        hint: "Use RAA: assume ¬A and try to prove A → B",
        rules: ['→I', '⊥E', 'RAA']
    },
    {
        id: 24,
        title: "Complex Derivation",
        description: "A multi-step derivation combining several rules",
        goal: "((A -> B) & (B -> C) & A) -> C",
        hypotheses: [],
        difficulty: "medium",
        hint: "Eliminate the conjunctions and chain the implications",
        rules: ['→I', '→E', '∧E']
    }
];

export const allRules: RuleType[] = ['→I', '→E', '∧I', '∧E', '∨I', '∨E', '¬I', '¬E', '⊥E', 'RAA'];

export function parseExercise(exercise: Exercise): ParsedExercise {
    return {
        ...exercise,
        goalFormula: FormulaParser.parse(exercise.goal),
        hypothesesFormulas: exercise.hypotheses.map(h => FormulaParser.parse(h))
    };
}
