// The real SafeAreaProvider renders nothing until native code reports insets, which never
// happens under Jest. The library's own mock reports fixed insets instead.
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

// Reanimated 4 runs on the native Worklets runtime, which Jest doesn't have. Same mocks as
// wellforge-platform: animations jump to their end state, so tests see the final layout.
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
