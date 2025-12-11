import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Tip {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
}

const tips: Tip[] = [
  {
    icon: 'water',
    title: '물 자주 마시기',
    description: '하루 2L 이상 수분 섭취로 건조함을 예방하세요',
    color: '#3B82F6',
  },
  {
    icon: 'sparkles',
    title: '보습 관리',
    description: '세안 후 즉시 보습제를 발라주세요',
    color: '#EC4899',
  },
  {
    icon: 'sunny',
    title: '자외선 차단',
    description: '외출 시 SPF 30+ 자외선 차단제 필수!',
    color: '#F59E0B',
  },
  {
    icon: 'medical',
    title: '입술 케어',
    description: '립밤을 자주 발라 입술 갈라짐을 예방하세요',
    color: '#EF4444',
  },
  {
    icon: 'moon',
    title: '충분한 수면',
    description: '피부 재생을 위해 7시간 이상 수면을 권장해요',
    color: '#8B5CF6',
  },
  {
    icon: 'nutrition',
    title: '비타민 A 주의',
    description: '비타민 A 보충제는 복용을 피해주세요',
    color: '#10B981',
  },
  {
    icon: 'eye',
    title: '눈 건조 관리',
    description: '인공눈물로 눈 건조함을 관리하세요',
    color: '#06B6D4',
  },
  {
    icon: 'fitness',
    title: '격한 운동 주의',
    description: '관절과 근육에 무리가 갈 수 있어요',
    color: '#F97316',
  },
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
  const todayTips = getTodayTips();

  return (
    <View className="w-full px-6">
      {/* 헤더 */}
      <View className="mb-4 flex-row items-center">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-green-500">
          <Ionicons name="checkmark" size={24} color="#FFFFFF" />
        </View>
        <View>
          <Text className="text-lg font-bold text-gray-800">오늘 복용 완료!</Text>
          <Text className="text-sm text-gray-500">오늘의 이소티논 케어 팁</Text>
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
                {tip.title}
              </Text>
              <Text className="mt-0.5 text-sm text-gray-500">
                {tip.description}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* 수정 안내 */}
      <Text className="mt-4 text-center text-xs text-gray-400">
        피부 기록 수정은 캘린더에서 가능해요
      </Text>
    </View>
  );
}
