// Tape.js - Represents the Turing Machine tape

import { BLANK_SYMBOL } from '../utils/constants.js';

export class Tape {
  constructor(input = '') {
    // Initialize tape with input string, each char a cell
    this.cells = input.length > 0 ? input.split('') : [BLANK_SYMBOL];
    this.head = 0;
    this.offset = 0; // tracks leftward expansion offset
  }

  /**
   * Read the symbol under the head
   */
  read() {
    return this.cells[this.head] ?? BLANK_SYMBOL;
  }

  /**
   * Write a symbol at the current head position
   */
  write(symbol) {
    this.cells[this.head] = symbol;
  }

  /**
   * Move the head left or right (or stay)
   * Expands tape as needed
   */
  move(direction) {
    if (direction === 'L') {
      this.head--;
      if (this.head < 0) {
        // Expand left
        this.cells.unshift(BLANK_SYMBOL);
        this.head = 0;
        this.offset++;
      }
    } else if (direction === 'R') {
      this.head++;
      if (this.head >= this.cells.length) {
        // Expand right
        this.cells.push(BLANK_SYMBOL);
      }
    }
    // 'S' = Stay — no movement
  }

  /**
   * Returns the tape cells array
   */
  getCells() {
    return this.cells;
  }

  /**
   * Returns the current head index
   */
  getHead() {
    return this.head;
  }

  /**
   * Returns a snapshot for display purposes
   * Pads with blanks on each side for context
   */
  getSnapshot(windowSize = 21) {
    const half = Math.floor(windowSize / 2);
    const startIdx = this.head - half;
    const endIdx = this.head + half;

    const result = [];
    for (let i = startIdx; i <= endIdx; i++) {
      if (i < 0 || i >= this.cells.length) {
        result.push({ symbol: BLANK_SYMBOL, isHead: i === this.head, index: i });
      } else {
        result.push({ symbol: this.cells[i], isHead: i === this.head, index: i });
      }
    }
    return result;
  }

  /**
   * Clone the tape
   */
  clone() {
    const t = new Tape('');
    t.cells = [...this.cells];
    t.head = this.head;
    t.offset = this.offset;
    return t;
  }

  /**
   * Reset the tape with new input
   */
  reset(input = '') {
    this.cells = input.length > 0 ? input.split('') : [BLANK_SYMBOL];
    this.head = 0;
    this.offset = 0;
  }
}
