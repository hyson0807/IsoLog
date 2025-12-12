import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { supportedLanguages } from '@/locales';

interface LanguageBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function LanguageBottomSheet({ visible, onClose }: LanguageBottomSheetProps) {
  const { t, i18n } = useTranslation();

  const handleLanguageSelect = async (langCode: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await i18n.changeLanguage(langCode);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-end bg-black/50"
        onPress={onClose}
      >
        <Pressable
          className="rounded-t-3xl bg-white px-5 pb-10 pt-6"
          onPress={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-900">
              {t('settings.languageSelect')}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          {/* 언어 목록 */}
          <View className="gap-3">
            {supportedLanguages.map((lang) => {
              const isSelected = i18n.language === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  onPress={() => handleLanguageSelect(lang.code)}
                  className={`flex-row items-center justify-between rounded-xl border-2 p-4 ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <Text
                    className={`text-base font-semibold ${
                      isSelected ? 'text-orange-600' : 'text-gray-800'
                    }`}
                  >
                    {lang.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color="#FF6B35" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
