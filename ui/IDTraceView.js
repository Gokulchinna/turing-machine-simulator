// IDTraceView.js - Displays the Instantaneous Description (ID) trace log
// Shows formal computation history: α q β notation (standard TOC textbook format)

import { escapeHtml } from '../utils/helpers.js';

export class IDTraceView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  /**
   * Render full ID trace from history + current snapshot
   * @param {Array}  history  - machine.history entries
   * @param {Object} snap     - machine.getSnapshot() current state
   */
  render(history, snap) {
    if (!this.container) return;

    // ID trace view only receives the history array + current snap, 
    // but the `snap.stepCount` handles the "is this step 0?" check natively
    if (history.length === 0 && snap.stepCount === 0) {
      this.container.innerHTML = `
        <div class="id-trace-empty">
          Press <strong>Step</strong> or <strong>Run</strong> to see the computation trace.
        </div>`;
      return;
    }

    // Since step 0 is now strictly IN history thanks to the timeline slider changes,
    // we just use history natively if it exists. But we need to ensure current state
    // is always pushed if the machine is halted/running.
    // Actually, `machine.history` contains the state up to current - 1, and `snap` contains current.
    // Wait, with the Timeline slider update, `history` contains EVERYTHING including current step!
    // We should just map directly over `history`.

    // Map directly from history
    const entries = history.map((h, i) => ({
      cells: h.cells,
      head: h.head,
      state: h.state,
      stepCount: h.stepCount,
      isCurrent: i === history.length - 1,
      status: h.status,
    }));

    const total = entries.length;
    const rows = entries.map((e, idx) => {
      const id = this._formatID(e.cells, e.head, e.state);
      const rowClass = e.isCurrent ? 'id-row id-row-current' : 'id-row';
      const stepLabel = e.isCurrent
        ? `<span class="id-step-label current-label">▶ Step ${e.stepCount}</span>`
        : `<span class="id-step-label">Step ${e.stepCount}</span>`;

      // Fade out older steps (keep min opacity at 0.3)
      const distance = total - 1 - idx;
      const opacity = Math.max(0.3, 1 - (distance * 0.15));

      return `
        <div class="${rowClass}" style="opacity: ${opacity};">
          ${stepLabel}
          <span class="id-notation">
            ⊢ <span class="id-left">${escapeHtml(id.left)}</span><span class="id-head-highlight">[${escapeHtml(id.headSym)}]</span><span class="id-right">${escapeHtml(id.right)}</span> <span class="id-state">(${escapeHtml(id.state)})</span>
          </span>
        </div>`;
    }).join('');

    this.container.innerHTML = `<div class="id-trace-log">${rows}</div>`;

    // Auto-scroll to bottom so current step is always visible
    this.container.scrollTop = this.container.scrollHeight;
  }

  /**
   * Format one configuration as αqβ (standard Instantaneous Description)
   * Left of head | state | head symbol + right of head
   */
  _formatID(cells, head, state) {
    const left    = cells.slice(0, head).join('') || '';
    const headSym = cells[head] ?? '_';
    const right   = cells.slice(head + 1).join('') || '';
    return { left, state, headSym, right };
  }

  /** Clear the trace */
  clear() {
    if (this.container) {
      this.container.innerHTML = `
        <div class="id-trace-empty">Press <strong>Step</strong> or <strong>Run</strong> to see the computation trace.</div>`;
    }
  }
}
