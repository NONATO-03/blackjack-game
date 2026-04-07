/**
 * GameState - Máquina de estados para o fluxo do jogo
 * Define estados possíveis e transições válidas
 */

export const GameState = {
  MENU: 'MENU',
  SHOP: 'SHOP',
  BETTING: 'BETTING',
  PLAYER_TURN: 'PLAYER_TURN',
  DEALER_TURN: 'DEALER_TURN',
  RESULT: 'RESULT'
};

/**
 * Transições válidas entre estados
 * Formato: { fromState: [possibleToStates] }
 */
export const ValidTransitions = {
  [GameState.MENU]: [GameState.SHOP],
  [GameState.SHOP]: [GameState.BETTING, GameState.MENU],
  [GameState.BETTING]: [GameState.PLAYER_TURN],
  [GameState.PLAYER_TURN]: [GameState.DEALER_TURN, GameState.RESULT],
  [GameState.DEALER_TURN]: [GameState.RESULT],
  [GameState.RESULT]: [GameState.SHOP, GameState.MENU]
};

/**
 * Verifica se uma transição é válida
 * @param {string} from - State de origem
 * @param {string} to - State de destino
 * @returns {boolean} Se transição é válida
 */
export function isValidTransition(from, to) {
  if (!ValidTransitions[from]) return false;
  return ValidTransitions[from].includes(to);
}

export default GameState;
