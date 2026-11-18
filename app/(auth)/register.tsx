import { useAuth } from '@features/auth/presentation/hooks/useAuth';
import { FadeInView } from '@shared/presentation/components/FadeInView';
import { colors } from '@shared/presentation/theme/colors';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const { register, isLoading, error } = useAuth();

  return (
    <FadeInView style={styles.container} translateY={14}>
      <View style={styles.logoWrap}>
        <Image
          source={require('../../assets/images/epn-logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>
      <Text style={styles.title}>Crear cuenta en EPNTalk</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Usuario (sin espacios)"
        placeholderTextColor={colors.textSecondary}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Correo"
        placeholderTextColor={colors.textSecondary}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña (mín. 6 caracteres)"
        placeholderTextColor={colors.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => register({ email, password, username })}
        disabled={isLoading}
        activeOpacity={0.85}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>Registrarse</Text>
        )}
      </TouchableOpacity>
      <Link href="/(auth)/login" style={styles.link}>
        ¿Ya tienes cuenta? Inicia sesión
      </Link>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.white },
  logoWrap: { alignItems: 'center', marginBottom: 16 },
  logo: { width: 100, height: 100, borderRadius: 12 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    color: colors.text,
    backgroundColor: colors.background,
  },
  button: {
    backgroundColor: colors.navy,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  error: { color: colors.red, marginBottom: 12, textAlign: 'center', fontWeight: '600' },
  link: { marginTop: 18, textAlign: 'center', color: colors.navy, fontWeight: '600' },
});
