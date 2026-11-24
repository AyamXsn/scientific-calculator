/** history.js - session-only calculation history (cleared on page reload). */
(function (root) {
  const items = [];
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const History = {
    add(expr, result) { items.unshift({ expr, result }); },
    clear() { items.length = 0; },
    /** Render into a <ul>; clicking an expression or result calls onPick(text). */
    render(list, onPick) {
      list.innerHTML = items.length
        ? items.map((h, i) => `<li><button data-i="${i}" data-k="expr" class="h-expr">${esc(h.expr)}</button>` +
            `<button data-i="${i}" data-k="result" class="h-res">= ${esc(h.result)}</button></li>`).join('')
        : '<li class="empty">No calculations yet. Results appear here.</li>';
      list.onclick = (e) => {
        const b = e.target.closest('button');
        if (b) onPick(items[b.dataset.i][b.dataset.k]);
      };
    },
  };
  root.History = History;
})(this);
