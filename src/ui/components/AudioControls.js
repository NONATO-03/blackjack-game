/**
 * AudioControls - Componente de interface para controle de áudio
 * Volume master, SFX, música e mute
 */

import { EventBus } from '../../events/EventBus.js';

export class AudioControls {
  #audioManager;
  #isVisible = false;
  #container = null;

  constructor(audioManager) {
    this.#audioManager = audioManager;
  }

  /**
   * Renderiza controles de áudio
   */
  render() {
    const masterVol = Math.round(this.#audioManager.masterVolume * 100);
    const sfxVol = Math.round(this.#audioManager.sfxVolume * 100);
    const musicVol = Math.round(this.#audioManager.musicVolume * 100);
    const muted = this.#audioManager.isMuted;

    return `
      <div class="audio-controls-panel" id="audio-controls">
        <div class="audio-header">
          <span class="audio-title">🔊 ÁUDIO</span>
          <button class="audio-close-btn" id="audio-close-btn">✕</button>
        </div>

        <!-- Master Volume -->
        <div class="audio-control-group">
          <div class="control-label">Master</div>
          <div class="control-slider">
            <input type="range"
                   id="master-volume"
                   min="0"
                   max="100"
                   value="${masterVol}"
                   class="volume-slider">
            <span class="volume-display" id="master-display">${masterVol}%</span>
          </div>
        </div>

        <!-- SFX Volume -->
        <div class="audio-control-group">
          <div class="control-label">SFX</div>
          <div class="control-slider">
            <input type="range"
                   id="sfx-volume"
                   min="0"
                   max="100"
                   value="${sfxVol}"
                   class="volume-slider">
            <span class="volume-display" id="sfx-display">${sfxVol}%</span>
          </div>
        </div>

        <!-- Music Volume -->
        <div class="audio-control-group">
          <div class="control-label">Música</div>
          <div class="control-slider">
            <input type="range"
                   id="music-volume"
                   min="0"
                   max="100"
                   value="${musicVol}"
                   class="volume-slider">
            <span class="volume-display" id="music-display">${musicVol}%</span>
          </div>
        </div>

        <!-- Mute Button -->
        <div class="audio-control-group">
          <button class="btn btn-mute ${muted ? 'muted' : ''}" id="mute-btn">
            ${muted ? '🔇 DESMUTADO' : '🔊 MUTAR'}
          </button>
        </div>

        <div class="audio-info">
          <span class="info-text">Sons ativos: <span id="active-sounds">0</span></span>
        </div>
      </div>
    `;
  }

  /**
   * Mostra painel de controles
   */
  show(parentElement = document.body) {
    const html = this.render();
    const panel = document.createElement('div');
    panel.innerHTML = html;
    parentElement.appendChild(panel);

    this.#container = document.getElementById('audio-controls');
    this.#isVisible = true;

    this.#attachEventListeners();
    this.#startUpdatingStatus();
  }

  /**
   * Esconde painel
   */
  hide() {
    if (this.#container) {
      this.#container.parentElement.removeChild(this.#container);
      this.#isVisible = false;
    }
  }

  /**
   * Attach listeners
   * @private
   */
  #attachEventListeners() {
    // Master volume
    const masterSlider = document.getElementById('master-volume');
    if (masterSlider) {
      masterSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value) / 100;
        this.#audioManager.setVolume('master', value);
        document.getElementById('master-display').textContent = e.target.value + '%';
      });
    }

    // SFX volume
    const sfxSlider = document.getElementById('sfx-volume');
    if (sfxSlider) {
      sfxSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value) / 100;
        this.#audioManager.setVolume('sfx', value);
        document.getElementById('sfx-display').textContent = e.target.value + '%';
      });
    }

    // Music volume
    const musicSlider = document.getElementById('music-volume');
    if (musicSlider) {
      musicSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value) / 100;
        this.#audioManager.setVolume('music', value);
        document.getElementById('music-display').textContent = e.target.value + '%';
      });
    }

    // Mute button
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const isMuted = this.#audioManager.isMuted;
        this.#audioManager.setMute(!isMuted);
        muteBtn.classList.toggle('muted');
        muteBtn.textContent = !isMuted ? '🔇 DESMUTADO' : '🔊 MUTAR';
      });
    }

    // Close button
    const closeBtn = document.getElementById('audio-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }
  }

  /**
   * Atualiza status de sons ativos
   * @private
   */
  #startUpdatingStatus() {
    const updateStatus = () => {
      const display = document.getElementById('active-sounds');
      if (display) {
        display.textContent = this.#audioManager.activeAudioCount;
      }
      if (this.#isVisible) {
        requestAnimationFrame(updateStatus);
      }
    };
    updateStatus();
  }

  /**
   * Toggle visibility
   */
  toggle() {
    if (this.#isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Getters
   */
  get isVisible() { return this.#isVisible; }
}

export default AudioControls;
