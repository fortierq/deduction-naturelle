import { Formula } from './formulas';

export type NotationRule =
  | {
      type: 'formula';
      formula: Formula;
    }
  | {
      type: 'set';
      formulas: Formula[];
    };