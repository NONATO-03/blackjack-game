/**
 * HUD - Head-Up Display com balance, aposta, controles
 */

import { EventBus } from '../../events/EventBus.js';

export class HUD {
  #balance = 4000;
  #bet = 300;
  #inventory = {};

  /**
   * Renderiza HUD
   */
  render() {
    return `
      <div class="hud-container">
        <div class="hud-left">
          <div class="hud-balance">
            <span class="label">SALDO:</span>
            <span class="value">$ ${this.#balance.toFixed(2)}</span>
          </div>
          <div class="hud-bet">
            <span class="label">APOSTA:</span>
            <span class="value">$ ${this.#bet.toFixed(2)}</span>
          </div>
        </div>

        <div class="hud-center">
          <div class="hud-controls">
            <button class="btn btn-hit" id="btn-hit" title="H - Comprar carta">
              [H] HIT
            </button>
            <button class="btn btn-stand" id="btn-stand" title="S - Passar">
              [S] STAND
            </button>
          </div>
          <div class="hud-status" id="hud-status">
            Aguardando ação...
          </div>
        </div>

        <div class="hud-right">
          <div class="hud-info">
            <div class="info-row">
              <span class="label">Multiplicador:</span>
              <span class="value">1.45x</span>
            </div>
            <div class="info-row">
              <span class="label">Ganho:</span>
              <span class="value">$ 435.00</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Atualiza status
   */
  updateStatus(message) {
    const statusEl = document.getElementById('hud-status');
    if (statusEl) {
      statusEl.textContent = message;
    }
  }

  /**
   * Habilita/desabilita controles
   */
  setControlsEnabled(enabled) {
    const hitBtn = document.getElementById('btn-hit');
    const standBtn = document.getElementById('btn-stand');

    if (hitBtn) hitBtn.disabled = !enabled;
    if (standBtn) standBtn.disabled = !enabled;
  }

  /**
   * Setters
   */
  set balance(value) { this.#balance = value; }
  set bet(value) { this.#bet = value; }
  set inventory(value) { this.#inventory = value; }
}

export default HUD;
