# Tennis Club Ranking — Frontend

[테니스 동아리 랭킹 백엔드](https://github.com/KWTC-Ranking/Backend)용 React + TypeScript + Vite
프런트엔드입니다.

## 스택

- Vite + React 19 + TypeScript
- React Router
- 별도 클라이언트 라이브러리 없이 `fetch`를 그대로 사용 (`src/api/`의 얇은 래퍼)
- ESLint + Prettier

## 로컬 실행

백엔드를 먼저 실행해야 합니다 (백엔드 저장소 README 참고 — `docker compose up -d` +
`./gradlew bootRun`, API는 `http://localhost:8080`). 백엔드의 CORS 설정은 Vite 기본 개발 포트인
`http://localhost:5173`을 이미 허용하고 있습니다.

```
npm install
npm run dev
```

백엔드가 `http://localhost:8080`이 아닌 다른 주소에서 돈다면, `.env.example`을 `.env.local`로
복사한 뒤 `VITE_API_BASE_URL`을 설정하세요.

## 스크립트

- `npm run dev` — 개발 서버
- `npm run build` — 타입체크(`tsc -b`) + 프로덕션 빌드
- `npm run lint` — ESLint
- `npm run format` — Prettier로 코드 포맷팅 (파일에 바로 반영)

## 구조

```
src/
  api/           fetch 래퍼 + 타입이 붙은 API 호출 함수(auth, leaderboard, ...) + 공통 DTO 타입
  context/       인증 상태 (AuthProvider/useAuth), 토큰은 localStorage에 보관
  routes/        화면 컴포넌트 (LoginPage, LeaderboardPage, ProtectedRoute)
  App.tsx        라우터 설정
```

## 인증

백엔드에 대한 JWT Bearer 인증입니다. `POST /api/auth/login`이 토큰을 반환하면 `localStorage`에
저장하고, 이후 모든 요청에 `src/api/client.ts`가 자동으로 `Authorization: Bearer <token>`을 붙입니다.
역할은 `ADMIN`과 `MEMBER` 두 가지뿐이며, 관리자 전용 UI는 `user.role === "ADMIN"` 조건으로
가려주세요.

## 진행 상황

지금까지는 스캐폴딩 수준입니다: 로그인 화면과 단식/복식 리더보드 화면이 실제 백엔드와 엔드투엔드로
연동되어 동작합니다. 그 외(경기 기록, 관리자 화면, 선수 프로필/점수 이력)는 아직 만들지 않았습니다 —
초기 세팅 때 작성한 핸드오프 브리핑 문서에 전체 API 레퍼런스와 추천 개발 순서가 정리되어 있습니다.
