import { View, Text, Image, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useRef } from 'react';

function LoadingDots() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -8,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animation = Animated.parallel([
      animateDot(dot1, 0),
      animateDot(dot2, 150),
      animateDot(dot3, 300),
    ]);

    animation.start();

    return () => animation.stop();
  }, [dot1, dot2, dot3]);

  return (
    <View className="flex-row items-center justify-center gap-2">
      {[dot1, dot2, dot3].map((dot, index) => (
        <Animated.View
          key={index}
          className="w-3 h-3 rounded-full bg-orange-500"
          style={{ transform: [{ translateY: dot }] }}
        />
      ))}
    </View>
  );
}

export function UpdateLoadingScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View
      className="flex-1 items-center justify-center"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        backgroundColor: '#FAFAFA',
        opacity: fadeAnim,
      }}
    >
      {/* App Icon */}
      <View className="mb-4">
        <Image
          source={require('@/assets/images/icon.png')}
          className="w-20 h-20 rounded-2xl"
          resizeMode="contain"
        />
      </View>

      {/* App Name */}
      <Text className="text-2xl font-bold text-gray-800 mb-10">
        IsoLog
      </Text>

      {/* Loading Animation */}
      <LoadingDots />

      {/* Text */}
      <Text className="mt-8 text-base font-medium text-gray-700">
        {t('update.updating')}
      </Text>
      <Text className="mt-2 text-sm text-gray-400">
        {t('update.pleaseWait')}
      </Text>
    </Animated.View>
  );
}
