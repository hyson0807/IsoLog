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
import { useRouter, usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

const DRAWER_WIDTH = Dimensions.get('window').width * 0.75;
const ANIMATION_DURATION = 300;

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
}

interface MenuItem {
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: '/' | '/calendar' | '/info' | '/tracking' | '/settings';
}

const menuItems: MenuItem[] = [
  { labelKey: 'nav.home', icon: 'home-outline', route: '/' },
  { labelKey: 'nav.calendar', icon: 'calendar-outline', route: '/calendar' },
  { labelKey: 'nav.info', icon: 'information-circle-outline', route: '/info' },
  { labelKey: 'nav.tracking', icon: 'stats-chart-outline', route: '/tracking' },
  { labelKey: 'nav.settings', icon: 'settings-outline', route: '/settings' },
];

export function DrawerMenu({ visible, onClose }: DrawerMenuProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // Modal 실제 표시 여부 (애니메이션 완료 후 닫힘)
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      // Modal을 먼저 표시
      setModalVisible(true);

      // 열기 전 초기값으로 리셋
      slideAnim.setValue(DRAWER_WIDTH);
      fadeAnim.setValue(0);

      // 부드러운 열기 애니메이션
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
      // 부드러운 닫기 애니메이션 (Modal이 열려있을 때만)
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
        // 애니메이션 완료 후 Modal 닫기
        setModalVisible(false);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Animated refs are stable
  }, [visible]);

  const handleMenuPress = async (route: MenuItem['route']) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    // 약간의 딜레이 후 라우팅 (애니메이션 완료 후)
    setTimeout(() => {
      router.push(route);
    }, 200);
  };

  const isActive = (route: string) => {
    if (route === '/') {
      return pathname === '/' || pathname === '/index';
    }
    return pathname === route || pathname.startsWith(route);
  };

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* 반투명 배경 (status bar 포함) */}
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          opacity: fadeAnim,
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose}>
          {/* 드로어 패널 (status bar 아래에서 시작) */}
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
            <Pressable onPress={(e) => e.stopPropagation()}>
              {/* 헤더 */}
              <View className="flex-row items-center justify-between border-b border-gray-100 px-5 pb-4 pt-6">
                <Text className="text-xl font-bold text-gray-900">{t('nav.menu')}</Text>
                <TouchableOpacity
                  onPress={onClose}
                  className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
                >
                  <Ionicons name="close" size={24} color="#666666" />
                </TouchableOpacity>
              </View>

              {/* 메뉴 항목들 */}
              <View className="mt-4 px-3">
                {menuItems.map((item) => {
                  const active = isActive(item.route);
                  return (
                    <TouchableOpacity
                      key={item.route}
                      onPress={() => handleMenuPress(item.route)}
                      className={`mb-2 flex-row items-center rounded-xl px-4 py-4 ${
                        active ? 'bg-orange-50' : 'bg-transparent'
                      }`}
                    >
                      <Ionicons
                        name={item.icon}
                        size={24}
                        color={active ? '#FF6B35' : '#666666'}
                      />
                      <Text
                        className={`ml-4 text-base font-medium ${
                          active ? 'text-orange-600' : 'text-gray-700'
                        }`}
                      >
                        {t(item.labelKey)}
                      </Text>
                      {active && (
                        <View className="ml-auto">
                          <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#FF6B35"
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}
