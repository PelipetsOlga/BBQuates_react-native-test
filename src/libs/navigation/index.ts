// The one import point for React Navigation, so an API change (the native tabs are still
// `unstable`) is fixed here only. Same idea as wellforge-platform `libs/utils/navigation`.
export {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
export {
  DarkTheme as DarkNavigationTheme,
  NavigationContainer,
  type Theme as NavigationTheme,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
export {
  createNativeBottomTabNavigator,
  type NativeBottomTabIcon,
  type NativeBottomTabScreenProps,
} from '@react-navigation/bottom-tabs/unstable';
export * from './tabBarHeight';
