// BuilderUI.js - Custom Turing Machine Builder UI

import { Validator } from './Validator.js';
import { escapeHtml } from '../utils/helpers.js';

export class BuilderUI {
  constructor(containerId, onBuild) {
    this.container = document.getElementById(containerId);
    this.onBuild = onBuild; // Callback when user submits a valid machine
    this.rowCount = 0;
    this._render();
  }

  _render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="builder-section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h3 class="builder-section-title" style="margin-bottom: 0;">🏗️ Custom Machine Builder</h3>
          <div class="builder-actions" style="display: flex; gap: 12px; margin-top: 0;">
            <button id="btn-builder-clear" class="btn btn-ghost">
              🗑️ Clear All
            </button>
            <button id="btn-builder-load" class="btn btn-primary">
              <span>🚀</span> Build & Load Machine
            </button>
          </div>
        </div>

        <div class="builder-fields-grid">
          <div class="builder-field">
            <label for="b-name">Machine Name</label>
            <input id="b-name" type="text" placeholder="My Turing Machine" class="builder-input" />
          </div>
          <div class="builder-field">
            <label for="b-desc">Description</label>
            <input id="b-desc" type="text" placeholder="What does this machine do?" class="builder-input" />
          </div>
          <div class="builder-field">
            <label for="b-states">States (comma-separated)</label>
            <input id="b-states" type="text" placeholder="q0, q1, q2, qAccept" class="builder-input" />
          </div>
          <div class="builder-field">
            <label for="b-start">Start State</label>
            <input id="b-start" type="text" placeholder="q0" class="builder-input" />
          </div>
          <div class="builder-field">
            <label for="b-accept">Accept State</label>
            <input id="b-accept" type="text" placeholder="qAccept" class="builder-input" />
          </div>
          <div class="builder-field">
            <label for="b-input">Input String</label>
            <input id="b-input" type="text" placeholder="aabb" class="builder-input" />
          </div>
        </div>

        <div class="builder-transitions-section">
          <div class="builder-transitions-header">
            <h4>Transition Rules</h4>
            <button id="btn-add-row" class="btn btn-secondary btn-sm">+ Add Row</button>
          </div>
          <div class="table-scroll-wrapper">
            <table class="transition-table builder-table" id="builder-table">
              <thead>
                <tr>
                  <th>State</th>
                  <th>Read</th>
                  <th>Write</th>
                  <th>Move</th>
                  <th>Next State</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="builder-tbody">
              </tbody>
            </table>
          </div>
          <button id="btn-add-row-bottom" class="btn btn-ghost btn-sm mt-2">+ Add another row</button>
        </div>

