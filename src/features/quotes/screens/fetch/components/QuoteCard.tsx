import { StyleSheet, View } from 'react-native';
import { AppText, type Theme, useThemedStyles } from '#/libs/ui';

export type QuoteCardProps = {
  quote: string;
};

// `Text("\"quote\"").minimumScaleFactor(0.5)` on black at 50% with a 25pt corner radius.
export function QuoteCard({ quote }: QuoteCardProps): React.JSX.Element {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.card}>
      <AppText adjustsFontSizeToFit minimumFontScale={0.5} style={styles.text}>
        {`"${quote}"`}
      </AppText>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      marginHorizontal: 16,
      padding: 16,
      borderRadius: 25,
      backgroundColor: theme.colors.quoteBackground,
    },
    text: { textAlign: 'center' },
  });
