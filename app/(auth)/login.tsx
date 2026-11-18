import { useAuth } from '@features/auth/presentation/hooks/useAuth';
import { FadeInView } from '@shared/presentation/components/FadeInView';
import { Ionicons } from '@expo/vector-icons';
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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuth();

  return (
    <FadeInView style={styles.container} translateY={14}>
      <View style={styles.logoWrap}>
        <Image
          source={require('../../assets/images/epn-logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>
      <Text style={styles.title}>Bienvenido a EPNTalk</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Correo"
        placeholderTextColor={colors.textSecondary}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <View style={styles.passwordWrap}>
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder="Contraseña"
          placeholderTextColor={colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword((visible) => !visible)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => login({ email, password })}
        disabled={isLoading}
        activeOpacity={0.85}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>Ingresar</Text>
        )}
      </TouchableOpacity>
      <Link href="/(auth)/register" style={styles.link}>
        ¿No tienes cuenta? Regístrate
      </Link>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.white },
  logoWrap: { alignItems: 'center', marginBottom: 16 },
  logo: { width: 110, height: 110, borderRadius: 12 },
  title: {
    fontSize: 26,
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
  passwordWrap: { marginBottom: 12 },
  passwordInput: { marginBottom: 0, paddingRight: 44 },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
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
