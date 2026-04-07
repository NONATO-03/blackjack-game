/**
 * ResultPanel - Painel de resultado con animación e contador
 */

import { EventBus } from '../../events/EventBus.js';

export class ResultPanel {
  #container;
  #panelEl = null;

  constructor(container) {
    this.#container = container;
  }

  /**
   * Mostra painel de resultado
   */
  show(data) {
    const { result, gain, playerValue, dealerValue } = data;

    const title = this.#getTitle(result);
    const bgClass = `result-${result}`;
    const gainSign = gain >= 0 ? '+' : '';
    const gainColor = gain >= 0 ? '#00ff00' : '#ff0000';

    const html = `
      <div class="result-overlay">
        <div class="result-panel ${bgClass}">
          <div class="result-title">${title}</div>

          <div class="result-values">
            <div class="value-row">
              <span class="label">Você:</span>
              <span class="value">${playerValue} pontos</span>
            </div>
            <div class="value-row">
              <span class="label">Dealer:</span>
              <span class="value">${dealerValue} pontos</span>
            </div>
          </div>

          <div class="result-gain" style="color: ${gainColor}">
            <span class="label">Ganho:</span>
            <span class="number" id="gain-counter">$ ${gainSign}${Math.abs(gain).toFixed(2)}</span>
          </div>

          <div class="result-buttons">
            <button class="btn btn-primary" id="btn-next-round">
              PRÓXIMA RODADA
            </button>
            <button class="btn btn-secondary" id="btn-return-shop">
              VOLTAR À LOJA
            </button>
          </div>
        </div>
      </div>
    `;

    this.#container.innerHTML = html;
    this.#panelEl = document.querySelector('.result-panel');

    // Trigger animation
    setTimeout(() => {
      if (this.#panelEl) {
        this.#panelEl.classList.add('slide-in');
      }
    }, 50);

    // Counter animation
    this.#animateCounter(gain);

    // Attach listeners
    this.#attachEventListeners();
  }

  /**
   * Anima contador de ganho
   * @private
   */
  #animateCounter(finalValue) {
    const element = document.getElementById('gain-counter');
    if (!element) return;

    const duration = 1.5; // segundos
    const startTime = performance.now();
    const startValue = 0;

    const animate = (currentTime) => {
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);

      // Easing: cubic
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const currentValue = startValue + (finalValue - startValue) * eased;
      const sign = finalValue >= 0 ? '+' : '';

      element.textContent = `$ ${sign}${currentValue.toFixed(2)}`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Attach event listeners
   * @private
   */
  #attachEventListeners() {
    const btnNext = document.getElementById('btn-next-round');
    const btnReturn = document.getElementById('btn-return-shop');

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        EventBus.emit('ui:next-round-clicked');
      });
    }

    if (btnReturn) {
      btnReturn.addEventListener('click', () => {
        EventBus.emit('ui:return-shop-clicked');
      });
    }
  }

  /**
   * Retorna título baseado no resultado
   * @private
   */
  #getTitle(result) {
    const titles = {
      'win': '🎉 VITÓRIA!',
      'loss': '💀 DERROTA!',
      'push': '🤝 EMPATE!'
    };
    return titles[result] || 'RESULTADO';
  }
}

export default ResultPanel;
