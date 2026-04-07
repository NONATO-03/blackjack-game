# API Reference

Complete API documentation for Blackjack Game Enterprise Architecture.

## Table of Contents

1. [Core Classes](#core-classes)
2. [Entities](#entities)
3. [Game Logic](#game-logic)
4. [Events](#events)
5. [Managers](#managers)

---

## Core Classes

### Card

Represents a single playing card with rank and suit.

**Properties:**
- `rank` (string): Card rank ('2'-'10', 'J', 'Q', 'K', 'A')
- `suit` (string): Card suit ('H', 'D', 'C', 'S')
- `value` (number): Numeric value for calculations
- `isNew` (boolean): Flag for animations

**Methods:**

```javascript
// Create card
const card = new Card('5', 'H');

// Check card type
card.isAce()              // boolean
card.isFace()             // boolean

// String representation
card.toString()           // "5H"
```

### Hand

Collection of cards with value calculation supporting blackjack rules (soft aces, busts).

**Methods:**

```javascript
const hand = new Hand();

// Add card
hand.addCard(card);

// Query
hand.length()             // number of cards
hand.value()              // calculated value (ace handling)
hand.getCards()           // frozen array of cards

// Check condition
hand.isBust()             // value > 21
hand.isBlackjack()        // 2 cards with value 21
hand.hasSoftAce()         // can count ace as 11 safely

// Modify
hand.clear()              // remove all cards
```

### Deck

Manages 52-card deck with shuffle, draw, and reload capabilities.

**Methods:**

```javascript
const deck = new Deck();

// Draw cards
deck.draw()               // returns Card, auto-reloads at 0
deck.shuffle()            // Fisher-Yates shuffle

// Query
deck.cardsRemaining()     // number of cards left
deck.getCards()           // all remaining cards

// Modify
deck.reset()              // reload to 52 cards
```

**Example:**

```javascript
const deck = new Deck();
deck.shuffle();

const card1 = deck.draw(); // Player card
const card2 = deck.draw(); // Dealer card
```

---

## Entities

### Player

Represents the game player with balance, inventory, and statistics.

**Properties:**
- `name` (string): Player name
- `balance` (number): Current balance in credits
- `bet` (number): Current bet amount
- `hand` (Hand): Current hand
- `inventory` (object): Item quantities by key
- `stats` (object): Game statistics

**Methods:**

```javascript
const player = new Player('PlayerName');

// Balance operations
player.gainBalance(300)            // add balance
player.loseBalance(100)            // subtract balance

// Item operations
player.buyItem(item)               // purchase with validation
player.useItem(itemKey)            // use item from inventory
player.getInventoryCount(itemKey)  // check quantity

// Statistics
player.recordRound(result, gain)   // update stats (win/loss)

// Serialization
const json = player.toJSON()       // for save/load
const restored = Player.fromJSON(json)
```

### Dealer

Represents the dealer/opponent with strategy-based behavior.

**Properties:**
- `type` (string): 'iniciante', 'profissional', 'mago', 'tubaron'
- `difficulty` (number): 1-5 scale
- `hand` (Hand): Current hand

**Methods:**

```javascript
const dealer = new Dealer('iniciante', 1);

// Decision logic
dealer.shouldHit()        // boolean - hit decision based on strategy
```

**Strategies:**
- **iniciante**: Hit if value < 17
- **profissional**: Hit if value < 17 or (17 with soft ace)
- **mago/tubaron**: Advanced logic based on difficulty

---

## Game Logic

### GameState (FSM

State machine for game flow with validated transitions.

**States:**

```javascript
GameState.MENU            // Initial state
GameState.SHOP            // Shop screen
GameState.BETTING         // Bet placement
GameState.PLAYER_TURN     // Player acting
GameState.DEALER_TURN     // Dealer playing
GameState.RESULT          // Result display
```

**Methods:**

```javascript
// Check transition
GameState.isValidTransition('MENU', 'SHOP')  // true
GameState.isValidTransition('MENU', 'PLAYER_TURN')  // false

// Get valid next states
GameState.getValidNextStates('PLAYER_TURN')  // ['DEALER_TURN', 'RESULT']
```

### GameEngine (Singleton)

Main orchestrator managing game flow and state.

**Methods:**

```javascript
// Get/initialize
const engine = GameEngine.getInstance();
await engine.init()

// State management
engine.state              // current GameState
engine.transitionTo(newState)

// Entities
engine.setGameEntities(player, dealer)
engine.player            // current player
engine.roundManager      // current round (if active)

// Actions
engine.startRound()       // begin new round
engine.playerHit()        // player hits
engine.playerStand()      // player stands
engine.finishRound()      // end and return to shop
```

**Example:**

```javascript
const engine = GameEngine.getInstance();
await engine.init();

engine.startRound();      // Begin round
await engine.playerHit(); // Hit once
await engine.playerStand(); // Stand
// Wait for result...
engine.finishRound();     // Return to shop
```

### RoundManager

Manages single round: dealing, player/dealer turns, resolution.

**Methods:**

```javascript
const round = new RoundManager(player, dealer);

// Flow
round.start()                      // deal 2 cards each
await round.playerHit()            // player draws
await round.playerStand()          // player stops, dealer plays
await round.dealerTurn()           // auto-play dealer
await round.resolve(forceResult?)  // end round, update balance

// Calculation
round.determineWinner()            // 'win'|'loss'|'push'
round.calculateGain(result)        // balance change
```

**Example:**

```javascript
const round = new RoundManager(player, dealer);
round.start();

while (player.hand.value() < 17) {
  await round.playerHit();
}

await round.playerStand();  // Dealer plays
// Result emitted via EventBus
```

---

## Events

### Core Event System

**Type:** Pub/Sub via EventBus

### Game Events

```javascript
EventBus.on('game:initialized', () => {})
EventBus.on('game:state-changed', ({from, to, data}) => {})
EventBus.on('game:round-started', ({dealer, player}) => {})
EventBus.on('game:round-result', ({result, gain, playerValue, dealerValue}) => {})
```

### Card Events

```javascript
EventBus.on('card:drawn', ({who, card, index}) => {})
EventBus.on('card:revealed', ({who, card, index}) => {})
```

### Player Events

```javascript
EventBus.on('player:hit', () => {})
EventBus.on('player:stand', () => {})
EventBus.on('player:balance-changed', ({newBalance, delta}) => {})
EventBus.on('player:item-purchased', ({item, newBalance}) => {})
EventBus.on('player:item-used', ({itemKey}) => {})
```

### Audio Events

```javascript
EventBus.on('audio:play', ({sound, volume}) => {})
EventBus.on('audio:mute-toggled', ({isMuted}) => {})
```

---

## Managers

### EventBus (Singleton)

Pub/Sub event system for decoupled communication.

**Methods:**

```javascript
const { EventBus } = require('./events/EventBus');

// Subscribe
EventBus.on(event, handler)
EventBus.once(event, handler)  // fire once then remove

// Publish
EventBus.emit(event, data)

// Manage
EventBus.off(event, handler)
EventBus.clear()               // remove all listeners
EventBus.listenerCount(event)  // how many listeners
```

### AssetManager (Singleton)

Image and asset loading with caching and fallbacks.

```javascript
const { AssetManager } = require('./assets/AssetManager');

const manager = AssetManager.getInstance();

// Load
await manager.preload()
const url = await manager.loadImage(path)
const urlWithFallback = await manager.getImageUrlWithFallback(path, [fallback1, fallback2])

// Query
manager.cacheSize
manager.isPreloading
```

### SaveManager (Singleton)

Persistence with localStorage.

```javascript
const { SaveManager } = require('./storage/SaveManager');

const manager = SaveManager.getInstance();

// API
await manager.init()
manager.save({player, gameState})
const data = manager.load()
const json = manager.export()
manager.import(jsonString)
manager.clear()

// Properties
manager.isDirty
manager.lastSaveTime
```

### AudioManager (Singleton)

Web Audio API integration with volume mixing.

```javascript
const { AudioManager } = require('./audio/AudioManager');

const manager = AudioManager.getInstance();

// Playback
await manager.playSFX(key, {volume, fadeIn, delay, loop})
await manager.playMusic(key, {volume, fadeIn, fadeOut})
manager.stopMusic()
manager.stopAll()
manager.stopSFX(id)

// Control
manager.setVolume(type, value)  // type: 'master'|'sfx'|'music'
manager.setMute(boolean)

// Status
manager.activeAudioCount
manager.isMuted
```

---

## Configuration

### Constants

```javascript
import { GameConstants } from './config/constants.js';

GameConstants.STARTING_BALANCE
GameConstants.BASE_PAYOUT_MULTIPLIER
GameConstants.BLACKJACK_MULTIPLIER
GameConstants.CARD_DRAW_DELAY
GameConstants.DEALER_DELAY
```

### Asset Paths

```javascript
import { AssetPaths } from './assets/paths/index.js';

AssetPaths.getCardPath(rank, suit)
AssetPaths.getDealerPath(type)
AssetPaths.getSellerPath(type)
```

---

## Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid rank | Card created with bad rank | Use valid ranks: 2-10, J, Q, K, A |
| Invalid suit | Card created with bad suit | Use valid suits: H, D, C, S |
| Audio context not resumed | Browser policy | User gesture required before audio |
| Save failed | Storage quota exceeded | Clear old saves or reduce size |

---

## Examples

### Complete Round

```javascript
const engine = GameEngine.getInstance();
const round = engine.roundManager;

engine.startRound();  // Deal

// Player plays
while (engine.player.hand.value() < 21) {
  const action = getUserInput(); // 'hit' or 'stand'
  if (action === 'hit') {
    await engine.playerHit();
  } else {
    break;
  }
}

await engine.playerStand();  // Dealer plays
// Wait for 'game:round-result' event

engine.finishRound();  // Return to shop
```

### Listen for Events

```javascript
import { EventBus } from './events/EventBus.js';

EventBus.on('game:round-result', ({result, gain}) => {
  console.log(`${result}! Gained ${gain} credits`);
});

EventBus.on('player:balance-changed', ({newBalance}) => {
  updateUI(newBalance);
});
```

### Custom Event

```javascript
// Emit custom event
EventBus.emit('custom:event', {data: 'value'});

// Listen
EventBus.once('custom:event', (payload) => {
  console.log(payload.data);  // 'value'
});
```

