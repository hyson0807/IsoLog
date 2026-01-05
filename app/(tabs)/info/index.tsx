import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  Animated,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  TextInput,
  Keyboard,
  StyleSheet,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useScrollToTop } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { ContentCard, InfoMenuSidebar, type InfoMenuItemType } from '@lib/features/info';
import {
  fetchContentsByTab,
  type CuratedContent,
  type TabType,
} from "@/services/contentService";

// 헤더 및 sticky header 높이 상수
const HEADER_HEIGHT = 72;
const STICKY_HEADER_HEIGHT = 100; // 검색창 + 탭바

export default function InfoScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);

  // Animated scroll value for header animation
  const scrollY = useRef(new Animated.Value(0)).current;

  // Header translateY (moves up as user scrolls, hides behind status bar)
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT],
    extrapolate: "clamp",
  });

  // Sticky header (search + tabs) translateY - follows header then stays fixed
  const stickyHeaderTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [HEADER_HEIGHT, 0],
    extrapolate: "clamp",
  });

  const [contents, setContents] = useState<CuratedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [menuSidebarVisible, setMenuSidebarVisible] = useState(false);

  // 페이지네이션 상태
  const [lastKey, setLastKey] = useState<Record<string, any> | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 메뉴 항목 선택 핸들러
  const handleMenuSelect = (type: InfoMenuItemType) => {
    if (type === "liked") {
      router.push("/info/liked");
    }
  };

  // 현재 언어 (ko 또는 en)
  const currentLanguage = i18n.language.startsWith("ko") ? "ko" : "en";

  // 초기 콘텐츠 로드
  const loadInitial = useCallback(async () => {
    try {
      setError(null);
      const result = await fetchContentsByTab(currentLanguage, activeTab, 20);
      setContents(result.items);
      setLastKey(result.lastKey);
      setHasMore(!!result.lastKey);
    } catch (err) {
      console.error("Content load failed:", err);
      setError(t("info.loadError"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentLanguage, activeTab, t]);

  // 추가 콘텐츠 로드 (스크롤 끝에 도달 시)
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || loading || searchQuery.trim()) return;

    setIsLoadingMore(true);
    try {
      const result = await fetchContentsByTab(currentLanguage, activeTab, 20, lastKey);
      setContents((prev) => [...prev, ...result.items]);
      setLastKey(result.lastKey);
      setHasMore(!!result.lastKey);
    } catch (err) {
      console.error("Load more failed:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, loading, searchQuery, currentLanguage, activeTab, lastKey]);

  // 초기 로드 및 탭 변경 시 로드
  useEffect(() => {
    setLoading(true);
    setLastKey(null);
    setHasMore(true);
    loadInitial();
  }, [loadInitial]);

  // 새로고침
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setLastKey(null);
    setHasMore(true);
    loadInitial();
  }, [loadInitial]);

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

  // 스크롤 끝에 도달했는지 확인 (무한 스크롤용)
  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const paddingToBottom = 100; // 하단에서 100px 전에 로드 시작
      const isCloseToBottom =
        layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

      if (isCloseToBottom) {
        loadMore();
      }
    },
    [loadMore]
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={[]}>
      {/* Status bar 배경 - 헤더가 이 뒤로 숨겨짐 */}
      <View style={[styles.statusBarBackground, { height: insets.top }]} />

      {/* 헤더 - 스크롤 시 위로 사라짐 */}
      <Animated.View
        style={[
          styles.header,
          { top: insets.top, transform: [{ translateY: headerTranslateY }] },
        ]}
      >
        <View className="flex-row items-start justify-between bg-white px-5 py-4">
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">
              {t("info.title")}
            </Text>
            <Text className="mt-1 text-sm text-gray-500">
              {t("info.subtitle")}
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
      </Animated.View>

      {/* Sticky Header: 검색창 + 탭 바 - 헤더를 따라가다가 상단에 고정 */}
      <Animated.View
        style={[
          styles.stickyHeader,
          { top: insets.top, transform: [{ translateY: stickyHeaderTranslateY }] },
        ]}
      >
        {/* 검색창 */}
        <View className="bg-white px-4 pb-3 pt-2">
          <View className="flex-row items-center rounded-lg border border-gray-200 bg-gray-50 px-3">
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput
              className="flex-1 px-2 py-2.5 text-sm text-gray-700"
              placeholder={t("info.searchPlaceholder")}
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
        <View className="flex-row border-b border-gray-200 bg-white">
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
              {t("info.tabs.all")}
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
              {t("info.tabs.articles")}
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
              {t("info.tabs.social")}
            </Text>
          </Pressable>
        </View>
      </Animated.View>

      {/* 콘텐츠 스크롤 영역 - RefreshControl이 탭바 아래에서 동작 */}
      <Animated.ScrollView
        ref={scrollRef}
        style={[styles.scrollView, { marginTop: insets.top + STICKY_HEADER_HEIGHT }]}
        contentContainerStyle={[styles.scrollContent, { paddingTop: HEADER_HEIGHT }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollEnd={handleScrollEnd}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#F97316"
            progressViewOffset={HEADER_HEIGHT}
          />
        }
      >
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
                      ? t("info.noSearchResults")
                      : t("info.empty")}
                  </Text>
                </View>
              ) : (
                filteredContents.map((content, index) => (
                  <ContentCard key={`${content.url}-${index}`} content={content} />
                ))
              )}
            </>
          )}

          {/* 추가 로딩 인디케이터 */}
          {isLoadingMore && (
            <View className="items-center justify-center py-4">
              <ActivityIndicator size="small" color="#F97316" />
            </View>
          )}

          {/* 더 이상 콘텐츠 없음 표시 */}
          {!loading && !hasMore && filteredContents.length > 0 && !searchQuery.trim() && (
            <View className="items-center justify-center py-4">
              <Text className="text-sm text-gray-400">{t("info.noMoreContents")}</Text>
            </View>
          )}

          {/* 하단 여백 */}
          <View className="h-8" />
        </View>
      </Animated.ScrollView>

      {/* 메뉴 사이드바 */}
      <InfoMenuSidebar
        visible={menuSidebarVisible}
        onClose={() => setMenuSidebarVisible(false)}
        onSelectItem={handleMenuSelect}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  statusBarBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    backgroundColor: "white",
  },
  header: {
    position: "absolute",
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 10,
    backgroundColor: "white",
  },
  stickyHeader: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: "white",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },
});
