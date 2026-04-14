// app.js - Main application entry point

import { TuringMachine } from './engine/TuringMachine.js';
import { TransitionParser } from './engine/TransitionParser.js';
import { TapeView } from './ui/TapeView.js';
import { StatePanel } from './ui/StatePanel.js';
import { TransitionTableView } from './ui/TransitionTableView.js';
import { ControlPanel } from './ui/ControlPanel.js';
import { IDTraceView } from './ui/IDTraceView.js';
import { BuilderUI } from './builder/BuilderUI.js';
import { StateDiagramView } from './ui/StateDiagramView.js';
import { BreakpointPanel } from './ui/BreakpointPanel.js';
import { StressTestUI } from './ui/StressTestUI.js';

import { anbn } from './machines/anbn.js';
import { palindrome } from './machines/palindrome.js';
import { binaryIncrement } from './machines/binaryIncrement.js';
import { evenOnes } from './machines/evenOnes.js';
import { reverseString } from './machines/reverseString.js';
import { unaryAddition } from './machines/unaryAddition.js';
import { equalAB } from './machines/equalAB.js';

import { STATUS, AUTO_STEP_INTERVAL } from './utils/constants.js';

// ─── Registry ────────────────────────────────────────────────────────────────
const PREDEFINED_MACHINES = {
  anbn, palindrome, binaryIncrement, evenOnes, reverseString, unaryAddition, equalAB,
};

// ─── State ───────────────────────────────────────────────────────────────────
let machine = null;
let autoRunTimer = null;
let isAutoRunning = false;
let stepInterval = AUTO_STEP_INTERVAL;
let activeMachineKey = 'anbn';

// ─── Machine Metadata (mutable so custom machines can be added) ───────────────
let machineMeta = [
  { key: 'anbn',            label: 'aⁿbⁿ',           icon: '🔢' },
  { key: 'palindrome',      label: 'Palindrome',      icon: '🔁' },
  { key: 'binaryIncrement', label: 'Binary +1',       icon: '⬆️' },
  { key: 'evenOnes',        label: 'Even 1s',         icon: '🧮' },
  { key: 'reverseString',   label: 'Reverse',         icon: '↩️' },
  { key: 'unaryAddition',   label: 'Unary Add',       icon: '➕' },
  { key: 'equalAB',         label: 'Equal #a #b',     icon: '⚖️' },
];

// ─── UI References ───────────────────────────────────────────────────────────
let tapeView, statePanel, transitionTableView, controlPanel, idTraceView, builderUI, stateDiagramView, breakpointPanel, stressTestUI;

// ─── Init ─────────────────────────────────────────────────────────────────────
function init() {
  tapeView = new TapeView('tape-container');
  statePanel = new StatePanel('state-panel');
  transitionTableView = new TransitionTableView('transition-table-container');
  idTraceView = new IDTraceView('id-trace-container');
  stateDiagramView = new StateDiagramView('state-diagram-container');

  controlPanel = new ControlPanel({
    onRun: handleRun,
    onStep: handleStep,
    onBack: handleBack,
    onPause: handlePause,
    onReset: handleReset,
    onSpeedChange: (interval) => { stepInterval = interval; },
    onSeek: handleSeek,
  });

  builderUI = new BuilderUI('builder-container', handleCustomMachineLoad);
  breakpointPanel = new BreakpointPanel('breakpoint-container', handleBreakpointHit);
  stressTestUI = new StressTestUI(() => {
    const def = PREDEFINED_MACHINES[activeMachineKey];
    return def ? TransitionParser.parseMachine(def) : null;
  });

  buildMachineSelector();

  document.getElementById('input-string')?.addEventListener('input', (e) => {
    if (machine) {
      machine.setInput(e.target.value);
      refreshUI();
    }
  });

  document.getElementById('btn-close-summary')?.addEventListener('click', () => {
    document.getElementById('execution-summary-modal')?.classList.add('hidden');
  });

  loadMachine('anbn');
}

