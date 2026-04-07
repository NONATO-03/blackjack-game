/**
 * SellerAvatar - Animação do vendedor na loja
 * Respira, pisca, fala, gesticula
 */

import { EventBus } from '../../events/EventBus.js';

export class SellerAvatar {
  #currentState = 'idle'; // idle, blink, talk, buy
  #breathScale = 1;
  #animationFactor = 0;
  #rafId = null;
  #messages = [
    '[VENDEDOR]: Sorte não se compra, quase isso...',
    '[VENDEDOR]: Compra agora, reclama depois.',
    '[VENDEDOR]: Não é barato, mas perde menos que no caos.',
    '[VENDEDOR]: Dinheiro parado não vence partida.',
    '[VENDEDOR]: Se for comprar, compre direito.'
  ];

  /**
   * Renderiza avatar do vendedor
   */
  render() {
    return `
      <div class="seller-container">
        <div class="seller-background">
          <div class="seller-char" id="seller-char">
            🧛
          </div>
        </div>
        <div class="seller-message" id="seller-message">
          ${this.#messages[Math.floor(Math.random() * this.#messages.length)]}
        </div>
      </div>
    `;
  }

  /**
   * Inicia animação de respiração
   */
  startAnimation() {
    if (this.#rafId) return; // Já rodando

    const animate = () => {
      const time = performance.now() / 1000;

      // Respiração suave (scale 1.0 → 1.1 → 1.0)
      const breathCycle = Math.sin(time * 0.5) * 0.05;
      this.#breathScale = 1 + breathCycle;

      // Atualizar char
      const charEl = document.getElementById('seller-char');
      if (charEl) {
        charEl.style.transform = `scale(${this.#breathScale})`;
        charEl.style.transition = 'transform 0.1s ease-out';
      }

      this.#rafId = requestAnimationFrame(animate);
    };

    animate();
  }

  /**
   * Para animação
   */
  stopAnimation() {
    if (this.#rafId) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
  }

  /**
   * Pisca
   */
  blink() {
    const charEl = document.getElementById('seller-char');
    if (!charEl) return;

    this.#currentState = 'blink';
    charEl.textContent = '😑';
    charEl.style.transition = 'all 0.15s ease-out';

    setTimeout(() => {
      charEl.textContent = '🧛';
      this.#currentState = 'idle';
    }, 150);
  }

  /**
   * Fala
   */
  talk(message = null) {
    const charEl = document.getElementById('seller-char');
    const messageEl = document.getElementById('seller-message');
    if (!charEl || !messageEl) return;

    this.#currentState = 'talk';
    charEl.textContent = '🗣️';
    charEl.style.animation = 'none';

    const msg = message || this.#messages[Math.floor(Math.random() * this.#messages.length)];
    messageEl.textContent = msg;
    messageEl.style.opacity = '1';

    setTimeout(() => {
      charEl.textContent = '🧛';
      this.#currentState = 'idle';
      messageEl.style.opacity = '0.7';
    }, 2000);
  }

  /**
   * Reação de compra
   */
  buy() {
    const charEl = document.getElementById('seller-char');
    if (!charEl) return;

    this.#currentState = 'buy';
    charEl.textContent = '👍';
    charEl.style.animation = 'bounce 0.6s ease-in-out';

    this.talk('[VENDEDOR]: Compra confirmada. Use com inteligência.');

    setTimeout(() => {
      charEl.textContent = '🧛';
      charEl.style.animation = 'none';
      this.#currentState = 'idle';
    }, 1000);
  }

  /**
   * Getters
   */
  get state() { return this.#currentState; }
}

export default SellerAvatar;
