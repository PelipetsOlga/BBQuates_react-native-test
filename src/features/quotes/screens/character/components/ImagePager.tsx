import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import PagerView, { type PagerViewOnPageSelectedEvent } from 'react-native-pager-view';
import { RemoteImage, type Size } from '#/libs/ui';

export type ImagePagerProps = {
  images: string[];
  screen: Size;
};

// The original's `TabView { ForEach(images) { AsyncImage } }.tabViewStyle(.page)`: a native
// pager (UIPageViewController / ViewPager2) with page dots over the bottom of the photos.
export function ImagePager({ images, screen }: ImagePagerProps): React.JSX.Element {
  const [page, setPage] = useState(0);
  const size = { width: screen.width / 1.2, height: screen.height / 1.7 };

  const handlePageSelected = useCallback((event: PagerViewOnPageSelectedEvent) => {
    setPage(event.nativeEvent.position);
  }, []);

  return (
    <View style={[styles.frame, size]}>
      <PagerView style={StyleSheet.absoluteFill} initialPage={0} onPageSelected={handlePageSelected} testID="image-pager">
        {images.map((uri) => (
          <View key={uri} style={StyleSheet.absoluteFill}>
            <RemoteImage uri={uri} mode="cover" style={StyleSheet.absoluteFill} />
          </View>
        ))}
      </PagerView>
      <View style={styles.dots} pointerEvents="none">
        {images.map((uri, index) => (
          <View
            key={uri}
            style={[styles.dot, index === page ? styles.activeDot : styles.inactiveDot]}
            testID={index === page ? 'page-dot-active' : 'page-dot'}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    marginTop: 60,
    borderRadius: 25,
    overflow: 'hidden',
  },
  dots: {
    position: 'absolute',
    bottom: 22,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  activeDot: { backgroundColor: '#FFFFFF' },
  inactiveDot: { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
});
