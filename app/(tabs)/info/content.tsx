import { useState, useMemo, useEffect } from "react";
import { View, Text, Pressable, ActivityIndicator, Linking, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import * as Haptics from "expo-haptics";
import { useLikedContents } from "@/contexts/LikedContentsContext";
import type { CuratedContent } from "@/services/contentService";

// 네이버 도메인 체크
const NAVER_DOMAINS = [
  "blog.naver.com",
  "m.blog.naver.com",
  "cafe.naver.com",
  "m.cafe.naver.com",
  "kin.naver.com",
  "m.kin.naver.com",
];

function isNaverUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return NAVER_DOMAINS.some((domain) => hostname.includes(domain));
  } catch {
    return false;
  }
}

// User-Agent (모바일 Safari)
const USER_AGENT = Platform.select({
  ios: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  android: "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  default: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
});

export default function ContentScreen() {
  const { url, source, content: contentParam } = useLocalSearchParams<{
    url: string;
    source: string;
    content: string;
  }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { isLiked, toggleLike } = useLikedContents();

  const contentData: CuratedContent | null = useMemo(() => {
    if (!contentParam) return null;
    try {
      return JSON.parse(contentParam);
    } catch {
      return null;
    }
  }, [contentParam]);

  const liked = url ? isLiked(url) : false;

  // 네이버 URL은 외부 브라우저로 열기
  useEffect(() => {
    if (url && isNaverUrl(url)) {
      Linking.openURL(url);
      router.back();
    }
  }, [url]);

  const handleBack = () => {
    router.back();
  };

  // 외부 브라우저로 열기 (에러 시 폴백)
  const openInBrowser = async () => {
    if (url) {
      await Linking.openURL(url);
      router.back();
    }
  };

  const handleLikePress = () => {
    if (!contentData) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleLike(contentData);
  };

  if (!url) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">URL이 없습니다.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* 헤더 */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <Pressable
          onPress={handleBack}
          className="p-2 -ml-2 active:bg-gray-100 rounded-full"
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </Pressable>
        <View className="flex-1 ml-2">
          <Text className="text-sm text-gray-500" numberOfLines={1}>
            {source || new URL(url).hostname}
          </Text>
        </View>
        {contentData && (
          <Pressable
            onPress={handleLikePress}
            className="p-2 -mr-2 active:bg-gray-100 rounded-full"
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={24}
              color={liked ? "#F97316" : "#9CA3AF"}
            />
          </Pressable>
        )}
      </View>

      {/* WebView */}
      <View className="flex-1">
        {loading && (
          <View className="absolute inset-0 items-center justify-center bg-white z-10">
            <ActivityIndicator size="large" color="#F97316" />
          </View>
        )}
        {error && (
          <View className="absolute inset-0 items-center justify-center bg-white z-10">
            <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 mt-4">페이지를 불러올 수 없습니다</Text>
            <Text className="text-gray-400 text-sm mt-1">
              원본 페이지가 삭제되었거나 이동되었습니다
            </Text>
            <View className="flex-row mt-6 gap-3">
              <Pressable
                onPress={openInBrowser}
                className="px-6 py-3 bg-orange-500 rounded-full active:bg-orange-600"
              >
                <Text className="text-white font-medium">브라우저에서 열기</Text>
              </Pressable>
              <Pressable
                onPress={handleBack}
                className="px-6 py-3 bg-gray-200 rounded-full active:bg-gray-300"
              >
                <Text className="text-gray-700 font-medium">돌아가기</Text>
              </Pressable>
            </View>
          </View>
        )}
        <WebView
          source={{ uri: url }}
          userAgent={USER_AGENT}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          onHttpError={(event) => {
            if (event.nativeEvent.statusCode >= 400) {
              setLoading(false);
              setError(true);
            }
          }}
          style={{ flex: 1 }}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          sharedCookiesEnabled={true}
        />
      </View>
    </SafeAreaView>
  );
}
