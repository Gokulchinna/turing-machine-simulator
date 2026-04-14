// Validator.js - Validates a custom Turing Machine definition before running

export class Validator {
  /**
   * Validate a machine config object
   * Returns { valid: boolean, errors: string[] }
   */
  static validate(config) {
    const errors = [];
    const { states, startState, acceptState, transitions, input } = config;

    // Check states
    if (!states || states.length === 0) {
      errors.push({ message: '❌ No states defined. Add at least a start state and accept state.', fieldId: 'b-states' });
    }

    // Check start state
    if (!startState || startState.trim() === '') {
      errors.push({ message: '❌ Start state is required.', fieldId: 'b-start' });
    } else if (states && !states.includes(startState)) {
      errors.push({ message: `❌ Start state "${startState}" is not in the states list.`, fieldId: 'b-start' });
    }

    // Check accept state
    if (!acceptState || acceptState.trim() === '') {
      errors.push({ message: '❌ Accept state is required.', fieldId: 'b-accept' });
    } else if (states && !states.includes(acceptState)) {
      errors.push({ message: `❌ Accept state "${acceptState}" is not in the states list.`, fieldId: 'b-accept' });
    }

    // Check that start ≠ accept
    if (startState && acceptState && startState === acceptState) {
      errors.push({ message: '❌ Start state and accept state must be different.', fieldId: 'b-accept' });
    }

    // Check transitions
    if (!transitions || (Array.isArray(transitions) && transitions.length === 0)) {
      errors.push({ message: '❌ No transitions defined. Add at least one transition rule.', fieldId: 'builder-tbody' });
    }

    // Per-rule validation
    if (Array.isArray(transitions)) {
      const seen = new Set();
      transitions.forEach((rule, i) => {
        const rowLabel = `Row ${i + 1}`;

        if (!rule.state || rule.state.trim() === '') {
          errors.push({ message: `❌ ${rowLabel}: State is empty.`, rowIdx: i, fieldClass: '.t-state' });
        }
        if (rule.read === undefined || rule.read === null || rule.read === '') {
          errors.push({ message: `❌ ${rowLabel}: Read symbol is empty.`, rowIdx: i, fieldClass: '.t-read' });
        }
        if (rule.write === undefined || rule.write === null || rule.write === '') {
          errors.push({ message: `❌ ${rowLabel}: Write symbol is empty.`, rowIdx: i, fieldClass: '.t-write' });
        }
        if (!['L', 'R', 'S'].includes((rule.move || '').toUpperCase())) {
          errors.push({ message: `❌ ${rowLabel}: Move direction must be L, R, or S.`, rowIdx: i, fieldClass: '.t-move' });
        }
        if (!rule.next || rule.next.trim() === '') {
          errors.push({ message: `❌ ${rowLabel}: Next state is empty.`, rowIdx: i, fieldClass: '.t-next' });
        }

        // Check states exist
        if (states && rule.state && !states.includes(rule.state)) {
          errors.push({ message: `❌ ${rowLabel}: State "${rule.state}" not in states list.`, rowIdx: i, fieldClass: '.t-state' });
        }
        if (states && rule.next && !states.includes(rule.next)) {
          errors.push({ message: `❌ ${rowLabel}: Next state "${rule.next}" not in states list.`, rowIdx: i, fieldClass: '.t-next' });
        }

        // Duplicate detection
        const key = `${rule.state},${rule.read}`;
        if (seen.has(key)) {
          errors.push({ message: `❌ Duplicate transition for (${rule.state}, ${rule.read}).`, rowIdx: i, fieldClass: '.t-state' });
        }
        seen.add(key);
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Quickly validate just an input string's symbols
   */
  static validateInput(input, alphabet) {
    if (!alphabet || alphabet.length === 0) return { valid: true, errors: [] };
    const errors = [];
    for (const ch of input) {
      if (!alphabet.includes(ch) && ch !== '_') {
        errors.push(`❌ Symbol "${ch}" not in input alphabet {${alphabet.join(', ')}}.`);
      }
    }
    return { valid: errors.length === 0, errors };
  }
}
