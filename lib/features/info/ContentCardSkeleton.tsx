import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

export function ContentCardSkeleton() {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <View
      className="mb-3 rounded-2xl bg-white p-4"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      {/* 제목 스켈레톤 (2줄) */}
      <Animated.View
        className="h-6 w-full rounded bg-gray-200"
        style={{ opacity: pulseAnim }}
      />
      <Animated.View
        className="mt-2 h-6 w-3/4 rounded bg-gray-200"
        style={{ opacity: pulseAnim }}
      />

      {/* 스니펫 + 썸네일 영역 */}
      <View className="mt-4 flex-row">
        {/* 썸네일 스켈레톤 */}
        <Animated.View
          className="mr-3 h-20 w-20 rounded-lg bg-gray-200"
          style={{ opacity: pulseAnim }}
        />
        {/* 스니펫 스켈레톤 (3줄) */}
        <View className="flex-1 justify-center">
          <Animated.View
            className="h-4 w-full rounded bg-gray-200"
            style={{ opacity: pulseAnim }}
          />
          <Animated.View
            className="mt-2 h-4 w-full rounded bg-gray-200"
            style={{ opacity: pulseAnim }}
          />
          <Animated.View
            className="mt-2 h-4 w-2/3 rounded bg-gray-200"
            style={{ opacity: pulseAnim }}
          />
        </View>
      </View>

      {/* 하단 정보 스켈레톤 */}
      <View className="mt-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          {/* 소스 스켈레톤 */}
          <Animated.View
            className="h-4 w-16 rounded bg-gray-200"
            style={{ opacity: pulseAnim }}
          />
          {/* 날짜 스켈레톤 */}
          <Animated.View
            className="h-4 w-12 rounded bg-gray-200"
            style={{ opacity: pulseAnim }}
          />
        </View>
        {/* 하트 아이콘 스켈레톤 */}
        <Animated.View
          className="h-5 w-5 rounded-full bg-gray-200"
          style={{ opacity: pulseAnim }}
        />
      </View>
    </View>
  );
}
