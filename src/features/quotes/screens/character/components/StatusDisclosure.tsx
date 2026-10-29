import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { Character } from '../../../models';
import { AppText, RemoteImage, type Theme, useThemedStyles } from '#/libs/ui';

export type StatusDisclosureProps = {
  character: Character;
  /** Width of the info column the death photo fits into. */
  width: number;
  /** Called once the death photo has loaded, so the sheet can scroll it into view. */
  onDeathPhotoLoad: () => void;
};

// SwiftUI's `DisclosureGroup("Status (spoiler alert!)")`: collapsed by default, a chevron that
// turns to point down, and the content revealed with an animation.
export function StatusDisclosure({ character, width, onDeathPhotoLoad }: StatusDisclosureProps): React.JSX.Element {
  const styles = useThemedStyles(createStyles);
  const [expanded, setExpanded] = useState(false);
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withTiming(expanded ? 90 : 0, { duration: 250 });
  }, [expanded, rotation]);

  const chevronStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
  const toggle = useCallback(() => setExpanded((value) => !value), []);
  const { death } = character;

  return (
    <Animated.View layout={LinearTransition.duration(250)}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={toggle}
        style={styles.header}
      >
        <AppText>Status (spoiler alert!)</AppText>
        <Animated.View style={[styles.chevronBox, chevronStyle]} testID="status-chevron">
          <View style={styles.chevron} />
        </Animated.View>
      </Pressable>
      {expanded && (
        <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(150)} style={styles.content}>
          <AppText variant="title2">{character.status}</AppText>
          {death ? (
            <>
              <RemoteImage
                uri={death.image}
                mode="fitWidth"
                width={width}
                style={styles.deathPhoto}
                onLoad={onDeathPhotoLoad}
                testID="death-photo"
              />
              <AppText style={styles.how}>{`How: ${death.details}`}</AppText>
              <AppText>{`Last words: ${death.lastWords}`}</AppText>
            </>
          ) : null}
        </Animated.View>
      )}
    </Animated.View>
  );
}

const CHEVRON = 9;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    chevronBox: { width: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
    // A right-pointing chevron: two borders of a square turned 45 degrees.
    chevron: {
      width: CHEVRON,
      height: CHEVRON,
      borderTopWidth: 2,
      borderRightWidth: 2,
      borderColor: theme.colors.textPrimary,
      transform: [{ rotate: '45deg' }],
    },
    content: { alignItems: 'flex-start', paddingTop: 8 },
    deathPhoto: { marginVertical: 8, borderRadius: 15, overflow: 'hidden' },
    how: { marginBottom: 7 },
  });
