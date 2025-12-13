import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { formatDateShort } from '@/utils/dateUtils';
import {
  DrinkingWarningLevel,
  SkinRecord,
  TroubleLevel,
  DrynessLevel,
} from '@/types/medication';
import { troubleOptions, drynessOptions } from '@/constants/skin';

interface DayDetailSheetProps {
  visible: boolean;
  date: string | null;
  hasTaken: boolean;
  canEdit: boolean;
  isMedicationDay: boolean;
  isDrinkingDate: boolean;
  warningLevel: DrinkingWarningLevel | null;
  skinRecord?: SkinRecord;
  onToggle: () => void;
  onToggleDrinking: () => void;
  onSaveSkinRecord: (record: SkinRecord) => void;
  onClose: () => void;
}

export function DayDetailSheet({
  visible,
  date,
  hasTaken,
  canEdit,
  isMedicationDay,
  isDrinkingDate,
  warningLevel,
  skinRecord,
  onToggle,
  onToggleDrinking,
  onSaveSkinRecord,
  onClose,
}: DayDetailSheetProps) {
  const { t } = useTranslation();
  const [trouble, setTrouble] = useState<TroubleLevel | undefined>(undefined);
  const [dryness, setDryness] = useState<DrynessLevel | undefined>(undefined);
  const [memo, setMemo] = useState('');

  // 시트가 열릴 때 기존 기록으로 초기화
  useEffect(() => {
    if (visible && skinRecord) {
      setTrouble(skinRecord.trouble);
      setDryness(skinRecord.dryness);
      setMemo(skinRecord.memo || '');
    } else if (visible) {
      setTrouble(undefined);
      setDryness(undefined);
      setMemo('');
    }
  }, [visible, skinRecord]);

  if (!date) return null;

  const handleToggle = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggle();
  };

  const handleToggleDrinking = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggleDrinking();
  };

  const handleTroubleSelect = async (value: TroubleLevel) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = trouble === value ? undefined : value;
    setTrouble(newValue);
    saveSkinRecordInternal(newValue, dryness, memo);
  };

  const handleDrynessSelect = async (value: DrynessLevel) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = dryness === value ? undefined : value;
    setDryness(newValue);
    saveSkinRecordInternal(trouble, newValue, memo);
  };

  const handleMemoBlur = () => {
    saveSkinRecordInternal(trouble, dryness, memo);
  };

  const saveSkinRecordInternal = (
    t: TroubleLevel | undefined,
    d: DrynessLevel | undefined,
    m: string
  ) => {
    if (t || d || m.trim()) {
      onSaveSkinRecord({
        date: date!,
        trouble: t,
        dryness: d,
        memo: m.trim() || undefined,
        recordedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <Pressable
          className="flex-1 justify-end bg-black/50"
          onPress={onClose}
        >
          <Pressable
            className="max-h-[90%] rounded-t-3xl bg-white px-5 pb-10 pt-6"
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
          {/* 헤더 */}
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-900">
              {formatDateShort(date)}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          {/* 복용 체크 + 술 약속 카드 (1줄에 2개) */}
          <View className="flex-row gap-3">
            {/* 복용 체크 카드 */}
            {canEdit ? (
              <TouchableOpacity
                onPress={handleToggle}
                className={`flex-1 items-center rounded-xl border-2 py-5 ${
                  hasTaken
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <Ionicons
                  name={hasTaken ? 'checkmark-circle' : 'medical'}
                  size={32}
                  color={hasTaken ? '#22C55E' : '#9CA3AF'}
                />
                <Text
                  className={`mt-2 text-sm font-semibold ${
                    hasTaken ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  {hasTaken ? t('dayDetail.takenComplete') : t('dayDetail.takenCheck')}
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="flex-1 items-center rounded-xl border-2 border-gray-100 bg-gray-50 py-5">
                <Ionicons name="lock-closed-outline" size={32} color="#D1D5DB" />
                <Text className="mt-2 text-sm font-semibold text-gray-300">
                  {t('dayDetail.notEditable')}
                </Text>
              </View>
            )}

            {/* 술 약속 카드 */}
            <TouchableOpacity
              onPress={handleToggleDrinking}
              className={`flex-1 items-center rounded-xl border-2 py-5 ${
                isDrinkingDate
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <Ionicons
                name="wine"
                size={32}
                color={isDrinkingDate ? '#DC2626' : '#9CA3AF'}
              />
              <Text
                className={`mt-2 text-sm font-semibold ${
                  isDrinkingDate ? 'text-red-600' : 'text-gray-400'
                }`}
              >
                {isDrinkingDate ? t('dayDetail.drinkingDate') : t('dayDetail.drinkingAdd')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 경고 안내 (경고 기간일 때) */}
          {warningLevel && (
            <View className="mt-4 rounded-lg bg-red-50 p-3">
              <Text className="text-center text-sm text-red-600">
                {t('dayDetail.drinkingWarning')}
              </Text>
            </View>
          )}

          {/* 피부 상태 기록 섹션 */}
          {canEdit && (
            <View className="mt-5 ">
              <Text className="mb-3 text-sm font-semibold text-gray-700">
                {t('skin.status')}
              </Text>

              {/* 트러블 상태 */}
              <Text className="mb-2 text-xs text-gray-500">{t('skin.trouble.label')}</Text>
              <View className="mb-3 flex-row gap-2">
                {troubleOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => handleTroubleSelect(option.value)}
                    className={`flex-1 items-center rounded-lg py-2 ${
                      trouble === option.value
                        ? 'border border-green-500 bg-green-100'
                        : 'border border-gray-200 bg-gray-50'
                    }`}
                  >
                    <Text>{option.emoji}</Text>
                    <Text className="mt-1 text-xs text-gray-600">
                      {t(`skin.trouble.${option.value}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 건조함 정도 */}
              <Text className="mb-2 text-xs text-gray-500">{t('skin.dryness.label')}</Text>
              <View className="mb-3 flex-row gap-2">
                {drynessOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => handleDrynessSelect(option.value)}
                    className={`flex-1 items-center rounded-lg py-2 ${
                      dryness === option.value
                        ? 'border border-blue-500 bg-blue-100'
                        : 'border border-gray-200 bg-gray-50'
                    }`}
                  >
                    <Text>{option.emoji}</Text>
                    <Text className="mt-1 text-xs text-gray-600">
                      {t(`skin.dryness.${option.value}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* 메모 섹션 (모든 날짜에서 작성 가능) */}
          <View className="mt-5">
            <Text className="mb-3 text-sm font-semibold text-gray-700">
              {t('skin.dailyMemo')}
            </Text>
            <TextInput
              placeholder={t('skin.memoPlaceholder')}
              placeholderTextColor="#9CA3AF"
              value={memo}
              onChangeText={setMemo}
              onBlur={handleMemoBlur}
              onSubmitEditing={() => {
                Keyboard.dismiss();
                handleMemoBlur();
              }}
              maxLength={100}
              returnKeyType="done"
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-4 text-sm text-gray-700"
            />
          </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
