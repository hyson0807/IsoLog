네, \*\*자동 언어 감지(Auto-detection)\*\*와 \*\*수동 변경(Manual Switching)\*\*을 모두 지원하는 완벽한 다국어(i18n) 구현 계획을 정리해 드립니다.

React Native 생태계의 표준이자 가장 강력한 라이브러리인 \*\*`i18next`\*\*와 \*\*`expo-localization`\*\*을 조합하여 구현하는 것이 정석입니다.

-----

### 🛠 구현 로드맵

1.  **라이브러리 설치:** 필요한 패키지 추가
2.  **언어 파일 생성:** 한국어(`ko.json`), 영어(`en.json`) 등 번역 파일 작성
3.  **설정 파일(`i18n.ts`) 작성:** "저장된 언어 확인 → 없으면 기기 언어 감지 → 없으면 영어" 로직 구현
4.  **컴포넌트 적용:** 하드코딩된 텍스트를 변수로 교체
5.  **설정 페이지 기능 추가:** 언어 변경 UI 및 로직 구현

-----

### 1\. 패키지 설치

터미널에서 아래 명령어를 실행하세요.

```bash
npm install i18next react-i18next expo-localization @react-native-async-storage/async-storage
```

-----

### 2\. 번역 파일 구조 잡기

프로젝트 루트에 `locales` 폴더를 만들고 JSON 파일을 생성합니다.

**📁 구조:**

```
/locales
  ├── ko.json  (한국어)
  └── en.json  (영어)
```

**📄 `locales/ko.json` (예시)**

```json
{
  "home": {
    "status_taken": "오늘 복용을 완료했어요! 🎉",
    "status_warning": "오늘은 약 먹는 날이에요! 💊",
    "btn_check": "복용 체크하기"
  },
  "settings": {
    "title": "설정",
    "language": "언어 설정",
    "alarm_time": "알림 시간"
  }
}
```

**📄 `locales/en.json` (예시)**

```json
{
  "home": {
    "status_taken": "Taken successfully! 🎉",
    "status_warning": "Time to take your pill! 💊",
    "btn_check": "Check-in"
  },
  "settings": {
    "title": "Settings",
    "language": "Language",
    "alarm_time": "Notification Time"
  }
}
```

-----

### 3\. i18n 초기화 로직 (`i18n.ts`)

이 부분이 핵심입니다. 앱이 켜질 때 **어떤 언어를 보여줄지 결정하는 두뇌** 역할을 합니다. 루트 폴더나 `utils` 폴더에 `i18n.ts`를 만드세요.

```typescript
// i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ko from './locales/ko.json';
import en from './locales/en.json';

const RESOURCES = {
  ko: { translation: ko },
  en: { translation: en },
};

// 언어 감지기 (Detector) 정의
const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      // 1. 사용자가 수동으로 설정한 언어가 있는지 확인
      const savedLanguage = await AsyncStorage.getItem('user-language');
      if (savedLanguage) {
        return callback(savedLanguage);
      }
      
      // 2. 없으면 기기 설정 언어 가져오기
      const deviceLanguage = Localization.getLocales()[0].languageCode; // 'ko', 'en' etc.
      
      // 3. 지원하는 언어인지 확인 후 반환, 아니면 기본값 'en'
      // (예: 프랑스어 사용자는 영어를 보게 됨)
      if (['ko', 'en'].includes(deviceLanguage)) {
        return callback(deviceLanguage);
      }
      return callback('en');
      
    } catch (error) {
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    // 언어가 변경되면 자동으로 저장소에 저장
    await AsyncStorage.setItem('user-language', language);
  },
};

i18n
  .use(initReactI18next) // 리액트와 연결
  .use(languageDetector as any) // 위에서 만든 감지기 연결
  .init({
    resources: RESOURCES,
    fallbackLng: 'en', // 번역 키가 없을 경우 영어 사용
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // 로딩 상태 처리 방지
    },
  });

export default i18n;
```

**앱 진입점(`app/_layout.tsx`) 최상단에 import:**

```typescript
import '../i18n'; // i18n 설정을 가장 먼저 실행
// ... 다른 import 들
```

-----

### 4\. 컴포넌트에서 사용하기 (UI 적용)

이제 하드코딩된 텍스트를 `t()` 함수로 바꿉니다.

```tsx
import { useTranslation } from 'react-i18next';

export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <Text className="text-xl font-bold">
      {/* 기존: "오늘은 약 먹는 날이에요! 💊" */}
      {t('home.status_warning')}
    </Text>
  );
}
```

-----

### 5\. 설정 페이지에서 언어 변경하기 (UI/UX)

알림 시간 설정과 동일하게 **바텀 시트(Bottom Sheet)** UX를 추천합니다.

**1. 설정 메뉴 UI (`settings.tsx`)**

```tsx
import { useTranslation } from 'react-i18next';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();

  // 현재 언어 라벨 표시용 (ko -> 한국어, en -> English)
  const currentLangLabel = i18n.language === 'ko' ? '한국어' : 'English';

  return (
    // ...
    <TouchableOpacity 
      onPress={() => setShowLanguageSheet(true)} 
      className="flex-row justify-between items-center p-4 bg-white"
    >
      <View className="flex-row items-center gap-3">
        <GlobeIcon size={24} color="#333" />
        <Text className="text-base">{t('settings.language')}</Text>
      </View>
      <View className="flex-row items-center">
        <Text className="text-orange-500 mr-2">{currentLangLabel}</Text>
        <ChevronRight color="#ccc" />
      </View>
    </TouchableOpacity>
    // ...
  );
}
```

**2. 언어 변경 바텀 시트 로직**

```tsx
// 언어 변경 함수
const changeLanguage = async (lang: string) => {
  await i18n.changeLanguage(lang); // 1. 언어 변경 (화면 즉시 갱신)
  // 2. AsyncStorage 저장은 i18n.ts의 cacheUserLanguage에서 자동 처리됨
  setShowLanguageSheet(false); // 시트 닫기
};

// 시트 내부 UI
<View className="p-5">
  <Text className="text-lg font-bold mb-4">언어 선택 / Language</Text>
  
  <TouchableOpacity onPress={() => changeLanguage('ko')} className="p-4 border-b border-gray-100">
    <Text className={i18n.language === 'ko' ? 'text-orange-500 font-bold' : 'text-black'}>
      한국어
    </Text>
  </TouchableOpacity>

  <TouchableOpacity onPress={() => changeLanguage('en')} className="p-4">
    <Text className={i18n.language === 'en' ? 'text-orange-500 font-bold' : 'text-black'}>
      English
    </Text>
  </TouchableOpacity>
</View>
```

-----

### 💡 캘린더 날짜 포맷 팁 (중요)

다국어 지원 시 **날짜(12월 11일 vs Dec 11)** 포맷도 같이 바뀌어야 완벽합니다. `date-fns`를 쓰고 계신다면 아래와 같이 처리하세요.

```tsx
import { format } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

const { i18n } = useTranslation();
const dateLocale = i18n.language === 'ko' ? ko : enUS;

// 사용
format(new Date(), 'MMMM d, yyyy', { locale: dateLocale });
```

이렇게 구현하면 앱 설치 시 자동으로 사용자 언어를 따라가고, 설정에서 언제든 바꿀 수 있는 글로벌 앱이 완성됩니다\!