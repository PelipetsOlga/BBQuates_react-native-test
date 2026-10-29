import { BlurTargetView, BlurView } from 'expo-blur';
import { useRef } from 'react';
import { Pressable, StyleSheet, type View } from 'react-native';
import type { Character } from '../../../models';
import { AppText, RemoteImage, type Size } from '#/libs/ui';

export type CharacterCardProps = {
  character: Character;
  /** The name as written in the quote, which is what the original shows on the card. */
  name: string;
  screen: Size;
  onPress: () => void;
};

// The first photo filling a `W/1.1 x H/1.8` card with a 50pt radius, and the name on an
// `.ultraThinMaterial` strip along the bottom.
export function CharacterCard({ character, name, screen, onPress }: CharacterCardProps): React.JSX.Element {
  // Android blurs only what a BlurTargetView wraps; iOS blurs whatever is behind the BlurView.
  const blurTarget = useRef<View>(null);
  const size = { width: screen.width / 1.1, height: screen.height / 1.8 };
  const photo = character.images[0];

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.card, size]} testID="character-card">
      <BlurTargetView ref={blurTarget} style={StyleSheet.absoluteFill}>
        {photo ? <RemoteImage uri={photo} mode="cover" style={StyleSheet.absoluteFill} /> : null}
      </BlurTargetView>
      <BlurView
        tint="systemUltraThinMaterial"
        intensity={100}
        blurTarget={blurTarget}
        blurMethod="dimezisBlurViewSdk31Plus"
        style={styles.nameBar}
      >
        <AppText>{name}</AppText>
      </BlurView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    // Keeps W/1.1 x H/1.8 while it fits, and loses height only when the content is taller than
    // the space between the spacers' minimums (Android's taller tab bar on a short screen).
    flexShrink: 1,
    borderRadius: 50,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  nameBar: {
    padding: 10,
    alignItems: 'center',
    overflow: 'hidden',
  },
});
