# Architecture Documentation

Enterprise-grade modular architecture for Blackjack Game.

## High-Level Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (GitHub Pages)               │
├─────────────────────────────────────────────────────────┤
│  public/index.html                                       │
│  ├─ HTML shell with CRT monitor styling                 │
│  └─ ES6 module loader → src/main.js                     │
└─────────────────────────────────────────────────────────┘
                              ↓
                        src/main.js
                   (Entry point, initialization)
                              ↓
┌─────────────────────────────────────────────────────────┐
│                  Core Singletons (initialized)           │
├─────────────────────────────────────────────────────────┤
│ GameEngine  ─→ coordinates all game logic               │
│ EventBus    ─→ pub/sub for decoupling                   │
│ UIManager   ─→ rendering & DOM updates                  │
│ AssetManager ─→ image loading & caching                 │
│ SaveManager ─→ localStorage persistence                 │
│ AudioManager ─→ Web Audio API integration               │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│              Game Loop (Event-Driven)                    │
├─────────────────────────────────────────────────────────┤
│ User Input → UI event → EventBus → GameEngine → state   │
│                                   ↓                      │
│                        Logic updates                     │
│                                   ↓                      │
│                    EventBus emits new events             │
│                                   ↓                      │
│                        UI/Audio/Save react               │
└─────────────────────────────────────────────────────────┘
```

## Directory Structure

```
blackjack-game/
├── src/
│   ├── core/              # Pure game logic (no UI)
│   │   ├── Card.js        # Card entity
│   │   ├── Deck.js        # Deck management (52 cards)
│   │   └── Hand.js        # Hand value calculation (soft aces)
│   │
│   ├── entities/          # Game entities (stateful)
│   │   ├── Player.js      # Player (balance, inventory, stats)
│   │   └── Dealer.js      # Dealer AI (strategy by type)
│   │
│   ├── game/              # Game orchestration
│   │   ├── GameEngine.js  # Main singleton orchestrator
│   │   ├── GameState.js   # FSM with validated transitions
│   │   └── RoundManager.js# Full round control
│   │
│   ├── ui/                # UI layer
│   │   ├── UIManager.js   # Renders based on game state
│   │   ├── components/
│   │   │   ├── ShopUI.js  # Shop display
│   │   │   ├── TableUI.js # Game mesa
│   │   │   ├── CardVisuals.js
│   │   │   ├── HUD.js
│   │   │   ├── SellerAvatar.js
│   │   │   ├── ResultPanel.js
│   │   │   └── AudioControls.js
│   │   └── effects/       # Animations & effects
│   │
│   ├── events/            # Event system
│   │   └── EventBus.js    # Pub/sub central
│   │
│   ├── assets/            # Asset management
│   │   ├── AssetManager.js
│   │   ├── config/        # Asset configurations
│   │   └── paths/         # Path centralization
│   │
│   ├── audio/             # Sound system
│   │   ├── AudioManager.js
│   │   ├── SoundBank.js
│   │   └── config/
│   │
│   ├── storage/           # Persistence
│   │   └── SaveManager.js
│   │
│   ├── config/            # Global config
│   │   └── constants.js
│   │
│   └── main.js            # Entry point
│
├── public/                # Static files (GitHub Pages)
│   ├── index.html         # Minimal HTML shell
│   ├── styles/            # Modular CSS
│   │   ├── main.css       # Aggregator
│   │   ├── theme/         # Design system
│   │   ├── components/    # Component styles
│   │   └── animations/    # Keyframes
│   └── assets/            # Images & sounds
│       ├── img/
│       └── audio/
│
├── tests/
│   ├── unit/              # Unit tests (~75 tests)
│   ├── integration/       # Integration tests (~30 tests)
│   ├── fixtures/          # Reusable test data
│   └── setup.js           # Jest configuration
│
├── docs/
│   ├── API.md              # API Reference
│   ├── ARCHITECTURE.md     # This file
│   ├── PATTERNS.md         # Design patterns used
│   └── EVENTS.md           # Event documentation
│
├── .github/workflows/
│   ├── test.yml            # Jest CI/CD
│   └── deploy.yml          # GitHub Pages deploy
│
├── .gitignore
├── .babelrc               # ES6 transpilation
├── jest.config.js         # Test configuration
├── package.json           # NPM dependencies
├── LICENSE                # MIT
└── README.md              # Main documentation
```

## Initialization Sequence

```
1. index.html loads src/main.js
   ↓
