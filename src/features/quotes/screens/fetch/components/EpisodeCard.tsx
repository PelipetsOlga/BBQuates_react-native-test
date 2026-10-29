import { StyleSheet, View } from 'react-native';
import { type Episode, formatSeasonEpisode } from '../../../models';
import { AppText, RemoteImage, type Size, type Theme, useThemedStyles } from '#/libs/ui';

export type EpisodeCardProps = {
  episode: Episode;
  screen: Size;
};

const CARD_MARGIN = 16;
const CARD_PADDING = 16;

// The original's `EpisodeView`: a leading-aligned VStack on black at 60% with a 25pt radius.
export function EpisodeCard({ episode, screen }: EpisodeCardProps): React.JSX.Element {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.card} testID="episode-card">
      <AppText variant="largeTitle">{episode.title}</AppText>
      <AppText variant="title2">{formatSeasonEpisode(episode.episode)}</AppText>
      <RemoteImage
        uri={episode.image}
        mode="fitWidth"
        width={screen.width - 2 * (CARD_MARGIN + CARD_PADDING)}
        style={styles.image}
      />
      <AppText variant="title3" adjustsFontSizeToFit minimumFontScale={0.5} style={styles.synopsis}>
        {episode.synopsis}
      </AppText>
      <AppText>{`Written By: ${episode.writtenBy}`}</AppText>
      <AppText>{`Directed By: ${episode.directedBy}`}</AppText>
      <AppText>{`Aired: ${episode.airDate}`}</AppText>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      // Shrinks when it is taller than the space between the spacers' minimums (SpacedContent
      // caps it). As in SwiftUI the image gives way first, keeping its aspect ratio; the synopsis
      // only scales its font down (`.minimumScaleFactor(0.5)`) once the image can't.
      flexShrink: 1,
      alignSelf: 'stretch',
      marginHorizontal: CARD_MARGIN,
      padding: CARD_PADDING,
      borderRadius: 25,
      backgroundColor: theme.colors.episodeBackground,
    },
    // SwiftUI puts no default spacing between stacked Texts, and 8pt around the image.
    image: { marginVertical: 8, borderRadius: 15, overflow: 'hidden' },
    synopsis: { flexShrink: 0.01, marginBottom: 16 },
  });
