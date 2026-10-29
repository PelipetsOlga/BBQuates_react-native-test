import { useCallback, useState } from 'react';
import { type LayoutChangeEvent, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

export type Size = { width: number; height: number };

export type GeometryReaderProps = {
  children: (size: Size) => React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

// SwiftUI's `GeometryReader { geo in ... }`: fills its parent and hands its measured size to
// `children`. Renders nothing until the first layout pass reports a size.
export function GeometryReader({ children, style, testID }: GeometryReaderProps): React.JSX.Element {
  const [size, setSize] = useState<Size | undefined>(undefined);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize((prev) => (prev?.width === width && prev?.height === height ? prev : { width, height }));
  }, []);

  return (
    <View style={[styles.fill, style]} onLayout={handleLayout} testID={testID}>
      {size ? children(size) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
