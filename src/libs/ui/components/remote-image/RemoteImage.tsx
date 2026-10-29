import { Image, type ImageLoadEventData } from 'expo-image';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

type CoverProps = {
  /** Fills a frame the caller sizes, cropping: SwiftUI `.resizable().scaledToFill()`. */
  mode: 'cover';
};

type FitWidthProps = {
  /**
   * The whole image at its aspect ratio: SwiftUI `.resizable().scaledToFit()`. It takes `width`
   * while there is room, and in a column short of space it gives up height first (width follows
   * from the aspect ratio), aligned to the leading edge.
   */
  mode: 'fitWidth';
  width: number;
};

export type RemoteImageProps = (CoverProps | FitWidthProps) & {
  uri: string;
  style?: StyleProp<ViewStyle>;
  onLoad?: () => void;
  testID?: string;
};

// SwiftUI's `AsyncImage { image in ... } placeholder: { ProgressView() }`.
export function RemoteImage(props: RemoteImageProps): React.JSX.Element {
  const { uri, mode, style, onLoad, testID } = props;
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);

  const handleLoad = useCallback(
    (event: ImageLoadEventData) => {
      const { width, height } = event.source;
      if (width > 0 && height > 0) setAspectRatio(width / height);
      setLoaded(true);
      onLoad?.();
    },
    [onLoad],
  );

  const frame: StyleProp<ViewStyle> =
    props.mode === 'cover'
      ? styles.cover
      : aspectRatio === undefined
        ? { width: props.width }
        : {
            height: props.width / aspectRatio,
            flexShrink: 1,
            aspectRatio,
            maxWidth: props.width,
            alignSelf: 'flex-start',
          };

  return (
    <View style={[frame, style]} testID={testID}>
      <Image
        source={{ uri }}
        contentFit={mode === 'cover' ? 'cover' : 'contain'}
        style={StyleSheet.absoluteFill}
        onLoad={handleLoad}
        testID={testID ? `${testID}-image` : undefined}
      />
      {!loaded && (
        <View style={mode === 'cover' ? styles.spinnerOverlay : styles.spinnerInline}>
          <ActivityIndicator />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { overflow: 'hidden' },
  spinnerOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  spinnerInline: { alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
});
