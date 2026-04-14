// binaryIncrement.js - Increments a binary number by 1
// Example: "1011" → "1100", "111" → "1000", "0" → "1"

export const binaryIncrement = {
  name: 'Binary Increment',
  description: 'Increments a binary number by 1. E.g. 1011 → 1100, 111 → 1000.',
  states: ['q0', 'q1', 'q2', 'qAccept'],
  startState: 'q0',
  acceptState: 'qAccept',
  input: '1011',
  transitions: [
    // q0: scan right to find the end of the number
    { state: 'q0', read: '0', write: '0', move: 'R', next: 'q0' },
    { state: 'q0', read: '1', write: '1', move: 'R', next: 'q0' },
    { state: 'q0', read: '_', write: '_', move: 'L', next: 'q1' },

    // q1: at the end, scan left adding 1
    { state: 'q1', read: '1', write: '0', move: 'L', next: 'q1' }, // carry propagates
    { state: 'q1', read: '0', write: '1', move: 'L', next: 'q2' }, // no more carry
    { state: 'q1', read: '_', write: '1', move: 'R', next: 'qAccept' }, // overflow: prepend 1

    // q2: done - move right to end
    { state: 'q2', read: '0', write: '0', move: 'R', next: 'q2' },
    { state: 'q2', read: '1', write: '1', move: 'R', next: 'q2' },
    { state: 'q2', read: '_', write: '_', move: 'R', next: 'qAccept' },
  ],
};
