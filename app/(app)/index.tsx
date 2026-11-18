import { Room } from '@features/chat/domain/entities/Room';
import { useRooms } from '@features/chat/presentation/hooks/useRooms';
import { AnimatedPressable } from '@shared/presentation/components/AnimatedPressable';
import { FadeInView } from '@shared/presentation/components/FadeInView';
import { colors } from '@shared/presentation/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function RoomsScreen() {
  const { rooms, isLoading, createRoom, isCreating, createError } = useRooms();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [roomName, setRoomName] = useState('');

  const handleCreate = () => {
    if (!roomName.trim() || isCreating) return;
    createRoom(roomName.trim(), {
      onSuccess: () => {
        setRoomName('');
        setModalVisible(false);
      },
    });
  };

  const renderRoom = ({ item, index }: { item: Room; index: number }) => (
    <FadeInView delay={Math.min(index, 8) * 35} translateY={6}>
      <AnimatedPressable
        style={styles.roomItem}
        onPress={() => router.push(`/chat/${item.id}`)}
      >
        <View style={styles.roomIcon}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.navy} />
        </View>
        <View style={styles.roomInfo}>
          <Text style={styles.roomName}># {item.name}</Text>
          <Text style={styles.roomDate}>{item.createdAt.toLocaleDateString()}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </AnimatedPressable>
    </FadeInView>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.navy} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={rooms}
        keyExtractor={(r) => r.id}
        renderItem={renderRoom}
        contentContainerStyle={rooms.length === 0 ? { flex: 1 } : { paddingVertical: 8 }}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Ionicons name="chatbubbles-outline" size={44} color={colors.disabled} />
            <Text style={styles.empty}>No hay salas aún. ¡Crea una!</Text>
          </View>
        }
      />

      <AnimatedPressable style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={28} color={colors.white} />
      </AnimatedPressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <AnimatedPressable
            style={StyleSheet.absoluteFill}
            onPress={() => setModalVisible(false)}
          />
          <FadeInView style={styles.dialog} translateY={16}>
            <Text style={styles.dialogTitle}>Nueva sala</Text>
            {!!createError && <Text style={styles.dialogError}>{createError}</Text>}
            <TextInput
              style={styles.dialogInput}
              placeholder="Nombre de la sala"
              placeholderTextColor={colors.textSecondary}
              value={roomName}
              onChangeText={setRoomName}
              autoFocus
              maxLength={50}
            />
            <View style={styles.dialogActions}>
              <AnimatedPressable
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </AnimatedPressable>
              <AnimatedPressable
                style={[styles.createBtn, isCreating && { opacity: 0.6 }]}
                onPress={handleCreate}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.createText}>Crear</Text>
                )}
              </AnimatedPressable>
            </View>
          </FadeInView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  empty: { color: colors.textSecondary, fontSize: 16 },
  roomItem: {
    backgroundColor: colors.white,
    padding: 14,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  roomIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roomInfo: { flex: 1 },
  roomName: { fontSize: 16, fontWeight: '700', color: colors.text },
  roomDate: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    backgroundColor: colors.navy,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: colors.navyDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: 24,
  },
  dialog: { backgroundColor: colors.white, borderRadius: 16, padding: 20 },
  dialogTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 },
  dialogError: { color: colors.red, fontSize: 13, marginBottom: 8 },
  dialogInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  dialogActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  cancelBtn: { padding: 10 },
  cancelText: { color: colors.textSecondary, fontSize: 15, fontWeight: '600' },
  createBtn: {
    backgroundColor: colors.navy,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  createText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
