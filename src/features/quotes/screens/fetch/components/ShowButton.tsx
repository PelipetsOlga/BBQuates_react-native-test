import { useCallback, useState } from 'react';
import { type NativeSyntheticEvent, Pressable, StyleSheet, type TextLayoutEventData } from 'react-native';
import { AppText, type ShowColors } from '#/libs/ui';

export type ShowButtonProps = {
  title: string;
  colors: ShowColors;
  /** The title wraps within this width and the button hugs its longest line, as in SwiftUI. */
  maxWidth: number;
  onPress: () => void;
};

const PADDING = 16;

// `Text.font(.title3).padding().background(<Show>Button).clipShape(r15).shadow(<Show>Shadow, radius: 5)`.
export function ShowButton({ title, colors, maxWidth, onPress }: ShowButtonProps): React.JSX.Element {
  // A wrapped RN Text keeps the full width it was offered; a wrapped SwiftUI Text reports its
  // longest line. Measure the lines and size the button to the longest one.
  const [textWidth, setTextWidth] = useState<number | undefined>(undefined);

  const handleTextLayout = useCallback((event: NativeSyntheticEvent<TextLayoutEventData>) => {
    const longest = Math.ceil(Math.max(0, ...event.nativeEvent.lines.map((line) => line.width)));
    setTextWidth((prev) => (prev === longest ? prev : longest));
  }, []);

  const width = textWidth === undefined ? undefined : Math.min(textWidth + 2 * PADDING, maxWidth);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { maxWidth, width, backgroundColor: colors.button, boxShadow: `0px 0px 10px ${colors.shadow}` },
        pressed && styles.pressed,
      ]}
    >
      <AppText variant="title3" style={styles.title} onTextLayout={handleTextLayout}>
        {title}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: PADDING,
    borderRadius: 15,
  },
  pressed: { opacity: 0.6 },
  title: { textAlign: 'center' },
});
