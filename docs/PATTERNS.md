# Design Patterns Documentation

Comprehensive guide to design patterns used in Blackjack Game.

## 1. Singleton Pattern

Ensures a class has only one instance and provides global access.

### Implementation

```javascript
class GameEngine {
  static #instance = null;

  static getInstance() {
    if (!GameEngine.#instance) {
      GameEngine.#instance = new GameEngine();
    }
    return GameEngine.#instance;
  }

  constructor() {
    // initialization
  }
}

// Usage
const engine = GameEngine.getInstance();
const sameEngine = GameEngine.getInstance();
console.assert(engine === sameEngine); // true
```

### Classes Using Singleton

| Class | Purpose |
|-------|---------|
| GameEngine | Main game orchestrator |
| EventBus | Central event system |
| AssetManager | Image cache & loading |
| SaveManager | Persistent storage |
| AudioManager | Audio playback & control |
| UIManager | DOM rendering & input |

### Pros & Cons

**Pros:**
- Global access point (no dependency injection needed)
- Guarantees single instance
- Lazy initialization possible

**Cons:**
- Global state can be harder to test
- Hides dependencies (not obvious from constructor)
- Can conceeal poor design

### Testing Singleton

```javascript
test('should be singleton', () => {
  const a = GameEngine.getInstance();
  const b = GameEngine.getInstance();
  expect(a).toBe(b);
});

// Clear between tests
beforeEach(() => {
  GameEngine.instance === null;
});
```

---

## 2. Observer Pattern (EventBus)

Defines one-to-many relationship between objects. When subject changes, observers are notified automatically.

### Implementation

```javascript
class EventBus {
  #listeners = {};

  on(event, handler) {
    if (!this.#listeners[event]) {
      this.#listeners[event] = [];
    }
    this.#listeners[event].push(handler);
  }

  emit(event, data) {
    if (this.#listeners[event]) {
      this.#listeners[event].forEach(handler => {
        try {
          handler(data);
        } catch (err) {
          console.error(`Error in ${event}:`, err);
        }
      });
    }
  }

  off(event, handler) {
    if (this.#listeners[event]) {
      this.#listeners[event] = this.#listeners[event].filter(h => h !== handler);
    }
  }
}
```

### Usage Pattern

```javascript
// PUBLISHER (Dealer plays)
EventBus.emit('card:drawn', { qui: 'dealer', card });

// SUBSCRIBER (UI updates)
EventBus.on('card:drawn', ({ who, card}) => {
  if (who === 'dealer') renderDealerCard(card);
});

// ANOTHER SUBSCRIBER (Audio plays)
EventBus.on('card:drawn', ({ who, card }) => {
  PlaySound('card-draw');
});
```

### Benefits

- **Decoupling**: Publisher doesn't know about subscribers
- **Flexibility**: Add/remove subscribers at runtime
- **Scalability**: Easy to add new reactions

### Common Pitfalls

```javascript
// ❌ BAD: Keeping reference, memory leak
const handler = () => {};
EventBus.on('event', handler);
// ...later, forget to off()

// ✅ GOOD: Always remove custom listeners
EventBus.off('event', handler);

// ✅ BETTER: Use once() for one-time events
EventBus.once('event', handler);
```

---

## 3. State Machine Pattern (FSM)

Allows object to change behavior based on internal state.

### Implementation in Game

```javascript
const GameState = {
  MENU: 'MENU',
  SHOP: 'SHOP',
  BETTING: 'BETTING',
  PLAYER_TURN: 'PLAYER_TURN',
  DEALER_TURN: 'DEALER_TURN',
  RESULT: 'RESULT',

  // Valid transitions
  TRANSITIONS: {
    MENU: ['SHOP'],
    SHOP: ['BETTING'],
    BETTING: ['PLAYER_TURN'],
    PLAYER_TURN: ['DEALER_TURN', 'RESULT'],
    DEALER_TURN: ['RESULT'],
    RESULT: ['SHOP'],
  },

  isValidTransition(from, to) {
    const allowed = this.TRANSITIONS[from] || [];
    return allowed.includes(to);
  },

  getValidNextStates(currentState) {
    return this.TRANSITIONS[currentState] || [];
  },
};
```

### Usage

```javascript
class GameEngine {
  transitionTo(newState) {
    // Validate
    if (!GameState.isValidTransition(this.state, newState)) {
      throw new Error(`Invalid: ${this.state} → ${newState}`);
    }

    // Transition
    EventBus.emit('game:state-changed', {
      from: this.state,
      to: newState,
    });

    this.state = newState;
  }
}

// Usage
engine.transitionTo(GameState.PLAYER_TURN); // OK
// engine.transitionTo(GameState.MENU);     // Error!
```

### Benefits

- **Safety**: Prevents invalid state sequences
- **Clarity**: Intent is explicit
- **Testing**: Easy to verify transitions

---

## 4. Strategy Pattern

Defines family of algorithms, encapsulates each, makes them interchangeable.

### Implementation: Dealer AI

```javascript
class Dealer {
  shouldHit() {
    switch (this.type) {
      case 'iniciante':
        return this.#iniciante Strategy();
      case 'profissional':
        return this.#profissionalStrategy();
      case 'mago':
        return this.#magoStrategy();
      case 'tubaron':
        return this.#tubaronStrategy();
      default:
        return false;
    }
  }

  #inicianteStrategy() {
    return this.hand.value() < 17;
  }

  #profissionalStrategy() {
    return this.hand.value() < 17 ||
           (this.hand.value() === 17 && this.hand.hasSoftAce());
  }

  #magoStrategy() {
    // Complex logic with difficulty multiplier
    return this.hand.value() < (17 + this.difficulty);
  }

  #tubaronStrategy() {
    // Aggressive - hits often
    return this.hand.value() < (18 + this.difficulty);
  }
}
```

