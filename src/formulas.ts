// Formula representation and parsing for propositional logic

export type FormulaType = "var" | "and" | "or" | "imp" | "neg" | "bot";

const FORMULA_PRECEDENCE: Record<FormulaType, number> = {
  var: 100,
  bot: 100,
  neg: 90,
  and: 70,
  or: 60,
  imp: 50,
};

export class Formula {
  constructor(
    public readonly type: FormulaType,
    public readonly args: (Formula | string)[] = [],
  ) {}

  static var(name: string): Formula {
    return new Formula("var", [name]);
  }

  static and(left: Formula, right: Formula): Formula {
    return new Formula("and", [left, right]);
  }

  static or(left: Formula, right: Formula): Formula {
    return new Formula("or", [left, right]);
  }

  static imp(left: Formula, right: Formula): Formula {
    return new Formula("imp", [left, right]);
  }

  static neg(inner: Formula): Formula {
    return new Formula("neg", [inner]);
  }

  static bot(): Formula {
    return new Formula("bot");
  }

  get left(): Formula {
    if (this.type === "and" || this.type === "or" || this.type === "imp") {
      return this.args[0] as Formula;
    }
    throw new Error(`Formula type ${this.type} has no left operand`);
  }

  get right(): Formula {
    if (this.type === "and" || this.type === "or" || this.type === "imp") {
      return this.args[1] as Formula;
    }
    throw new Error(`Formula type ${this.type} has no right operand`);
  }

  get inner(): Formula {
    if (this.type === "neg") {
      return this.args[0] as Formula;
    }
    throw new Error(`Formula type ${this.type} has no inner operand`);
  }

  get name(): string {
    if (this.type === "var") {
      return this.args[0] as string;
    }
    throw new Error(`Formula type ${this.type} is not a variable`);
  }

  toString(): string {
    switch (this.type) {
      case "var":
        return this.name;
      case "and":
        return `(${this.left.toString()} & ${this.right.toString()})`;
      case "or":
        return `(${this.left.toString()} | ${this.right.toString()})`;
      case "imp":
        return `(${this.left.toString()} -> ${this.right.toString()})`;
      case "neg":
        return `!${this.inner.toString()}`;
      case "bot":
        return "0";
      default:
        return "?";
    }
  }

  toLatex(): string {
    return this.formatLatexWithPrecedence(0);
  }

  private formatLatexWithPrecedence(parentPrecedence: number): string {
    const currentPrecedence = FORMULA_PRECEDENCE[this.type];

    let result: string;

    switch (this.type) {
      case "var":
        result = this.name;
        break;
      case "bot":
        result = "\\bot";
        break;
      case "neg":
        result = `\\neg ${this.inner.formatLatexWithPrecedence(currentPrecedence)}`;
        break;
      case "and":
        result = `${this.left.formatLatexWithPrecedence(currentPrecedence)} \\land ${this.right.formatLatexWithPrecedence(currentPrecedence + 1)}`;
        break;
      case "or":
        result = `${this.left.formatLatexWithPrecedence(currentPrecedence)} \\lor ${this.right.formatLatexWithPrecedence(currentPrecedence + 1)}`;
        break;
      case "imp":
        result = `${this.left.formatLatexWithPrecedence(currentPrecedence + 1)} \\to ${this.right.formatLatexWithPrecedence(currentPrecedence)}`;
        break;
      default:
        result = "?";
    }

    if (currentPrecedence < parentPrecedence) {
      return `(${result})`;
    }
    return result;
  }

  equals(other: Formula | null | undefined): boolean {
    if (!other || this.type !== other.type) return false;
    if (this.type === "var") return this.name === other.name;
    if (this.type === "bot") return true;
    if (this.type === "neg") return this.inner.equals(other.inner);
    return this.left.equals(other.left) && this.right.equals(other.right);
  }

  clone(): Formula {
    switch (this.type) {
      case "var":
        return Formula.var(this.name);
      case "bot":
        return Formula.bot();
      case "neg":
        return Formula.neg(this.inner.clone());
      case "and":
        return Formula.and(this.left.clone(), this.right.clone());
      case "or":
        return Formula.or(this.left.clone(), this.right.clone());
      case "imp":
        return Formula.imp(this.left.clone(), this.right.clone());
      default:
        throw new Error("Unknown formula type");
    }
  }
}

// Parser for formulas
export class FormulaParser {
  private pos: number = 0;
  private input: string;

  constructor(input: string) {
    this.input = input.replace(/\s+/g, "");
  }

  static parse(input: string): Formula {
    const parser = new FormulaParser(input);
    const result = parser.parseFormula();
    if (parser.pos < parser.input.length) {
      throw new Error(
        `Unexpected character at position ${parser.pos}: ${parser.input[parser.pos]}`,
      );
    }
    return result;
  }

  private parseFormula(): Formula {
    return this.parseImplication();
  }

  private parseImplication(): Formula {
    let left = this.parseOr();
    while (this.match("->") || this.match("=>")) {
      const right = this.parseImplication();
      left = Formula.imp(left, right);
    }
    return left;
  }

  private parseOr(): Formula {
    let left = this.parseAnd();
    while (this.match("|") || this.match("\\/")) {
      const right = this.parseAnd();
      left = Formula.or(left, right);
    }
    return left;
  }

  private parseAnd(): Formula {
    let left = this.parseNegation();
    while (this.match("&") || this.match("/\\")) {
      const right = this.parseNegation();
      left = Formula.and(left, right);
    }
    return left;
  }

  private parseNegation(): Formula {
    if (this.match("!") || this.match("~") || this.match("-")) {
      const inner = this.parseNegation();
      return Formula.neg(inner);
    }
    return this.parseAtom();
  }

  private parseAtom(): Formula {
    if (this.match("(")) {
      const formula = this.parseFormula();
      if (!this.match(")")) {
        throw new Error("Expected closing parenthesis");
      }
      return formula;
    }

    if (this.match("0") || this.matchWord("false")) {
      return Formula.bot();
    }

    if (this.match("1") || this.matchWord("true")) {
      return Formula.neg(Formula.bot());
    }

    const start = this.pos;
    while (
      this.pos < this.input.length &&
      /[a-zA-Z0-9_]/.test(this.input[this.pos])
    ) {
      this.pos++;
    }
    if (this.pos > start) {
      return Formula.var(this.input.slice(start, this.pos));
    }

    throw new Error(
      `Unexpected character at position ${this.pos}: ${this.input[this.pos] || "end of input"}`,
    );
  }

  private match(str: string): boolean {
    if (this.input.slice(this.pos, this.pos + str.length) === str) {
      this.pos += str.length;
      return true;
    }
    return false;
  }

  private matchWord(word: string): boolean {
    const remaining = this.input.slice(this.pos).toLowerCase();
    if (remaining.startsWith(word.toLowerCase())) {
      const nextChar = this.input[this.pos + word.length];
      if (!nextChar || !/[a-zA-Z0-9_]/.test(nextChar)) {
        this.pos += word.length;
        return true;
      }
    }
    return false;
  }
}
