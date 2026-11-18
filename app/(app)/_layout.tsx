import { useAuth } from '@features/auth/presentation/hooks/useAuth';
import { colors } from '@shared/presentation/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import { AnimatedPressable } from '@shared/presentation/components/AnimatedPressable';

function BrandTitle() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Image
        source={require('../../assets/images/epn-logo.png')}
        style={{ width: 30, height: 30, borderRadius: 6 }}
        contentFit="contain"
      />
      <Text style={{ color: colors.white, fontSize: 18, fontWeight: '700' }}>EPNTalk</Text>
    </View>
  );
}

export default function AppLayout() {
  const { logout } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.navy },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: BrandTitle,
          headerRight: () => (
            <AnimatedPressable onPress={logout} style={{ marginRight: 12 }}>
              <Ionicons name="log-out-outline" size={22} color={colors.white} />
            </AnimatedPressable>
          ),
        }}
      />
      <Stack.Screen name="chat/[roomId]" options={{ title: 'Chat' }} />
    </Stack>
  );
}
