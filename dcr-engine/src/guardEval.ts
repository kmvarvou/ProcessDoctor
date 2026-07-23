import type { GuardMap, VariableStore } from "./types";

const decodeXMLEntities = (expr: string): string =>
  expr
    .replace(/&gt;=/g, ">=")
    .replace(/&lt;=/g, "<=")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"');

type FEELToken =
  | { type: 'IDENT'; value: string }
  | { type: 'NUMBER'; value: number }
  | { type: 'STRING'; value: string }
  | { type: 'OP'; value: string }
  | { type: 'ARITH'; value: string }
  | { type: 'LPAREN' }
  | { type: 'RPAREN' }
  | { type: 'AND' }
  | { type: 'OR' }
  | { type: 'NOT' }
  | { type: 'TRUE' }
  | { type: 'FALSE' }
  | { type: 'IF' }
  | { type: 'THEN' }
  | { type: 'ELSE' }
  | { type: 'EOF' };

const UNDEF = Symbol('UNDEF');
type FEELValue = string | number | boolean | typeof UNDEF;

function tokenizeFEEL(input: string): FEELToken[] {
  const tokens: FEELToken[] = [];
  let i = 0;
  while (i < input.length) {
    if (/\s/.test(input[i])) { i++; continue; }
    if (input[i] === '(') { tokens.push({ type: 'LPAREN' }); i++; continue; }
    if (input[i] === ')') { tokens.push({ type: 'RPAREN' }); i++; continue; }
    if (i + 1 < input.length && (input.slice(i, i + 2) === '>=' || input.slice(i, i + 2) === '<=' || input.slice(i, i + 2) === '!=')) {
      tokens.push({ type: 'OP', value: input.slice(i, i + 2) }); i += 2; continue;
    }
    if (input[i] === '>' || input[i] === '<' || input[i] === '=') {
      tokens.push({ type: 'OP', value: input[i] }); i++; continue;
    }
    if (input[i] === '+' || input[i] === '-' || input[i] === '*') {
      tokens.push({ type: 'ARITH', value: input[i] }); i++; continue;
    }
    if (/[0-9]/.test(input[i])) {
      const start = i;
      while (i < input.length && /[0-9.]/.test(input[i])) i++;
      tokens.push({ type: 'NUMBER', value: parseFloat(input.slice(start, i)) }); continue;
    }
    if (input[i] === '"' || input[i] === "'") {
      const q = input[i++]; const start = i;
      while (i < input.length && input[i] !== q) i++;
      tokens.push({ type: 'STRING', value: input.slice(start, i++) }); continue;
    }
    if (/[A-Za-z_]/.test(input[i])) {
      const start = i;
      while (i < input.length && /[A-Za-z0-9_]/.test(input[i])) i++;
      const word = input.slice(start, i);
      const lower = word.toLowerCase();
      if (lower === 'and') tokens.push({ type: 'AND' });
      else if (lower === 'or') tokens.push({ type: 'OR' });
      else if (lower === 'not') tokens.push({ type: 'NOT' });
      else if (lower === 'true') tokens.push({ type: 'TRUE' });
      else if (lower === 'false') tokens.push({ type: 'FALSE' });
      else if (lower === 'if') tokens.push({ type: 'IF' });
      else if (lower === 'then') tokens.push({ type: 'THEN' });
      else if (lower === 'else') tokens.push({ type: 'ELSE' });
      else tokens.push({ type: 'IDENT', value: word });
      continue;
    }
    i++;
  }
  tokens.push({ type: 'EOF' });
  return tokens;
}

