/**
 * SaveManager - Singleton para persistência com localStorage
 * Salva/carrega estado do jogador e jogo
 */

import { EventBus } from '../events/EventBus.js';

export class SaveManager {
  static #instance = null;

  #saveKey = 'blackjack-game-save';
  #autoSaveInterval = 60000; // Auto-save a cada 1 minuto
  #autoSaveTimerId = null;
  #isDirty = false; // Flag se há mudanças não-salvas

  static getInstance() {
    if (!SaveManager.#instance) {
      SaveManager.#instance = new SaveManager();
    }
    return SaveManager.#instance;
  }

  /**
   * Inicia SaveManager
   * Carrega save anterior e configura auto-save
   */
  async init() {
    try {
      console.log('[SaveManager] Inicializando...');

      // Tentar carregar save anterior
      const savedGame = this.load();
      if (savedGame) {
        console.log('[SaveManager] Save anterior encontrado:', savedGame.timestamp);
        EventBus.emit('save:loaded', { data: savedGame });
      } else {
        console.log('[SaveManager] Nenhum save encontrado');
      }

      // Configurar listeners para marcar como dirty
      this.#setupDirtyListeners();

      // Iniciar auto-save
      this.#startAutoSave();

      console.log('[SaveManager] Inicializado');
    } catch (error) {
      console.error('[SaveManager] Erro na inicialização:', error);
    }
  }

  /**
   * Salva estado completo do jogo
   * @param {Object} gameState - Estado do jogo
   * @returns {boolean} true se sucesso
   */
  save(gameState) {
    try {
      if (!gameState) {
        console.warn('[SaveManager] Nenhum estado para salvar');
        return false;
      }

      const saveData = {
        version: '1.0.0',
        timestamp: Date.now(),
        player: gameState.player ? this.#serializePlayer(gameState.player) : null,
        game: {
          state: gameState.state,
          totalRounds: gameState.totalRounds || 0,
          difficulty: gameState.difficulty || 1
        }
      };

      const json = JSON.stringify(saveData);
      localStorage.setItem(this.#saveKey, json);

      this.#isDirty = false;
      console.log('[SaveManager] Save realizado com sucesso');
      EventBus.emit('save:saved', { timestamp: saveData.timestamp });

      return true;
    } catch (error) {
      console.error('[SaveManager] Erro ao salvar:', error);
      // Quota exceeded
      if (error.name === 'QuotaExceededError') {
        console.error('[SaveManager] localStorage cheio!');
        EventBus.emit('save:quota-exceeded');
      }
      return false;
    }
  }

  /**
   * Carrega estado do jogo
   * @returns {Object|null}
   */
  load() {
    try {
      const json = localStorage.getItem(this.#saveKey);
      if (!json) return null;

      const saveData = JSON.parse(json);

      // Validar versão
      if (saveData.version !== '1.0.0') {
        console.warn('[SaveManager] Versão de save incompatível');
        return null;
      }

      // Validar idade do save (mais de 30 dias = descarta)
      const ageMs = Date.now() - saveData.timestamp;
      const maxAgeMs = 30 * 24 * 60 * 60 * 1000;
      if (ageMs > maxAgeMs) {
        console.warn('[SaveManager] Save muito antigo, descartando');
        this.clear();
        return null;
      }

      console.log('[SaveManager] Save carregado com sucesso');
      return saveData;
    } catch (error) {
      console.error('[SaveManager] Erro ao carregar save:', error);
      return null;
    }
  }

  /**
   * Carrega apenas dados do jogador
   * @returns {Object|null}
   */
  loadPlayer() {
    const saveData = this.load();
    return saveData?.player || null;
  }

  /**
   * Limpa save
   */
  clear() {
    try {
      localStorage.removeItem(this.#saveKey);
      console.log('[SaveManager] Save limpo');
      EventBus.emit('save:cleared');
      return true;
    } catch (error) {
      console.error('[SaveManager] Erro ao limpar save:', error);
      return false;
    }
  }

  /**
   * Exporta save como JSON (para download)
   * @returns {string}
   */
  export() {
    const json = localStorage.getItem(this.#saveKey);
    return json || '{}';
  }

  /**
   * Importa save de JSON
   * @param {string} json
   * @returns {boolean}
   */
  import(json) {
    try {
      const saveData = JSON.parse(json);
      localStorage.setItem(this.#saveKey, json);
      console.log('[SaveManager] Save importado com sucesso');
      EventBus.emit('save:imported');
      return true;
    } catch (error) {
      console.error('[SaveManager] Erro ao importar save:', error);
      EventBus.emit('save:import-error', { error });
      return false;
    }
  }

  /**
   * Marca como dirty (precisa de save)
   * @private
   */
  #setDirty() {
    this.#isDirty = true;
  }

  /**
   * Setup listeners para marcar dirty
   * @private
   */
  #setupDirtyListeners() {
    EventBus.on('player:balance-changed', () => this.#setDirty());
    EventBus.on('player:item-purchased', () => this.#setDirty());
    EventBus.on('player:item-used', () => this.#setDirty());
    EventBus.on('player:round-recorded', () => this.#setDirty());
    EventBus.on('game:state-changed', () => this.#setDirty());
  }

  /**
   * Inicia auto-save
   * @private
   */
  #startAutoSave() {
    this.#autoSaveTimerId = setInterval(() => {
      if (this.#isDirty) {
        console.log('[SaveManager] Auto-save acionado');
        // Será chamado com estado real em GameEngine
        EventBus.emit('save:auto-save-triggered');
      }
    }, this.#autoSaveInterval);

    // Salvar ao sair da página
    window.addEventListener('beforeunload', () => {
      if (this.#isDirty) {
        console.log('[SaveManager] Save antes de sair');
        EventBus.emit('save:before-unload');
      }
    });
  }

  /**
   * Para auto-save
   */
  stopAutoSave() {
    if (this.#autoSaveTimerId) {
      clearInterval(this.#autoSaveTimerId);
      this.#autoSaveTimerId = null;
    }
  }

  /**
   * Serializa objeto Player
   * @private
   */
  #serializePlayer(player) {
    return {
      name: player.name,
      balance: player.balance,
      bet: player.bet,
      inventory: player.inventory,
      stats: player.stats,
      skillsUnlocked: Array.from(player.skillsUnlocked || [])
    };
  }

  /**
   * Getters
   */
  get isDirty() { return this.#isDirty; }
  get lastSaveTime() {
    const saveData = this.load();
    return saveData?.timestamp || null;
  }

  /**
   * Debug
   */
  toString() {
    return `SaveManager(dirty=${this.#isDirty}, autoSave=${this.#autoSaveTimerId !== null})`;
  }
}

export default SaveManager;