2. initializeApp()
   ├─ UIManager.init()         [Load DOM, attach listeners]
   ├─ AssetManager.preload()   [Load critical images in parallel]
   ├─ AudioManager.init()      [Initialize Web Audio API]
   ├─ SaveManager.init()       [Load localStorage data]
   ├─ GameEngine.init()        [Setup singletons]
   │  ├─ emit('game:initialized')
   │  └─ transitionTo(SHOP)
   └─ setupGlobalListeners()   [Connect EventBus handlers]

RESULT: Game ready, showing shop screen
```

## Game Loop (State Machine)

```
┌─ MENU ─┐
│        ↓
│      SHOP ←─ RESULT
│        │       ↑
│        ↓       │
│     BETTING    │
│        │       │
│        ↓       │
│  PLAYER_TURN ──┤
│        │       │
│        ├─ DEALER_TURN ──┐
│        │  (auto-loop)   │
│        └────────────────→

# Typical round flow:
[SHOP] → Player clicks "INICIAR PARTIDA"
  ↓
[BETTING] → RoundManager.start() (deal 2 cards each)
  ↓
[PLAYER_TURN] → Player hits H or stands S
  ├─ HIT: Player.addCard(draw)
  │  ├─ if Bust → RESULT with loss
  │  └─ else continue PLAYER_TURN
  └─ STAND:
     ↓
[DEALER_TURN] → Dealer auto-plays (1s delay per card)
  ├─ while (dealer.shouldHit())
  │  └─ Dealer.addCard(draw)
  ├─ if Dealer Bust → RESULT with win
  └─ else compare & RESULT
     ↓
[RESULT] → Display outcome, update balance
  ├─ 2s pause
  └─ Back to SHOP
```

## Data Flow

### Player Action → Game Update → UI/Audio/Save

```
User Input (click 'Hit')
         ↓
UIManager.handleInput('hit')
         ↓
EventBus.emit('ui:player-action', {action: 'hit'})
         ↓
GameEngine listens, calls playerHit()
         ↓
RoundManager.playerHit()
  ├─ deck.draw() → player.hand.addCard()
  ├─ EventBus.emit('card:drawn', {who: 'player', card})
  └─ Check player.hand.isBust()
         ↓
UIManager listens to 'card:drawn'
  └─ Re-render table with new card
         ↓
AudioManager listens to 'card:drawn'
  └─ Play card-draw sound effect
         ↓
SaveManager listens to 'player:balance-changed'
  └─ Auto-save after 60s (dirty flag)
```

## Design Patterns Used

### 1. **Singleton Pattern**

```javascript
class GameEngine {
  static #instance = null;
  static getInstance() {
    if (!GameEngine.#instance) {
      GameEngine.#instance = new GameEngine();
    }
    return GameEngine.#instance;
  }
}

// Usage: Ensures one instance across entire app
const engine = GameEngine.getInstance();
```

**Classes using Singleton:**
- GameEngine
- EventBus
- AssetManager
- SaveManager
- AudioManager
- UIManager

### 2. **Observer Pattern (EventBus)**

```javascript
// Publish
EventBus.emit('card:drawn', {card, who});

// Subscribe
EventBus.on('card:drawn', ({card, who}) => {
  if (who === 'player') renderPlayerCard(card);
});
```

**Benefits:**
- Loose coupling between modules
- No circular dependencies
- Easy to test (mock EventBus)

### 3. **State Machine (FSM)**

```javascript
// Define states
const States = { MENU, SHOP, BETTING, PLAYER_TURN, DEALER_TURN, RESULT };

// Validate transitions
if (!GameState.isValidTransition(current, next)) {
  throw new Error(`Invalid: ${current} → ${next}`);
}

