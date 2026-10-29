import { registerRootComponent } from 'expo';

import App from './App';
import { configureDI } from './src/app/di/diConfigurator';

// Services must be registered before the first render resolves any of them.
configureDI();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
