// equalAB.js - Accepts strings over {a,b} with equal number of a's and b's (any order)
// Unlike aⁿbⁿ, this accepts "abba", "baba", "baab" etc.
// This is NOT a regular language and NOT context-free — only a TM can decide it!
// (Actually equal #a = #b IS context-free, but the TM approach demonstrates power clearly)
// Algorithm: match each 'a' with a 'b' (mark both as X), repeat, accept if all matched

export const equalAB = {
  name: 'Equal #a and #b',
  description: 'Accepts strings over {a,b} with equal numbers of a\'s and b\'s in ANY order. e.g. "abba", "baab", "aabb" → ACCEPT.',
  states: ['q0', 'q1', 'q2', 'q3', 'qAccept'],
  startState: 'q0',
  acceptState: 'qAccept',
  input: 'abba',
  transitions: [
    // q0: scan for next unprocessed symbol
    { state: 'q0', read: 'X', write: 'X', move: 'R', next: 'q0' },  // skip matched
    { state: 'q0', read: 'a', write: 'X', move: 'R', next: 'q1' },  // found 'a', match with 'b'
    { state: 'q0', read: 'b', write: 'X', move: 'R', next: 'q2' },  // found 'b', match with 'a'
    { state: 'q0', read: '_', write: '_', move: 'R', next: 'qAccept' }, // all matched → accept

    // q1: found 'a', scan right for a 'b' to match
    { state: 'q1', read: 'a', write: 'a', move: 'R', next: 'q1' },
    { state: 'q1', read: 'X', write: 'X', move: 'R', next: 'q1' },
    { state: 'q1', read: 'b', write: 'X', move: 'L', next: 'q3' },  // found 'b', mark it
    // no transition on '_' → REJECT (unmatched 'a')

    // q2: found 'b', scan right for an 'a' to match
    { state: 'q2', read: 'b', write: 'b', move: 'R', next: 'q2' },
    { state: 'q2', read: 'X', write: 'X', move: 'R', next: 'q2' },
    { state: 'q2', read: 'a', write: 'X', move: 'L', next: 'q3' },  // found 'a', mark it
    // no transition on '_' → REJECT (unmatched 'b')

    // q3: go back left to find the start (leftmost blank)
    { state: 'q3', read: 'a', write: 'a', move: 'L', next: 'q3' },
    { state: 'q3', read: 'b', write: 'b', move: 'L', next: 'q3' },
    { state: 'q3', read: 'X', write: 'X', move: 'L', next: 'q3' },
    { state: 'q3', read: '_', write: '_', move: 'R', next: 'q0' },  // back to start
  ],
};
