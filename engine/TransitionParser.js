// TransitionParser.js - Parses transition data from various input formats

/**
 * Parse transition table rows from the builder UI or predefined machines
 * Input format (array of objects):
 * [{ state, read, write, move, next }, ...]
 *
 * Output format (Map):
 * Map { "state,symbol" => { nextState, writeSymbol, direction } }
 */
export class TransitionParser {
  /**
   * Parse an array of transition rule objects into a Map
   */
  static parseRules(rules) {
    const map = new Map();
    for (const rule of rules) {
      const key = `${rule.state},${rule.read}`;
      map.set(key, {
        nextState: rule.next,
        writeSymbol: rule.write,
        direction: rule.move.toUpperCase(),
      });
    }
    return map;
  }

  /**
   * Parse from a predefined machine definition
   * Predefined machines use the same format
   */
  static parseMachine(machineDef) {
    const {
      states,
      startState,
      acceptState,
      transitions,
      input,
      name,
      description,
    } = machineDef;

    const transitionMap = this.parseRules(transitions);

    return {
      states: states || [],
      startState,
      acceptState,
      transitions: transitionMap,
      input: input || '',
      name: name || 'Custom Machine',
      description: description || '',
    };
  }

  /**
   * Serialize a transition Map back to array format (for display)
   */
  static serializeToArray(transitionMap) {
    const result = [];
    for (const [key, val] of transitionMap) {
      const [state, read] = key.split(',');
      result.push({
        state,
        read,
        write: val.writeSymbol,
        move: val.direction,
        next: val.nextState,
      });
    }
    return result;
  }
}
