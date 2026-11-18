import { colors } from '@shared/presentation/theme/colors';
import { Image } from 'expo-image';
import { useEffect, useMemo } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Message } from '../../domain/entities/Message';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

// Burbuja con animación de entrada: aparece con fade + leve desplazamiento.
export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const opacity = useMemo(() => new Animated.Value(0), []);
  const offset = useMemo(() => new Animated.Value(8), []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 240, useNativeDriver: true }),
      Animated.timing(offset, { toValue: 0, duration: 240, useNativeDriver: true }),
    ]).start();
  }, [opacity, offset]);

  return (
    <Animated.View
      style={[
        styles.row,
        isOwn && styles.rowOwn,
        { opacity, transform: [{ translateY: offset }] },
      ]}
    >
      <View style={[styles.bubble, isOwn ? styles.own : styles.other]}>
        {!isOwn && <Text style={styles.author}>{message.authorUsername}</Text>}
        {!!message.imageUrl && (
          <Image
            source={{ uri: message.imageUrl }}
            style={styles.image}
            contentFit="cover"
          />
        )}
        {!!message.content && (
          <Text style={[styles.text, isOwn && styles.textOwn]}>{message.content}</Text>
        )}
        <Text style={styles.time}>
          {message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginVertical: 4 },
  rowOwn: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '78%', borderRadius: 14, padding: 10 },
  own: { backgroundColor: colors.navy },
  other: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    backgroundColor: colors.background,
    marginBottom: 6,
  },
  author: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, marginBottom: 2 },
  text: { fontSize: 15, color: colors.text },
  textOwn: { color: colors.white },
  time: { fontSize: 10, color: colors.textSecondary, marginTop: 4, alignSelf: 'flex-end' },
});
