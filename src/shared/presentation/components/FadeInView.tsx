import { ReactNode, useEffect, useMemo } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';

interface FadeInViewProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
  duration?: number;
  translateY?: number;
}

// Animación suave de entrada (fade + desplazamiento vertical), sin dependencias extra.
export function FadeInView({
  children,
  style,
  delay = 0,
  duration = 280,
  translateY = 10,
}: FadeInViewProps) {
  const opacity = useMemo(() => new Animated.Value(0), []);
  const offset = useMemo(() => new Animated.Value(translateY), [translateY]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration, delay, useNativeDriver: true }),
      Animated.timing(offset, { toValue: 0, duration, delay, useNativeDriver: true }),
    ]).start();
  }, [opacity, offset, delay, duration, translateY]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY: offset }] }]}>
      {children}
    </Animated.View>
  );
}
