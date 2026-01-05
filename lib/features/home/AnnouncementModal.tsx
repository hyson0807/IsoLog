import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import { CURRENT_ANNOUNCEMENT } from '@/constants/announcement';
import { EmailCopiedToast } from './EmailCopiedToast';

interface AnnouncementModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AnnouncementModal({ visible, onClose }: AnnouncementModalProps) {
  const { t } = useTranslation();
  const [isToastVisible, setIsToastVisible] = useState(false);

  const handleCopyEmail = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Clipboard.setStringAsync(CURRENT_ANNOUNCEMENT.email);
    setIsToastVisible(true);
  };

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/50"
        onPress={handleClose}
      >
        <Pressable
          className="mx-6 w-full max-w-sm rounded-2xl bg-white p-6"
          onPress={(e) => e.stopPropagation()}
        >
          {/* X 닫기 버튼 */}
          <TouchableOpacity
            onPress={handleClose}
            className="absolute right-4 top-4 z-10 h-8 w-8 items-center justify-center rounded-full"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          {/* 제목 */}
          <Text className="mb-4 pr-8 text-xl font-bold text-gray-900">
            {t(CURRENT_ANNOUNCEMENT.titleKey)}
          </Text>

          {/* 메시지 */}
          <Text className="mb-6 text-base leading-6 text-gray-600">
            {t(CURRENT_ANNOUNCEMENT.messageKey)}
          </Text>

          {/* 이메일 복사 버튼 */}
          <TouchableOpacity
            onPress={handleCopyEmail}
            className="flex-row items-center justify-center rounded-xl bg-orange-500 py-4"
            activeOpacity={0.8}
          >
            <Ionicons name="mail-outline" size={20} color="white" />
            <Text className="ml-2 text-base font-semibold text-white">
              {t(CURRENT_ANNOUNCEMENT.copyEmailKey)}
            </Text>
          </TouchableOpacity>

          {/* 이메일 주소 표시 */}
          <Text className="mt-3 text-center text-sm text-gray-400">
            {CURRENT_ANNOUNCEMENT.email}
          </Text>
        </Pressable>
      </Pressable>

      {/* 토스트 */}
      <EmailCopiedToast
        visible={isToastVisible}
        onHide={() => setIsToastVisible(false)}
      />
    </Modal>
  );
}
