import { useState } from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { formatMonthYear } from '@/utils/dateUtils';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onTodayPress: () => void;
  showTodayButton: boolean;
}

export function CalendarHeader({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onTodayPress,
  showTodayButton,
}: CalendarHeaderProps) {
  const { t } = useTranslation();
  const [showLegend, setShowLegend] = useState(false);

  return (
    <View className="relative z-10">
      <View className="flex-row items-center justify-between px-5 py-4">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={onPrevMonth}
            className="p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>

          <Text className="mx-4 text-xl font-bold text-gray-900">
            {formatMonthYear(currentDate)}
          </Text>

          <TouchableOpacity
            onPress={onNextMonth}
            className="p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-forward" size={24} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center gap-2">
          {showTodayButton && (
            <TouchableOpacity
              onPress={onTodayPress}
              className="rounded-lg bg-orange-100 px-3 py-1.5"
            >
              <Text className="text-sm font-medium text-orange-600">Today</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => setShowLegend(!showLegend)}
            className="p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="information-circle-outline" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 범례 팝오버 - 헤더 기준 상대 위치 */}
      {showLegend && (
        <>
          {/* 배경 오버레이 */}
          <Pressable
            className="fixed inset-0 z-20"
            style={{ position: 'absolute', top: -100, bottom: -1000, left: -100, right: -100 }}
            onPress={() => setShowLegend(false)}
          />

          {/* 팝오버 */}
          <View className="absolute right-7 top-16 z-30">
            {/* 삼각형 화살표 */}
            <View className="absolute -top-2 right-2 z-10">
              <View
                style={{
                  width: 0,
                  height: 0,
                  borderLeftWidth: 8,
                  borderRightWidth: 8,
                  borderBottomWidth: 8,
                  borderLeftColor: 'transparent',
                  borderRightColor: 'transparent',
                  borderBottomColor: 'white',
                }}
              />
            </View>

            {/* 팝오버 내용 */}
            <Pressable
              className="w-52 rounded-xl bg-white p-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 8,
              }}
              onPress={(e) => e.stopPropagation()}
            >
              <Text className="mb-3 text-base font-bold text-gray-900">
                {t('calendar.legend.title')}
              </Text>

              {/* 오늘 */}
              <View className="mb-2.5 flex-row items-center">
                <View className="mr-2.5 h-7 w-7 items-center justify-center rounded-full border-2 border-orange-500">
                  <Text className="text-xs font-semibold text-orange-600">1</Text>
                </View>
                <Text className="text-sm text-gray-700">{t('calendar.legend.today')}</Text>
              </View>

              {/* 복용 완료 */}
              <View className="mb-2.5 flex-row items-center">
                <View className="relative mr-2.5 h-7 w-7 items-center justify-center">
                  <Text className="text-xs font-semibold text-gray-900">1</Text>
                  <View className="absolute -right-0.5 -top-0.5">
                    <Ionicons name="checkmark-circle" size={12} color="#22C55E" />
                  </View>
                </View>
                <Text className="text-sm text-gray-700">{t('calendar.legend.taken')}</Text>
              </View>

              {/* 술 약속 주변 */}
              <View className="mb-2.5 flex-row items-center">
                <View className="relative mr-2.5 h-7 w-7 items-center justify-center">
                  <Text className="text-xs font-semibold text-gray-900">1</Text>
                  <View className="absolute bottom-0.5 h-0.5 w-4 rounded-full bg-red-500" />
                </View>
                <Text className="text-sm text-gray-700">{t('calendar.legend.drinking')}</Text>
              </View>

              {/* 섭취 예정일 */}
              <View className="flex-row items-center">
                <View className="mr-2.5 h-7 w-7 items-center justify-center rounded-full bg-orange-100">
                  <Text className="text-xs font-medium text-orange-600">1</Text>
                </View>
                <Text className="text-sm text-gray-700">{t('calendar.legend.scheduled')}</Text>
              </View>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}
