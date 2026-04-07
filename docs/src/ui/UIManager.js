/**
 * UIManager - Singleton que coordena renderização de todos os componentes
 * Gerencia qual tela está ativa (SHOP, TABLE, RESULT) e valida transições
 */

import { EventBus } from '../events/EventBus.js';
import { GameState } from '../game/GameState.js';
import { ShopUI } from './components/ShopUI.js';
import { TableUI } from './components/TableUI.js';
import { ResultPanel } from './components/ResultPanel.js';

export class UIManager {
  static #instance = null;

  #currentScreen = null;
  #crtContent = null;
  #shopUI = null;
  #tableUI = null;
  #resultPanel = null;
  #isInitialized = false;
  #isLocked = false;

  static getInstance() {
    if (!UIManager.#instance) {
      UIManager.#instance = new UIManager();
    }
    return UIManager.#instance;
  }

  /**
   * Inicialização
   */
  async init() {
    if (this.#isInitialized) {
      console.warn('UIManager já inicializado');
      return;
    }

    try {
      // Encontrar container principal
      this.#crtContent = document.getElementById('crt-content');
      if (!this.#crtContent) {
        throw new Error('Elemento #crt-content não encontrado no DOM');
      }

      // Inicializar componentes
      this.#shopUI = new ShopUI(this.#crtContent);
      this.#tableUI = new TableUI(this.#crtContent);
      this.#resultPanel = new ResultPanel(this.#crtContent);

      // Configurar listeners de eventos do game
      this.#setupGameListeners();

      // Configurar handlers de input
      this.#setupInputHandlers();

      this.#isInitialized = true;
      console.log('[UIManager] Inicializado com sucesso');
    } catch (error) {
      console.error('[UIManager] Erro na inicialização:', error);
      throw error;
    }
  }

  /**
   * Listeners de eventos do GameEngine
   * @private
   */
  #setupGameListeners() {
    EventBus.on('game:state-changed', (data) => {
      this.#onStateChanged(data);
    });

    EventBus.on('game:cards-dealt', (data) => {
      this.#tableUI.updateCardsDealt(data);
    });

    EventBus.on('card:drawn', (data) => {
      this.#tableUI.updateCardDrawn(data);
    });

    EventBus.on('card:revealed', (data) => {
      this.#tableUI.revealDealerCard(data);
    });

    EventBus.on('game:round-result', (data) => {
      this.#onRoundResult(data);
    });

    EventBus.on('player:balance-changed', (data) => {
      this.#updateBalance(data);
    });

    EventBus.on('shop:tab-changed', (data) => {
      this.#shopUI.updateTab(data);
    });

    EventBus.on('shop:item-purchased', (data) => {
      this.#shopUI.announceItem(data);
    });

    console.log('[UIManager] Game listeners configurados');
  }

  /**
   * Input handlers (keyboard + mouse)
   * @private
   */
  #setupInputHandlers() {
    document.addEventListener('keydown', (e) => {
      if (this.#isLocked) return;

      const key = e.key.toUpperCase();

      // Hit (H) ou Stand (S) durante gameplay
      if (key === 'H' || key === 'S') {
        EventBus.emit('ui:player-action', { action: key === 'H' ? 'hit' : 'stand' });
        return;
      }

      // Shop navigation
      const numberKey = parseInt(key);
      if (numberKey >= 1 && numberKey <= 4) {
        EventBus.emit('ui:shop-tab-select', { tab: numberKey - 1 });
      }
    });

    console.log('[UIManager] Input handlers configurados');
  }

  /**
   * Tratador de mudança de estado
   * @private
   */
  #onStateChanged({ from, to }) {
    console.log(`[UIManager] State changed: ${from} → ${to}`);

    switch (to) {
      case GameState.SHOP:
        this.#renderShop();
        break;
      case GameState.PLAYER_TURN:
      case GameState.DEALER_TURN:
        this.#renderTable();
        break;
      case GameState.RESULT:
        // Painel de resultado já foi renderizado em #onRoundResult
        break;
      default:
        console.warn(`[UIManager] Estado desconhecido: ${to}`);
    }
  }

  /**
   * Renderiza tela de SHOP
   * @private
   */
  #renderShop() {
    this.#clear();
    this.#currentScreen = 'SHOP';
    this.#shopUI.render();
    this.#unlock();
  }

  /**
   * Renderiza tela de TABLE (durante jogo)
   * @private
   */
  #renderTable() {
    this.#clear();
    this.#currentScreen = 'TABLE';
    this.#tableUI.render();
    this.#unlock();
  }

  /**
   * Renderiza painel de resultado
   * @private
   */
  #onRoundResult(data) {
    this.#lock();
    this.#resultPanel.show(data);
  }

  /**
   * Atualiza balance em tempo real
   * @private
   */
  #updateBalance({ newBalance, delta }) {
    if (this.#currentScreen === 'SHOP') {
      this.#shopUI.updateBalance(newBalance);
    } else if (this.#currentScreen === 'TABLE') {
      this.#tableUI.updateBalance(newBalance);
    }
  }

  /**
   * Limpa conteúdo
   * @private
   */
  #clear() {
    if (this.#crtContent) {
      this.#crtContent.innerHTML = '';
    }
  }

  /**
   * Lock input durante animations
   * @private
   */
  #lock() {
    this.#isLocked = true;
    EventBus.emit('ui:lock-input');
  }

  /**
   * Unlock input
   * @private
   */
  #unlock() {
    this.#isLocked = false;
    EventBus.emit('ui:unlock-input');
  }

  /**
   * Getters
   */
  get isInitialized() { return this.#isInitialized; }
  get currentScreen() { return this.#currentScreen; }
  get isLocked() { return this.#isLocked; }

  /**
   * Debug
   */
  toString() {
    return `UIManager(screen=${this.#currentScreen}, locked=${this.#isLocked})`;
  }
}

export default UIManager;
