/**
 * Jest Setup File
 * Configures global mocks for browser APIs and utilities
 */

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

global.localStorage = localStorageMock;

// Mock Web Audio API
class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.currentTime = 0;
  }

  createGain() {
    return new MockGainNode();
  }

  createBufferSource() {
    return new MockBufferSource();
  }

  decodeAudioData() {
    return Promise.resolve(new MockAudioBuffer());
  }

  resume() {
    return Promise.resolve();
  }
}

class MockGainNode {
  constructor() {
    this.gain = { value: 1 };
    this.destination = {};
  }

  connect(node) {
    return this;
  }

  disconnect() {}
}

class MockBufferSource {
  constructor() {
    this.buffer = new MockAudioBuffer();
    this.gain = { value: 1 };
    this.loop = false;
  }

  connect(node) {
    return this;
  }

  disconnect() {}

  start() {}

  stop() {}

  linearRampToValueAtTime() {}
}

class MockAudioBuffer {
  constructor() {
    this.length = 44100;
    this.sampleRate = 44100;
  }
}

global.AudioContext = MockAudioContext;
global.webkitAudioContext = MockAudioContext;

// Mock DOM elements
global.document = {
  ...global.document,
  getElementById: jest.fn().mockReturnValue(null),
  createElement: jest.fn(tag => ({
    id: '',
    className: '',
    style: {},
    innerHTML: '',
    textContent: '',
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
  body: {
    appendChild: jest.fn(),
  },
  readyState: 'complete',
};

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));
global.cancelAnimationFrame = jest.fn(id => clearTimeout(id));

// Mock fetch for HTTP requests (not used in core game)
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  })
);

// Clear mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});
