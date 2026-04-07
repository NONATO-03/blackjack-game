/**
 * Sellers Asset Config
 * Define vendedores animados na loja com suas frames
 */

export const SellerAssets = {
  vendedor: {
    name: 'Vendedor',
    folder: 'sellers/vendedor',
    background: 'fundo_loja.png',
    frames: {
      idle: ['vendedor_1.png'],      // Parado/respirando
      blink: ['vendedor_2.png'],     // Piscada
      talk: ['vendedor_3.png', 'vendedor_4.png'], // Falando (alternando)
      buy: ['vendedor_1.png']        // Reação de compra
    },
    messages: [
      '[VENDEDOR]: Sorte não se compra, quase isso...',
      '[VENDEDOR]: Compra agora, reclama depois.',
      '[VENDEDOR]: Não é barato, mas perde menos que no caos.',
      '[VENDEDOR]: Dinheiro parado não vence partida.',
      '[VENDEDOR]: Se for comprar, compre direito.'
    ]
  },

  desconhecido: {
    name: 'Desconhecido',
    folder: 'sellers/desconhecido',
    background: 'fundo_desconhecido.png',
    frames: {
      idle: ['desconhecido_1.png'],
      blink: ['desconhecido_2.png'],
      talk: ['desconhecido_3.png'],
      buy: ['desconhecido_1.png']
    },
    messages: [
      '[DESCONHECIDO]: Cuidado com o que você compra...',
      '[DESCONHECIDO]: Nem tudo é o que parece.',
      '[DESCONHECIDO]: A sorte é uma moeda de dois lados.'
    ]
  },

  /**
   * Retorna config do vendedor
   * @param {string} type - 'vendedor' ou 'desconhecido'
   * @returns {Object}
   */
  getConfig(type = 'vendedor') {
    return SellerAssets[type] || SellerAssets.vendedor;
  },

  /**
   * Retorna path do background
   * @param {string} type
   * @returns {string}
   */
  getBackgroundPath(type = 'vendedor') {
    const config = SellerAssets.getConfig(type);
    return `${config.folder}/${config.background}`;
  },

  /**
   * Retorna array de paths para frame
   * @param {string} type
   * @param {string} frameType - 'idle', 'blink', 'talk', 'buy'
   * @returns {Array<string>}
   */
  getFramePaths(type = 'vendedor', frameType = 'idle') {
    const config = SellerAssets.getConfig(type);
    const frames = config.frames[frameType] || config.frames.idle;
    return frames.map(frame => `${config.folder}/${frame}`);
  },

  /**
   * Retorna mensagem aleatória
   * @param {string} type
   * @returns {string}
   */
  getRandomMessage(type = 'vendedor') {
    const config = SellerAssets.getConfig(type);
    const messages = config.messages;
    return messages[Math.floor(Math.random() * messages.length)];
  },

  /**
   * Retorna todos os tipos
   */
  getAllTypes() {
    return ['vendedor', 'desconhecido'];
  }
};

export default SellerAssets;
