import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { MessageBubble } from '@features/chat/presentation/components/MessageBubble';
import { ImageToUpload } from '@features/chat/domain/repositories/IChatRepository';
import { useChat } from '@features/chat/presentation/hooks/useChat';
import { AnimatedPressable } from '@shared/presentation/components/AnimatedPressable';
import { FadeInView } from '@shared/presentation/components/FadeInView';
import { colors } from '@shared/presentation/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function ChatScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { messages, sendMessage, sendImage, isSendingImage, imageError } = useChat(roomId);
  const user = useAuthStore((s) => s.user);
  const [input, setInput] = useState('');
  const insets = useSafeAreaInsets().bottom;
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) listRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  }, [input, sendMessage]);

  const pickAndSendImage = useCallback(
    async (source: 'library' | 'camera') => {
      if (isSendingImage) return;

      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            'Permiso denegado',
            'Necesitamos acceso a la cámara para tomar la foto y enviarla.',
          );
          return;
        }
      }

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 })
          : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      const image: ImageToUpload = { uri: asset.uri, mimeType: asset.mimeType ?? undefined };
      sendImage(image);
    },
    [sendImage, isSendingImage],
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <MessageBubble message={item} isOwn={item.userId === user?.id} />
        )}
        contentContainerStyle={{ padding: 12 }}
        keyboardShouldPersistTaps="handled"
      />

      <View
        style={[
          styles.inputWrapper,
          // Levanta el campo por encima de la barra del sistema / home indicator.
          { paddingBottom: insets + 8 },
        ]}
      >
        {imageError && <Text style={styles.error}>{imageError}</Text>}

        <View style={styles.inputRow}>
          <AnimatedPressable
            style={styles.iconBtn}
            onPress={() => pickAndSendImage('library')}
            disabled={isSendingImage}
          >
            <Ionicons name="images" size={20} color={colors.navy} />
          </AnimatedPressable>
          {Platform.OS !== 'web' && (
            <AnimatedPressable
              style={styles.iconBtn}
              onPress={() => pickAndSendImage('camera')}
              disabled={isSendingImage}
            >
              <Ionicons name="camera" size={20} color={colors.navy} />
            </AnimatedPressable>
          )}
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={500}
          />
          <AnimatedPressable style={styles.sendBtn} onPress={handleSend}>
            <Ionicons name="send" size={18} color={colors.white} />
          </AnimatedPressable>
        </View>
      </View>

      {isSendingImage && (
        <FadeInView style={styles.uploading} translateY={0}>
          <ActivityIndicator color={colors.white} size="large" />
          <Text style={styles.uploadingText}>Enviando imagen...</Text>
        </FadeInView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inputWrapper: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxHeight: 100,
    color: colors.text,
    backgroundColor: colors.background,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: colors.navy,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: { color: colors.red, fontSize: 12, paddingHorizontal: 12, paddingBottom: 4 },
  uploading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: { color: colors.white, marginTop: 12, fontSize: 14, fontWeight: '600' },
});
