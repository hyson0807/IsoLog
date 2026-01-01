import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type CuratedContent } from '@/services/contentService';

const STORAGE_KEY = '@isoLog/liked_contents';

interface LikedContentsStorageData {
  contents: CuratedContent[];
}

interface LikedContentsContextValue {
  likedContents: CuratedContent[];
  isLoading: boolean;
  isLiked: (url: string) => boolean;
  toggleLike: (content: CuratedContent) => void;
}

const LikedContentsContext = createContext<LikedContentsContextValue | undefined>(undefined);

export function LikedContentsProvider({ children }: { children: ReactNode }) {
  const [likedContents, setLikedContents] = useState<CuratedContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // URL 기반 Set으로 빠른 lookup
  const likedUrls = useMemo(() => {
    return new Set(likedContents.map((c) => c.url));
  }, [likedContents]);

  // AsyncStorage에서 데이터 로드
  useEffect(() => {
    async function loadData() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data: LikedContentsStorageData = JSON.parse(stored);
          setLikedContents(data.contents || []);
        }
      } catch (error) {
        console.error('좋아요 데이터 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // 데이터 변경 시 AsyncStorage에 저장
  useEffect(() => {
    if (isLoading) return;

    async function saveData() {
      try {
        const data: LikedContentsStorageData = {
          contents: likedContents,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error('좋아요 데이터 저장 실패:', error);
      }
    }
    saveData();
  }, [likedContents, isLoading]);

  // 좋아요 여부 확인
  const isLiked = useCallback(
    (url: string) => {
      return likedUrls.has(url);
    },
    [likedUrls]
  );

  // 좋아요 토글
  const toggleLike = useCallback((content: CuratedContent) => {
    setLikedContents((prev) => {
      const exists = prev.some((c) => c.url === content.url);
      if (exists) {
        // 좋아요 해제
        return prev.filter((c) => c.url !== content.url);
      } else {
        // 좋아요 추가 (최신순으로 맨 앞에)
        return [content, ...prev];
      }
    });
  }, []);

  const value = useMemo(
    () => ({
      likedContents,
      isLoading,
      isLiked,
      toggleLike,
    }),
    [likedContents, isLoading, isLiked, toggleLike]
  );

  return (
    <LikedContentsContext.Provider value={value}>
      {children}
    </LikedContentsContext.Provider>
  );
}

export function useLikedContents() {
  const context = useContext(LikedContentsContext);
  if (context === undefined) {
    throw new Error('useLikedContents must be used within a LikedContentsProvider');
  }
  return context;
}
