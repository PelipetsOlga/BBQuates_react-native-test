import { CharacterSheet } from '#/features/quotes/screens/character/CharacterSheet';
import { createNativeStackNavigator } from '#/libs/navigation';
import { useTheme } from '#/libs/ui/theme';
import { AppRoute, type AppRouteStackParams } from '../routes';
import { TabBarNavigator } from './TabBarNavigator';

const Stack = createNativeStackNavigator<AppRouteStackParams>();

export function RootNavigator(): React.JSX.Element {
  const { colors } = useTheme();
  return (
    <Stack.Navigator initialRouteName={AppRoute.TabBar} screenOptions={{ headerShown: false }}>
      <Stack.Screen name={AppRoute.TabBar} component={TabBarNavigator} />
      {/* `modal` is the iOS page sheet, the same as SwiftUI's `.sheet`. */}
      <Stack.Screen
        name={AppRoute.CharacterSheet}
        component={CharacterSheet}
        options={{ presentation: 'modal', contentStyle: { backgroundColor: colors.sheetBackground } }}
      />
    </Stack.Navigator>
  );
}
