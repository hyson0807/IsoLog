import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { PremiumSection, LanguageBottomSheet } from '@lib/features/settings';
import { usePremiumContext } from '@/contexts/PremiumContext';
import { supportedLanguages } from '@/locales';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { restorePurchase } = usePremiumContext();
  const [showLanguageSheet, setShowLanguageSheet] = useState(false);

  // 현재 언어 레이블 가져오기
  const getCurrentLanguageLabel = () => {
    const lang = supportedLanguages.find((l) => l.code === i18n.language);
    return lang?.label ?? 'English';
  };

  const handleRestore = async () => {
    try {
      const restored = await restorePurchase();
      if (restored) {
        Alert.alert(t('alert.restoreSuccess'), t('alert.restoreSuccessMessage'));
      } else {
        Alert.alert(t('alert.restoreFail'), t('alert.restoreFailMessage'));
      }
    } catch {
      Alert.alert(t('alert.error'), t('alert.restoreError'));
    }
  };

  const handleCopyEmail = async () => {
    await Clipboard.setStringAsync('contact@hyson.kr');
    Alert.alert(t('alert.notice'), t('settings.emailCopied'));
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* 헤더 */}
      <View className="flex-row items-center border-b border-gray-100 bg-white px-5 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-4 h-10 w-10 items-center justify-center rounded-full"
        >
          <Ionicons name="arrow-back" size={24} color="#666666" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">{t('settings.title')}</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 프리미엄 섹션 */}
        <View className="px-5 pt-5">
          <PremiumSection
            onPurchase={() => router.push('/paywall')}
            onRestore={handleRestore}
            onManageSubscription={() => router.push('/subscription')}
          />
        </View>

        {/* 알림 설정 */}
        <View className="px-5 pt-6">
          <Text className="mb-3 text-sm font-medium text-gray-500">{t('settings.notification')}</Text>
          <TouchableOpacity
            onPress={() => router.push('/settings/notification-settings')}
            className="flex-row items-center justify-between rounded-xl bg-white px-4 py-4"
          >
            <View className="flex-row items-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <Ionicons name="notifications" size={20} color="#F97316" />
              </View>
              <Text className="text-base text-gray-700">{t('settings.notificationSettings')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        {/* 언어 설정 */}
        <View className="px-5 pt-6">
          <Text className="mb-3 text-sm font-medium text-gray-500">{t('settings.languageSection')}</Text>
          <TouchableOpacity
            onPress={() => setShowLanguageSheet(true)}
            className="flex-row items-center justify-between rounded-xl bg-white px-4 py-4"
          >
            <View className="flex-row items-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <Ionicons name="language-outline" size={20} color="#6B7280" />
              </View>
              <Text className="text-base text-gray-700">{t('settings.language')}</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="mr-2 text-gray-400">{getCurrentLanguageLabel()}</Text>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </View>
          </TouchableOpacity>
        </View>

        {/* 계정 섹션 (Coming Soon) */}
        <View className="px-5 pt-6">
          <Text className="mb-3 text-sm font-medium text-gray-500">{t('settings.account')}</Text>
          <View className="rounded-xl bg-white px-4 py-4">
            <View className="flex-row items-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <Ionicons name="person-outline" size={20} color="#9CA3AF" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-base font-medium text-gray-400">{t('settings.loginSync')}</Text>
                  <View className="ml-2 rounded-full bg-gray-100 px-2 py-0.5">
                    <Text className="text-xs font-medium text-gray-400">{t('common.comingSoon')}</Text>
                  </View>
                </View>
                <Text className="mt-0.5 text-sm text-gray-300">
                  {t('settings.syncDesc')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 앱 정보 */}
        <View className="px-5 pb-10 pt-6">
          <Text className="mb-3 text-sm font-medium text-gray-500">{t('settings.info')}</Text>
          <View className="rounded-xl bg-white">
            <TouchableOpacity className="flex-row items-center justify-between px-4 py-4">
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
                </View>
                <Text className="text-base text-gray-700">{t('settings.version')}</Text>
              </View>
              <Text className="text-gray-400">1.1.0</Text>
            </TouchableOpacity>

            <View className="mx-4 h-px bg-gray-100" />

            <TouchableOpacity
              onPress={handleCopyEmail}
              className="flex-row items-center justify-between px-4 py-4"
            >
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <Ionicons name="mail-outline" size={20} color="#6B7280" />
                </View>
                <View>
                  <Text className="text-base text-gray-700">{t('settings.feedback')}</Text>
                  <Text className="text-xs text-gray-400">contact@hyson.kr</Text>
                </View>
              </View>
              <Ionicons name="copy-outline" size={20} color="#D1D5DB" />
            </TouchableOpacity>

            <View className="mx-4 h-px bg-gray-100" />

            <TouchableOpacity
              onPress={() => router.push('/legal/terms')}
              className="flex-row items-center justify-between px-4 py-4"
            >
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <Ionicons name="document-text-outline" size={20} color="#6B7280" />
                </View>
                <Text className="text-base text-gray-700">{t('settings.terms')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>

            <View className="mx-4 h-px bg-gray-100" />

            <TouchableOpacity
              onPress={() => router.push('/legal/privacy')}
              className="flex-row items-center justify-between px-4 py-4"
            >
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <Ionicons name="shield-checkmark-outline" size={20} color="#6B7280" />
                </View>
                <Text className="text-base text-gray-700">{t('settings.privacy')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 언어 선택 바텀시트 */}
      <LanguageBottomSheet
        visible={showLanguageSheet}
        onClose={() => setShowLanguageSheet(false)}
      />
    </SafeAreaView>
  );
}
