"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  FlaskConical,
  Info,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Ticket,
  Trophy,
  Wallet,
  Zap,
} from "lucide-react";
import {
  advanceSimulation,
  cumulativeProbability,
  EXPECTED_WEEKS,
  initialSimulation,
  PRIZES,
  TICKETS_PER_WEEK,
  WEEKLY_COST,
  type Simulation,
} from "@/lib/lotto";

const numberFormat = new Intl.NumberFormat("ko-KR");
const fmt = (number: number) => numberFormat.format(number);
function money(number: number) {
  if (number >= 100_000_000)
    return `${(number / 100_000_000).toLocaleString("ko-KR", { maximumFractionDigits: 2 })}억`;
  if (number >= 10_000)
    return `${(number / 10_000).toLocaleString("ko-KR", { maximumFractionDigits: 1 })}만`;
  return fmt(number);
}
function Ball({
  value,
  small = false,
  bonus = false,
  muted = false,
}: {
  value?: number;
  small?: boolean;
  bonus?: boolean;
  muted?: boolean;
}) {
  const color = value
    ? value <= 10
      ? "yellow"
      : value <= 20
        ? "blue"
        : value <= 30
          ? "red"
          : value <= 40
            ? "gray"
            : "green"
    : "empty";
  return (
    <span
      className={`ball ball-${color} ${small ? "ball-small" : ""} ${bonus ? "ball-bonus" : ""} ${muted ? "ball-muted" : ""}`}
    >
      {value ?? "–"}
    </span>
  );
}

