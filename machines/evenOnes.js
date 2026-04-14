// evenOnes.js - Accepts binary strings with an even number of 1s
// Example: "1010" → ACCEPT (2 ones), "101" → REJECT (3 ones), "" → ACCEPT (0 ones)

export const evenOnes = {
  name: 'Even Number of 1s',
  description: 'Accepts binary strings containing an even number of 1s (including zero 1s).',
  states: ['qEven', 'qOdd', 'qAccept'],
  startState: 'qEven',
  acceptState: 'qAccept',
  input: '1010',
  transitions: [
    // qEven: even count of 1s so far
    { state: 'qEven', read: '0', write: '0', move: 'R', next: 'qEven' },
    { state: 'qEven', read: '1', write: '1', move: 'R', next: 'qOdd' },
    { state: 'qEven', read: '_', write: '_', move: 'R', next: 'qAccept' }, // end with even → accept

    // qOdd: odd count of 1s so far
    { state: 'qOdd', read: '0', write: '0', move: 'R', next: 'qOdd' },
    { state: 'qOdd', read: '1', write: '1', move: 'R', next: 'qEven' },
    // No transition on '_' in qOdd → REJECT (odd number of 1s)
  ],
};
