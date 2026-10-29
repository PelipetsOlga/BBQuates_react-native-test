import { Image } from 'expo-image';
import { useCallback, useRef } from 'react';
import { Image as RNImage, ScrollView, StyleSheet, View } from 'react-native';
import type { AppRoute, AppRouteStackParams } from '#/app/navigation/routes';
import type { NativeStackScreenProps } from '#/libs/navigation';
import { AppText, GeometryReader, SHOW_BACKGROUNDS, type Theme, useThemedStyles } from '#/libs/ui';
import { type Character, SHOW_KEYS } from '../../models';
import { ImagePager } from './components/ImagePager';
import { StatusDisclosure } from './components/StatusDisclosure';

type Props = NativeStackScreenProps<AppRouteStackParams, AppRoute.CharacterSheet>;

// The original's `CharacterView`: the show background fitted to the width and pinned to the
// top, with the photos and the character info scrolling over it.
export function CharacterSheet({ route }: Props): React.JSX.Element {
  const { show, character } = route.params;
  const styles = useThemedStyles(createStyles);
  const scrollRef = useRef<ScrollView>(null);

  const background = SHOW_BACKGROUNDS[SHOW_KEYS[show]];
  const { width: assetWidth, height: assetHeight } = RNImage.resolveAssetSource(background);

  // `proxy.scrollTo(1, anchor: .bottom)` on the info block, which is the end of the content.
  const scrollToStatus = useCallback(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, []);

  return (
    <GeometryReader testID="character-sheet">
      {(size) => (
        <>
          <Image
            source={background}
            contentFit="contain"
            style={[styles.background, { width: size.width, aspectRatio: assetWidth / assetHeight }]}
          />
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <ImagePager images={character.images} screen={size} />
            <View style={[styles.info, { width: size.width / 1.25 }]}>
              <CharacterInfo character={character} />
              <StatusDisclosure
                character={character}
                width={size.width / 1.25}
                onDeathPhotoLoad={scrollToStatus}
              />
            </View>
          </ScrollView>
        </>
      )}
    </GeometryReader>
  );
}

function CharacterInfo({ character }: { character: Character }): React.JSX.Element {
  const styles = useThemedStyles(createStyles);
  return (
    <>
      <AppText>{character.name}</AppText>
      <AppText>{`Portrayed By: ${character.portrayedBy}`}</AppText>
      <View style={styles.divider} />
      <AppText variant="title2">{`${character.name} Character Info`}</AppText>
      <AppText>{`Born: ${character.birthday}`}</AppText>
      <View style={styles.divider} />
      <AppText>Occupations:</AppText>
      {character.occupations.map((occupation) => (
        <AppText key={occupation} variant="subheadline">{` - ${occupation}`}</AppText>
      ))}
      <View style={styles.divider} />
      <AppText>Nicknames:</AppText>
      {character.aliases.length > 0 ? (
        character.aliases.map((alias) => (
          <AppText key={alias} variant="subheadline">{` - ${alias}`}</AppText>
        ))
      ) : (
        <AppText variant="subheadline">None</AppText>
      )}
      <View style={styles.divider} />
    </>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    background: { position: 'absolute', top: 0, left: 0 },
    scrollContent: { alignItems: 'center' },
    info: { marginTop: 8, paddingBottom: 70 },
    // SwiftUI's `Divider()` with the stack's default spacing around it.
    divider: {
      height: StyleSheet.hairlineWidth,
      marginVertical: 10,
      backgroundColor: theme.colors.separator,
    },
  });
