import { useMemo } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FetchScreen } from '#/features/quotes/screens/fetch/FetchScreen';
import {
  createNativeBottomTabNavigator,
  type NativeBottomTabScreenProps,
  TabBarHeightContext,
} from '#/libs/navigation';
import { TAB_ITEMS, type TabRouteParams } from '../tabs';

const Tabs = createNativeBottomTabNavigator<TabRouteParams>();

type FetchTabProps = NativeBottomTabScreenProps<TabRouteParams, keyof TabRouteParams>;

function FetchTab({ route }: FetchTabProps): React.JSX.Element {
  return <FetchScreen show={route.params.show} />;
}

// Native tabs: a real UITabBar on iOS (so it matches SwiftUI's TabView) and a
// BottomNavigationView on Android. Tab screens stay mounted once visited, which keeps each
// tab's state across switches like the original's TabView.
export function TabBarNavigator(): React.JSX.Element {
  return (
    <HeightProvider>
      <Tabs.Navigator screenOptions={{ headerShown: false }}>
        {TAB_ITEMS.map(({ route, show, icon }) => (
          <Tabs.Screen
            key={route}
            name={route}
            component={FetchTab}
            initialParams={{ show }}
            options={{ title: show, tabBarIcon: icon }}
          />
        ))}
      </Tabs.Navigator>
    </HeightProvider>
  );
}

// Native tabs don't report their height, so it's derived the way WellForge does: the bar's
// own height (UITabBar 48, BottomNavigationView 80) plus the bottom safe area.
function HeightProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { bottom } = useSafeAreaInsets();
  const height = useMemo(() => bottom + (Platform.OS === 'android' ? 80 : 48), [bottom]);
  return <TabBarHeightContext.Provider value={height}>{children}</TabBarHeightContext.Provider>;
}
