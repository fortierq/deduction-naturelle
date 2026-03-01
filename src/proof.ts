// Proof tree structure and logic with full sequents

import { Formula } from './formulas';
import { Sequent } from './sequent';

export type RuleName = 
    | 'axiom' 
    | '→I' | '→E' 
    | '∧I' | '∧E₁' | '∧E₂'
    | '∨I₁' | '∨I₂' | '∨E'
    | '¬I' | '¬E'
    | '⊥E' | 'raa';

export interface DischargedAssumption {
    formula: Formula;
    label?: string;
}

export interface DischargedPair {
    left: Formula;
    right: Formula;
}

export class ProofNode {
    private static nextId = 1;
    
    public id: number;
    public rule: RuleName | null = null;
    public premises: ProofNode[] = [];
    public dischargedAssumption: DischargedAssumption | DischargedPair | null = null;
    public isComplete: boolean = false;

    constructor(public sequent: Sequent) {
        this.id = ProofNode.nextId++;
    }

    static reset(): void {
        ProofNode.nextId = 1;
    }

    clone(): ProofNode {
        const node = new ProofNode(this.sequent.clone());
        node.id = this.id;
        node.rule = this.rule;
        node.premises = this.premises.map(p => p.clone());
        node.isComplete = this.isComplete;
        
        if (this.dischargedAssumption) {
            if ('left' in this.dischargedAssumption) {
                node.dischargedAssumption = {
                    left: this.dischargedAssumption.left.clone(),
                    right: this.dischargedAssumption.right.clone()
                };
            } else {
                node.dischargedAssumption = {
                    formula: this.dischargedAssumption.formula.clone(),
                    label: this.dischargedAssumption.label
                };
            }
        }
        
        return node;
    }
}

export interface ProofResult {
    success: boolean;
    error?: string;
}

export type ProofMessageKey =
    | 'noGoalSelected'
    | 'goalMustBeFalsum'
    | 'proofHypothesisNotInContext'
    | 'proofHypothesisGoalMismatch'
    | 'proofGoalNotImplication'
    | 'proofSelectedNotImplication'
    | 'proofImplicationConclusionMismatch'
    | 'proofGoalNotConjunction'
    | 'proofSelectedNotConjunction'
    | 'proofConjunctionLeftMismatch'
    | 'proofConjunctionRightMismatch'
    | 'proofGoalNotDisjunction'
    | 'proofSelectedNotDisjunction'
    | 'proofGoalNotNegation';

type ProofMessages = Record<ProofMessageKey, string>;

const defaultProofMessages: ProofMessages = {
    noGoalSelected: 'No goal selected',
    goalMustBeFalsum: 'Goal must be ⊥ (falsum)',
    proofHypothesisNotInContext: 'Hypothesis not available in current context',
    proofHypothesisGoalMismatch: 'Hypothesis does not match the goal',
    proofGoalNotImplication: 'Goal is not an implication',
    proofSelectedNotImplication: 'Selected formula is not an implication',
    proofImplicationConclusionMismatch: 'Conclusion of implication does not match the goal',
    proofGoalNotConjunction: 'Goal is not a conjunction',
    proofSelectedNotConjunction: 'Selected formula is not a conjunction',
    proofConjunctionLeftMismatch: 'Left side of conjunction does not match the goal',
    proofConjunctionRightMismatch: 'Right side of conjunction does not match the goal',
    proofGoalNotDisjunction: 'Goal is not a disjunction',
    proofSelectedNotDisjunction: 'Selected formula is not a disjunction',
    proofGoalNotNegation: 'Goal is not a negation'
};

interface ProofState {
    root: ProofNode;
    selectedId: number;
}

export class ProofTree {
    public root: ProofNode;
    public selectedNode: ProofNode | null;
    private history: ProofState[] = [];
    private messages: ProofMessages;

    constructor(goal: Formula, hypotheses: Formula[] = [], messages?: Partial<ProofMessages>) {
        ProofNode.reset();
        const sequent = new Sequent(hypotheses, goal);
        this.root = new ProofNode(sequent);
        this.selectedNode = this.root;
        this.messages = {
            ...defaultProofMessages,
            ...messages
        };
    }

    private fail(key: ProofMessageKey): ProofResult {
        return { success: false, error: this.messages[key] };
    }

    saveState(): void {
        this.history.push({
            root: this.cloneTree(this.root),
            selectedId: this.selectedNode?.id ?? this.root.id
        });
    }

    private cloneTree(node: ProofNode): ProofNode {
        const clone = node.clone();
        clone.premises = node.premises.map(p => this.cloneTree(p));
        return clone;
    }

