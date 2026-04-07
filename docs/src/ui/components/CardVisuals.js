/**
 * CardVisuals - Componente que renderiza cartas em HTML
 * Trata cartas ocultas vs visíveis
 */

export class CardVisuals {
  /**
   * Renderiza um array de cartas em HTML
   * @param {Card[]} cards - Array de cartas
   * @param {number} revealUpTo - Index até qual revelar (-1 = todas)
   * @returns {string} HTML
   */
  renderCards(cards, revealUpTo = -1) {
    if (!cards || cards.length === 0) {
      return '<div class="empty-hand">---</div>';
    }

    return cards.map((card, idx) => {
      const isHidden = revealUpTo >= 0 && idx > revealUpTo;
      return this.#renderCard(card, isHidden, idx);
    }).join('');
  }

  /**
   * Renderiza uma carta individual
   * @private
   */
  #renderCard(card, hidden = false, index = 0) {
    if (hidden) {
      return `
        <div class="card-visual card-hidden" data-index="${index}">
          <div class="card-back">
            <div class="card-pattern">⬥</div>
          </div>
        </div>
      `;
    }

    const { rank, suit } = card;
    const suitSymbol = this.#getSuitSymbol(suit);
    const rankDisplay = this.#getRankDisplay(rank);
    const color = this.#getColor(suit);

    return `
      <div class="card-visual card-visible" data-index="${index}" style="animation-delay: ${index * 100}ms;">
        <div class="card-front" style="color: ${color}">
          <div class="card-corner top-left">
            <div class="rank">${rankDisplay}</div>
            <div class="suit">${suitSymbol}</div>
          </div>
          <div class="card-center">${suitSymbol}</div>
          <div class="card-corner bottom-right">
            <div class="rank">${rankDisplay}</div>
            <div class="suit">${suitSymbol}</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Retorna símbolo do naipe
   * @private
   */
  #getSuitSymbol(suit) {
    const symbols = {
      'H': '♥',
      'D': '♦',
      'C': '♣',
      'S': '♠'
    };
    return symbols[suit] || '?';
  }

  /**
   * Retorna display do rank
   * @private
   */
  #getRankDisplay(rank) {
    if (rank === '10') return '10';
    return rank;
  }

  /**
   * Retorna cor do naipe
   * @private
   */
  #getColor(suit) {
    // Red: Hearts, Diamonds
    // Black: Clubs, Spades
    return (suit === 'H' || suit === 'D') ? '#ff0000' : '#000000';
  }

  /**
   * Renderiza cartas como texto (para debug/acessibilidade)
   * @param {Card[]} cards
   * @returns {string} String com cartas
   */
  toText(cards) {
    return cards.map(card => `${card.rank}${card.suit}`).join(' ');
  }
}

export default CardVisuals;
