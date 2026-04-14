// TransitionTableView.js - Renders the full transition table and highlights the active rule

import { escapeHtml } from '../utils/helpers.js';
import { TransitionParser } from '../engine/TransitionParser.js';

export class TransitionTableView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.rules = [];
  }

  /**
   * Set the transition map and re-render the table
   */
  setTransitions(transitionMap) {
    this.rules = TransitionParser.serializeToArray(transitionMap);
    this.render(null);
  }

  /**
   * Render the table; highlight the active rule if provided
   * @param {Object|null} lastTransition - { state, symbol }
   */
  render(lastTransition) {
    if (!this.container) return;

    if (!this.rules || this.rules.length === 0) {
      this.container.innerHTML = '<div class="table-empty">No transitions loaded.</div>';
      return;
    }

    const rows = this.rules.map((rule, i) => {
      const isActive = lastTransition &&
        rule.state === lastTransition.state &&
        rule.read === lastTransition.symbol;

      const rowClass = isActive ? 'transition-row active-rule' : 'transition-row';
      return `<tr class="${rowClass}" data-index="${i}">
        <td><span class="state-pill">${escapeHtml(rule.state)}</span></td>
        <td><span class="symbol-pill">${escapeHtml(rule.read)}</span></td>
        <td><span class="symbol-pill write">${escapeHtml(rule.write)}</span></td>
        <td><span class="dir-pill ${rule.move}">${rule.move}</span></td>
        <td><span class="state-pill next">${escapeHtml(rule.next)}</span></td>
      </tr>`;
    }).join('');

    this.container.innerHTML = `
      <div class="table-scroll-wrapper">
        <table class="transition-table">
          <thead>
            <tr>
              <th>State</th>
              <th>Read</th>
              <th>Write</th>
              <th>Move</th>
              <th>Next State</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;

    // Scroll active row into view
    const activeRow = this.container.querySelector('.active-rule');
    if (activeRow) {
      activeRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /**
   * Update only the highlight (without full re-render)
   */
  highlightRule(lastTransition) {
    this.render(lastTransition);
  }
}