// Transition
gameEngine.transitionTo(States.PLAYER_TURN);
```

**Benefits:**
- Prevents invalid state sequences
- Clear game flow

### 4. **Strategy Pattern**

```javascript
class Dealer {
  shouldHit() {
    if (this.type === 'iniciante') {
      return this.hand.value() < 17;
    } else if (this.type === 'profissional') {
      return this.hand.value() < 17 ||
             (this.hand.value() === 17 && this.hand.hasSoftAce());
    }
    // ...
  }
}
```

### 5. **Factory Pattern** (implicit)

```javascript
const card = new Card('5', 'H');  // Constructor validates
const hand = new Hand(cards);     // Accepts array
```

## Dependencies Graph

```
GameEngine (center, uses everything)
  ├→ GameState (FSM validation)
  ├→ EventBus (emit/listen all)
  ├→ RoundManager (gameplay)
  │   ├→ Deck, Card, Hand (core logic)
  │   ├→ Player, Dealer (entities)
  │   └→ EventBus (emit events)
  ├→ Player, Dealer (entities)
  ├→ UIManager (render updates)
  │   ├→ EventBus (listen to game)
  │   ├→ AssetManager (load images)
  │   └→ Components (render parts)
  ├→ AssetManager (load images)
  ├→ SaveManager (persist state)
  └→ AudioManager (play sounds)
     └→ SoundBank (sound definitions)

EventBus touches all:
  ← Emitters: GameEngine, RoundManager, Player, Card
  → Listeners: UIManager, AudioManager, SaveManager
```

## Module Responsibilities

| Module | Responsibility | Dependencies |
|--------|-----------------|--------------|
| Card | Card entity, rank/suit validation | None |
| Deck | 52 cards, shuffle, draw | Card |
| Hand | Value calculation, bust detection | Card |
| Player | Balance, inventory, stats | Hand |
| Dealer | AI decision (shouldHit) | Hand |
| GameState | FSM with valid transitions | None |
| GameEngine | Orchestrate all | All modules |
| RoundManager | Deal, play, resolve | Deck, Hand, Player, Dealer |
| EventBus | Pub/Sub | None |
| UIManager | Render & input | EventBus, components |
| AssetManager | Image cache, load | None |
| SaveManager | localStorage persistence | None |
| AudioManager | Web Audio API | SoundBank |

## Testing Strategy

### Unit Tests (75 tests)

Focus on individual module behavior:
- **Card**: rank/suit validation, value computation
- **Hand**: value calculation with aces, bust/blackjack detection
- **Deck**: shuffle randomness, draw/reload cycle
- **GameState**: valid transitions, state guards
- **EventBus**: listener registration, emit/call order

### Integration Tests (30 tests)

Focus on module interaction:
- **GameEngine**: full game flow, state transitions
- **RoundManager**: deal→play→resolve sequence

### Coverage Goals

```
core/        90%+ (Card, Deck, Hand)
entities/    85%+ (Player, Dealer)
game/        85%+ (GameEngine, RoundManager, GameState)
events/      90%+ (EventBus)
overall      70%+ (goal)
```

## Performance Considerations

### Time Complexity

- **Deck.shuffle()**: O(n) Fisher-Yates
- **Hand.value()**: O(c) where c = cards in hand (~4 avg)
- **GameState transitions**: O(1) hash lookup
- **EventBus.emit()**: O(l) where l = listeners per event

### Space Complexity

- **Deck**: O(52) = O(1)
- **Hand**: O(c) = O(1) for game purposes
- **AssetManager cache**: O(a) = O(n) for n assets loaded
- **EventBus listeners**: O(e*l) for e events, l listeners avg

### Optimization

- Asset images pre-loaded (AssetManager)
- Card drawing happens at constant time
- Shuffle only happens start of round
- Audio plays async (non-blocking)

## Future Architecture Enhancements

### Multiplayer Support

```javascript
// Current: LocalGameAdapter (single-player)
class LocalGameAdapter extends Network Manager {
  async playerAction(action) {
    return engine.execute(action);  // Instant
  }
}

// Future: WebSocketAdapter (multiplayer)
class WebSocketAdapter extends NetworkManager {
  async playerAction(action) {
    return socket.emit('action', action);  // Network
  }
}

// Swap at initialization:
if (multiplayer) {
  network = new WebSocketAdapter(serverUrl);
} else {
  network = new LocalGameAdapter();
}
```

### Electron Desktop App

```javascript
// electron/main.js
const { app, BrowserWindow } = require('electron');

app.on('ready', () => {
  const win = new BrowserWindow({...});
  win.loadFile(path.join(__dirname, 'public/index.html'));

  // Same code runs in Electron!
  // Can use native features via preload
});
```

## GitHub Pages Deployment

```
push to main →
  → test.yml runs Jest
  → if tests pass
  → deploy.yml uploads public/ →
  → GitHub Pages serves files →
  → index.html loads src/main.js → Game runs!
```

No build step needed! ES6 modules work natively in modern browsers.

