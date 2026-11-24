/**
 * scientific.js - safe expression engine (tokenizer + recursive-descent parser).
 * No eval(): every expression is turned into tokens and evaluated by hand.
 * Grammar (lowest to highest precedence):
 *   expr    := term (('+'|'-') term)*
 *   term    := unary (('*'|'/'|implicit) unary)*
 *   unary   := ('-'|'+') unary | power
 *   power   := postfix ('^' unary)?          (right-associative)
 *   postfix := primary ('!' | '%')*
 *   primary := number | const | func '(' expr ')' | '(' expr ')'
 */
(function (root) {
  class CalcError extends Error {}
  const fail = (m) => { throw new CalcError(m); };

  const CONSTS = { pi: Math.PI, e: Math.E };
  // Each function receives (value, ctx) where ctx.toRad / ctx.fromRad handle angle modes.
  const FUNCS = {
    sin: (x, c) => c.clean(Math.sin(c.toRad(x))),
    cos: (x, c) => c.clean(Math.cos(c.toRad(x))),
    tan: (x, c) => {
      if (Math.abs(Math.cos(c.toRad(x))) < 1e-12) fail('Undefined: tan of this angle');
      return c.clean(Math.tan(c.toRad(x)));
    },
    asin: (x, c) => { if (x < -1 || x > 1) fail('asin needs a value from -1 to 1'); return c.clean(c.fromRad(Math.asin(x))); },
    acos: (x, c) => { if (x < -1 || x > 1) fail('acos needs a value from -1 to 1'); return c.clean(c.fromRad(Math.acos(x))); },
    atan: (x, c) => c.clean(c.fromRad(Math.atan(x))),
    log:  (x) => { if (x <= 0) fail('log needs a value greater than 0'); return Math.log10(x); },
    ln:   (x) => { if (x <= 0) fail('ln needs a value greater than 0'); return Math.log(x); },
    sqrt: (x) => { if (x < 0) fail('Square root of a negative number'); return Math.sqrt(x); },
    cbrt: (x) => Math.cbrt(x),
    abs:  (x) => Math.abs(x),
  };

  function factorial(n) {
    if (!Number.isInteger(n) || n < 0) fail('Factorial needs a whole number ≥ 0');
    if (n > 170) fail('Factorial too large (max 170!)');
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  }

  /** Turn the display string into tokens, rejecting anything unknown. */
  function tokenize(src) {
    const s = src.toLowerCase().replace(/×/g, '*').replace(/÷/g, '/').replace(/[−–]/g, '-')
      .replace(/π/g, 'pi').replace(/√/g, 'sqrt').replace(/∛/g, 'cbrt')
      .replace(/\[/g, '(').replace(/\]/g, ')').replace(/\s+/g, '');
    const tokens = []; let i = 0;
    while (i < s.length) {
      const ch = s[i];
      if (/[0-9.]/.test(ch)) {
        const m = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/.exec(s.slice(i));
        if (!m) fail('Invalid number');
        tokens.push({ t: 'num', v: parseFloat(m[0]) }); i += m[0].length;
      } else if (/[a-z]/.test(ch)) {
        const m = /^[a-z]+/.exec(s.slice(i))[0];
        if (m in FUNCS) tokens.push({ t: 'fn', v: m });
        else if (m in CONSTS || m === 'ans') tokens.push({ t: 'const', v: m });
        else fail(`Unknown name "${m}"`);
        i += m.length;
      } else if ('+-*/^!%()'.includes(ch)) { tokens.push({ t: 'op', v: ch }); i++; }
      else fail(`Unexpected character "${ch}"`);
    }
    return tokens;
  }

  /**
   * Evaluate an expression string.
   * @param {string} src  expression
   * @param {{degrees?: boolean, ans?: number}} opts
   */
  function evaluate(src, opts = {}) {
    const deg = opts.degrees !== false;
    const ctx = {
      toRad: (x) => (deg ? (x * Math.PI) / 180 : x),
      fromRad: (x) => (deg ? (x * 180) / Math.PI : x),
      clean: (x) => (Math.abs(x) < 1e-14 ? 0 : x), // sin(180°) → 0, not 1.2e-16
    };
    const tokens = tokenize(src);
    if (!tokens.length) fail('Empty expression');
    let depth = 0;
    tokens.forEach((k) => { if (k.v === '(') depth++; if (k.v === ')' && --depth < 0) fail('Unbalanced parentheses'); });
    while (depth-- > 0) tokens.push({ t: 'op', v: ')' }); // auto-close open brackets

    let p = 0;
    const peek = () => tokens[p];
    const isOp = (v) => peek() && peek().t === 'op' && peek().v === v;
    const eat = (v) => { if (!isOp(v)) fail('Incomplete expression'); p++; };

    function expr() {
      let l = term();
      while (isOp('+') || isOp('-')) l = tokens[p++].v === '+' ? l + term() : l - term();
      return l;
    }
    function term() {
      let l = unary();
      for (;;) {
        const k = peek();
        if (isOp('*') || isOp('/')) {
          const op = tokens[p++].v, r = unary();
          if (op === '/' && r === 0) fail('Cannot divide by zero');
          l = op === '*' ? l * r : l / r;
        } else if (k && (k.t === 'num' || k.t === 'fn' || k.t === 'const' || isOp('('))) l *= unary(); // 2π, 3(4+1)
        else return l;
      }
    }
    function unary() {
      if (isOp('-')) { p++; return -unary(); }
      if (isOp('+')) { p++; return unary(); }
      return power();
    }
    function power() {
      const base = postfix();
      if (!isOp('^')) return base;
      p++;
      const r = Math.pow(base, unary());
      if (!Number.isFinite(r)) fail(base === 0 ? 'Cannot raise 0 to a negative power' : 'Result is not a real number');
      return r;
    }
    function postfix() {
      let v = primary();
      while (isOp('!') || isOp('%')) v = tokens[p++].v === '!' ? factorial(v) : v / 100;
      return v;
    }
    function primary() {
      const k = tokens[p++];
      if (!k) fail('Incomplete expression');
      if (k.t === 'num') return k.v;
      if (k.t === 'const') return k.v === 'ans' ? (opts.ans || 0) : CONSTS[k.v];
      if (k.t === 'fn') { eat('('); const a = expr(); eat(')'); return FUNCS[k.v](a, ctx); }
      if (k.v === '(') { const v = expr(); eat(')'); return v; }
      return fail('Invalid expression');
    }

    const result = expr();
    if (p < tokens.length) fail('Invalid expression');
    if (!Number.isFinite(result)) fail('Result is too large');
    return result;
  }

  /** Round to 12 significant digits to hide floating-point noise (0.1+0.2 → 0.3). */
  function format(v) {
    const r = parseFloat(v.toPrecision(12));
    return Math.abs(r) >= 1e15 || (r !== 0 && Math.abs(r) < 1e-9) ? r.toExponential(8).replace(/\.?0+e/, 'e') : String(r);
  }

  const api = { evaluate, format, CalcError };
  if (typeof module !== 'undefined') module.exports = api; else root.Scientific = api;
})(this);