function feelEval(tokens: FEELToken[], store: VariableStore): boolean {
  let pos = 0;
  const peek = (): FEELToken => tokens[pos];
  const consume = (): FEELToken => tokens[pos++];
  const toBool = (v: FEELValue): boolean => v !== UNDEF && Boolean(v);

  

  function parseExpr(): FEELValue { return parseOr(); }

  function parseOr(): FEELValue {
    let left = parseAnd();
    while (peek().type === 'OR') { consume(); const r = parseAnd(); left = toBool(left) || toBool(r); }
    return left;
  }

  function parseAnd(): FEELValue {
    let left = parseNot();
    while (peek().type === 'AND') { consume(); const r = parseNot(); left = toBool(left) && toBool(r); }
    return left;
  }

  function parseNot(): FEELValue {
    if (peek().type === 'NOT') { consume(); return !toBool(parseNot()); }
    return parseComparison();
  }

  function parseComparison(): FEELValue {
    const left = parseAddSub();
    const opTok = peek();
    if (opTok.type !== 'OP') return left;
    consume();
    const right = parseAddSub();
    if (left === UNDEF || right === UNDEF) return false;
    const op = (opTok as { type: 'OP'; value: string }).value;
    switch (op) {
      case '>':  return (left as any) >  (right as any);
      case '<':  return (left as any) <  (right as any);
      case '>=': return (left as any) >= (right as any);
      case '<=': return (left as any) <= (right as any);
      case '=':  return left == right;
      case '!=': return left != right;
      default:   return false;
    }
  }

  function parseAddSub(): FEELValue {
    let left = parseMul();
    while (peek().type === 'ARITH' && (peek() as { type: 'ARITH'; value: string }).value !== '*') {
      const op = (consume() as { type: 'ARITH'; value: string }).value;
      const right = parseMul();
      if (left === UNDEF || right === UNDEF) { left = UNDEF; continue; }
      left = op === '+' ? (left as number) + (right as number) : (left as number) - (right as number);
    }
    return left;
  }

  function parseMul(): FEELValue {
    let left = parseAtom();
    while (peek().type === 'ARITH' && (peek() as { type: 'ARITH'; value: string }).value === '*') {
      consume();
      const right = parseAtom();
      if (left === UNDEF || right === UNDEF) { left = UNDEF; continue; }
      left = (left as number) * (right as number);
    }
    return left;
  }

  function parseAtom(): FEELValue {
    const tok = peek();
    if (tok.type === 'NUMBER') { consume(); return tok.value; }
    if (tok.type === 'STRING') { consume(); return tok.value; }
    if (tok.type === 'TRUE')   { consume(); return true; }
    if (tok.type === 'FALSE')  { consume(); return false; }
    if (tok.type === 'IDENT')  { consume(); return tok.value in store ? store[tok.value] as FEELValue : UNDEF; }
    if (tok.type === 'ARITH' && (tok as { type: 'ARITH'; value: string }).value === '-') {
      consume();
      const v = parseAtom();
      return v === UNDEF ? UNDEF : -(v as number);
    }
    if (tok.type === 'LPAREN') {
      consume();
      const val = parseExpr();
      if (peek().type === 'RPAREN') consume();
      return val;
    }
    if (tok.type === 'IF') {
      consume();
      const cond = parseExpr();
      if (peek().type === 'THEN') consume();
      const thenBranch = parseExpr();
      if (peek().type === 'ELSE') consume();
      const elseBranch = parseExpr();
      return toBool(cond) ? thenBranch : elseBranch;
    }
    return UNDEF;
  }

  return toBool(parseExpr());
}

export const evaluateGuard = (
  expression: string | undefined,
  variableStore: VariableStore
): boolean => {
  if (!expression || expression.trim() === "") return true;
  try {
    return feelEval(tokenizeFEEL(decodeXMLEntities(expression).trim()), variableStore);
  } catch {
    return true;
  }
};

export type GuardVarType = 'Int' | 'Bool' | 'String';
export type GuardTypeMap = Record<string, GuardVarType>;

const GENERIC_ERROR = 'Invalid guard syntax';