    undo(): boolean {
        if (this.history.length === 0) return false;
        const state = this.history.pop()!;
        this.root = state.root;
        this.selectedNode = this.findNodeById(this.root, state.selectedId) || this.findFirstOpenGoal();
        return true;
    }

    findNodeById(node: ProofNode, id: number): ProofNode | null {
        if (node.id === id) return node;
        for (const premise of node.premises) {
            const found = this.findNodeById(premise, id);
            if (found) return found;
        }
        return null;
    }

    findFirstOpenGoal(): ProofNode | null {
        return this.findOpenGoalInNode(this.root);
    }

    private findOpenGoalInNode(node: ProofNode): ProofNode | null {
        if (!node.isComplete && node.rule === null) {
            return node;
        }
        for (const premise of node.premises) {
            const found = this.findOpenGoalInNode(premise);
            if (found) return found;
        }
        return null;
    }

    isComplete(): boolean {
        return this.isNodeComplete(this.root);
    }

    private isNodeComplete(node: ProofNode): boolean {
        if (!node.isComplete && node.rule === null) return false;
        return node.premises.every(p => this.isNodeComplete(p));
    }

    applyAxiom(hypothesis: Formula): ProofResult {
        if (!this.selectedNode) return this.fail('noGoalSelected');
        
        const node = this.selectedNode;
        const sequent = node.sequent;
        
        if (!sequent.hasInContext(hypothesis)) {
            return this.fail('proofHypothesisNotInContext');
        }
        
        if (!sequent.goal.equals(hypothesis)) {
            return this.fail('proofHypothesisGoalMismatch');
        }

        this.saveState();
        node.rule = 'axiom';
        node.isComplete = true;
        this.selectedNode = this.findFirstOpenGoal();
        return { success: true };
    }

    applyImplIntro(): ProofResult {
        if (!this.selectedNode) return this.fail('noGoalSelected');
        
        const node = this.selectedNode;
        const goal = node.sequent.goal;
        
        if (goal.type !== 'impl') {
            return this.fail('proofGoalNotImplication');
        }

        this.saveState();
        const antecedent = goal.left;
        const consequent = goal.right;
        const newSequent = node.sequent.addToContext(antecedent).withGoal(consequent);
        
        const premise = new ProofNode(newSequent);
        node.rule = '→I';
        node.premises = [premise];
        node.dischargedAssumption = { formula: antecedent };
        
        this.selectedNode = premise;
        return { success: true };
    }

    applyImplElim(implFormula: Formula): ProofResult {
        if (!this.selectedNode) return this.fail('noGoalSelected');
        
        const node = this.selectedNode;
        
        if (implFormula.type !== 'impl') {
            return this.fail('proofSelectedNotImplication');
        }
        
        if (!implFormula.right.equals(node.sequent.goal)) {
            return this.fail('proofImplicationConclusionMismatch');
        }

        this.saveState();
        const premise1 = new ProofNode(node.sequent.withGoal(implFormula));
        const premise2 = new ProofNode(node.sequent.withGoal(implFormula.left));
        
        node.rule = '→E';
        node.premises = [premise1, premise2];
        
        this.selectedNode = premise1;
        return { success: true };
    }

    applyAndIntro(): ProofResult {
        if (!this.selectedNode) return this.fail('noGoalSelected');
        
        const node = this.selectedNode;
        const goal = node.sequent.goal;
        
        if (goal.type !== 'and') {
            return this.fail('proofGoalNotConjunction');
        }

        this.saveState();
        const premise1 = new ProofNode(node.sequent.withGoal(goal.left));
        const premise2 = new ProofNode(node.sequent.withGoal(goal.right));
        
        node.rule = '∧I';
        node.premises = [premise1, premise2];
        
        this.selectedNode = premise1;
        return { success: true };
    }

    applyAndElimLeft(conjFormula: Formula): ProofResult {
        if (!this.selectedNode) return this.fail('noGoalSelected');
        
        const node = this.selectedNode;
        
        if (conjFormula.type !== 'and') {
            return this.fail('proofSelectedNotConjunction');
        }
        
        if (!conjFormula.left.equals(node.sequent.goal)) {
            return this.fail('proofConjunctionLeftMismatch');
        }

        this.saveState();
        const premise = new ProofNode(node.sequent.withGoal(conjFormula));
        
        node.rule = '∧E₁';
        node.premises = [premise];
        
        this.selectedNode = premise;
        return { success: true };
    }

