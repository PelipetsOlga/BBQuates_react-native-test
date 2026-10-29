import { useCallback, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';

export type SpacedContentProps = {
  /** SwiftUI `Spacer(minLength:)` above the content. */
  minTop: number;
  /** SwiftUI `Spacer(minLength:)` below the content. */
  minBottom: number;
  children: React.ReactNode;
};

// `VStack { Spacer(minLength: minTop); content; Spacer(minLength: minBottom) }`.
//
// SwiftUI splits the free space equally between the two Spacers and then lifts one to its
// minimum. Flexbox can't express that: flexGrow hands out space on top of each minHeight
// (minTop + x vs minBottom + x). So the column is measured and the top spacer computed: half
// of the free space, but at least `minTop`; the bottom one is what's left. Content taller than
// the space between both minimums is capped, and children that may shrink (flexShrink) do so.
export function SpacedContent({ minTop, minBottom, children }: SpacedContentProps): React.JSX.Element {
  const [areaHeight, setAreaHeight] = useState<number | undefined>(undefined);
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);

  const handleAreaLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setAreaHeight((prev) => (prev === height ? prev : height));
  }, []);

  const handleContentLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setContentHeight((prev) => (prev === height ? prev : height));
  }, []);

  const top =
    areaHeight === undefined || contentHeight === undefined
      ? minTop
      : Math.max(minTop, (areaHeight - contentHeight) / 2);
  const maxContentHeight = areaHeight === undefined ? undefined : Math.max(0, areaHeight - minTop - minBottom);

  return (
    <View style={styles.area} onLayout={handleAreaLayout}>
      <View style={{ height: top }} />
      <View style={[styles.content, { maxHeight: maxContentHeight }]} onLayout={handleContentLayout}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1, alignSelf: 'stretch' },
  content: { alignSelf: 'stretch', alignItems: 'center', gap: 8 },
});
