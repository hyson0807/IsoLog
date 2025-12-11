import { useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NotificationPromptSnackbarProps {
  visible: boolean;
  onPress: () => void;
  onDismiss: () => void;
}

export function NotificationPromptSnackbar({
  visible,
  onPress,
  onDismiss,
}: NotificationPromptSnackbarProps) {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const handleDismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  }, [onDismiss, translateY, opacity]);

  useEffect(() => {
    if (visible) {
      // 슬라이드 인
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // 4초 후 자동 닫기
      const timer = setTimeout(() => {
        handleDismiss();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [visible, handleDismiss, translateY, opacity]);

  const handlePress = () => {
    handleDismiss();
    onPress();
  };

  if (!visible) return null;

  return (
    <Animated.View
      className="absolute bottom-6 left-4 right-4"
      style={{
        transform: [{ translateY }],
        opacity,
      }}
    >
      <View className="flex-row items-center justify-between rounded-2xl bg-gray-800 px-4 py-4 shadow-lg">
        <View className="flex-1">
          <Text className="text-base font-semibold text-white">
            오늘도 성공!
          </Text>
          <Text className="mt-0.5 text-sm text-gray-300">
            내일도 잊지 않게 알려드릴까요?
          </Text>
        </View>
        <TouchableOpacity
          onPress={handlePress}
          className="ml-3 flex-row items-center rounded-full bg-orange-500 px-4 py-2"
          activeOpacity={0.8}
        >
          <Text className="mr-1 font-semibold text-white">알림 받기</Text>
          <Ionicons name="chevron-forward" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}