// StatePanel.js - Displays current state, step count, and status

import { STATUS, STATUS_COLORS } from '../utils/constants.js';
import { escapeHtml } from '../utils/helpers.js';

export class StatePanel {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  /**
   * Update the panel with current machine snapshot
   */
  render(snapshot, history = []) {
    if (!this.container) return;

    const { currentState, stepCount, status, lastTransition } = snapshot;
    const color = STATUS_COLORS[status] || STATUS_COLORS.IDLE;

    const statusIcon = {
      [STATUS.ACCEPTED]: '✅',
      [STATUS.REJECTED]: '❌',
      [STATUS.RUNNING]: '⚙️',
      [STATUS.PAUSED]: '⏸️',
      [STATUS.IDLE]: '💤',
    }[status] || '💤';

    const transitionHtml = lastTransition
      ? `<div class="transition-display">
          <span class="transition-label">Last Transition:</span>
          <span class="transition-value">δ(${lastTransition.state}, ${lastTransition.symbol}) → (${lastTransition.nextState}, ${lastTransition.writeSymbol}, ${lastTransition.direction})</span>
        </div>`
      : `<div class="transition-display"><span class="transition-label">Last Transition:</span> <span class="transition-none">—</span></div>`;

    let impactHtml = '';
    if (stepCount > 0 && history.length > stepCount) {
      const before = history[stepCount - 1];
      const after = history[stepCount];

      const minIdx = Math.min(before.cells.findIndex(c => c !== '_'), after.cells.findIndex(c => c !== '_'));
      const maxIdx = Math.max(
        before.cells.findLastIndex(c => c !== '_'),
        after.cells.findLastIndex(c => c !== '_')
      );
      
      const start = Math.max(0, Math.min(minIdx, before.head) - 1);
      const end = Math.max(maxIdx, before.head) + 2;

      const formatCells = (cells, mutatedIdx) => {
         const slice = cells.slice(start, Math.max(start + 1, end));
         return slice.map((c, i) => {
            const absoluteIdx = start + i;
            return absoluteIdx === mutatedIdx 
              ? `<span class="impact-highlight">${escapeHtml(c)}</span>`
              : escapeHtml(c);
         }).join('');
      };

      impactHtml = `
        <div class="impact-display">
          <div class="impact-row"><span class="impact-label">Before:</span> <span class="impact-tape">${formatCells(before.cells, before.head)}</span></div>
          <div class="impact-row"><span class="impact-label">After :</span> <span class="impact-tape">${formatCells(after.cells, before.head)}</span></div>
        </div>
      `;
    }

    this.container.innerHTML = `
      <div class="state-panel-grid">
        <div class="state-card">
          <div class="state-card-label">Current State</div>
          <div class="state-card-value state-badge">${currentState}</div>
        </div>
        <div class="state-card">
          <div class="state-card-label">Steps</div>
          <div class="state-card-value steps-counter">${stepCount}</div>
        </div>
        <div class="state-card status-card" style="--status-color: ${color}">
          <div class="state-card-label">Status</div>
          <div class="state-card-value status-badge" style="color: ${color}">
            ${statusIcon} ${status}
          </div>
        </div>
      </div>
      ${transitionHtml}
      ${impactHtml}
    `;
  }

  /**
   * Show a pulsing indicator while running
   */
  setRunning(isRunning) {
    if (this.container) {
      if (isRunning) {
        this.container.classList.add('running');
      } else {
        this.container.classList.remove('running');
      }
    }
  }
}
