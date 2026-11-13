# Lotto Lab

매주 로또 6/45 100장을 구매해 1등까지 걸리는 시간을 실험하는 Next.js 웹사이트입니다.

## 실행

Node.js 22 LTS 권장 (Next.js 최소 요구 버전 20.9).

```bash
npm install
npm run dev
```

Chrome에서 http://localhost:3000 을 엽니다.

```bash
npm test
npm run typecheck
npm run build
npm start
```

## 기능

- 기본 0.1초마다 1주 추첨, 매주 독립적으로 생성하는 100장 전체 판정
- 1× / 10× / 100× 배속, 일시 정지, 이어서 실행, 초기화
- 1등 발생 주에 자동 정지 및 당첨 조합 표시
- 1~5등 누적 횟수, 누적 비용, 가정 당첨금 및 수익률
- 최근 전체 기록 / 당첨 기록 각각 최대 60개 유지
- 누적 당첨 확률과 평균 대기 기간, 모바일 반응형 UI

번호는 `Math.random()`으로 생성하며 실제 구매·추첨과 연결되지 않습니다. 각 장 내 번호는 중복되지 않지만 서로 다른 장의 조합은 중복될 수 있습니다. 1~3등의 당첨금은 각각 20억원, 5천만원, 150만원으로 가정하며, 모든 금액은 세전입니다. 새로고침 시 기록이 초기화됩니다. 비활성 탭은 브라우저에 의해 타이머가 느려질 수 있습니다. 폰트는 Google Fonts를 사용하고, 연결 불가 시 시스템 sans-serif로 표시됩니다.

## Vercel 배포

1. 이 프로젝트를 GitHub에 푸시하고 Vercel에서 저장소를 Import합니다.
2. Framework Preset을 **Next.js**로 설정합니다.
3. 저장소 루트가 이 폴더면 Root Directory는 기본값입니다. 상위 `LottoSimul`을 저장소로 사용하면 `LottoSimulation`을 지정하세요.
4. Deploy를 실행합니다. 환경 변수나 별도 데이터베이스는 필요하지 않습니다.

## 구조

- `src/app/page.tsx`: 대시보드 및 타이머 제어
- `src/app/globals.css`: 반응형 스타일
- `src/lib/lotto.ts`: 추첨, 등수 판정, 배속 처리, 확률 계산
- `tests/lotto.test.ts`: 등수, 추첨, 집계 및 자동 정지 검증