// Returns null if the expression is syntactically valid, every referenced variable is present
// in typeMap, and it is well-typed (e.g. rejects `boolVar + intVar`, `boolVar > 5`, and a non-Bool guard as a whole).
export const validateGuardSyntax = (
  expression: string,
  typeMap: GuardTypeMap = {}
): string | null => {
  if (!expression || expression.trim() === '') return null;
  const expr = decodeXMLEntities(expression).trim();

  let depth = 0;
  for (const ch of expr) {
    if (ch === '(') depth++;
    else if (ch === ')') { depth--; if (depth < 0) return GENERIC_ERROR; }
  }
  if (depth > 0) return GENERIC_ERROR;

  try {
    const tokens = tokenizeFEEL(expr);
    let pos = 0;
    const peek = () => tokens[pos];
    const consume = () => tokens[pos++];

    const requireType = (type: GuardVarType, expected: GuardVarType): void => {
      if (type !== expected) throw new Error(GENERIC_ERROR);
    };

    function parseE(): GuardVarType { return parseOr(); }

    function parseOr(): GuardVarType {
      let left = parseAnd();
      while (peek().type === 'OR') {
        consume();
        const right = parseAnd();
        requireType(left, 'Bool');
        requireType(right, 'Bool');
        left = 'Bool';
      }
      return left;
    }

    function parseAnd(): GuardVarType {
      let left = parseNot();
      while (peek().type === 'AND') {
        consume();
        const right = parseNot();
        requireType(left, 'Bool');
        requireType(right, 'Bool');
        left = 'Bool';
      }
      return left;
    }

    function parseNot(): GuardVarType {
      if (peek().type === 'NOT') {
        consume();
        requireType(parseNot(), 'Bool');
        return 'Bool';
      }
      return parseComparison();
    }

    function parseComparison(): GuardVarType {
      const left = parseAddSub();
      const opTok = peek();
      if (opTok.type !== 'OP') return left;
      consume();
      const right = parseAddSub();
      const op = (opTok as { type: 'OP'; value: string }).value;
      if (op === '=' || op === '!=') {
        if (left !== right) throw new Error(GENERIC_ERROR);
      } else {
        requireType(left, 'Int');
        requireType(right, 'Int');
      }
      return 'Bool';
    }

    function parseAddSub(): GuardVarType {
      let left = parseMul();
      while (peek().type === 'ARITH' && (peek() as { type: 'ARITH'; value: string }).value !== '*') {
        consume();
        const right = parseMul();
        requireType(left, 'Int');
        requireType(right, 'Int');
        left = 'Int';
      }
      return left;
    }

    function parseMul(): GuardVarType {
      let left = parseAtom();
      while (peek().type === 'ARITH' && (peek() as { type: 'ARITH'; value: string }).value === '*') {
        consume();
        const right = parseAtom();
        requireType(left, 'Int');
        requireType(right, 'Int');
        left = 'Int';
      }
      return left;
    }

    function parseAtom(): GuardVarType {
      const tok = peek();
      if (tok.type === 'NUMBER') { consume(); return 'Int'; }
      if (tok.type === 'STRING') { consume(); return 'String'; }
      if (tok.type === 'TRUE')   { consume(); return 'Bool'; }
      if (tok.type === 'FALSE')  { consume(); return 'Bool'; }
      if (tok.type === 'IDENT')  {
        consume();
        const type = typeMap[tok.value];
        if (type === undefined) throw new Error(GENERIC_ERROR);
        return type;
      }
      if (tok.type === 'ARITH' && (tok as { type: 'ARITH'; value: string }).value === '-') {
        consume();
        requireType(parseAtom(), 'Int');
        return 'Int';
      }
      if (tok.type === 'LPAREN') {
        consume();
        const inner = parseE();
        if (peek().type === 'RPAREN') consume();
        return inner;
      }
      if (tok.type === 'IF') {
        consume();
        requireType(parseE(), 'Bool');
        if (peek().type === 'THEN') consume();
        const thenBranch = parseE();
        if (peek().type === 'ELSE') consume();
        const elseBranch = parseE();
        if (thenBranch !== elseBranch) throw new Error(GENERIC_ERROR);
        return thenBranch;
      }
      throw new Error(GENERIC_ERROR);
    }

    const result = parseE();
    if (peek().type !== 'EOF') return GENERIC_ERROR;
    requireType(result, 'Bool');
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : GENERIC_ERROR;
  }
};

export const getGuard = (
  guardMap: GuardMap | undefined,
  source: string,
  target: string,
  relationType: string
): string | undefined => {
  return guardMap?.[source]?.[target]?.[relationType];
};
