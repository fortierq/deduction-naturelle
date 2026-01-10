// Sequent representation: Γ ⊢ A

import { Formula } from './formulas';

export class Sequent {
    constructor(
        public readonly context: Formula[],
        public readonly goal: Formula
    ) {}

    toDisplayString(): string {
        const contextStr = this.context.length > 0 
            ? this.context.map(f => f.toDisplayString()).join(', ')
            : '';
        return `${contextStr} ⊢ ${this.goal.toDisplayString()}`;
    }

    clone(): Sequent {
        return new Sequent(
            this.context.map(f => f.clone()),
            this.goal.clone()
        );
    }

    withGoal(newGoal: Formula): Sequent {
        return new Sequent(this.context.map(f => f.clone()), newGoal);
    }

    addToContext(formula: Formula): Sequent {
        return new Sequent([...this.context.map(f => f.clone()), formula.clone()], this.goal.clone());
    }

    hasInContext(formula: Formula): boolean {
        return this.context.some(f => f.equals(formula));
    }
}
