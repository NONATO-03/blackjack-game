/**
 * Dealers Asset Config
 * Mapeia tipos de dealers para assets e configurações
 */

export const DealerAssets = {
  iniciante: {
    name: 'Iniciante',
    folder: 'enemies/iniciantes',
    image: 'iniciante_1.png',
    description: 'Um iniciante no jogo. Fácil de vencer.',
    difficulty: 1,
    basePayoutMultiplier: 1.45,
    minBet: 100,
    maxBet: 1000
  },

  profissional: {
    name: 'Profissional',
    folder: 'enemies/profissionais',
    image: 'profissional_1.png',
    description: 'Dealer experiente. Joga melhor que iniciantes.',
    difficulty: 2,
    basePayoutMultiplier: 1.5,
    minBet: 200,
    maxBet: 2000
  },

  mago: {
    name: 'Mago',
    folder: 'enemies/mago',
    image: 'mago_1.png',
    description: 'Dealer místico com estratégias imprevistas.',
    difficulty: 3,
    basePayoutMultiplier: 1.6,
    minBet: 300,
    maxBet: 3000
  },

  tubaron: {
    name: 'Tubarão',
    folder: 'enemies/tubaron',
    image: 'tubaron_1.png',
    description: 'Predador. O mais difícil.',
    difficulty: 5,
    basePayoutMultiplier: 2.0,
    minBet: 500,
    maxBet: 5000
  },

  /**
   * Retorna config do dealer
   * @param {string} type - 'iniciante', 'profissional', 'mago', 'tubaron'
   * @returns {Object}
   */
  getConfig(type = 'iniciante') {
    return DealerAssets[type] || DealerAssets.iniciante;
  },

  /**
   * Retorna path da imagem do dealer
   * @param {string} type
   * @returns {string}
   */
  getImagePath(type = 'iniciante') {
    const config = DealerAssets.getConfig(type);
    return `${config.folder}/${config.image}`;
  },

  /**
   * Lista de todos os tipos
   */
  getAllTypes() {
    return ['iniciante', 'profissional', 'mago', 'tubaron'];
  }
};

export default DealerAssets;
