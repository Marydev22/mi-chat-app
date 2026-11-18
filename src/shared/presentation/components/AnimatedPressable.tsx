import { ReactNode, useMemo } from 'react';
import { Animated, StyleProp, TouchableWithoutFeedback, ViewStyle } from 'react-native';

interface AnimatedPressableProps {
  children?: ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  scaleTo?: number;
}

// Realimentación visual suave al tocar: escala el botón con un spring.
export function AnimatedPressable({
  children,
  onPress,
  style,
  disabled = false,
  scaleTo = 0.94,
}: AnimatedPressableProps) {
  const scale = useMemo(() => new Animated.Value(1), []);

  const animate = (toValue: number) =>
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();

  return (
    <TouchableWithoutFeedback
      disabled={disabled}
      onPressIn={() => !disabled && animate(scaleTo)}
      onPressOut={() => animate(1)}
      onPress={() => {
        if (disabled) return;
        animate(1);
        onPress();
      }}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </TouchableWithoutFeedback>
  );
}
