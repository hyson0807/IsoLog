import { useState, useMemo } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import * as Haptics from "expo-haptics";
import { useLikedContents } from "@/contexts/LikedContentsContext";
import type { CuratedContent } from "@/services/contentService";

export default function ContentScreen() {
  const { url, source, content: contentParam } = useLocalSearchParams<{
    url: string;
    source: string;
    content: string;
  }>();
  const [loading, setLoading] = useState(true);
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

  const handleBack = () => {
    router.back();
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
        <WebView
          source={{ uri: url }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          style={{ flex: 1 }}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
    </SafeAreaView>
  );
}
