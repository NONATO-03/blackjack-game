/**
 * Items Shop Config
 * Define todos os itens que podem ser comprados na loja
 */

export const ItemAssets = {
  // ITENS - Poderes de uma vez só
  items: {
    'X-RAY': {
      key: 'X-RAY',
      name: 'X-RAY VISION',
      category: 'ITENS',
      cost: 350,
      stock: 3,
      icon: '👁️',
      description: 'Revela a carta oculta do dealer uma vez.',
      effect: {
        type: 'reveal',
        target: 'dealer-hidden-card',
        duration: 1,
        cooldown: 0
      }
    },

    'REBOOT_CARD': {
      key: 'REBOOT_CARD',
      name: 'REBOOT CARD',
      category: 'ITENS',
      cost: 420,
      stock: 3,
      icon: '🔄',
      description: 'Troca a última carta que você comprou.',
      effect: {
        type: 'replace',
        target: 'last-player-card',
        duration: 1,
        cooldown: 0
      }
    },

    'STACK_OVERFLOW': {
      key: 'STACK_OVERFLOW',
      name: 'STACK OVERFLOW',
      category: 'ITENS',
      cost: 600,
      stock: 2,
      icon: '⚡',
      description: 'Pula o turno do dealer uma vez.',
      effect: {
        type: 'skip',
        target: 'dealer-turn',
        duration: 1,
        cooldown: 0
      }
    },

    'BUFFER_OVERFLOW': {
      key: 'BUFFER_OVERFLOW',
      name: 'BUFFER OVERFLOW',
      category: 'ITENS',
      cost: 900,
      stock: 1,
      icon: '💥',
      description: 'Aumenta o multiplicador de ganho em 0.15x.',
      effect: {
        type: 'multiply',
        target: 'payout-multiplier',
        amount: 0.15,
        duration: 1,
        cooldown: 0
      }
    },

    'DEFRAG_HAND': {
      key: 'DEFRAG_HAND',
      name: 'DEFRAG HAND',
      category: 'ITENS',
      cost: 750,
      stock: 2,
      icon: '📋',
      description: 'Revela as próximas 3 cartas do topo.',
      effect: {
        type: 'peek',
        target: 'deck-top-3',
        duration: 1,
        cooldown: 0
      }
    },

    'MAC_SPOOF': {
      key: 'MAC_SPOOF',
      name: 'MAC ADDRESS SPOOF',
      category: 'ITENS',
      cost: 1300,
      stock: 1,
      icon: '🛡️',
      description: 'Recupera 30% da perda se perder.',
      effect: {
        type: 'shield',
        target: 'loss-reduction',
        amount: 0.3,
        duration: 1,
        cooldown: 0
      }
    }
  },

  // MELHORIAS - Permanent boni
  upgrades: {
    'win_mult': {
      key: 'win_mult',
      name: 'MULTIPLICADOR DE GANHO',
      category: 'MELHORIAS',
      cost: 1100,
      stock: 'INF',
      icon: '📈',
      description: '+0.1x no multiplicador de ganho por vitória.',
      effect: {
        type: 'payout-boost',
        amount: 0.1,
        permanent: true
      }
    },

    'max_bet': {
      key: 'max_bet',
      name: 'AUMENTO DE LIMITE',
      category: 'MELHORIAS',
      cost: 1500,
      stock: 'INF',
      icon: '💰',
      description: 'Aumenta o limite máximo de aposta em $500.',
      effect: {
        type: 'bet-limit',
        amount: 500,
        permanent: true
      }
    }
  },

  // BEBIDAS - Temporary buffs (2-3 rodadas)
  drinks: {
    'negroni': {
      key: 'negroni',
      name: 'NEGRONI',
      category: 'BEBIDAS',
      cost: 500,
      stock: 2,
      icon: '🍷',
      description: '+0.2x de XP por 2 rodadas.',
      effect: {
        type: 'xp-boost',
        amount: 0.2,
        duration: 2,
        cooldown: 5
      }
    },

    'caipira': {
      key: 'caipira',
      name: 'CAIPIRA',
      category: 'BEBIDAS',
      cost: 420,
      stock: 2,
      icon: '🍹',
      description: '+0.2x de dinheiro por 2 rodadas.',
      effect: {
        type: 'money-boost',
        amount: 0.2,
        duration: 2,
        cooldown: 5
      }
    }
  },

  // OUTROS - Especiais
  special: {
    'boletim': {
      key: 'boletim',
      name: 'BOLETIM DA CASA',
      category: 'OUTROS',
      cost: 550,
      stock: 'INF',
      icon: '📜',
      description: 'Dica diária do submundo. Revela insider info.',
      effect: {
        type: 'tip',
        target: 'game-tip'
      }
    },

    'ticket': {
      key: 'ticket',
      name: 'BILHETE DE SORTEIO',
      category: 'OUTROS',
      cost: 1000,
      stock: 1,
      icon: '🎟️',
      description: 'Chance de prêmio bônus no próximo round.',
      effect: {
        type: 'lottery',
        chance: 0.25,
        reward: 1000
      }
    }
  },

  /**
   * Retorna item por key
   * @param {string} key
   * @returns {Object}
   */
  getItem(key) {
    return ItemAssets.items[key] ||
           ItemAssets.upgrades[key] ||
           ItemAssets.drinks[key] ||
           ItemAssets.special[key] ||
           null;
  },

  /**
   * Retorna todos os itens de uma categoria
   * @param {string} category
   * @returns {Array}
   */
  getItemsByCategory(category) {
    const all = [
      ...Object.values(ItemAssets.items),
      ...Object.values(ItemAssets.upgrades),
      ...Object.values(ItemAssets.drinks),
      ...Object.values(ItemAssets.special)
    ];
    return all.filter(item => item.category === category);
  },

  /**
   * Retorna todas as categorias
   */
  getCategories() {
    return ['ITENS', 'MELHORIAS', 'BEBIDAS', 'OUTROS'];
  },

  /**
   * Retorna todos os itens
   */
  getAllItems() {
    return [
      ...Object.values(ItemAssets.items),
      ...Object.values(ItemAssets.upgrades),
      ...Object.values(ItemAssets.drinks),
      ...Object.values(ItemAssets.special)
    ];
  }
};

export default ItemAssets;
