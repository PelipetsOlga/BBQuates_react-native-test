import { render, screen } from '@testing-library/react-native';
import { configureDI } from '#/app/di/diConfigurator';
import { NavigationContainer } from '#/libs/navigation';
import { TabBarNavigator } from '../navigators/TabBarNavigator';
import { TAB_ITEMS } from '../tabs';

describe('TabBarNavigator', () => {
  it('lists the three shows in order', () => {
    expect(TAB_ITEMS.map((item) => item.show)).toEqual([
      'Breaking Bad',
      'Better Call Saul',
      'El Camino',
    ]);
  });

  it('uses the original SF Symbols on iOS', () => {
    expect(TAB_ITEMS.map((item) => item.icon)).toEqual([
      { type: 'sfSymbol', name: 'tortoise' },
      { type: 'sfSymbol', name: 'briefcase' },
      { type: 'sfSymbol', name: 'car' },
    ]);
  });

  it('mounts only the first tab at launch', () => {
    configureDI();

    render(
      <NavigationContainer>
        <TabBarNavigator />
      </NavigationContainer>,
    );

    expect(screen.getAllByTestId('fetch-screen')).toHaveLength(1);
  });
});
