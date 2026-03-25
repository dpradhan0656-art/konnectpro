import 'react-native-url-polyfill/auto';
import * as WebBrowser from 'expo-web-browser';

// Must run before any other app code so the OAuth redirect can complete the in-flight
// Custom Tabs / auth session promise on cold start (fixes first-time Google sign-in hanging).
WebBrowser.maybeCompleteAuthSession();

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
