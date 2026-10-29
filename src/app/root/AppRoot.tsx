import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DarkNavigationTheme, NavigationContainer, type NavigationTheme } from '#/libs/navigation';
import { darkTheme, ThemeProvider } from '#/libs/ui/theme';
import { RootNavigator } from '../navigation';

const navigationTheme: NavigationTheme = {
  ...DarkNavigationTheme,
  colors: {
    ...DarkNavigationTheme.colors,
    background: darkTheme.colors.background,
    text: darkTheme.colors.textPrimary,
  },
};

export function AppRoot(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer theme={navigationTheme}>
          <RootNavigator />
        </NavigationContainer>
        <StatusBar style="light" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
