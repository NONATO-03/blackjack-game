/**
 * SoundBank - Biblioteca de sons disponíveis
 * Define IDs, paths e metadados de todos os sons do jogo
 */

const AUDIO_BASE = '../assets/audio';

export const SoundBank = {
  // SFX - Sons curtos
  sfx: {
    'card-draw': {
      name: 'Card Draw',
      path: `${AUDIO_BASE}/sfx/card-draw.mp3`,
      duration: 0.3,
      category: 'game'
    },
    'stand': {
      name: 'Stand',
      path: `${AUDIO_BASE}/sfx/stand.mp3`,
      duration: 0.5,
      category: 'game'
    },
    'win': {
      name: 'Win',
      path: `${AUDIO_BASE}/sfx/win.mp3`,
      duration: 1.2,
      category: 'result'
    },
    'lose': {
      name: 'Lose',
      path: `${AUDIO_BASE}/sfx/lose.mp3`,
      duration: 1.0,
      category: 'result'
    },
    'push': {
      name: 'Push',
      path: `${AUDIO_BASE}/sfx/push.mp3`,
      duration: 0.8,
      category: 'result'
    },
    'cha-ching': {
      name: 'Cha-Ching (Purchase)',
      path: `${AUDIO_BASE}/sfx/cha-ching.mp3`,
      duration: 0.6,
      category: 'ui'
    },
    'ui-click': {
      name: 'UI Click',
      path: `${AUDIO_BASE}/sfx/ui-click.mp3`,
      duration: 0.15,
      category: 'ui'
    },
    'error': {
      name: 'Error',
      path: `${AUDIO_BASE}/sfx/error.mp3`,
      duration: 0.4,
      category: 'ui'
    },
    'button-hover': {
      name: 'Button Hover',
      path: `${AUDIO_BASE}/sfx/button-hover.mp3`,
      duration: 0.2,
      category: 'ui'
    },
    'bust': {
      name: 'Bust',
      path: `${AUDIO_BASE}/sfx/bust.mp3`,
      duration: 1.0,
      category: 'game'
    },
    'blackjack': {
      name: 'Blackjack!',
      path: `${AUDIO_BASE}/sfx/blackjack.mp3`,
      duration: 1.5,
      category: 'game'
    }
  },

  // Música - Sons longos com loop
  music: {
    'shop': {
      name: 'Shop Theme',
      path: `${AUDIO_BASE}/music/shop-theme.mp3`,
      bpm: 120,
      category: 'ambient'
    },
    'game': {
      name: 'Game Theme',
      path: `${AUDIO_BASE}/music/game-theme.mp3`,
      bpm: 100,
      category: 'ambient'
    },
    'dealer-turn': {
      name: 'Dealer Turn',
      path: `${AUDIO_BASE}/music/dealer-turn.mp3`,
      bpm: 130,
      category: 'tension'
    },
    'result': {
      name: 'Result Theme',
      path: `${AUDIO_BASE}/music/result-theme.mp3`,
      bpm: 140,
      category: 'emotion'
    }
  },

  /**
   * Retorna som por key
   * @param {string} key - Identificador do som
   * @returns {Object|null}
   */
  getSound(key) {
    return SoundBank.sfx[key] || SoundBank.music[key] || null;
  },

  /**
   * Retorna path do som
   * @param {string} key
   * @returns {string|null}
   */
  getPath(key) {
    const sound = SoundBank.getSound(key);
    return sound?.path || null;
  },

  /**
   * Retorna todos os SFX
   */
  getAllSFX() {
    return SoundBank.sfx;
  },

  /**
   * Retorna toda música
   */
  getAllMusic() {
    return SoundBank.music;
  },

  /**
   * Retorna sons de uma categoria
   * @param {string} category - 'game', 'ui', 'result', 'ambient', etc
   */
  getByCategory(category) {
    const all = { ...SoundBank.sfx, ...SoundBank.music };
    return Object.entries(all)
      .filter(([, sound]) => sound.category === category)
      .map(([key, sound]) => ({ key, ...sound }));
  }
};

export default SoundBank;