// ─── Machine Selector ────────────────────────────────────────────────────────
function buildMachineSelector() {
  const container = document.getElementById('machine-selector');
  if (!container) return;

  container.innerHTML = machineMeta.map(m => {
    const def = PREDEFINED_MACHINES[m.key];
    const name = def?.name || m.label;
    const desc = def?.description || '';
    const isActive = m.key === activeMachineKey;
    return `
      <div class="machine-item">
        <button class="machine-btn ${isActive ? 'active' : ''}"
                id="machine-btn-${m.key}"
                data-machine="${m.key}">
          <span class="machine-icon">${m.icon}</span>
          <span class="machine-label">${m.label}</span>
        </button>
        <div class="machine-info-inline ${isActive ? 'show' : ''}">
          <div class="machine-info-name">${name}</div>
          <div class="machine-info-desc">${desc}</div>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.machine-btn').forEach(btn => {
    btn.addEventListener('click', () => loadMachine(btn.dataset.machine));
  });
}

function setActiveMachineButton(key) {
  document.querySelectorAll('.machine-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.machine === key);
  });
  document.querySelectorAll('.machine-item').forEach(item => {
    const btn = item.querySelector('.machine-btn');
    const info = item.querySelector('.machine-info-inline');
    if (info) info.classList.toggle('show', btn?.dataset.machine === key);
  });
}

// ─── Load Machine ─────────────────────────────────────────────────────────────
function loadMachine(key) {
  stopAutoRun();
  activeMachineKey = key;

  const def = PREDEFINED_MACHINES[key];
  if (!def) return;

  const parsed = TransitionParser.parseMachine(def);
  machine = new TuringMachine(parsed);

  const inputField = document.getElementById('input-string');
  if (inputField) inputField.value = def.input || '';

  transitionTableView.setTransitions(parsed.transitions);
  setActiveMachineButton(key);
  builderUI.prefillFromMachine(def, def.transitions);
  idTraceView.clear();
  stateDiagramView.render(machine);
  refreshUI();
}

function handleCustomMachineLoad(config) {
  stopAutoRun();

  const parsed = TransitionParser.parseMachine(config);
  machine = new TuringMachine(parsed);

  const inputField = document.getElementById('input-string');
  if (inputField) inputField.value = config.input || '';

  // Register custom machine with a unique key
  const customKey = `custom_${Date.now()}`;
  PREDEFINED_MACHINES[customKey] = config;
  activeMachineKey = customKey;

  // Add to sidebar list — avoid duplicates by checking existing custom name
  const existingIdx = machineMeta.findIndex(m => m.isCustom && m.label === (config.name || 'Custom Machine'));
  if (existingIdx >= 0) {
    machineMeta[existingIdx].key = customKey; // update key pointer
  } else {
    machineMeta.push({ key: customKey, label: config.name || 'Custom Machine', icon: '🔧', isCustom: true });
  }

  transitionTableView.setTransitions(parsed.transitions);
  buildMachineSelector();
  setActiveMachineButton(customKey);

  idTraceView.clear();
  stateDiagramView.render(machine);
  refreshUI();

  showToast('✅ Custom machine loaded! Press Step or Run to start.');
  switchTab('simulator');
}

// ─── Control Handlers ────────────────────────────────────────────────────────
function handleStep() {
  if (!machine || !machine.canStep()) return;
  const canContinue = machine.step();
  refreshUI();
  tapeView.flashHead();
  if (!canContinue) showHaltToast();
}

function handleBack() {
  if (!machine || !machine.canStepBack()) return;
  stopAutoRun();
  machine.stepBack();
  refreshUI();
}

function handleSeek(stepIndex) {
  if (!machine) return;
  stopAutoRun();
  machine.seek(stepIndex);
  refreshUI();
}

function handleRun() {
  if (!machine || !machine.canStep()) return;
  if (isAutoRunning) return;
  isAutoRunning = true;
  controlPanel.updateButtons(machine.status, true, machine.canStepBack());
  statePanel.setRunning(true);
  autoStep();
}

function handleBreakpointHit(bp) {
  stopAutoRun();
  showToast(`🛑 Paused on Breakpoint: ${bp.type} = ${bp.value}`, 'error');
  refreshUI();
}

function autoStep() {
  if (!machine || !machine.canStep() || !isAutoRunning) {
    stopAutoRun();
    if (machine && !machine.canStep()) showHaltToast();
    return;
  }
  
  machine.step();
  refreshUI();

  // Highlight head briefly
  tapeView.flashHead();

  // Check breakpoint
  const currentSymbol = machine.tape.read();
  const bp = breakpointPanel?.check(machine.currentState, currentSymbol);
  if (bp) {
    handleBreakpointHit(bp);
    return;
  }

  autoRunTimer = setTimeout(autoStep, stepInterval);
}

function handlePause() {
  stopAutoRun();
  refreshUI();
}

function handleReset() {
  stopAutoRun();
  if (!machine) return;
  const inputVal = document.getElementById('input-string')?.value || machine.input;
  machine.reset(inputVal);
  idTraceView.clear();
  refreshUI();
}

function stopAutoRun() {
  isAutoRunning = false;
  clearTimeout(autoRunTimer);
  autoRunTimer = null;
  statePanel?.setRunning(false);
  controlPanel?.updateButtons(machine?.status || STATUS.IDLE, false, machine?.canStepBack() ?? false);
}

// ─── UI Refresh ───────────────────────────────────────────────────────────────
function refreshUI() {
  if (!machine) return;

  const snap = machine.getSnapshot();

  tapeView.render(snap.tapeSnapshot);
  statePanel.render(snap, machine.history);
  transitionTableView.render(snap.lastTransition);
  idTraceView.render(machine.history, snap);
  controlPanel.updateButtons(snap.status, isAutoRunning, machine.canStepBack());
  controlPanel.updateTimeline(snap.historyLength, snap.stepCount);
  stateDiagramView.highlight(snap);

  updateStatusBadge(snap.status);
}

function updateStatusBadge(status) {
  const badge = document.getElementById('header-status');
  if (!badge) return;
  const icons = { ACCEPTED: '✅', REJECTED: '❌', RUNNING: '⚙️', IDLE: '💤', PAUSED: '⏸️' };
  badge.textContent = `${icons[status] || ''} ${status}`;
  badge.className = `status-badge status-${status.toLowerCase()}`;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function showHaltToast() {
  const status = machine?.status;
  if (status === STATUS.ACCEPTED) showToast('✅ Machine ACCEPTED the input!', 'success');
  else if (status === STATUS.REJECTED) showToast('❌ Machine REJECTED the input.', 'error');
  
  showExecutionSummary();
}

function showExecutionSummary() {
  if (!machine) return;
  const modal = document.getElementById('execution-summary-modal');
  if (!modal) return;

  const resultEl = document.getElementById('summary-result');
  const stepsEl = document.getElementById('summary-steps');
  const tapeEl = document.getElementById('summary-tape');
  const stateEl = document.getElementById('summary-state');
  const uniqueStatesEl = document.getElementById('summary-unique-states');
  const leftMovesEl = document.getElementById('summary-left');
  const rightMovesEl = document.getElementById('summary-right');
  const writesEl = document.getElementById('summary-writes');

  let minHead = 0, maxHead = 0;
  const uniqueStates = new Set();
  let leftMoves = 0;
  let rightMoves = 0;
  let writesPerformed = 0;

  machine.history.forEach(snap => {
    // Tape Expansion
    if (snap.head < minHead) minHead = snap.head;
    if (snap.head > maxHead) maxHead = snap.head;
    
    // Unique States
    uniqueStates.add(snap.state);

    // Moves and Writes
    if (snap.lastTransition) {
      if (snap.lastTransition.direction === 'L') leftMoves++;
      if (snap.lastTransition.direction === 'R') rightMoves++;
      
      // A write is "performed" if a symbol was written (even if it's the same symbol, or maybe only if it changed?)
      // Standard definition: any transition explicitly writes something.
      writesPerformed++; 
    }
  });

  const tapeUsed = maxHead - minHead + 1;

  if (resultEl) {
    resultEl.textContent = machine.status;
    resultEl.className = `metric-value ${machine.status.toLowerCase()}`;
  }
  if (stepsEl) stepsEl.textContent = machine.stepCount;
  if (stateEl) stateEl.textContent = machine.currentState;
  if (tapeEl) tapeEl.textContent = `${tapeUsed} cells`;
  if (uniqueStatesEl) uniqueStatesEl.textContent = uniqueStates.size;
  if (leftMovesEl) leftMovesEl.textContent = leftMoves;
  if (rightMovesEl) rightMovesEl.textContent = rightMoves;
  if (writesEl) writesEl.textContent = writesPerformed;

  modal.classList.remove('hidden');
}

function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('hidden', panel.dataset.panel !== tabName);
  });
}

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  init();
});
