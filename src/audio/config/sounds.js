/**
 * Audio Config - Mapeamento de eventos para sons
 * Define quando tocar qual som
 */

export const AudioConfig = {
  // Intensidade de volume padrão por categoria
  defaultVolumes: {
    sfx: 0.8,
    music: 0.5,
    ui: 0.4
  },

  // Mapeamento de eventos de jogo para sons
  eventMap: {
    // Game events
    'game:initialized': null,  // Sem som
    'game:state-changed': null,
    'game:round-started': { sound: 'game', type: 'music' },
    'game:cards-dealt': { sound: 'card-draw', type: 'sfx', volume: 0.4 },
    'game:round-result': null,  // Resultado específico em handler

    // Card events
    'card:drawn': { sound: 'card-draw', type: 'sfx' },
    'card:revealed': { sound: 'stand', type: 'sfx' },

    // Player events
    'player:hit': { sound: 'ui-click', type: 'sfx' },
    'player:stand': { sound: 'stand', type: 'sfx' },
    'player:balance-changed': null,
    'player:item-purchased': { sound: 'cha-ching', type: 'sfx' },
    'player:item-used': { sound: 'ui-click', type: 'sfx' },

    // Shop events
    'shop:item-purchased': { sound: 'cha-ching', type: 'sfx' },
    'shop:tab-changed': { sound: 'button-hover', type: 'sfx' },

    // UI events
    'ui:player-action': { sound: 'ui-click', type: 'sfx', volume: 0.3 },
    'ui:lock-input': null,
    'ui:unlock-input': null,
    'ui:show-notification': { sound: 'error', type: 'sfx' },
    'ui:purchase-notification': { sound: 'cha-ching', type: 'sfx' }
  },

  // Mapeamento de resultados para sons
  resultMap: {
    'win': { sound: 'win', type: 'sfx', volume: 0.8 },
    'loss': { sound: 'lose', type: 'sfx', volume: 0.6 },
    'push': { sound: 'push', type: 'sfx', volume: 0.6 },
    'blackjack': { sound: 'blackjack', type: 'sfx', volume: 1.0 },
    'bust': { sound: 'bust', type: 'sfx', volume: 0.8 }
  },

  // Sequências de som para situações específicas
  sequences: {
    startRound: [
      { sound: 'card-draw', delay: 0 },
      { sound: 'card-draw', delay: 0.3 },
      { sound: 'card-draw', delay: 0.6 },
      { sound: 'card-draw', delay: 0.9 }
    ]
  },

  /**
   * Retorna config de som para um evento
   * @param {string} eventName
   * @returns {Object|null}
   */
  getEventSound(eventName) {
    return AudioConfig.eventMap[eventName] || null;
  },

  /**
   * Retorna config de som para um resultado
   * @param {string} result - 'win', 'loss', 'push', etc
   * @returns {Object|null}
   */
  getResultSound(result) {
    return AudioConfig.resultMap[result] || null;
  },

  /**
   * Retorna sequência de sons
   * @param {string} sequenceName
   * @returns {Array|null}
   */
  getSequence(sequenceName) {
    return AudioConfig.sequences[sequenceName] || null;
  }
};

export default AudioConfig;
