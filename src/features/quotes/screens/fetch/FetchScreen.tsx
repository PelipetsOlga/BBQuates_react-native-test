import { Image } from 'expo-image';
import { useCallback } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { AppRoute, useAppNavigation } from '#/app/navigation/routes';
import { useTabBarHeight } from '#/libs/navigation';
import { AppText, GeometryReader, SHOW_BACKGROUNDS, type Size, useTheme } from '#/libs/ui';
import { useSubjectValue } from '#/libs/utils';
import { type Show, SHOW_KEYS } from '../../models';
import type { FetchStatus } from '../../store';
import { CharacterCard } from './components/CharacterCard';
import { EpisodeCard } from './components/EpisodeCard';
import { QuoteCard } from './components/QuoteCard';
import { ShowButton } from './components/ShowButton';
import { SpacedContent } from './components/SpacedContent';
import { useFetchScreenStore } from './hooks/useFetchScreenStore';

export type FetchScreenProps = {
  show: Show;
};

// The original's `FetchView`. Layout, top to bottom, inside the full-screen geometry:
//   spacer (min 60) - status content - spacer (min 20), see `SpacedContent`
//   buttons row (30pt side padding)
//   fixed clearance over the tab bar (95pt on iOS, see `tabBarClearance`)
// The two spacers share the free space, so short content (an episode) sits centered and tall
// content (a quote with its card) pins to the 60pt top.
export function FetchScreen({ show }: FetchScreenProps): React.JSX.Element {
  const store = useFetchScreenStore(show);
  const status = useSubjectValue(store.status$);
  const navigation = useAppNavigation();
  const colors = useTheme().colors.shows[SHOW_KEYS[show]];
  const clearance = tabBarClearance(useTabBarHeight());

  const getQuote = useCallback(() => void store.getQuoteData(), [store]);
  const getEpisode = useCallback(() => void store.getEpisode(), [store]);

  const openCharacter = useCallback(() => {
    if (status.kind !== 'successQuote') return;
    navigation.navigate(AppRoute.CharacterSheet, { show, character: status.character });
  }, [navigation, show, status]);

  return (
    <GeometryReader style={styles.root} testID="fetch-screen">
      {(size) => (
        <>
          <Image
            source={SHOW_BACKGROUNDS[SHOW_KEYS[show]]}
            contentFit="fill"
            style={backgroundFrame(size)}
          />
          <View style={size}>
            <SpacedContent minTop={60} minBottom={20}>
              <StatusContent status={status} size={size} onCharacterPress={openCharacter} />
            </SpacedContent>
            <View style={styles.buttons}>
              <ShowButton
                title="Get Random Quote"
                colors={colors}
                maxWidth={buttonMaxWidth(size)}
                onPress={getQuote}
              />
              <View style={styles.buttonSpacer} />
              <ShowButton
                title="Get Random Episode"
                colors={colors}
                maxWidth={buttonMaxWidth(size)}
                onPress={getEpisode}
              />
            </View>
            <View style={{ height: clearance }} />
          </View>
        </>
      )}
    </GeometryReader>
  );
}

type StatusContentProps = {
  status: FetchStatus;
  size: Size;
  onCharacterPress: () => void;
};

function StatusContent({ status, size, onCharacterPress }: StatusContentProps): React.JSX.Element | null {
  switch (status.kind) {
    case 'notStarted':
      return null;
    case 'fetching':
      return <ActivityIndicator testID="fetching-indicator" />;
    case 'successQuote':
      return (
        <>
          <QuoteCard quote={status.quote.quote} />
          <CharacterCard
            character={status.character}
            name={status.quote.character}
            screen={size}
            onPress={onCharacterPress}
          />
        </>
      );
    case 'successEpisode':
      return <EpisodeCard episode={status.episode} screen={size} />;
    case 'failed':
      return <AppText>{status.error.message}</AppText>;
  }
}

/** The original's `Spacer(minLength: 95)` under the buttons: an 83pt iPhone tab bar plus 12. */
const IOS_TAB_BAR_CLEARANCE = 95;
const TAB_BAR_GAP = 12;

/**
 * iOS keeps the original's fixed 95pt. Android's taller tab bar plus system navigation would
 * cover the buttons, so it gets the same 12pt gap over its real height instead.
 */
function tabBarClearance(tabBarHeight: number): number {
  return Platform.OS === 'ios' ? IOS_TAB_BAR_CLEARANCE : tabBarHeight + TAB_BAR_GAP;
}

const BUTTONS_SIDE_PADDING = 30;
const BUTTONS_MIN_GAP = 8;

/** Half of the buttons row: what SwiftUI's HStack offers each button before it wraps the title. */
function buttonMaxWidth({ width }: Size): number {
  return (width - 2 * BUTTONS_SIDE_PADDING - BUTTONS_MIN_GAP) / 2;
}

/** The background stretched to 2.7 x 1.2 of the screen and centered, like the original's ZStack. */
function backgroundFrame({ width, height }: Size) {
  const frameWidth = width * 2.7;
  const frameHeight = height * 1.2;
  return {
    position: 'absolute' as const,
    width: frameWidth,
    height: frameHeight,
    left: (width - frameWidth) / 2,
    top: (height - frameHeight) / 2,
  };
}

const styles = StyleSheet.create({
  root: { overflow: 'hidden' },
  buttons: {
    flexDirection: 'row',
    paddingHorizontal: BUTTONS_SIDE_PADDING,
  },
  buttonSpacer: { flexGrow: 1, minWidth: BUTTONS_MIN_GAP },
});
