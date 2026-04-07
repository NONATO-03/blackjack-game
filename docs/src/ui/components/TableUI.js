/**
 * TableUI - Componente da mesa de jogo
 * Exibe cartas do dealer e jogador, HUD, status
 */

import { EventBus } from '../../events/EventBus.js';
import { CardVisuals } from './CardVisuals.js';
import { HUD } from './HUD.js';

export class TableUI {
  #container;
  #cardVisuals;
  #hud;
  #dealerCards = [];
  #playerCards = [];
  #dealerValue = 0;
  #playerValue = 0;
  #balance = 4000;
  #bet = 300;
  #gameLog = [];
  #isDealerRevealed = false;

  constructor(container) {
    this.#container = container;
    this.#cardVisuals = new CardVisuals();
    this.#hud = new HUD();
  }

  /**
   * Renderiza mesa completa
   */
  render() {
    const html = `
      <div class="table-layout">
        <div class="table-title">
          <span>[ MESA DE BLACKJACK ]</span>
        </div>

        <div class="game-main">
          <!-- Left Panel: Dealer Info -->
          <div class="game-panel game-panel-left">
            <div class="panel-title">DEALER</div>
            <div class="panel-dealer" id="dealer-panel">
              <div class="dealer-avatar">🎩</div>
              <div class="cards-display" id="dealer-cards">
                <!-- Cartas renderizadas aqui -->
              </div>
              <div class="value-display" id="dealer-value">? pontos</div>
            </div>
          </div>

          <!-- Center Panel: Game Status -->
          <div class="game-panel game-panel-center">
            <div class="table-stage" id="table-stage">
              <div class="stage-background">
                <div class="felt-texture"></div>
              </div>
              <div class="table-status" id="table-status">
                Preparando mesa...
              </div>
            </div>
          </div>

          <!-- Right Panel: Player Info -->
          <div class="game-panel game-panel-right">
            <div class="panel-title">JOGADOR</div>
            <div class="panel-player" id="player-panel">
              <div class="player-avatar">👤</div>
              <div class="cards-display" id="player-cards">
                <!-- Cartas renderizadas aqui -->
              </div>
              <div class="value-display" id="player-value">? pontos</div>
            </div>
          </div>
        </div>

        <!-- Bottom: HUD -->
        <div class="game-hud" id="hud">
          ${this.#hud.render()}
        </div>

        <!-- Game Log Panel -->
        <div class="game-log-panel">
          <div class="log-title">[ LOG ]</div>
          <div class="log-content" id="game-log">
            <p>▸ Jogo iniciado</p>
          </div>
        </div>
      </div>
    `;

    this.#container.innerHTML = html;
    this.#attachEventListeners();
    this.#addLog('▸ Cartas distribuídas');
  }

  /**
   * Attach event listeners
   * @private
   */
  #attachEventListeners() {
    document.addEventListener('keydown', (e) => {
      const key = e.key.toUpperCase();
      if (key === 'H') {
        EventBus.emit('ui:player-action', { action: 'hit' });
      } else if (key === 'S') {
        EventBus.emit('ui:player-action', { action: 'stand' });
      }
    });
  }

  /**
   * Atualiza cartas distribuídas inicialmente
   */
  updateCardsDealt(data) {
    this.#playerCards = data.playerHand;
    this.#dealerCards = [data.dealerHand[0]]; // Primeira visível, segunda oculta
    this.#playerValue = data.playerValue;
    this.#dealerValue = data.dealerValue;

    this.#renderCards();
    this.#updateValues();
  }

  /**
   * Atualiza quando carta é comprada
   */
  updateCardDrawn(data) {
    if (data.who === 'player') {
      // Simular (em production, RoundManager passaria a Hand completa)
      this.#playerValue = data.value;
      this.#addLog(`▸ Comprou carta (${data.value} pontos)`);
    } else if (data.who === 'dealer') {
      this.#dealerValue = data.value;
      this.#addLog(`▸ Dealer comprou carta`);
    }

    this.#updateValues();
  }

  /**
   * Revela segunda carta do dealer
   */
  revealDealerCard(data) {
    this.#isDealerRevealed = true;
    this.#dealerValue = data.value;
    this.#addLog(`▸ Dealer revelou segunda carta`);
    this.#updateValues();
  }

  /**
   * Renderiza cartas
   * @private
   */
  #renderCards() {
    const dealerCardsEl = document.getElementById('dealer-cards');
    const playerCardsEl = document.getElementById('player-cards');

    if (dealerCardsEl) {
      dealerCardsEl.innerHTML = this.#cardVisuals.renderCards(
        this.#dealerCards,
        this.#isDealerRevealed ? -1 : 0 // -1 = revela tudo, 0 = esconde 1a
      );
    }

    if (playerCardsEl) {
      playerCardsEl.innerHTML = this.#cardVisuals.renderCards(this.#playerCards, -1);
    }
  }

  /**
   * Atualiza valores exibidos
   * @private
   */
  #updateValues() {
    const dealerValueEl = document.getElementById('dealer-value');
    const playerValueEl = document.getElementById('player-value');

    if (dealerValueEl) {
      const dealerText = this.#isDealerRevealed
        ? `${this.#dealerValue} pontos`
        : `? pontos`;
      dealerValueEl.textContent = dealerText;
    }

    if (playerValueEl) {
      playerValueEl.textContent = `${this.#playerValue} pontos`;
    }
  }

  /**
   * Adiciona linha ao log
   * @private
   */
  #addLog(message) {
    this.#gameLog.push(message);
    if (this.#gameLog.length > 8) {
      this.#gameLog.shift();
    }

    const logEl = document.getElementById('game-log');
    if (logEl) {
      logEl.innerHTML = this.#gameLog.map(msg => `<p>${msg}</p>`).join('');
      logEl.scrollTop = logEl.scrollHeight;
    }
  }

  /**
   * Atualiza balance
   */
  updateBalance(newBalance) {
    this.#balance = newBalance;
    const balanceEl = document.querySelector('.hud-balance .value');
    if (balanceEl) {
      balanceEl.textContent = `$ ${newBalance.toFixed(2)}`;
    }
  }

  /**
   * Getters
   */
  get log() { return [...this.#gameLog]; }
}

export default TableUI;
