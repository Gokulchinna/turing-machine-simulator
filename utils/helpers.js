// helpers.js - Utility helper functions

/**
 * Deep clone an object/array
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Format a transition for display
 * δ(state, symbol) → (nextState, writeSymbol, direction)
 */
export function formatTransition(state, symbol, nextState, writeSymbol, direction) {
  return `δ(${state}, ${symbol}) → (${nextState}, ${writeSymbol}, ${direction})`;
}

/**
 * Debounce function
 */
export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Sanitize a string to be used as a symbol (single character or blank)
 */
export function sanitizeSymbol(s) {
  return s.trim() || '_';
}

/**
 * Generate a unique ID
 */
export function uid() {
  return Math.random().toString(36).slice(2, 9);
}

/**
 * Escape HTML to prevent XSS in dynamic content
 */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
