// anbn.js - Recognizes the language aⁿbⁿ (equal number of a's followed by b's)
// Example: "aabb" → ACCEPT, "aaabbb" → ACCEPT, "ab" → ACCEPT, "aab" → REJECT

export const anbn = {
  name: 'aⁿbⁿ Checker',
  description: 'Accepts strings of the form aⁿbⁿ (n ≥ 1). Equal number of a\'s followed by equal number of b\'s.',
  states: ['q0', 'q1', 'q2', 'q3', 'qAccept'],
  startState: 'q0',
  acceptState: 'qAccept',
  input: 'aabb',
  transitions: [
    // q0: scan right, find first 'a', mark it with X
    { state: 'q0', read: 'a', write: 'X', move: 'R', next: 'q1' },
    { state: 'q0', read: 'Y', write: 'Y', move: 'R', next: 'q3' },
    // q1: skip a's and Y's, find first b, mark with Y
    { state: 'q1', read: 'a', write: 'a', move: 'R', next: 'q1' },
    { state: 'q1', read: 'Y', write: 'Y', move: 'R', next: 'q1' },
    { state: 'q1', read: 'b', write: 'Y', move: 'L', next: 'q2' },
    // q2: go back left to find leftmost 'a'
    { state: 'q2', read: 'a', write: 'a', move: 'L', next: 'q2' },
    { state: 'q2', read: 'Y', write: 'Y', move: 'L', next: 'q2' },
    { state: 'q2', read: 'X', write: 'X', move: 'R', next: 'q0' },
    // q3: verify all b's are marked (Y), reach blank → accept
    { state: 'q3', read: 'Y', write: 'Y', move: 'R', next: 'q3' },
    { state: 'q3', read: '_', write: '_', move: 'R', next: 'qAccept' },
  ],
};
