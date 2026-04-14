// palindrome.js - Checks if a string over {a, b} is a palindrome
// Approach: repeatedly match and erase outermost characters
// Example: "abba" → ACCEPT, "aba" → ACCEPT, "ab" → REJECT

export const palindrome = {
  name: 'Palindrome Checker',
  description: 'Accepts palindromes over {a, b}. Example: "abba", "aba", "aabaa" are accepted.',
  states: ['q0', 'q1a', 'q1b', 'q2a', 'q2b', 'q3', 'q4', 'qAccept'],
  startState: 'q0',
  acceptState: 'qAccept',
  input: 'abba',
  transitions: [
    // q0: read leftmost symbol, mark it
    { state: 'q0', read: 'a', write: 'X', move: 'R', next: 'q1a' },
    { state: 'q0', read: 'b', write: 'X', move: 'R', next: 'q1b' },
    { state: 'q0', read: 'X', write: 'X', move: 'R', next: 'q4' },
    { state: 'q0', read: '_', write: '_', move: 'R', next: 'qAccept' },

    // q1a: scanning right after reading 'a' from left
    { state: 'q1a', read: 'a', write: 'a', move: 'R', next: 'q1a' },
    { state: 'q1a', read: 'b', write: 'b', move: 'R', next: 'q1a' },
    { state: 'q1a', read: 'X', write: 'X', move: 'L', next: 'q2a' },
    { state: 'q1a', read: '_', write: '_', move: 'L', next: 'q2a' },

    // q2a: looking for matching 'a' on the right
    { state: 'q2a', read: 'a', write: 'X', move: 'L', next: 'q3' },
    { state: 'q2a', read: 'X', write: 'X', move: 'R', next: 'q4' }, // single char in middle

    // q1b: scanning right after reading 'b' from left
    { state: 'q1b', read: 'a', write: 'a', move: 'R', next: 'q1b' },
    { state: 'q1b', read: 'b', write: 'b', move: 'R', next: 'q1b' },
    { state: 'q1b', read: 'X', write: 'X', move: 'L', next: 'q2b' },
    { state: 'q1b', read: '_', write: '_', move: 'L', next: 'q2b' },

    // q2b: looking for matching 'b' on the right
    { state: 'q2b', read: 'b', write: 'X', move: 'L', next: 'q3' },
    { state: 'q2b', read: 'X', write: 'X', move: 'R', next: 'q4' }, // single char in middle

    // q3: go back left to find next leftmost symbol
    { state: 'q3', read: 'a', write: 'a', move: 'L', next: 'q3' },
    { state: 'q3', read: 'b', write: 'b', move: 'L', next: 'q3' },
    { state: 'q3', read: 'X', write: 'X', move: 'R', next: 'q0' },

    // q4: all X's - accept
    { state: 'q4', read: 'X', write: 'X', move: 'R', next: 'q4' },
    { state: 'q4', read: '_', write: '_', move: 'R', next: 'qAccept' },
  ],
};
