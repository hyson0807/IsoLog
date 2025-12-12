import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { SkinRecord, TroubleLevel, DrynessLevel } from '@/types/medication';
import { troubleOptions, drynessOptions } from '@/constants/skin';

interface SkinRecordCardProps {
  date: string;
  existingRecord?: SkinRecord;
  onSave: (record: SkinRecord) => void;
  onComplete?: () => void;
  onCancel?: () => void;
  isRestDay?: boolean;
}

export function SkinRecordCard({
  date,
  existingRecord,
  onSave,
  onComplete,
  onCancel,
  isRestDay = false,
}: SkinRecordCardProps) {
  const { t } = useTranslation();
  const [trouble, setTrouble] = useState<TroubleLevel | undefined>(
    existingRecord?.trouble
  );
  const [dryness, setDryness] = useState<DrynessLevel | undefined>(
    existingRecord?.dryness
  );

  const handleTroubleSelect = async (value: TroubleLevel) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newTrouble = trouble === value ? undefined : value;
    setTrouble(newTrouble);

    // 둘 다 선택되면 저장
    if (newTrouble && dryness) {
      onSave({
        date,
        trouble: newTrouble,
        dryness,
        recordedAt: new Date().toISOString(),
      });
      onComplete?.();
    }
  };

  const handleDrynessSelect = async (value: DrynessLevel) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newDryness = dryness === value ? undefined : value;
    setDryness(newDryness);

    // 둘 다 선택되면 저장
    if (trouble && newDryness) {
      onSave({
        date,
        trouble,
        dryness: newDryness,
        recordedAt: new Date().toISOString(),
      });
      onComplete?.();
    }
  };

  const handleCancel = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCancel?.();
  };

  return (
    <View className="w-full px-6">
      {/* 헤더: 복용 완료 + 취소 버튼 (복용일) / 휴약일 안내 */}
      <View className="mb-6 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons
            name={isRestDay ? 'moon' : 'checkmark-circle'}
            size={32}
            color={isRestDay ? '#F59E0B' : '#22C55E'}
          />
          <Text
            className={`ml-3 text-2xl font-bold ${isRestDay ? 'text-amber-500' : 'text-green-600'}`}
          >
            {isRestDay ? t('home.restDayTitle') : t('home.takenComplete')}
          </Text>
        </View>
        {!isRestDay && onCancel && (
          <TouchableOpacity onPress={handleCancel} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text className="text-base text-gray-400">{t('common.cancel')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 섹션 타이틀 */}
      <Text className="mb-5 text-lg font-semibold text-gray-800">
        {t('skin.title')}
      </Text>

      {/* 트러블 상태 선택 */}
      <Text className="mb-3 text-base font-medium text-gray-600">{t('skin.trouble.label')}</Text>
      <View className="mb-6 flex-row gap-3">
        {troubleOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => handleTroubleSelect(option.value)}
            className={`flex-1 items-center rounded-2xl py-4 ${
              trouble === option.value
                ? 'bg-green-500'
                : 'border border-gray-200'
            }`}
          >
            <Text className="text-3xl">{option.emoji}</Text>
            <Text
              className={`mt-2 text-sm font-medium ${
                trouble === option.value ? 'text-white' : 'text-gray-600'
              }`}
            >
              {t(`skin.trouble.${option.value}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 건조함 정도 선택 */}
      <Text className="mb-3 text-base font-medium text-gray-600">{t('skin.dryness.label')}</Text>
      <View className="flex-row gap-3">
        {drynessOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => handleDrynessSelect(option.value)}
            className={`flex-1 items-center rounded-2xl py-4 ${
              dryness === option.value
                ? 'bg-blue-500'
                : 'border border-gray-200'
            }`}
          >
            <Text className="text-3xl">{option.emoji}</Text>
            <Text
              className={`mt-2 text-sm font-medium ${
                dryness === option.value ? 'text-white' : 'text-gray-600'
              }`}
            >
              {t(`skin.dryness.${option.value}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
