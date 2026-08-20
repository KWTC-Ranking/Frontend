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

같은 와이파이의 휴대폰 등 다른 기기에서 개발 서버로 접속하려면 `npm run dev -- --host`로 띄우고,
백엔드의 `RANKING_ALLOWED_ORIGINS`에 그 기기가 쓰는 origin(예: `http://<PC의 LAN IP>:5173`)을
추가해야 CORS가 통과합니다. Windows는 방화벽에서 5173/8080 인바운드를 막고 있을 수 있습니다.

## 스크립트

- `npm run dev` — 개발 서버
- `npm run build` — 타입체크(`tsc -b`) + 프로덕션 빌드
- `npm run lint` — ESLint
- `npm run format` — Prettier로 코드 포맷팅 (파일에 바로 반영)

## 구조

```
src/
  api/           fetch 래퍼 + 타입이 붙은 API 호출 함수(auth, players, matches, leaderboard, admin) + 공통 DTO 타입
  context/       인증 상태 (AuthProvider/useAuth), 토큰은 localStorage에 보관
  routes/
    Layout               공통 상단 네비게이션
    LoginPage
    LeaderboardPage      단식/복식 탭
    ChangePasswordPage
    PlayerListPage       회원 목록 + 비활성화 토글 (ADMIN)
    PlayerDetailPage     랭킹 + 점수 변동 이력 + 프로필수정/비밀번호초기화 링크 (ADMIN)
    PlayerEditPage       (ADMIN)
    RecordMatchPage      경기 등록 (단식/복식, 동적 세트 입력)
    MatchListPage / MatchDetailPage
    AddMemberPage        회원 추가 (ADMIN)
    AdminTierWeightsPage 티어 가중치 4x4 매트릭스 편집 (ADMIN)
  App.tsx        라우터 설정
```

## 인증

백엔드에 대한 JWT Bearer 인증입니다. `POST /api/auth/login`이 토큰을 반환하면 `localStorage`에
저장하고, 이후 모든 요청에 `src/api/client.ts`가 자동으로 `Authorization: Bearer <token>`을 붙입니다.
역할은 `ADMIN`과 `MEMBER` 두 가지뿐이며, 관리자 전용 UI는 `user.role === "ADMIN"` 조건으로
가려집니다.

## 배포 (Docker + nginx)

정적 빌드 결과물을 nginx로 서빙하는 컨테이너입니다. **`VITE_API_BASE_URL`은 빌드 시점에 JS
번들에 박히기 때문에, 백엔드 주소가 바뀌면 컨테이너를 재시작하는 게 아니라 이미지를 다시 빌드해야
합니다.**

1. 환경변수 템플릿 복사:
   ```
   cp .env.example .env
   ```
   `VITE_API_BASE_URL`을 백엔드가 실제로 배포된 주소로 설정하세요 (예:
   `https://api.kwtc.example`). 값이 없으면 빌드 자체가 실패합니다.
2. 빌드 후 실행:
   ```
   docker compose up -d --build
   ```
3. `http://<host>:${FRONTEND_PORT:-80}`에서 접근 가능합니다.

**백엔드 쪽에도 반드시 설정할 것**: 배포된 이 프런트엔드의 실제 주소를 백엔드의
`RANKING_ALLOWED_ORIGINS`(백엔드 저장소 `.env`)에 추가해야 합니다. 안 하면 브라우저가 모든
API 요청을 CORS로 막습니다.

**주소가 바뀌면**: `.env`의 `VITE_API_BASE_URL`을 수정하고
`docker compose up -d --build`로 다시 빌드·재생성하세요.

**리버스 프록시 뒤에 둘 때**: 이 컨테이너는 순수 HTTP로만 서빙합니다 (TLS 종료는 nginx/Caddy 등
앞단 프록시에서). React Router는 클라이언트 사이드 라우팅이라 `nginx.conf`에 `/matches/3` 같은
경로를 `index.html`로 폴백시키는 설정이 이미 들어있습니다 — 프록시를 추가로 두더라도 이 폴백
동작은 유지되어야 합니다.

## 진행 상황

백엔드가 제공하는 API 전체(인증/회원/경기/리더보드/관리자 기능)에 대응하는 화면이 갖춰져 있고,
실제 백엔드에 대해 엔드투엔드로 동작을 확인했습니다. 모바일 반응형 레이아웃도 적용돼 있습니다.