        <div id="builder-errors" class="builder-errors hidden"></div>
      </div>
    `;

    this._bindEvents();
    this._addRow(); // Start with one empty row
    this._addRow(); // Two rows by default
    this._addRow();
  }

  _bindEvents() {
    document.getElementById('btn-add-row')?.addEventListener('click', () => this._addRow());
    document.getElementById('btn-add-row-bottom')?.addEventListener('click', () => this._addRow());
    document.getElementById('btn-builder-load')?.addEventListener('click', () => this._handleBuild());
    document.getElementById('btn-builder-clear')?.addEventListener('click', () => this._clearAll());
  }

  _addRow(data = {}) {
    const tbody = document.getElementById('builder-tbody');
    if (!tbody) return;

    const rowId = `row-${this.rowCount++}`;
    const tr = document.createElement('tr');
    tr.id = rowId;
    tr.className = 'transition-row';

    tr.innerHTML = `
      <td><input type="text" class="t-state" placeholder="q0" value="${escapeHtml(data.state || '')}" /></td>
      <td><input type="text" class="t-read" placeholder="_" maxlength="1" value="${escapeHtml(data.read || '')}" /></td>
      <td><input type="text" class="t-write" placeholder="_" maxlength="1" value="${escapeHtml(data.write || '')}" /></td>
      <td>
        <select class="t-move">
          <option value="R" ${data.move === 'R' ? 'selected' : ''}>R</option>
          <option value="L" ${data.move === 'L' ? 'selected' : ''}>L</option>
          <option value="S" ${data.move === 'S' ? 'selected' : ''}>S (Stay)</option>
        </select>
      </td>
      <td><input type="text" class="t-next" placeholder="q1" value="${escapeHtml(data.next || '')}" /></td>
      <td>
        <button class="btn btn-danger btn-xs btn-remove-row" data-row="${rowId}">✕</button>
      </td>
    `;

    tr.querySelector('.btn-remove-row').addEventListener('click', () => {
      tr.remove();
    });

    tbody.appendChild(tr);
  }

  _getRows() {
    const tbody = document.getElementById('builder-tbody');
    if (!tbody) return [];

    const rows = [];
    tbody.querySelectorAll('tr').forEach((tr) => {
      const state = tr.querySelector('.t-state')?.value.trim();
      const read = tr.querySelector('.t-read')?.value;
      const write = tr.querySelector('.t-write')?.value;
      const move = tr.querySelector('.t-move')?.value;
      const next = tr.querySelector('.t-next')?.value.trim();

      // Skip fully empty rows
      if (!state && !read && !write && !next) return;

      rows.push({ state, read: read || '_', write: write || '_', move: move || 'R', next });
    });
    return rows;
  }

  _handleBuild() {
    const name = document.getElementById('b-name')?.value.trim() || 'Custom Machine';
    const description = document.getElementById('b-desc')?.value.trim() || '';
    const statesRaw = document.getElementById('b-states')?.value.trim();
    const startState = document.getElementById('b-start')?.value.trim();
    const acceptState = document.getElementById('b-accept')?.value.trim();
    const input = document.getElementById('b-input')?.value || '';

    const states = statesRaw ? statesRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
    const transitions = this._getRows();

    const config = { name, description, states, startState, acceptState, transitions, input };
    const result = Validator.validate(config);

    if (!result.valid) {
      this._showErrors(result.errors);
      return;
    }

    this._hideErrors();
    this.onBuild?.(config);
  }

  _showErrors(errors) {
    this._hideErrors(); // clear first

    const el = document.getElementById('builder-errors');
    if (el) {
      el.innerHTML = errors.map(e => `<div class="error-item">${e.message}</div>`).join('');
      el.classList.remove('hidden');
    }

    errors.forEach(err => {
      let targetEl = null;
      if (err.fieldId) {
        targetEl = document.getElementById(err.fieldId);
      } else if (err.rowIdx !== undefined && err.fieldClass) {
        const tbody = document.getElementById('builder-tbody');
        if (tbody) {
          const rows = tbody.querySelectorAll('tr');
          if (rows[err.rowIdx]) {
            targetEl = rows[err.rowIdx].querySelector(err.fieldClass);
          }
        }
      }

      if (targetEl) {
        targetEl.classList.add('builder-error-highlight');
        targetEl.title = err.message;
      }
    });
  }

  _hideErrors() {
    const el = document.getElementById('builder-errors');
    if (el) el.classList.add('hidden');

    document.querySelectorAll('.builder-error-highlight').forEach(el => {
      el.classList.remove('builder-error-highlight');
      el.title = '';
    });
  }

  _clearAll() {
    document.getElementById('b-name').value = '';
    document.getElementById('b-desc').value = '';
    document.getElementById('b-states').value = '';
    document.getElementById('b-start').value = '';
    document.getElementById('b-accept').value = '';
    document.getElementById('b-input').value = '';
    const tbody = document.getElementById('builder-tbody');
    if (tbody) tbody.innerHTML = '';
    this._addRow();
    this._addRow();
    this._addRow();
    this._hideErrors();
  }

  /**
   * Pre-fill the builder with an existing machine definition
   */
  prefillFromMachine(machine, transitions) {
    document.getElementById('b-name').value = machine.name || '';
    document.getElementById('b-desc').value = machine.description || '';
    document.getElementById('b-states').value = (machine.states || []).join(', ');
    document.getElementById('b-start').value = machine.startState || '';
    document.getElementById('b-accept').value = machine.acceptState || '';
    document.getElementById('b-input').value = machine.input || '';

    const tbody = document.getElementById('builder-tbody');
    if (tbody) tbody.innerHTML = '';

    (transitions || []).forEach(rule => this._addRow(rule));
  }
}
