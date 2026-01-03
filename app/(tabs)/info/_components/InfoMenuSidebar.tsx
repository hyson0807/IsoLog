import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

const DRAWER_WIDTH = Dimensions.get('window').width * 0.75;
const ANIMATION_DURATION = 300;

export type InfoMenuItemType = 'liked';

interface MenuItem {
  type: InfoMenuItemType;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

const menuItems: MenuItem[] = [
  {
    type: 'liked',
    labelKey: 'info.menu.liked',
    icon: 'heart',
    iconColor: '#F97316',
  },
];

interface InfoMenuSidebarProps {
  visible: boolean;
  onClose: () => void;
  onSelectItem: (type: InfoMenuItemType) => void;
}

export function InfoMenuSidebar({ visible, onClose, onSelectItem }: InfoMenuSidebarProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      slideAnim.setValue(DRAWER_WIDTH);
      fadeAnim.setValue(0);

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 150,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else if (modalVisible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: DRAWER_WIDTH,
          useNativeDriver: true,
          damping: 25,
          stiffness: 200,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalVisible(false);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Animated refs are stable
  }, [visible]);

  const handleItemPress = async (type: InfoMenuItemType) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectItem(type);
    onClose();
  };

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          opacity: fadeAnim,
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose}>
          <Animated.View
            style={{
              position: 'absolute',
              right: 0,
              top: insets.top,
              bottom: 0,
              width: DRAWER_WIDTH,
              backgroundColor: 'white',
              transform: [{ translateX: slideAnim }],
              shadowColor: '#000',
              shadowOffset: { width: -2, height: 0 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
              elevation: 10,
              borderTopLeftRadius: 16,
            }}
          >
            <Pressable onPress={(e) => e.stopPropagation()} style={{ flex: 1 }}>
              {/* 헤더 */}
              <View className="flex-row items-center justify-between border-b border-gray-100 px-5 pb-4 pt-6">
                <Text className="text-xl font-bold text-gray-900">
                  {t('info.menu.title')}
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
                >
                  <Ionicons name="close" size={24} color="#666666" />
                </TouchableOpacity>
              </View>

              {/* 메뉴 항목들 */}
              <View className="mt-2 px-3">
                {menuItems.map((item) => (
                  <TouchableOpacity
                    key={item.type}
                    onPress={() => handleItemPress(item.type)}
                    className="flex-row items-center rounded-xl px-4 py-4 active:bg-gray-100"
                  >
                    <Ionicons name={item.icon} size={22} color={item.iconColor} />
                    <Text className="ml-4 text-base font-medium text-gray-700">
                      {t(item.labelKey)}
                    </Text>
                    <View className="ml-auto">
                      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}