    applyAndElimRight(conjFormula: Formula): ProofResult {
        if (!this.selectedNode) return this.fail('noGoalSelected');
        
        const node = this.selectedNode;
        
        if (conjFormula.type !== 'and') {
            return this.fail('proofSelectedNotConjunction');
        }
        
        if (!conjFormula.right.equals(node.sequent.goal)) {
            return this.fail('proofConjunctionRightMismatch');
        }

        this.saveState();
        const premise = new ProofNode(node.sequent.withGoal(conjFormula));
        
        node.rule = '∧E₂';
        node.premises = [premise];
        
        this.selectedNode = premise;
        return { success: true };
    }

    applyOrIntroLeft(): ProofResult {
        if (!this.selectedNode) return this.fail('noGoalSelected');
        
        const node = this.selectedNode;
        const goal = node.sequent.goal;
        
        if (goal.type !== 'or') {
            return this.fail('proofGoalNotDisjunction');
        }

        this.saveState();
        const premise = new ProofNode(node.sequent.withGoal(goal.left));
        
        node.rule = '∨I₁';
        node.premises = [premise];
        
        this.selectedNode = premise;
        return { success: true };
    }

    applyOrIntroRight(): ProofResult {
        if (!this.selectedNode) return this.fail('noGoalSelected');
        
        const node = this.selectedNode;
        const goal = node.sequent.goal;
        
        if (goal.type !== 'or') {
            return this.fail('proofGoalNotDisjunction');
        }

        this.saveState();
        const premise = new ProofNode(node.sequent.withGoal(goal.right));
        
        node.rule = '∨I₂';
        node.premises = [premise];
        
        this.selectedNode = premise;
        return { success: true };
    }

    applyOrElim(disjFormula: Formula): ProofResult {
        if (!this.selectedNode) return this.fail('noGoalSelected');
        
        const node = this.selectedNode;
        
        if (disjFormula.type !== 'or') {
            return this.fail('proofSelectedNotDisjunction');
        }

        this.saveState();
        const left = disjFormula.left;
        const right = disjFormula.right;
        
        const premise1 = new ProofNode(node.sequent.withGoal(disjFormula));
        const premise2 = new ProofNode(node.sequent.addToContext(left));
        const premise3 = new ProofNode(node.sequent.addToContext(right));
        
        node.rule = '∨E';
        node.premises = [premise1, premise2, premise3];
        node.dischargedAssumption = { left, right };
        
        this.selectedNode = premise1;
        return { success: true };
    }

    applyNegIntro(): ProofResult {
        if (!this.selectedNode) return this.fail('noGoalSelected');
        
        const node = this.selectedNode;
        const goal = node.sequent.goal;
        
        if (goal.type !== 'neg') {
            return this.fail('proofGoalNotNegation');
        }

        this.saveState();
        const inner = goal.inner;
        const newSequent = node.sequent.addToContext(inner).withGoal(Formula.bottom());
        
        const premise = new ProofNode(newSequent);
        node.rule = '¬I';
        node.premises = [premise];
        node.dischargedAssumption = { formula: inner };
        
        this.selectedNode = premise;
        return { success: true };
    }

    applyNegElim(formula: Formula): ProofResult {
        if (!this.selectedNode) return this.fail('noGoalSelected');
        
        const node = this.selectedNode;
        
        if (node.sequent.goal.type !== 'bottom') {
            return this.fail('goalMustBeFalsum');
        }

        this.saveState();
        const negFormula = Formula.neg(formula);
        
        const premise1 = new ProofNode(node.sequent.withGoal(formula));
        const premise2 = new ProofNode(node.sequent.withGoal(negFormula));
        
        node.rule = '¬E';
        node.premises = [premise1, premise2];
        
        this.selectedNode = premise1;
        return { success: true };
    }

    applyAbsurd(): ProofResult {
        if (!this.selectedNode) return this.fail('noGoalSelected');
        
        const node = this.selectedNode;

        this.saveState();
        const premise = new ProofNode(node.sequent.withGoal(Formula.bottom()));
        
        node.rule = '⊥E';
        node.premises = [premise];
        
        this.selectedNode = premise;
        return { success: true };
    }

    applyraa(): ProofResult {
        if (!this.selectedNode) return this.fail('noGoalSelected');
        
        const node = this.selectedNode;

        this.saveState();
        const negGoal = Formula.neg(node.sequent.goal);
        const newSequent = node.sequent.addToContext(negGoal).withGoal(Formula.bottom());
        
        const premise = new ProofNode(newSequent);
        node.rule = 'raa';
        node.premises = [premise];
        node.dischargedAssumption = { formula: negGoal };
        
        this.selectedNode = premise;
        return { success: true };
    }
}
