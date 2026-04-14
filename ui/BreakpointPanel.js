// BreakpointPanel.js - Manages execution breakpoints

export class BreakpointPanel {
  constructor(containerId, onBreakpointHit) {
    this.container = document.getElementById(containerId);
    this.counterEl = document.getElementById('bp-count');
    this.breakpoints = []; // Array of { id, type: 'STATE' | 'SYMBOL', value: string }
    this.onBreakpointHit = onBreakpointHit; // callback when breakpoint stops execution

    this._initUI();
  }

  _initUI() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="bp-list" id="bp-list">
        <div class="bp-empty">No active breakpoints.</div>
      </div>
      <div class="bp-add-form">
        <select id="bp-type" class="bp-select">
          <option value="STATE">State</option>
          <option value="SYMBOL">Symbol</option>
        </select>
        <input type="text" id="bp-value" class="bp-input" placeholder="e.g. q3 or b" />
        <button id="btn-add-bp" class="btn btn-add-bp btn-xs">➕ Add</button>
      </div>
    `;

    document.getElementById('btn-add-bp').addEventListener('click', () => {
      const type = document.getElementById('bp-type').value;
      const value = document.getElementById('bp-value').value.trim();
      if (value) {
        this.addBreakpoint(type, value);
        document.getElementById('bp-value').value = '';
      }
    });

    document.getElementById('bp-value').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('btn-add-bp').click();
      }
    });
  }

  addBreakpoint(type, value) {
    const id = Date.now().toString();
    this.breakpoints.push({ id, type, value });
    this.render();
  }

  removeBreakpoint(id) {
    this.breakpoints = this.breakpoints.filter(bp => bp.id !== id);
    this.render();
  }

  render() {
    const list = document.getElementById('bp-list');
    if (!list) return;

    if (this.breakpoints.length === 0) {
      list.innerHTML = '<div class="bp-empty">No active breakpoints.</div>';
    } else {
      list.innerHTML = this.breakpoints.map(bp => `
        <div class="bp-item" data-id="${bp.id}">
          <div class="bp-info">
            <span class="bp-type-badge">${bp.type}</span>
            <span class="bp-value-badge">${bp.value}</span>
          </div>
          <button class="bp-btn-remove" title="Remove Breakpoint">✕</button>
        </div>
      `).join('');

      list.querySelectorAll('.bp-btn-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.target.closest('.bp-item').dataset.id;
          this.removeBreakpoint(id);
        });
      });
    }

    if (this.counterEl) {
      this.counterEl.textContent = this.breakpoints.length;
      this.counterEl.style.display = this.breakpoints.length > 0 ? 'inline-block' : 'none';
    }
  }

  /**
   * Check if current machine config hits any active breakpoint.
   * Return the matching breakpoint if hit, else null.
   */
  check(currentState, currentSymbol) {
    for (const bp of this.breakpoints) {
      if (bp.type === 'STATE' && bp.value === currentState) return bp;
      if (bp.type === 'SYMBOL' && bp.value === currentSymbol) return bp;
    }
    return null;
  }
}
