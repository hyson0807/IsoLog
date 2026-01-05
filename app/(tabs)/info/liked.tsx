import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useLikedContents } from "@/contexts/LikedContentsContext";
import { ContentCard } from '@lib/features/info';

export default function LikedContentsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { likedContents, isLoading } = useLikedContents();

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* 헤더 */}
      <View className="flex-row items-center border-b border-gray-200 bg-white px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="mr-3 p-1"
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </Pressable>
        <Text className="text-lg font-bold text-gray-900">
          {t("info.liked.title")}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
      >
        {isLoading ? (
          <View className="items-center justify-center py-20">
            <Text className="text-gray-400">
              {t("common.loading")}
            </Text>
          </View>
        ) : likedContents.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Ionicons name="heart-outline" size={48} color="#D1D5DB" />
            <Text className="mt-4 text-center text-gray-400">
              {t("info.liked.empty")}
            </Text>
          </View>
        ) : (
          likedContents.map((content, index) => (
            <ContentCard key={`${content.url}-${index}`} content={content} />
          ))
        )}

        {/* 하단 여백 */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
