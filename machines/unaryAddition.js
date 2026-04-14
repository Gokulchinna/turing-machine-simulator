// unaryAddition.js - Computes m + n in unary
// Input: 1^m + 1^n  e.g. "111+11" = 3+2
// Strategy: replace '+' with '1' → gives m+1+n ones, then erase one '1' → m+n ones
// Result visible on tape as a row of 1s

export const unaryAddition = {
  name: 'Unary Addition',
  description: 'Computes m + n in unary notation. Input: 1ᵐ+1ⁿ (e.g. "111+11" = 3+2 = 5). Result is 1^(m+n) on tape.',
  states: ['q0', 'q1', 'q2', 'qAccept'],
  startState: 'q0',
  acceptState: 'qAccept',
  input: '111+11',
  transitions: [
    // q0: scan right through first block of 1s
    { state: 'q0', read: '1', write: '1', move: 'R', next: 'q0' },
    // Replace '+' with '1', switch to scanning second block
    { state: 'q0', read: '+', write: '1', move: 'R', next: 'q1' },
    // q1: scan right through second block of 1s
    { state: 'q1', read: '1', write: '1', move: 'R', next: 'q1' },
    // Reached end → go left to erase one trailing 1
    { state: 'q1', read: '_', write: '_', move: 'L', next: 'q2' },
    // q2: erase the last '1' (compensate for the extra '1' we wrote over '+')
    { state: 'q2', read: '1', write: '_', move: 'R', next: 'qAccept' },
  ],
};
