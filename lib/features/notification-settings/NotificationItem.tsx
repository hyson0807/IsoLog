import { type ReactNode } from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NotificationItemProps {
  /** 아이콘 이름 (Ionicons) - 없으면 아이콘 미표시 */
  icon?: keyof typeof Ionicons.glyphMap;
  /** 아이콘 색상 */
  iconColor?: string;
  /** 아이콘 배경 색상 (Tailwind class) */
  iconBgClass?: string;
  /** 알림 제목 */
  title: string;
  /** 알림 설명 */
  description: string;
  /** 토글 상태 */
  enabled: boolean;
  /** 토글 변경 핸들러 */
  onToggle: (value: boolean) => void;
  /** 비활성화 여부 (마스터 토글이 꺼진 경우) */
  disabled?: boolean;
  /** 토글 활성화 색상 */
  activeColor?: string;
  /** 토글 트랙 활성화 색상 */
  trackActiveColor?: string;
  /** 추가 설정 영역 (시간 설정 등) */
  children?: ReactNode;
}

export function NotificationItem({
  icon,
  iconColor,
  iconBgClass,
  title,
  description,
  enabled,
  onToggle,
  disabled = false,
  activeColor = '#3B82F6',
  trackActiveColor = '#93C5FD',
  children,
}: NotificationItemProps) {
  const isActive = enabled && !disabled;

  const handleToggle = (value: boolean) => {
    if (disabled) return;
    onToggle(value);
  };

  const handlePress = () => {
    if (disabled) return;
    onToggle(!enabled);
  };

  return (
    <View className={`px-4 py-4 ${disabled ? 'opacity-50' : ''}`}>
      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={disabled ? 1 : 0.7}
          className="flex-1 flex-row items-center"
        >
          {icon && (
            <View className={`mr-3 h-10 w-10 items-center justify-center rounded-full ${iconBgClass}`}>
              <Ionicons name={icon} size={20} color={iconColor} />
            </View>
          )}
          <View className="flex-1">
            <Text className="text-base font-medium text-gray-900">{title}</Text>
            <Text className="mt-0.5 text-sm text-gray-500">{description}</Text>
          </View>
        </TouchableOpacity>
        <Switch
          value={enabled}
          onValueChange={handleToggle}
          disabled={disabled}
          trackColor={{ false: '#E5E7EB', true: trackActiveColor }}
          thumbColor={isActive ? activeColor : '#F3F4F6'}
          ios_backgroundColor="#E5E7EB"
        />
      </View>
      {children}
    </View>
  );
}
