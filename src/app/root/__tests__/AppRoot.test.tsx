import { render, screen } from '@testing-library/react-native';
import { configureDI } from '#/app/di/diConfigurator';
import { AppRoot } from '../AppRoot';

describe('AppRoot', () => {
  it('renders the first show screen', () => {
    configureDI();

    render(<AppRoot />);

    expect(screen.getByTestId('fetch-screen')).toBeTruthy();
  });
});
