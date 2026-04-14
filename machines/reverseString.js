// reverseString.js - Reverses a string over {a, b}
// Approach: repeatedly move the rightmost unprocessed char to the left output area
// For simplicity, marks positions with | as separator and X as processed
// Example: "abc" → "cba" (over {a,b,c})

export const reverseString = {
  name: 'String Reversal',
  description: 'Reverses a string over {a, b, c}. Left-to-right approach: replaces each char with X, writes it to the left, then cleans up.',
  states: ['q0', 'q_write_a', 'q_write_b', 'q_write_c', 'q_return_out', 'q_return_X', 'q_cleanup', 'qAccept'],
  startState: 'q0',
  acceptState: 'qAccept',
  input: 'abc',
  transitions: [
    // q0: Start. Read first character
    { state: 'q0', read: 'a', write: 'X', move: 'L', next: 'q_write_a' },
    { state: 'q0', read: 'b', write: 'X', move: 'L', next: 'q_write_b' },
    { state: 'q0', read: 'c', write: 'X', move: 'L', next: 'q_write_c' },
    { state: 'q0', read: '_', write: '_', move: 'R', next: 'qAccept' },

    // q_write_a: Move left until blank, write 'a'
    { state: 'q_write_a', read: 'X', write: 'X', move: 'L', next: 'q_write_a' },
    { state: 'q_write_a', read: 'a', write: 'a', move: 'L', next: 'q_write_a' },
    { state: 'q_write_a', read: 'b', write: 'b', move: 'L', next: 'q_write_a' },
    { state: 'q_write_a', read: 'c', write: 'c', move: 'L', next: 'q_write_a' },
    { state: 'q_write_a', read: '_', write: 'a', move: 'R', next: 'q_return_out' },

    // q_write_b: Move left until blank, write 'b'
    { state: 'q_write_b', read: 'X', write: 'X', move: 'L', next: 'q_write_b' },
    { state: 'q_write_b', read: 'a', write: 'a', move: 'L', next: 'q_write_b' },
    { state: 'q_write_b', read: 'b', write: 'b', move: 'L', next: 'q_write_b' },
    { state: 'q_write_b', read: 'c', write: 'c', move: 'L', next: 'q_write_b' },
    { state: 'q_write_b', read: '_', write: 'b', move: 'R', next: 'q_return_out' },

    // q_write_c: Move left until blank, write 'c'
    { state: 'q_write_c', read: 'X', write: 'X', move: 'L', next: 'q_write_c' },
    { state: 'q_write_c', read: 'a', write: 'a', move: 'L', next: 'q_write_c' },
    { state: 'q_write_c', read: 'b', write: 'b', move: 'L', next: 'q_write_c' },
    { state: 'q_write_c', read: 'c', write: 'c', move: 'L', next: 'q_write_c' },
    { state: 'q_write_c', read: '_', write: 'c', move: 'R', next: 'q_return_out' },

    // q_return_out: Move right over output string until 'X' is reached
    { state: 'q_return_out', read: 'a', write: 'a', move: 'R', next: 'q_return_out' },
    { state: 'q_return_out', read: 'b', write: 'b', move: 'R', next: 'q_return_out' },
    { state: 'q_return_out', read: 'c', write: 'c', move: 'R', next: 'q_return_out' },
    { state: 'q_return_out', read: 'X', write: 'X', move: 'R', next: 'q_return_X' },

    // q_return_X: Move right over 'X's until next input character or blank
    { state: 'q_return_X', read: 'X', write: 'X', move: 'R', next: 'q_return_X' },
    { state: 'q_return_X', read: 'a', write: 'X', move: 'L', next: 'q_write_a' },
    { state: 'q_return_X', read: 'b', write: 'X', move: 'L', next: 'q_write_b' },
    { state: 'q_return_X', read: 'c', write: 'X', move: 'L', next: 'q_write_c' },
    { state: 'q_return_X', read: '_', write: '_', move: 'L', next: 'q_cleanup' },

    // q_cleanup: Remove 'X's
    { state: 'q_cleanup', read: 'X', write: '_', move: 'L', next: 'q_cleanup' },
    { state: 'q_cleanup', read: 'a', write: 'a', move: 'R', next: 'qAccept' },
    { state: 'q_cleanup', read: 'b', write: 'b', move: 'R', next: 'qAccept' },
    { state: 'q_cleanup', read: 'c', write: 'c', move: 'R', next: 'qAccept' },
    { state: 'q_cleanup', read: '_', write: '_', move: 'R', next: 'qAccept' },
  ],
};
