/** calculator.js - UI controller: buttons, keyboard, display and history wiring. */
(function () {
  const $ = (id) => document.getElementById(id);
  const state = { expr: '', degrees: true, ans: 0, done: false };

  // [label, type, value, css class]. "ins" inserts text, "act" runs an action.
  const SCI = [
    ['sin', 'ins', 'sin('], ['cos', 'ins', 'cos('], ['tan', 'ins', 'tan('], ['asin', 'ins', 'asin('], ['acos', 'ins', 'acos('],
    ['atan', 'ins', 'atan('], ['log', 'ins', 'log('], ['ln', 'ins', 'ln('], ['√x', 'ins', '√('], ['∛x', 'ins', '∛('],
    ['x²', 'ins', '^2'], ['x³', 'ins', '^3'], ['xʸ', 'ins', '^'], ['1/x', 'ins', '^(-1)'], ['n!', 'ins', '!'],
    ['|x|', 'ins', 'abs('], ['π', 'ins', 'π'], ['e', 'ins', 'e'], ['Ans', 'ins', 'Ans'], ['%', 'ins', '%'],
    ['(', 'ins', '('], [')', 'ins', ')'], ['[', 'ins', '['], [']', 'ins', ']'], ['DEG/RAD', 'act', 'mode'],
  ];
  const BASIC = [
    ['AC', 'act', 'clear', 'danger'], ['⌫', 'act', 'back', 'op'], ['History', 'act', 'history', 'op hist-btn'], ['÷', 'ins', '÷', 'op'],
    ['7', 'ins', '7'], ['8', 'ins', '8'], ['9', 'ins', '9'], ['×', 'ins', '×', 'op'],
    ['4', 'ins', '4'], ['5', 'ins', '5'], ['6', 'ins', '6'], ['−', 'ins', '−', 'op'],
    ['1', 'ins', '1'], ['2', 'ins', '2'], ['3', 'ins', '3'], ['+', 'ins', '+', 'op'],
    ['0', 'ins', '0'], ['.', 'ins', '.'], ['=', 'act', 'equals', 'equals wide'],
  ];

  function build(container, keys) {
    container.innerHTML = keys.map(([l, t, v, c = '']) => `<button class="key ${c}" data-t="${t}" data-v="${v}">${l}</button>`).join('');
  }

  function show(result, isError) {
    $('expr').textContent = state.expr;
    $('result').textContent = result;
    $('result').classList.toggle('error', !!isError);
    $('mode').textContent = state.degrees ? 'DEG' : 'RAD';
  }

  function insert(text) {
    // After "=": operators continue from the answer, anything else starts fresh.
    if (state.done) state.expr = /^[+−×÷^!%*/-]/.test(text) ? Scientific.format(state.ans) : '';
    state.done = false;
    state.expr += text;
    preview();
  }

  /** Live preview: quietly show the current value while typing. */
  function preview() {
    try { show(Scientific.format(Scientific.evaluate(state.expr, opts()))); }
    catch { show(state.expr ? '…' : '0'); }
  }

  const opts = () => ({ degrees: state.degrees, ans: state.ans });

  function equals() {
    if (!state.expr || state.done) return;
    try {
      const value = Scientific.evaluate(state.expr, opts());
      const text = Scientific.format(value);
      History.add(state.expr, text); History.render($('history-list'), insert);
      state.ans = parseFloat(text); state.done = true;
      show(text);
      $('expr').textContent = state.expr + ' =';
    } catch (e) {
      show(e instanceof Scientific.CalcError ? e.message : 'Invalid expression', true);
    }
  }

  const actions = {
    equals,
    clear() { state.expr = ''; state.done = false; show('0'); },
    back() { if (state.done) return actions.clear(); state.expr = state.expr.replace(/(asin|acos|atan|sin|cos|tan|log|ln|abs|Ans)\($|(Ans)$|.$/u, ''); preview(); },
    mode() { state.degrees = !state.degrees; state.done ? show($('result').textContent) : preview(); },
    history() { $('history').classList.toggle('open'); },
  };

  function press(t, v) { t === 'ins' ? insert(v) : actions[v](); }

  document.querySelector('.keys').addEventListener('click', (e) => {
    const b = e.target.closest('.key'); if (b) press(b.dataset.t, b.dataset.v);
  });

  // Keyboard support
  const KEYMAP = { '*': '×', '/': '÷', '-': '−' };
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    if (k === 'Enter' || k === '=') { e.preventDefault(); equals(); }
    else if (k === 'Backspace') actions.back();
    else if (k === 'Escape') actions.clear();
    else if (/^[0-9.()+^!%]$/.test(k) || k in KEYMAP) { e.preventDefault(); insert(KEYMAP[k] || k); }
    else return;
    const el = document.querySelector(`.key[data-v="${KEYMAP[k] || k}"]`);
    if (el) { el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 120); }
  });

  build($('sci'), SCI); build($('basic'), BASIC);
  $('mode').onclick = actions.mode;
  $('clear-history').onclick = () => { History.clear(); History.render($('history-list'), insert); };
  History.render($('history-list'), insert);
  show('0');
})();