### Alternative: Strategy Objects

```javascript
const strategies = {
  iniciante: (hand) => hand.value() < 17,
  profissional: (hand) =>
    hand.value() < 17 || (hand.value() === 17 && hand.hasSoftAce()),
  // ...
};

class Dealer {
  shouldHit() {
    const strategy = strategies[this.type];
    return strategy(this.hand);
  }
}
```

### Benefits

- Encapsulates conditional logic
- Makes strategies easy to test
- Supports strategy selection at runtime

---

## 5. Factory Pattern

Creates objects without specifying exact classes.

### Implicit Factory: Card Constructor

```javascript
class Card {
  constructor(rank, suit) {
    // Validation is "factory logic"
    if (!Card.VALID_RANKS.includes(rank)) {
      throw new Error(`Invalid rank: ${rank}`);
    }
    if (!Card.VALID_SUITS.includes(suit)) {
      throw new Error(`Invalid suit: ${suit}`);
    }

    this.rank = rank;
    this.suit = suit;
    this.value = this.#computeValue();
  }

  static VALID_RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  static VALID_SUITS = ['H', 'D', 'C', 'S'];
}

// Usage (constructor acts as factory)
try {
  const goodCard = new Card('5', 'H');      // ✓
  const badCard = new Card('X', 'H');       // ✗ throws
} catch (err) {
  console.error(err);
}
```

### Future: Explicit Factory

```javascript
class ItemFactory {
  static create(key, overrides = {}) {
    const config = ItemConfigs[key];
    if (!config) {
      throw new Error(`Unknown item: ${key}`);
    }

    return new Item({
      ...config,
      ...overrides,
    });
  }
}

// Usage
const potion = ItemFactory.create('health-potion', { quantity: 5 });
```

---

## 6. Adapter Pattern

Converts interface to another interface clients expect.

### Current: Network Adapter (preparing for multiplayer)

```javascript
// Abstract interface
class NetworkManager {
  async sendMove(action) {
    throw new Error('Not implemented');
  }

  async syncGameState() {
    throw new Error('Not implemented');
  }
}

// Single-player adapter (current)
class LocalGameAdapter extends NetworkManager {
  async sendMove(action) {
    const engine = GameEngine.getInstance();
    if (action === 'hit') {
      await engine.playerHit();
    } else if (action === 'stand') {
      await engine.playerStand();
    }
  }
}

// Multiplayer adapter (future)
class WebSocketAdapter extends NetworkManager {
  constructor(serverUrl) {
    super();
    this.socket = new WebSocket(serverUrl);
  }

  async sendMove(action) {
    return new Promise(resolve => {
      this.socket.emit('player:action', action, (result) => {
        EventBus.emit('network:action-result', result);
        resolve(result);
      });
    });
  }
}

// Swap at initialization
const networkAdapter = multiplayer
  ? new WebSocketAdapter('wss://server.com')
  : new LocalGameAdapter();
```

### Benefits

- Clean interface for different implementations
- Supports future multiplayer without core changes
- Easy to test (mock adapter)

---

## 7. Template Method Pattern (Implicit)

Defines skeleton of algorithm in parent, lets subclasses fill details.

### Example: Game Initialization

```javascript
async function initializeApp() {
  // Template (order matters!)

  // 1. Setup UI first
  await uiManager.init();

  // 2. Load assets
  await assetManager.preload();

  // 3. Initialize audio
  await audioManager.init(SoundBank);

  // 4. Restore state
  await saveManager.init();

  // 5. Setup listeners
  setupGlobalListeners();

  // 6. Start game
  await gameEngine.init();
}
```

The template is the order of initialization. Changing order can break things.

---

## When to Use Each Pattern

| Situation | Pattern | Example |
|-----------|---------|---------|
| One instance globally | Singleton | EventBus, GameEngine |
| Publish-subscribe | Observer | card:drawn event |
| Change behavior by state | State Machine | GameState FSM |
| Multiple algorithm implementations | Strategy | Dealer AI |
| Object creation with validation | Factory | Card constructor |
| Swap implementations | Adapter | Network adapters |

---

## Anti-Patterns to Avoid

### ❌ God Object

```javascript
// BAD: GameEngine does everything
class GameEngine {
  dealCards() {}
  calculateValue() {}
  renderUI() {}
  playSound() {}
  saveGame() {}
  // 500 lines of mixed concerns!
}

// GOOD: Separate concerns
class GameEngine {
  // Only orchestrates
}

class RoundManager {
  // Handles deal, play, resolve
}

class UIManager {
  // Handles rendering
}
```

### ❌ Circular Dependencies

```javascript
// BAD:
// UIManager imports GameEngine
// GameEngine imports UIManager
// → Both depend on each other

// GOOD: Use EventBus as mediator
// UIManager → (emit event) → EventBus
// GameEngine ← (listens) ← EventBus
```

### ❌ Leaky Abstractions

```javascript
// BAD: Exposing internal state
class Hand {
  getCardsArray() {
    return this.cards; // Not frozen!
  }
}

// GOOD: Encapsulate
class Hand {
  getCards() {
    return Object.freeze([...this.cards]); // Frozen copy
  }
}
```

---

## Summary

The architecture uses proven enterprise patterns:
- **Singleton** for global managers
- **Observer** for event-driven design
- **State Machine** for game flow
- **Strategy** for AI variations
- **Factory** for object creation
- **Adapter** for future multiplayer

These create a **loosely coupled, highly cohesive** system ready for scaling to multiplayer, Electron, and more.

