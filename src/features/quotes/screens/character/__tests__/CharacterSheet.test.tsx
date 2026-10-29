import { fireEvent, render, screen } from '@testing-library/react-native';
import characterFixture from '../../../__fixtures__/samplecharacter.json';
import deathFixture from '../../../__fixtures__/sampledeath.json';
import { AppRoute, type AppRouteStackParams } from '#/app/navigation/routes';
import type { NativeStackScreenProps } from '#/libs/navigation';
import { type Character, toCharacter, toDeath } from '../../../models';
import { CharacterSheet } from '../CharacterSheet';
import { StatusDisclosure } from '../components/StatusDisclosure';

type Props = NativeStackScreenProps<AppRouteStackParams, AppRoute.CharacterSheet>;

const walter: Character = { ...toCharacter(characterFixture), death: toDeath(deathFixture) };

function renderSheet(character: Character) {
  const props = {
    route: { key: 'sheet', name: AppRoute.CharacterSheet, params: { show: 'Breaking Bad', character } },
    navigation: {},
  } as unknown as Props;

  render(<CharacterSheet {...props} />);
  fireEvent(screen.getByTestId('character-sheet'), 'layout', {
    nativeEvent: { layout: { x: 0, y: 0, width: 390, height: 796 } },
  });
}

describe('CharacterSheet', () => {
  it('shows the character info', () => {
    renderSheet(walter);

    expect(screen.getByText('Walter White')).toBeTruthy();
    expect(screen.getByText('Portrayed By: Bryan Cranston')).toBeTruthy();
    expect(screen.getByText('Walter White Character Info')).toBeTruthy();
    expect(screen.getByText('Born: 09-07-1958')).toBeTruthy();
    expect(screen.getByText('Occupations:')).toBeTruthy();
    expect(screen.getByText(' - Meth Kingpin')).toBeTruthy();
    expect(screen.getByText('Nicknames:')).toBeTruthy();
    expect(screen.getByText(' - Heisenberg')).toBeTruthy();
  });

  it('shows None for a character without nicknames', () => {
    renderSheet({ ...walter, aliases: [] });

    expect(screen.getByText('None')).toBeTruthy();
  });

  describe('image pager', () => {
    it('has one dot per photo with the first one active', () => {
      renderSheet(walter);

      expect(screen.getAllByTestId('page-dot')).toHaveLength(walter.images.length - 1);
      expect(screen.getAllByTestId('page-dot-active')).toHaveLength(1);
    });

    it('moves the active dot when a page is selected', () => {
      renderSheet(walter);

      fireEvent(screen.getByTestId('image-pager'), 'pageSelected', { nativeEvent: { position: 2 } });

      expect(screen.getAllByTestId(/page-dot/).map((dot) => dot.props.testID)).toEqual([
        'page-dot',
        'page-dot',
        'page-dot-active',
        ...Array.from({ length: walter.images.length - 3 }, () => 'page-dot'),
      ]);
    });
  });

  describe('status disclosure', () => {
    it('starts collapsed', () => {
      renderSheet(walter);

      expect(screen.getByText('Status (spoiler alert!)')).toBeTruthy();
      expect(screen.queryByText('Dead')).toBeNull();
    });

    it('reveals the status and the death when pressed', () => {
      renderSheet(walter);

      fireEvent.press(screen.getByText('Status (spoiler alert!)'));

      expect(screen.getByText('Dead')).toBeTruthy();
      expect(screen.getByTestId('death-photo')).toBeTruthy();
      expect(screen.getByText(`How: ${deathFixture.details}`)).toBeTruthy();
      expect(screen.getByText('Last words: Well, erm... goodbye, Lydia.')).toBeTruthy();
    });

    it('shows only the status for a character without a death', () => {
      renderSheet({ ...walter, status: 'Alive', death: undefined });

      fireEvent.press(screen.getByText('Status (spoiler alert!)'));

      expect(screen.getByText('Alive')).toBeTruthy();
      expect(screen.queryByTestId('death-photo')).toBeNull();
      expect(screen.queryByText(/Last words/)).toBeNull();
    });

    it('collapses again on a second press', () => {
      renderSheet(walter);

      fireEvent.press(screen.getByText('Status (spoiler alert!)'));
      fireEvent.press(screen.getByText('Status (spoiler alert!)'));

      expect(screen.queryByText('Dead')).toBeNull();
    });

    it('asks to scroll once the death photo loads', () => {
      const onDeathPhotoLoad = jest.fn();
      render(<StatusDisclosure character={walter} width={312} onDeathPhotoLoad={onDeathPhotoLoad} />);
      fireEvent.press(screen.getByText('Status (spoiler alert!)'));

      expect(onDeathPhotoLoad).not.toHaveBeenCalled();

      // expo-image's host view forwards `nativeEvent` to the `onLoad` prop.
      fireEvent(screen.getByTestId('death-photo-image'), 'load', {
        nativeEvent: { cacheType: 'none', source: { width: 600, height: 400, url: deathFixture.image } },
      });

      expect(onDeathPhotoLoad).toHaveBeenCalledTimes(1);
    });
  });
});
