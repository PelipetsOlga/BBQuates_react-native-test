import { act, fireEvent, render, screen } from '@testing-library/react-native';
import characterFixture from '../../../__fixtures__/samplecharacter.json';
import episodeFixture from '../../../__fixtures__/sampleepisode.json';
import { AppRoute } from '#/app/navigation/routes';
import { DIContainer, ServiceLocator } from '#/libs/di';
import { CurrentValueSubject } from '#/libs/utils';
import { toCharacter, toEpisode } from '../../../models';
import { type FetchScreenStore, FetchScreenStoreFactoryKey, type FetchStatus } from '../../../store';
import { FetchScreen } from '../FetchScreen';

const mockNavigate = jest.fn();
jest.mock('#/app/navigation/routes', () => ({
  ...jest.requireActual('#/app/navigation/routes'),
  useAppNavigation: () => ({ navigate: mockNavigate }),
}));

const character = toCharacter(characterFixture);
const episode = toEpisode(episodeFixture);

function renderScreen(initial: FetchStatus) {
  const store: jest.Mocked<FetchScreenStore> = {
    status$: new CurrentValueSubject<FetchStatus>(initial),
    getQuoteData: jest.fn().mockResolvedValue(undefined),
    getEpisode: jest.fn().mockResolvedValue(undefined),
  };
  const factory = jest.fn(() => store);
  const container = new DIContainer();
  container.register(FetchScreenStoreFactoryKey, () => factory);
  ServiceLocator.setResolver(container);

  render(<FetchScreen show="Breaking Bad" />);
  // No native layout under Jest: report the screen size the way onLayout would.
  fireEvent(screen.getByTestId('fetch-screen'), 'layout', {
    nativeEvent: { layout: { x: 0, y: 0, width: 390, height: 844 } },
  });

  return { store, factory };
}

describe('FetchScreen', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('creates the store for its own show', () => {
    const { factory } = renderScreen({ kind: 'notStarted' });

    expect(factory).toHaveBeenCalledWith('Breaking Bad');
  });

  it('shows only the two buttons before anything is fetched', () => {
    renderScreen({ kind: 'notStarted' });

    expect(screen.getByText('Get Random Quote')).toBeTruthy();
    expect(screen.getByText('Get Random Episode')).toBeTruthy();
    expect(screen.queryByTestId('fetching-indicator')).toBeNull();
  });

  it('runs the store actions from the buttons', () => {
    const { store } = renderScreen({ kind: 'notStarted' });

    fireEvent.press(screen.getByText('Get Random Quote'));
    fireEvent.press(screen.getByText('Get Random Episode'));

    expect(store.getQuoteData).toHaveBeenCalledTimes(1);
    expect(store.getEpisode).toHaveBeenCalledTimes(1);
  });

  it('shows a spinner while fetching', () => {
    renderScreen({ kind: 'fetching' });

    expect(screen.getByTestId('fetching-indicator')).toBeTruthy();
  });

  it('shows the quote in quotation marks and the character card', () => {
    renderScreen({
      kind: 'successQuote',
      quote: { quote: 'Say my name.', character: 'Walter White' },
      character,
    });

    expect(screen.getByText('"Say my name."')).toBeTruthy();
    expect(screen.getByText('Walter White')).toBeTruthy();
  });

  it('opens the character sheet with the show and character', () => {
    renderScreen({
      kind: 'successQuote',
      quote: { quote: 'Say my name.', character: 'Walter White' },
      character,
    });

    fireEvent.press(screen.getByTestId('character-card'));

    expect(mockNavigate).toHaveBeenCalledWith(AppRoute.CharacterSheet, {
      show: 'Breaking Bad',
      character,
    });
  });

  it('shows the episode card', () => {
    renderScreen({ kind: 'successEpisode', episode });

    expect(screen.getByTestId('episode-card')).toBeTruthy();
    expect(screen.getByText('Pilot')).toBeTruthy();
    expect(screen.getByText('Season 1 Episode 1')).toBeTruthy();
    expect(screen.getByText(episode.synopsis)).toBeTruthy();
    expect(screen.getByText('Written By: Vince Gilligan')).toBeTruthy();
    expect(screen.getByText('Directed By: Vince Gilligan')).toBeTruthy();
    expect(screen.getByText('Aired: 01-20-2008')).toBeTruthy();
  });

  it('shows the error message on failure', () => {
    renderScreen({ kind: 'failed', error: new Error('Invalid status code: 500') });

    expect(screen.getByText('Invalid status code: 500')).toBeTruthy();
  });

  it('re-renders when the store status changes', () => {
    const { store } = renderScreen({ kind: 'notStarted' });

    act(() => {
      store.status$.send({ kind: 'fetching' });
    });

    expect(screen.getByTestId('fetching-indicator')).toBeTruthy();
  });
});
