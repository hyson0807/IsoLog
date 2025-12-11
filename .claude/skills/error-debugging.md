# Error Debugging Skill

에러 메시지를 분석하고 해결책을 제시하는 스킬입니다.

---
name: error-debugging
description: 에러 메시지, 스택 트레이스, 빌드 실패, 런타임 에러가 보이면 이 스킬을 사용하여 체계적으로 디버깅합니다.
---

## 발동 조건

다음 키워드가 포함된 경우 자동 활성화:
- Error, Exception, Failed, Crash
- TypeError, ReferenceError, SyntaxError
- 빌드 실패, 컴파일 에러
- Stack trace, Traceback
- npm ERR, yarn error, gradle error

## 디버깅 프로세스

### 1단계: 에러 분석
- 에러 타입 식별 (문법, 런타임, 타입, 네트워크 등)
- 에러 메시지 핵심 내용 파악
- 발생 위치 (파일명, 라인 번호) 확인

### 2단계: 원인 파악
- 스택 트레이스에서 내 코드 위치 찾기
- 관련 코드 컨텍스트 확인
- 최근 변경사항과의 연관성 검토

### 3단계: 해결책 제시
- 즉시 적용 가능한 수정 코드 제공
- 수정 이유 간단히 설명
- 비슷한 에러 방지 팁 (선택적)

## 출력 형식

```
🔴 에러 유형: [에러 타입]
📍 발생 위치: [파일:라인]
💡 원인: [한 줄 요약]

✅ 해결책:
[수정된 코드]

📝 설명: [왜 이 에러가 발생했는지]
```

## 프로젝트 환경 참고

이 프로젝트에서 주로 사용하는 기술 스택:
- Frontend: React Native, TypeScript
- Backend: Node.js, Express
- Database: PostgreSQL, Supabase
- 기타: REST API, JWT 인증

해당 기술 스택의 일반적인 에러 패턴을 우선 고려합니다.

## 추가 체크리스트

에러 해결 후 확인할 것:
- [ ] 같은 패턴의 코드가 다른 곳에도 있는지
- [ ] 타입 정의가 올바른지 (TypeScript)
- [ ] 환경변수나 설정 파일 문제는 없는지
- [ ] 의존성 버전 충돌은 없는지