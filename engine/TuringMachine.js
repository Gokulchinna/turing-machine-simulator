// TuringMachine.js - Core Turing Machine engine

import { Tape } from './Tape.js';
import { STATUS, MAX_STEPS } from '../utils/constants.js';

export class TuringMachine {
  constructor(config) {
    this.states = config.states || [];
    this.startState = config.startState;
    this.acceptState = config.acceptState;
    this.transitions = config.transitions; // Map: "state,symbol" => { nextState, writeSymbol, direction }
    this.input = config.input || '';
    this.name = config.name || 'Turing Machine';
    this.description = config.description || '';

    // Runtime state
    this.tape = new Tape(this.input);
    this.currentState = this.startState;
    this.status = STATUS.IDLE;
    this.stepCount = 0;
    this.lastTransition = null; // { state, symbol, nextState, writeSymbol, direction }
    this.history = []; // Array of all states from step 0
  }

  _saveSnapshot() {
    this.history.push({
      cells: [...this.tape.getCells()],
      head: this.tape.getHead(),
      state: this.currentState,
      status: this.status,
      stepCount: this.stepCount,
      lastTransition: this.lastTransition ? { ...this.lastTransition } : null,
    });
  }

  /**
   * Perform exactly ONE step of computation
   * @param {boolean} silent - If true, do not save snapshots (for high performance batch testing)
   */
  step(silent = false) {
    if (this.status === STATUS.ACCEPTED || this.status === STATUS.REJECTED) {
      return false; // Already halted
    }

    // Infinite loop protection
    if (this.stepCount >= MAX_STEPS) {
      this.status = STATUS.REJECTED;
      this.lastTransition = null;
      return false;
    }

    // Set running
    this.status = STATUS.RUNNING;

    // Truncate future history if we've traveled back in time
    if (this.stepCount < this.history.length - 1) {
      this.history = this.history.slice(0, this.stepCount + 1);
    }

    // 1. READ symbol under head
    const currentSymbol = this.tape.read();

    // 2. FIND transition
    const key = `${this.currentState},${currentSymbol}`;
    const transition = this.transitions.get(key);

    // 3. If missing → REJECT
    if (!transition) {
      this.status = STATUS.REJECTED;
      this.lastTransition = null;
      return false;
    }

    const { nextState, writeSymbol, direction } = transition;

    // Save transition for display
    this.lastTransition = {
      state: this.currentState,
      symbol: currentSymbol,
      nextState,
      writeSymbol,
      direction,
    };

    // 4. WRITE symbol
    this.tape.write(writeSymbol);

    // 5. MOVE head
    this.tape.move(direction);

    // 6. UPDATE state
    this.currentState = nextState;

    // 7. INCREMENT step counter
    this.stepCount++;

    // 8. CHECK accept state
    if (this.currentState === this.acceptState) {
      this.status = STATUS.ACCEPTED;
      if (!silent) this._saveSnapshot();
      return false; // Accepted, no more steps needed
    }

    if (!silent) this._saveSnapshot();
    return true; // Can continue
  }

  /**
   * Run until halted (fast, silent execution)
   */
  run() {
    while (this.step(true)) {
      // tight loop
    }
    return {
      status: this.status,
      stepCount: this.stepCount
    };
  }

  /**
   * Reset the machine to its initial state
   */
  reset(newInput = null) {
    const inputToUse = newInput !== null ? newInput : this.input;
    this.input = inputToUse;
    this.tape.reset(inputToUse);
    this.currentState = this.startState;
    this.status = STATUS.IDLE;
    this.stepCount = 0;
    this.lastTransition = null;
    this.history = [];
    this._saveSnapshot(); // Step 0
  }

  /**
   * Jump to an arbitrary step in history
   */
  seek(stepIndex) {
    if (stepIndex < 0 || stepIndex >= this.history.length) return false;
    const snap = this.history[stepIndex];
    this.tape.cells = [...snap.cells];
    this.tape.head  = snap.head;
    this.currentState   = snap.state;
    this.status         = snap.status;
    this.stepCount      = snap.stepCount;
    this.lastTransition = snap.lastTransition ? { ...snap.lastTransition } : null;
    return true;
  }

  /**
   * Step back one step by restoring the previous history snapshot
   */
  stepBack() {
    return this.seek(this.stepCount - 1);
  }

  /**
   * Whether step-back is possible
   */
  canStepBack() {
    return this.stepCount > 0;
  }

  /**
   * Get current machine state snapshot
   */
  getSnapshot() {
    return {
      tapeSnapshot: this.tape.getSnapshot(),
      cells: this.tape.getCells(),
      head: this.tape.getHead(),
      currentState: this.currentState,
      status: this.status,
      stepCount: this.stepCount,
      lastTransition: this.lastTransition,
      historyLength: this.history.length,
    };
  }

  /**
   * Check if machine can still step
   */
  canStep() {
    return this.status !== STATUS.ACCEPTED && this.status !== STATUS.REJECTED;
  }

  /**
   * Update the machine's input string and reset
   */
  setInput(input) {
    this.input = input;
    this.reset(input);
  }
}
