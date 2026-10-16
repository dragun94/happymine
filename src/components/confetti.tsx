import { useEffect, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';

const COLORS = [Colors.primary, Colors.yellow, Colors.green, '#FF9EC4', '#8EC5FF', '#C7A6FF'];
const PETALS = ['🌸', '✨', '🎉', '💛'];
const COUNT = 48;

type Piece = {
  x: number;
  delay: number;
  duration: number;
  drift: number;
  spin: number;
  size: number;
  color: string;
  petal: string | null;
};

function makePieces(width: number): Piece[] {
  return Array.from({ length: COUNT }, (_, i) => ({
    x: Math.random() * width,
    delay: Math.random() * 0.25,
    duration: 0.6 + Math.random() * 0.4,
    drift: (Math.random() - 0.5) * 120,
    spin: (Math.random() - 0.5) * 4,
    size: 8 + Math.random() * 8,
    color: COLORS[i % COLORS.length],
    petal: i % 4 === 0 ? PETALS[i % PETALS.length] : null,
  }));
}

/** 꽃가루가 위에서 흩날리며 떨어지는 효과. key 를 바꾸면 다시 터져요. */
export function Confetti() {
  const { width, height } = Dimensions.get('window');
  const [progress] = useState(() => new Animated.Value(0));
  const [pieces] = useState(() => makePieces(width));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 3200,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [progress]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => {
        const start = p.delay;
        const end = Math.min(1, p.delay + p.duration);
        const translateY = progress.interpolate({
          inputRange: [0, start, end, 1],
          outputRange: [-40, -40, height + 40, height + 40],
        });
        const translateX = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, p.drift],
        });
        const rotate = progress.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', `${p.spin * 360}deg`],
        });
        const transform = [{ translateY }, { translateX }, { rotate }];
        return p.petal ? (
          <Animated.Text
            key={i}
            style={{ position: 'absolute', left: p.x, fontSize: p.size + 10, transform }}>
            {p.petal}
          </Animated.Text>
        ) : (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: p.x,
              width: p.size,
              height: p.size * 0.6,
              borderRadius: 3,
              backgroundColor: p.color,
              transform,
            }}
          />
        );
      })}
    </View>
  );
}
