// ControlPanel.js - Manages all control buttons and speed slider

import { STATUS, AUTO_STEP_INTERVAL } from '../utils/constants.js';

export class ControlPanel {
  constructor(config) {
    this.onRun = config.onRun;
    this.onStep = config.onStep;
    this.onBack = config.onBack;
    this.onPause = config.onPause;
    this.onReset = config.onReset;
    this.onSpeedChange = config.onSpeedChange;
    this.onSeek = config.onSeek;

    this.btnRun = document.getElementById('btn-run');
    this.btnStep = document.getElementById('btn-step');
    this.btnBack = document.getElementById('btn-back');
    this.btnPause = document.getElementById('btn-pause');
    this.btnReset = document.getElementById('btn-reset');
    this.speedSlider = document.getElementById('speed-slider');
    this.speedLabel = document.getElementById('speed-label');
    
    this.timelineSlider = document.getElementById('timeline-slider');
    this.timelineLabel = document.getElementById('timeline-label');

    this._bindEvents();
  }

  _bindEvents() {
    this.btnRun?.addEventListener('click', () => this.onRun?.());
    this.btnStep?.addEventListener('click', () => this.onStep?.());
    this.btnBack?.addEventListener('click', () => this.onBack?.());
    this.btnPause?.addEventListener('click', () => this.onPause?.());
    this.btnReset?.addEventListener('click', () => this.onReset?.());

    this.speedSlider?.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      const interval = 1100 - val * 100; // Maps 1-10 → 1000ms-100ms
      this.updateSpeedLabel(val);
      this.onSpeedChange?.(interval);
    });

    this.timelineSlider?.addEventListener('input', (e) => {
      const stepIndex = parseInt(e.target.value);
      this.onSeek?.(stepIndex);
      if (this.timelineLabel) {
         this.timelineLabel.textContent = `${stepIndex} / ${this.timelineSlider.max}`;
      }
    });
  }

  updateSpeedLabel(val) {
    if (this.speedLabel) {
      const labels = ['', 'Slowest', 'Slow', 'Slow', 'Medium', 'Medium', 'Medium', 'Fast', 'Fast', 'Faster', 'Fastest'];
      this.speedLabel.textContent = labels[val] || `${val}x`;
    }
  }

  /**
   * Update button states based on machine status
   */
  updateButtons(status, isAutoRunning, canStepBack = false) {
    const halted = status === STATUS.ACCEPTED || status === STATUS.REJECTED;

    if (this.btnRun) {
      this.btnRun.disabled = halted || isAutoRunning;
      this.btnRun.classList.toggle('active', isAutoRunning);
    }
    if (this.btnStep) {
      this.btnStep.disabled = halted || isAutoRunning;
    }
    if (this.btnBack) {
      this.btnBack.disabled = !canStepBack || isAutoRunning;
    }
    if (this.btnPause) {
      this.btnPause.disabled = !isAutoRunning;
    }
    if (this.btnReset) {
      this.btnReset.disabled = false;
    }
  }

  /**
   * Reset all buttons to idle state
   */
  resetButtons() {
    this.updateButtons(STATUS.IDLE, false);
    this.updateTimeline(1, 0);
  }

  /**
   * Update the timeline slider UI
   */
  updateTimeline(historyLength, currentStep) {
    if (this.timelineSlider && this.timelineLabel) {
      this.timelineSlider.max = Math.max(0, historyLength - 1);
      this.timelineSlider.value = currentStep;
      this.timelineSlider.disabled = historyLength <= 1;
      this.timelineLabel.textContent = `${currentStep} / ${this.timelineSlider.max}`;
    }
  }
}
