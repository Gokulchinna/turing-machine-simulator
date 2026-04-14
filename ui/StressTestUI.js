// StressTestUI.js - Manages the bulk input stress tester

import { TuringMachine } from '../engine/TuringMachine.js';
import { escapeHtml } from '../utils/helpers.js';
import { STATUS, MAX_STEPS } from '../utils/constants.js';

export class StressTestUI {
  constructor(getMachineConfigFn) {
    this.getMachineConfigFn = getMachineConfigFn;
    this.btnRun = document.getElementById('btn-run-stress');
    this.inputArea = document.getElementById('stress-inputs');
    this.tbody = document.getElementById('stress-results-tbody');

    this.btnRun?.addEventListener('click', () => this.runTests());
  }

  runTests() {
    if (!this.inputArea || !this.tbody) return;
    
    const config = this.getMachineConfigFn();
    if (!config) {
      this.tbody.innerHTML = '<tr><td colspan="3" style="color:var(--accent-red); padding:1rem; text-align:center;">No valid machine config available.</td></tr>';
      return;
    }

    const rawLines = this.inputArea.value.split('\n');
    let inputs = rawLines.map(s => s.trim()).filter(s => s !== '');
    
    if (inputs.length === 0) {
      inputs = ['']; // test empty tape if nothing provided
    }

    this.btnRun.disabled = true;
    this.btnRun.textContent = 'Running...';
    
    this.tbody.innerHTML = '';

    // Run tests
    inputs.forEach(input => {
      // Map '_' to empty string for execution if they typed it
      const actualInput = input === '_' ? '' : input;
      
      const tm = new TuringMachine({ ...config, input: actualInput });
      
      const result = tm.run(); // Calls the optimized silent run()

      const statusColor = result.status === STATUS.ACCEPTED ? 'var(--accent-green)' : 'var(--accent-red)';
      const statusLabel = result.status === STATUS.ACCEPTED ? 'ACCEPT' : (result.status === STATUS.REJECTED ? 'REJECT' : result.status);
      
      const stepsDisplay = result.stepCount >= MAX_STEPS 
        ? `<span style="color: var(--accent-amber);" title="Max Steps Reached">Max (${MAX_STEPS})</span>` 
        : result.stepCount;

      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
      tr.innerHTML = `
        <td style="padding: 0.5rem 1rem; font-family: var(--font-mono);">${escapeHtml(input)}</td>
        <td style="padding: 0.5rem 1rem; color: ${statusColor}; font-weight: bold;">${statusLabel}</td>
        <td style="padding: 0.5rem 1rem; font-family: var(--font-mono); color: var(--accent-cyan);">${stepsDisplay}</td>
      `;
      this.tbody.appendChild(tr);
    });

    this.btnRun.disabled = false;
    this.btnRun.textContent = '▶ Run Stress Test';
  }
}