export default function Home() {
  const [simulation, setSimulation] = useState<Simulation>(initialSimulation);
  const current = useRef(simulation);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [tab, setTab] = useState<"all" | "wins">("all");
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => {
      const next = advanceSimulation(current.current, speed);
      current.current = next;
      setSimulation(next);
      if (next.won) setRunning(false);
    }, 100);
    return () => window.clearInterval(interval);
  }, [running, speed]);

  function reset() {
    setRunning(false);
    const fresh = initialSimulation();
    current.current = fresh;
    setSimulation(fresh);
  }

  const { weeks, latest, counts, won } = simulation;
  const cost = weeks * WEEKLY_COST;
  const probability = cumulativeProbability(weeks) * 100;
  const history = tab === "all" ? simulation.history : simulation.wins;
  const totalWins = counts.slice(1).reduce((sum, value) => sum + value, 0);
  const chartX = Math.min(weeks / (EXPECTED_WEEKS * 3), 1) * 302 + 18;
  const chartY = 119 - probability * 0.95;

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <a href="#" className="brand" aria-label="Lotto Lab 홈">
            <span className="brand-mark">
              <i />
              <i />
              <i />
              <i />
            </span>
            Lotto<span className="brand-light">Lab</span>
            <span className="brand-period">.</span>
          </a>
          <nav aria-label="메인 메뉴">
            <a className="nav-active" href="#simulator">
              시뮬레이터
            </a>
            <a href="#how-it-works" onClick={() => setShowHelp(true)}>
              이용 가이드 <ArrowUpRight size={13} />
            </a>
          </nav>
          <span className="header-caption">
            <span className="green-dot" /> 작은 실험, 커다란 확률
          </span>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <FlaskConical size={14} /> THE LUCK EXPERIMENT{" "}
              <span>로또 6/45</span>
            </div>
            <h1>
              매주 100장, <span>1등까지 얼마나?</span>
            </h1>
            <p>
              막연한 행운을, 눈에 보이는 숫자로.
              <br className="mobile-break" /> 매주 로또 100장을 사는 또 다른
              나를 만나보세요.
            </p>
          </div>
          <div className="hero-note">
            <span className="note-spark">✳</span>
            <div>
              행운에도 시간이 필요하니까.<small>LET’S FIND YOUR LUCK.</small>
            </div>
          </div>
        </section>

        <section className="experiment-bar" aria-label="실험 조건">
          <div>
            <span className="condition-icon">
              <Ticket size={18} />
            </span>
            <span className="condition-label">매주 구매</span>
            <strong>
              100<span>장</span>
            </strong>
          </div>
          <span className="bar-divider" />
          <div>
            <span className="condition-icon">
              <Wallet size={18} />
            </span>
            <span className="condition-label">주간 투자</span>
            <strong>
              100,000<span>원</span>
            </strong>
          </div>
          <span className="bar-divider" />
          <div>
            <span className="condition-icon">
              <Clock3 size={18} />
            </span>
            <span className="condition-label">추첨 간격</span>
            <strong>
              0.1<span>초</span>
            </strong>
          </div>
          <span className="auto-stop">
            <Check size={14} /> 1등 당첨 시 자동 종료
          </span>
        </section>

        <div className="workspace" id="simulator">
          <div className="main-column">
            <section className={`panel draw-panel ${won ? "won-panel" : ""}`}>
              <div className="panel-heading">
                <h2>
                  <span
                    className={`status-dot ${running ? "is-running" : ""}`}
                  />
                  실시간 추첨
                </h2>
                <span className={`status-pill ${running ? "active" : ""}`}>
                  {won
                    ? "1등 당첨!"
                    : running
                      ? "시뮬레이션 진행 중"
                      : weeks
                        ? "잠시 쉬어가는 중"
                        : "시작할 준비 완료"}
                </span>
              </div>
              <div className="week-display">
                <span className="overline">YOUR JOURNEY TO THE JACKPOT</span>
                <div className="week-number">
                  {fmt(weeks)}
                  <span>주째</span>
                </div>
                <p>
                  {won
                    ? "드디어, 기다리던 행운이 찾아왔어요!"
                    : weeks
                      ? `현실에서는 약 ${fmt(Math.floor(weeks / 52))}년 ${weeks % 52}주의 시간이에요`
                      : "당신의 첫 번째 행운을 기다리고 있어요"}
                </p>
              </div>
              <div className="draw-numbers">
                <div className="draw-label">
                  {latest ? `${fmt(weeks)}주차 당첨 번호` : "이번 주 당첨 번호"}
                  <span>LOTTO 6/45</span>
                </div>
                <div className="balls">
                  {Array.from({ length: 6 }, (_, i) => (
                    <Ball key={i} value={latest?.numbers[i]} />
                  ))}
                  <span className="plus-sign">+</span>
                  <div className="bonus-wrap">
                    <Ball value={latest?.bonus} bonus />
                    <span>보너스</span>
                  </div>
                </div>
              </div>
              <div
                className={`week-result ${latest?.bestRank ? "has-win" : ""}`}
              >
                <Sparkles size={16} />
                <span>
                  {!latest ? (
                    "100장의 로또, 어떤 결과가 기다리고 있을까요?"
                  ) : latest.bestRank ? (
                    <>
                      이번 주 최고 <strong>{latest.bestRank}등 당첨!</strong>{" "}
                      <span className="result-extra">
                        총{" "}
                        {fmt(latest.counts.slice(1).reduce((a, b) => a + b, 0))}
                        장 당첨
                      </span>
                    </>
                  ) : (
                    "이번 주는 아쉽게도 낙첨. 다음 행운을 만나볼까요?"
                  )}
                </span>
                {latest && (
                  <span className="result-amount">
                    +{money(latest.prize)}원
                  </span>
                )}
              </div>
              {won && latest && (
                <div className="jackpot-message" role="status">
                  <Trophy size={26} />
                  <div>
                    <strong>{fmt(weeks)}주 만에 1등에 당첨됐어요!</strong>
                    <p>
                      총 {fmt(weeks * 100)}장 구매 · 구매 비용 {money(cost)}원
                    </p>
                    <div className="winning-ticket">
                      내 1등 번호{" "}
                      {latest.bestTicket.map((n) => (
                        <Ball key={n} value={n} small />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div className="controls">
                <button
                  className="start-button"
                  onClick={() => {
                    if (won) reset();
                    setRunning((value) => !value);
                  }}
                >
                  {running ? (
                    <Pause size={18} fill="currentColor" />
                  ) : (
                    <Play size={18} fill="currentColor" />
                  )}
                  {running
                    ? "잠시 멈추기"
                    : won
                      ? "다시 실험하기"
                      : weeks
                        ? "이어서 시뮬레이션"
                        : "시뮬레이션 시작"}
                  {!running && (
                    <ArrowRight size={18} className="button-arrow" />
                  )}
                </button>
                <button
                  className="reset-button"
                  onClick={reset}
                  aria-label="시뮬레이션 초기화"
                  title="초기화"
                >
                  <RotateCcw size={19} />
                </button>
              </div>
              <div className="speed-row">
                <span>
                  <Zap size={13} />
                  실험 속도
                </span>
                <div className="speed-options" aria-label="시뮬레이션 배속">
                  {[1, 10, 100].map((value) => (
                    <button
                      key={value}
                      aria-pressed={speed === value}
                      className={speed === value ? "selected" : ""}
                      onClick={() => setSpeed(value)}
                    >
                      {value}×
                    </button>
                  ))}
                </div>
                <span className="speed-description">
                  0.1초마다 {speed}주 진행
                </span>
              </div>
            </section>

            <section className="panel rankings-panel">
              <div className="panel-heading">
                <h2>작은 행운의 기록</h2>
                <span className="subtle-text">
                  총 <strong>{fmt(totalWins)}</strong>장 당첨
                </span>
              </div>
              <div className="rank-grid">
                {[1, 2, 3, 4, 5].map((rank) => (
                  <div className={`rank-item rank-${rank}`} key={rank}>
                    <span className="rank-label">
                      {rank === 1 && <Trophy size={13} />}
                      {rank}등
                    </span>
                    <strong>
                      {fmt(counts[rank])}
                      <small>회</small>
                    </strong>
                    <span className="rank-requirement">
                      {rank === 1
                        ? "6개 일치"
                        : rank === 2
                          ? "5개 + 보너스"
                          : `${8 - rank}개 일치`}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="side-column">
            <section className="panel summary-panel">
              <div className="panel-heading">
                <h2>지금까지의 실험</h2>
                <span className="mini-icon">
                  <ArrowUpRight size={17} />
                </span>
              </div>
              <div className="summary-main">
                <span>누적 구매 금액</span>
                <div>
                  {money(cost)}
                  <small>원</small>
                </div>
                <span className="purchase-count">
                  <Ticket size={13} />총 {fmt(weeks * TICKETS_PER_WEEK)}장 구매
                </span>
              </div>
              <div className="summary-details">
                <div>
                  <span>
                    예상 누적 당첨금{" "}
                    <span title="1~3등은 고정 가정 금액, 세전 기준입니다.">
                      <Info size={12} />
                    </span>
                  </span>
                  <strong className="purple-text">
                    {money(simulation.prize)}원
                  </strong>
                </div>
                <div>
                  <span>예상 수익률</span>
                  <strong
                    className={simulation.prize > cost ? "purple-text" : ""}
                  >
                    {cost
                      ? `${(((simulation.prize - cost) / cost) * 100).toFixed(1)}%`
                      : "—"}
                  </strong>
                </div>
              </div>
              <div className="summary-footnote">
                1~3등 당첨금은 가정값으로 계산해요.
              </div>
            </section>

            <section className="probability-panel">
              <div className="panel-heading">
                <h2>
                  <Sparkles size={16} />
                  확률의 시선
                </h2>
                <span title="매주 100장을 독립적으로 무작위 구매할 때의 기하분포 평균입니다.">
                  <CircleHelp size={16} />
                </span>
              </div>
              <p>
                매주 100장씩 구매한다면
                <br />
                1등까지 걸리는 평균 시간은
              </p>
              <div className="expected-number">
                {fmt(Math.round(EXPECTED_WEEKS))}
                <span>주</span>
              </div>
              <span className="expected-years">
                약 {fmt(Math.round(EXPECTED_WEEKS / 52))}년이라는 긴 여정
              </span>
              <div className="chart-wrap">
                <svg
                  viewBox="0 0 340 150"
                  role="img"
                  aria-label="구매 주차가 늘어날수록 높아지는 누적 1등 당첨 확률"
                >
                  <defs>
                    <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9475ec" stopOpacity=".22" />
                      <stop offset="100%" stopColor="#9475ec" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M18 119H320 M18 72H320 M18 24H320"
                    stroke="#e6dff6"
                    strokeDasharray="3 5"
                  />
                  <path
                    d={`M18 119 ${Array.from({ length: 61 }, (_, i) => `L${18 + (i / 60) * 302} ${119 - (1 - Math.exp(-i / 20)) * 95}`).join(" ")} L320 119Z`}
                    fill="url(#chart-fill)"
                  />
                  <path
                    d={`M18 119 ${Array.from({ length: 61 }, (_, i) => `L${18 + (i / 60) * 302} ${119 - (1 - Math.exp(-i / 20)) * 95}`).join(" ")}`}
                    fill="none"
                    stroke="#9676df"
                    strokeWidth="2.5"
                  />
                  <circle
                    cx={chartX}
                    cy={chartY}
                    r="5"
                    fill="#7550d9"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <text x="18" y="143">
                    0주
                  </text>
                  <text x="130" y="143">
                    누적 당첨 확률
                  </text>
                  <text x="280" y="143">
                    24만 주
                  </text>
                </svg>
              </div>
              <div className="probability-bottom">
                <span>현재까지 1등에 당첨될 확률</span>
                <strong>{probability.toFixed(2)}%</strong>
              </div>
              <p className="probability-note">
                이만큼 구매했을 때 한 번 이상 당첨될 확률이에요.
                <br />
                평균은 평균일 뿐, 다음 추첨의 확률은 늘 같아요.
              </p>
            </section>
          </aside>
        </div>

        <section className="panel history-panel">
          <div className="panel-heading">
            <div className="history-title">
              <h2>매주 쌓이는 이야기</h2>
              <span className={`live-label ${running ? "live-on" : ""}`}>
                <span />
                LIVE
              </span>
            </div>
            <span className="history-caption">
              최근 60개 기록 <ArrowDown size={12} />
            </span>
          </div>
          <div className="history-tabs">
            <button
              className={tab === "all" ? "active-tab" : ""}
              onClick={() => setTab("all")}
            >
              전체 기록 <span>{fmt(weeks)}</span>
            </button>
            <button
              className={tab === "wins" ? "active-tab" : ""}
              onClick={() => setTab("wins")}
            >
              당첨 기록
            </button>
            <span className="history-refresh">
              {speed === 1
                ? "0.1초마다 새로운 한 주"
                : `0.1초마다 ${speed}주씩 추첨 · 최근 기록 표시`}
            </span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>주차</th>
                  <th>
                    당첨 번호 <span>+ 보너스</span>
                  </th>
                  <th>최고 등수</th>
                  <th>당첨 장수</th>
                  <th>예상 당첨금</th>
                </tr>
              </thead>
              <tbody>
                {history.map((result) => (
                  <tr key={result.week}>
                    <td>
                      <strong>{fmt(result.week)}</strong>
                      <span className="subtle-text"> 주</span>
                      {result.week === weeks && (
                        <span className="new-tag">NEW</span>
                      )}
                    </td>
                    <td>
                      <div className="table-balls">
                        {result.numbers.map((n) => (
                          <Ball key={n} value={n} small />
                        ))}
                        <span className="table-plus">+</span>
                        <Ball value={result.bonus} small bonus />
                      </div>
                    </td>
                    <td>
                      <span
                        className={`rank-badge ${result.bestRank ? "rank-badge-win" : ""}`}
                      >
                        {result.bestRank ? `${result.bestRank}등 당첨` : "낙첨"}
                      </span>
                    </td>
                    <td>
                      {fmt(result.counts.slice(1).reduce((a, b) => a + b, 0))}
                      <span className="subtle-text">장</span>
                    </td>
                    <td className={result.prize ? "prize-cell" : "subtle-text"}>
                      {fmt(result.prize)}원
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {history.length === 0 && (
              <div className="empty-history">
                <span className="empty-icon">
                  <Ticket size={25} strokeWidth={1.4} />
                </span>
                <strong>
                  {weeks
                    ? "아직 당첨 기록이 없어요"
                    : "아직 펼쳐지지 않은 행운의 기록"}
                </strong>
                <p>
                  {weeks
                    ? "실험을 이어가며 첫 당첨을 기다려 보세요."
                    : "시뮬레이션을 시작하면 매주 추첨 결과가 이곳에 쌓여요."}
                </p>
              </div>
            )}
          </div>
          <div className="history-footer">
            <span className="green-dot" />
            모든 번호는 매주 새롭게, 무작위로 생성됩니다.
            <span>100장 × 무한한 가능성</span>
          </div>
        </section>

        <section className="guide" id="how-it-works">
          <button
            aria-expanded={showHelp}
            onClick={() => setShowHelp(!showHelp)}
          >
            <span>
              <Info size={16} />이 실험, 어떻게 작동하나요?
            </span>
            <ChevronDown size={17} className={showHelp ? "rotated" : ""} />
          </button>
          {showHelp && (
            <div className="guide-content">
              <div>
                <h3>실제 로또와 같은 추첨 방식</h3>
                <p>
                  1~45 중 서로 다른 번호 6개와 보너스 번호 1개를 추첨합니다.
                  매주 독립적인 자동 선택 100장(장당 1,000원)을 생성하고 전부
                  비교합니다. 장과 장 사이에는 같은 조합이 나올 수 있습니다.
                </p>
              </div>
              <div>
                <h3>행운은 예약할 수 없으니까</h3>
                <p>
                  한 장의 1등 확률은 1/8,145,060. 100장 구매 시 주당 1등 확률은
                  약 0.001228%입니다. 평균 대기 시간은 약 81,451주이며, 당첨을
                  보장하는 기간이 아닙니다. 1등이 나온 주에 자동으로 멈춥니다.
                </p>
              </div>
              <div>
                <h3>실험을 위한 당첨금 가정</h3>
                <p>
                  1등 {money(PRIZES[1])}원, 2등 {money(PRIZES[2])}원, 3등{" "}
                  {money(PRIZES[3])}원, 4등 5만원, 5등 5천원으로 세전
                  계산합니다. 실제 1~3등 당첨금은 회차마다 다릅니다. 배속은
                  동일한 추첨을 더 많이 실행하며, 탭이 비활성화되면 실행이
                  느려질 수 있습니다. 새로고침하면 기록이 초기화됩니다.
                </p>
              </div>
            </div>
          )}
        </section>

        <footer>
          <a className="footer-brand" href="#">
            Lotto Lab<span>.</span>
          </a>
          <p>행운을 기다리는 대신, 확률을 탐험해 보세요.</p>
          <span>
            MADE FOR CURIOSITY <span className="footer-spark">✳</span>
          </span>
        </footer>
      </main>
    </>
  );
}
