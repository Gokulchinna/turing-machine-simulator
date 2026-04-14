// constants.js - Global constants for the Turing Machine Simulator

export const BLANK_SYMBOL = '_';
export const MAX_STEPS = 1000;

export const STATUS = {
  RUNNING: 'RUNNING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  IDLE: 'IDLE',
  PAUSED: 'PAUSED',
};

export const DIRECTION = {
  LEFT: 'L',
  RIGHT: 'R',
  STAY: 'S',
};

export const STATUS_COLORS = {
  RUNNING: '#f59e0b',
  ACCEPTED: '#10b981',
  REJECTED: '#ef4444',
  IDLE: '#6b7280',
  PAUSED: '#8b5cf6',
};

export const AUTO_STEP_INTERVAL = 400; // ms between auto steps
export const TAPE_VISIBLE_CELLS = 21;  // number of cells shown at once
