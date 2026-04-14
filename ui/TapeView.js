// TapeView.js - Renders the tape visually with head highlighting

import { BLANK_SYMBOL } from '../utils/constants.js';
import { escapeHtml } from '../utils/helpers.js';

export class TapeView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.animating = false;
  }

  /**
   * Render the tape snapshot
   * @param {Array} snapshot - Array of { symbol, isHead, index }
   */
  render(snapshot) {
    if (!this.container) return;

    const headArrIndex = snapshot.findIndex(c => c.isHead);

    const cells = snapshot.map((cell, i) => {
      const sym = escapeHtml(cell.symbol === BLANK_SYMBOL ? '⬜' : cell.symbol);
      const dist = Math.abs(i - headArrIndex);
      const warmClass = dist > 0 && dist <= 2 ? ' cell-warm-zone' : '';
      const headClass = cell.isHead ? 'tape-cell head' : 'tape-cell';
      const blankClass = cell.symbol === BLANK_SYMBOL ? ' blank' : '';
      return `<div class="${headClass}${blankClass}${warmClass}" data-index="${cell.index}">
        <span class="cell-symbol">${sym === '⬜' ? '_' : sym}</span>
        ${cell.isHead ? '<div class="head-arrow">▼</div>' : ''}
      </div>`;
    }).join('');

    this.container.innerHTML = `
      <div class="tape-track">
        <div class="tape-cells-wrapper">
          ${cells}
        </div>
      </div>
    `;

    // Scroll head cell into view within the tape container only (no page scroll)
    const headEl = this.container.querySelector('.tape-cell.head');
    if (headEl) {
      const containerRect = this.container.getBoundingClientRect();
      const headRect = headEl.getBoundingClientRect();
      const offset = headRect.left - containerRect.left - (this.container.offsetWidth / 2) + (headEl.offsetWidth / 2);
      this.container.scrollLeft += offset;
    }
  }

  /**
   * Flash the head cell for visual feedback
   */
  flashHead() {
    const headEl = this.container?.querySelector('.tape-cell.head');
    if (headEl) {
      headEl.classList.add('flash');
      setTimeout(() => headEl.classList.remove('flash'), 300);
    }
  }

  /**
   * Clear the tape display
   */
  clear() {
    if (this.container) {
      this.container.innerHTML = '<div class="tape-empty">No tape loaded</div>';
    }
  }
}
