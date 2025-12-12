import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTION_COUNT_KEY = '@isoLog/medication_check_count';
const TRIGGER_COUNTS = [3, 10, 30, 60, 100];

/**
 * 복용 체크 후 리뷰 요청을 시도합니다.
 *
 * 로직:
 * 1. 네이티브 리뷰 기능 지원 여부 확인
 * 2. 복용 체크 횟수 증가 및 저장
 * 3. 특정 횟수(3, 10, 30, 60, 100회)에만 리뷰 팝업 요청
 *
 * 참고: OS 정책에 따라 실제 팝업 표시 여부가 결정됨 (연간 횟수 제한)
 */
export const tryRequestReview = async (): Promise<void> => {
  try {
    // 1. 기기가 리뷰 팝업을 지원하는지 확인 (iOS 10.3+, Android 5.0+)
    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) {
      return;
    }

    // 2. 복용 체크 횟수 증가
    const currentCountStr = await AsyncStorage.getItem(ACTION_COUNT_KEY);
    let count = currentCountStr ? parseInt(currentCountStr, 10) : 0;
    count += 1;
    await AsyncStorage.setItem(ACTION_COUNT_KEY, count.toString());

    // 3. 트리거 조건 확인 (특정 횟수에만 요청)
    if (!TRIGGER_COUNTS.includes(count)) {
      return;
    }

    // 4. 리뷰 팝업 요청
    // 참고: 호출해도 OS가 쿼터 제한으로 무시할 수 있음
    await StoreReview.requestReview();

    console.log(`[ReviewService] Review requested at count: ${count}`);
  } catch (error) {
    console.log('[ReviewService] Error requesting review:', error);
  }
};
