import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import type { CuratedContent } from "@/services/contentService";

interface ContentCardProps {
  content: CuratedContent;
}

export function ContentCard({ content }: ContentCardProps) {
  const { t } = useTranslation();

  const handlePress = () => {
    router.push({
      pathname: "/content",
      params: {
        url: content.url,
        source: content.source,
      },
    });
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t("info.date.today", "Today");
    if (diffDays === 1) return t("info.date.yesterday", "Yesterday");
    if (diffDays < 7) return t("info.date.daysAgo", "{{count}} days ago", { count: diffDays });
    if (diffDays < 30) return t("info.date.weeksAgo", "{{count}} weeks ago", { count: Math.floor(diffDays / 7) });
    return t("info.date.monthsAgo", "{{count}} months ago", { count: Math.floor(diffDays / 30) });
  };

  return (
    <Pressable
      onPress={handlePress}
      className="mb-3 rounded-2xl bg-white p-4 active:bg-gray-50"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      {/* 제목 */}
      <Text
        className="text-base font-semibold leading-6 text-gray-900"
        numberOfLines={2}
      >
        {content.title}
      </Text>

      {/* 스니펫 */}
      <Text
        className="mt-2 text-sm leading-5 text-gray-600"
        numberOfLines={3}
      >
        {content.snippet}
      </Text>

      {/* 하단 정보 */}
      <View className="mt-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="globe-outline" size={14} color="#9CA3AF" />
          <Text className="ml-1 text-xs text-gray-400">{content.source}</Text>
        </View>

        {content.publishedAt && (
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={14} color="#9CA3AF" />
            <Text className="ml-1 text-xs text-gray-400">
              {formatDate(content.publishedAt)}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
