import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  TextInput,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScrollToTop } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { ContentCard } from "@/components/info/ContentCard";
import { InfoMenuSidebar, type InfoMenuItemType } from "@/components/info/InfoMenuSidebar";
import {
  fetchContentsByTab,
  type CuratedContent,
  type TabType,
} from "@/services/contentService";

export default function InfoScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);

  const [contents, setContents] = useState<CuratedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [menuSidebarVisible, setMenuSidebarVisible] = useState(false);

  // 메뉴 항목 선택 핸들러
  const handleMenuSelect = (type: InfoMenuItemType) => {
    if (type === "liked") {
      router.push("/liked");
    }
  };

  // 현재 언어 (ko 또는 en)
  const currentLanguage = i18n.language.startsWith("ko") ? "ko" : "en";

  // 콘텐츠 로드
  const loadContents = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchContentsByTab(currentLanguage, activeTab, 20);
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
  const handleTabChange = (tab: TabType) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
    }
  };

  // 검색 필터링
  const filteredContents = useMemo(() => {
    if (!searchQuery.trim()) return contents;
    const query = searchQuery.toLowerCase().trim();
    return contents.filter(
      (content) =>
        content.title.toLowerCase().includes(query) ||
        content.snippet.toLowerCase().includes(query)
    );
  }, [searchQuery, contents]);

  // 검색 시 All 탭으로 전환
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (text.trim() && activeTab !== "all") {
      setActiveTab("all");
    }
  };

  // 검색 초기화
  const clearSearch = () => {
    setSearchQuery("");
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#F97316"
          />
        }
      >
        {/* 헤더 - 스크롤 시 사라짐 */}
        <View className="flex-row items-start justify-between bg-white px-5 py-4">
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">
              {t("info.title", "정보")}
            </Text>
            <Text className="mt-1 text-sm text-gray-500">
              {t("info.subtitle", "이소티논 관련 유용한 정보")}
            </Text>
          </View>
          <Pressable
            onPress={() => setMenuSidebarVisible(true)}
            className="ml-2 p-1"
            hitSlop={8}
          >
            <Ionicons name="menu" size={24} color="#374151" />
          </Pressable>
        </View>

        {/* Sticky Header: 검색창 + 탭 바 */}
        <View className="bg-white">
          {/* 검색창 */}
          <View className="px-4 pb-3 pt-2">
            <View className="flex-row items-center rounded-lg border border-gray-200 bg-gray-50 px-3">
              <Ionicons name="search" size={18} color="#9CA3AF" />
              <TextInput
                className="flex-1 px-2 py-2.5 text-sm text-gray-700"
                placeholder={t("info.searchPlaceholder", "제목 또는 내용 검색")}
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={handleSearchChange}
                returnKeyType="search"
                onSubmitEditing={() => Keyboard.dismiss()}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={clearSearch} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                </Pressable>
              )}
            </View>
          </View>

          {/* 탭 바 */}
          <View className="flex-row border-b border-gray-200">
            <Pressable
              className={`flex-1 py-3 items-center border-b-2 ${
                activeTab === "all"
                  ? "border-orange-500"
                  : "border-transparent"
              }`}
              onPress={() => handleTabChange("all")}
            >
              <Text
                className={`font-medium ${
                  activeTab === "all" ? "text-orange-500" : "text-gray-500"
                }`}
              >
                {t("info.tabs.all", "All")}
              </Text>
            </Pressable>
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
                {t("info.tabs.articles", "Articles")}
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
        </View>

        {/* 콘텐츠 영역 */}
        <View className="px-4 pt-4">
          {/* 로딩 상태 */}
          {loading && (
            <View className="items-center justify-center py-20">
              <ActivityIndicator size="large" color="#F97316" />
            </View>
          )}

          {/* 에러 상태 */}
          {!loading && error && (
            <View className="items-center justify-center py-20">
              <Text className="text-center text-gray-500">{error}</Text>
            </View>
          )}

          {/* 콘텐츠 목록 */}
          {!loading && !error && (
            <>
              {filteredContents.length === 0 ? (
                <View className="items-center justify-center py-20">
                  <Text className="text-gray-400">
                    {searchQuery.trim()
                      ? t("info.noSearchResults", "검색 결과가 없습니다.")
                      : t("info.empty", "콘텐츠가 없습니다.")}
                  </Text>
                </View>
              ) : (
                filteredContents.map((content, index) => (
                  <ContentCard key={`${content.url}-${index}`} content={content} />
                ))
              )}
            </>
          )}

          {/* 하단 여백 */}
          <View className="h-8" />
        </View>
      </ScrollView>

      {/* 메뉴 사이드바 */}
      <InfoMenuSidebar
        visible={menuSidebarVisible}
        onClose={() => setMenuSidebarVisible(false)}
        onSelectItem={handleMenuSelect}
      />
    </SafeAreaView>
  );
}
