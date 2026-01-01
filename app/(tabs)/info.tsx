import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { ContentCard } from "@/components/info/ContentCard";
import {
  fetchCuratedContents,
  type CuratedContent,
  type ContentType,
} from "@/services/contentService";

export default function InfoScreen() {
  const { t, i18n } = useTranslation();
  const [contents, setContents] = useState<CuratedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ContentType>("article");

  // 현재 언어 (ko 또는 en)
  const currentLanguage = i18n.language.startsWith("ko") ? "ko" : "en";

  // 콘텐츠 로드
  const loadContents = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchCuratedContents(currentLanguage, activeTab, 20);
      setContents(data);
    } catch (err) {
      console.error("콘텐츠 로드 실패:", err);
      setError("콘텐츠를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentLanguage, activeTab]);

  // 초기 로드 및 탭 변경 시 로드
  useEffect(() => {
    setLoading(true);
    loadContents();
  }, [loadContents]);

  // 새로고침
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadContents();
  }, [loadContents]);

  // 탭 변경
  const handleTabChange = (tab: ContentType) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* 헤더 */}
      <View className="bg-white px-5 py-4">
        <Text className="text-xl font-bold text-gray-900">
          {t("info.title", "정보")}
        </Text>
        <Text className="mt-1 text-sm text-gray-500">
          {t("info.subtitle", "이소티논 관련 유용한 정보")}
        </Text>
      </View>

      {/* 탭 바 */}
      <View className="bg-white flex-row border-b border-gray-200">
        <Pressable
          className={`flex-1 py-3 items-center border-b-2 ${
            activeTab === "article"
              ? "border-orange-500"
              : "border-transparent"
          }`}
          onPress={() => handleTabChange("article")}
        >
          <Text
            className={`font-medium ${
              activeTab === "article" ? "text-orange-500" : "text-gray-500"
            }`}
          >
            {t("info.tabs.articles", "블로그")}
          </Text>
        </Pressable>
        <Pressable
          className={`flex-1 py-3 items-center border-b-2 ${
            activeTab === "news"
              ? "border-orange-500"
              : "border-transparent"
          }`}
          onPress={() => handleTabChange("news")}
        >
          <Text
            className={`font-medium ${
              activeTab === "news" ? "text-orange-500" : "text-gray-500"
            }`}
          >
            {t("info.tabs.news", "뉴스")}
          </Text>
        </Pressable>
        <Pressable
          className={`flex-1 py-3 items-center border-b-2 ${
            activeTab === "social"
              ? "border-orange-500"
              : "border-transparent"
          }`}
          onPress={() => handleTabChange("social")}
        >
          <Text
            className={`font-medium ${
              activeTab === "social" ? "text-orange-500" : "text-gray-500"
            }`}
          >
            {t("info.tabs.social", "Social")}
          </Text>
        </Pressable>
      </View>

      {/* 로딩 상태 */}
      {loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      )}

      {/* 에러 상태 */}
      {!loading && error && (
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-center text-gray-500">{error}</Text>
        </View>
      )}

      {/* 콘텐츠 목록 */}
      {!loading && !error && (
        <ScrollView
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#F97316"
            />
          }
        >
          {contents.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-gray-400">
                {t("info.empty", "콘텐츠가 없습니다.")}
              </Text>
            </View>
          ) : (
            contents.map((content, index) => (
              <ContentCard key={`${content.url}-${index}`} content={content} />
            ))
          )}

          {/* 하단 여백 */}
          <View className="h-8" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
