import { useEffect, useRef, useCallback } from 'react';
import { View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface EmailCopiedToastProps {
  visible: boolean;
  onHide: () => void;
}

export function EmailCopiedToast({ visible, onHide }: EmailCopiedToastProps) {
  const { t } = useTranslation();
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const handleHide = useCallback(() => {
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
      onHide();
    });
  }, [onHide, translateY, opacity]);

  useEffect(() => {
    if (visible) {
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

      const timer = setTimeout(() => {
        handleHide();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [visible, handleHide, translateY, opacity]);

  if (!visible) return null;

  return (
    <Animated.View
      className="absolute bottom-6 left-4 right-4"
      style={{
        transform: [{ translateY }],
        opacity,
      }}
    >
      <View className="flex-row items-center justify-center rounded-xl bg-gray-800 px-4 py-3 shadow-lg">
        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
        <Text className="ml-2 text-base font-medium text-white">
          {t('announcement.feedbackRequest.emailCopied')}
        </Text>
      </View>
    </Animated.View>
  );
}
