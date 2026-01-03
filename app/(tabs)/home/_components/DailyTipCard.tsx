import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface Tip {
  icon: keyof typeof Ionicons.glyphMap;
  key: string;
  color: string;
}

const tips: Tip[] = [
  { icon: 'water', key: 'water', color: '#3B82F6' },
  { icon: 'sparkles', key: 'moisturize', color: '#EC4899' },
  { icon: 'sunny', key: 'sunscreen', color: '#F59E0B' },
  { icon: 'medical', key: 'lipcare', color: '#EF4444' },
  { icon: 'moon', key: 'sleep', color: '#8B5CF6' },
  { icon: 'nutrition', key: 'vitaminA', color: '#10B981' },
  { icon: 'eye', key: 'eyecare', color: '#06B6D4' },
  { icon: 'fitness', key: 'exercise', color: '#F97316' },
];

// 날짜 기반으로 오늘의 팁 2개 선택
function getTodayTips(): Tip[] {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const index1 = dayOfYear % tips.length;
  const index2 = (dayOfYear + 1) % tips.length;
  return [tips[index1], tips[index2]];
}

export function DailyTipCard() {
  const { t } = useTranslation();
  const todayTips = getTodayTips();

  return (
    <View className="w-full px-6">
      {/* 헤더 */}
      <View className="mb-4  flex-row items-center">
        <View>
          <Text className="text-lg font-bold text-gray-500">{t('tips.title')}</Text>
        </View>
      </View>

      {/* 팁 카드들 */}
      <View className="gap-3">
        {todayTips.map((tip, index) => (
          <View
            key={index}
            className="flex-row items-center rounded-2xl border border-gray-100 bg-gray-50 p-4"
          >
            <View
              className="mr-4 h-12 w-12 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${tip.color}15` }}
            >
              <Ionicons name={tip.icon} size={24} color={tip.color} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-800">
                {t(`tips.${tip.key}.title`)}
              </Text>
              <Text className="mt-0.5 text-sm text-gray-500">
                {t(`tips.${tip.key}.description`)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* 수정 안내 */}
      <Text className="mt-4 text-center text-xs text-gray-400">
        {t('skin.editNote')}
      </Text>
    </View>
  );
}
