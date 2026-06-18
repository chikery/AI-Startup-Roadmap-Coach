import Link from "next/link";

const bricolageFont = "var(--font-bricolage), 'Bricolage Grotesque', sans-serif";

export default function Home() {
  return (
    <div style={{ fontFamily: "'Pretendard', sans-serif", color: "#1F2436", background: "#F5F6F8", overflowX: "hidden" }}>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(14px)", background: "rgba(245,246,248,0.82)", borderBottom: "1px solid rgba(47,62,114,0.07)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ width: 32, height: 32, borderRadius: 9, background: "#5A5BD6", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 21V11M12 11C12 7 9 4 4 4C4 9 8 11 12 11ZM12 11C12 6.5 15 3 21 3.5C20.5 9 16 11 12 11Z" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <span style={{ fontFamily: bricolageFont, fontWeight: 700, fontSize: 20, letterSpacing: "-0.01em" }}>Stepup</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 36, fontSize: 15, fontWeight: 500, color: "#2C3550", whiteSpace: "nowrap" }}>
            <a href="#how" style={{ color: "inherit", textDecoration: "none" }}>작동 방식</a>
            <a href="#match" style={{ color: "inherit", textDecoration: "none" }}>지원사업 매칭</a>
            <a href="#preview" style={{ color: "inherit", textDecoration: "none" }}>작성 화면</a>
            <Link href="/dashboard" style={{ background: "#1F2436", color: "#F5F6F8", padding: "11px 20px", borderRadius: 100, fontWeight: 600, textDecoration: "none", fontSize: 15 }}>무료로 시작하기</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -140, right: -60, width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, #C7C8FA, transparent 70%)", filter: "blur(12px)", opacity: 0.75, animation: "floaty 9s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: -180, left: -80, width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle at 50% 50%, #DDE2F7, transparent 70%)", filter: "blur(16px)", opacity: 0.55, animation: "floaty2 11s ease-in-out infinite" }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.02fr", gap: 48, alignItems: "center", padding: "72px 40px 88px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: bricolageFont, fontSize: 13.5, fontWeight: 600, letterSpacing: "0.06em", color: "#5A5BD6", background: "#ECECFB", padding: "8px 15px", borderRadius: 100 }}>IDEA → PLAN → FUND</div>
            <h1 style={{ fontSize: 62, lineHeight: 1.05, fontWeight: 800, letterSpacing: "-0.035em", margin: "24px 0 0", fontFamily: bricolageFont }}>아이디어를<br /><span style={{ color: "#5A5BD6" }}>사업으로</span> 키우는<br />가장 빠른 길.</h1>
            <p style={{ fontSize: 19, lineHeight: 1.6, color: "#4A5568", maxWidth: 520, margin: "28px 0 0" }}>창업 아이디어만 있다면 충분해요. AI 코치가 <b style={{ color: "#1F2436" }}>7단계로 사업계획서</b>를 완성하고, 지금 신청 가능한 <b style={{ color: "#1F2436" }}>정부지원사업</b>까지 매칭해 드립니다.</p>
            <div style={{ display: "flex", alignItems: "center", gap: 13, marginTop: 36 }}>
              <Link href="/dashboard" style={{ background: "#5A5BD6", color: "#fff", padding: "17px 30px", borderRadius: 100, fontSize: 17, fontWeight: 600, boxShadow: "0 14px 30px -10px rgba(90,91,214,0.6)", textDecoration: "none" }}>무료로 시작하기 →</Link>
              <a href="#preview" style={{ padding: "17px 28px", borderRadius: 100, fontSize: 17, fontWeight: 600, border: "1.5px solid #D5D9E2", color: "#2C3550", textDecoration: "none" }}>데모 둘러보기</a>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 40, fontSize: 14, color: "#6B7280" }}>
              <span style={{ display: "inline-flex" }}>
                {(["#5A5BD6","#8E8FF2","#DC4444"] as string[]).map((c,i) => <span key={i} style={{ width: 26, height: 26, borderRadius: "50%", background: c, border: "2px solid #F5F6F8", display: "inline-block", marginLeft: i > 0 ? -8 : 0 }} />)}
              </span>
              문체부 · 중기부 · 예술경영지원센터 공고 <b style={{ color: "#2C3550" }}>실시간 반영</b>
            </div>
          </div>
          {/* Mockup */}
          <div style={{ position: "relative" }}>
            <div style={{ background: "#fff", borderRadius: 18, boxShadow: "0 36px 70px -26px rgba(47,62,114,0.42)", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 16px", background: "#F1F1F6", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                {(["#E5675B","#F4BE4F","#61C554"] as string[]).map((c,i) => <span key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />)}
                <span style={{ flex: 1, textAlign: "center", fontSize: 12, color: "#8B92A0" }}>app.stepup.kr / write</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "168px 1fr" }}>
                <div style={{ background: "#2F3E72", padding: "18px 13px", color: "#C2CAE2" }}>
                  <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em", color: "#7E86A8", marginBottom: 12 }}>ROADMAP</div>
                  {([
                    { n: "✓", label: "문제 발견", active: false, done: true },
                    { n: "✓", label: "시장·고객 리서치", active: false, done: true },
                    { n: "3", label: "솔루션 & MVP", active: true, done: false },
                    { n: "4", label: "비즈니스 모델", active: false, done: false },
                    { n: "5", label: "실행 로드맵", active: false, done: false },
                    { n: "6", label: "재무 계획", active: false, done: false },
                    { n: "7", label: "피치덱 완성", active: false, done: false },
                  ] as Array<{n:string;label:string;active:boolean;done:boolean}>).map((s) => (
                    <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 8px", borderRadius: 8, marginBottom: 3, background: s.active ? "rgba(142,143,242,0.14)" : "transparent" }}>
                      <span style={{ width: 19, height: 19, borderRadius: "50%", background: s.done ? "rgba(142,143,242,0.28)" : s.active ? "#8E8FF2" : "rgba(255,255,255,0.1)", color: s.done ? "#C2CAE2" : s.active ? "#2F3E72" : "#6E7699", fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: bricolageFont }}>{s.n}</span>
                      <span style={{ fontSize: 12, color: s.done ? "#9AA3C0" : s.active ? "#EAEDF6" : "#6E7699", fontWeight: s.active ? 700 : 400, whiteSpace: "nowrap" }}>{s.label}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "22px 22px 24px", position: "relative", minHeight: 380 }}>
                  <div style={{ fontSize: 12, color: "#5A5BD6", fontWeight: 700, letterSpacing: "0.04em" }}>STEP 3 · 솔루션 &amp; MVP 설계</div>
                  <div style={{ fontSize: 18, fontWeight: 700, margin: "6px 0 14px", color: "#1F2436", letterSpacing: "-0.01em" }}>핵심 솔루션을 한 문장으로 정의해 볼까요?</div>
                  <div style={{ background: "#F4F5FA", border: "1px solid #E6E9F0", borderRadius: 12, padding: "14px 15px", fontSize: 13.5, lineHeight: 1.7, color: "#3C4660" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "#5A5BD6", background: "#ECECFB", padding: "4px 9px", borderRadius: 100, marginBottom: 9 }}>✦ AI 초안</span><br />
                    지역 예술가의 작품을 <b>구독형 큐레이션</b>으로 매달 엄선해 배송하고, 구매 전 실물을 집에서 체험하게 하여 <b>온라인 구매 거부감</b>이라는 문제를 해소합니다.
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "#fff", background: "#5A5BD6", padding: "9px 15px", borderRadius: 9 }}>이대로 저장</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "#2C3550", border: "1px solid #D5D9E2", padding: "9px 15px", borderRadius: 9 }}>↻ 다시 생성</span>
                  </div>
                  <div style={{ position: "absolute", right: 18, bottom: 18, width: 232, background: "#fff", border: "1px solid #E6E9F0", borderRadius: 13, boxShadow: "0 18px 34px -14px rgba(47,62,114,0.32)", padding: "14px 15px", animation: "floaty 7s ease-in-out infinite" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: "#6B7280", letterSpacing: "0.04em" }}>🎯 추천 지원사업</span>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: "#5A5BD6", background: "#ECECFB", padding: "3px 8px", borderRadius: 100 }}>매칭 94%</span>
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1F2436", lineHeight: 1.35 }}>예비창업패키지 2026</div>
                    <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 3 }}>중소벤처기업부 · 최대 1억원</div>
                    <div style={{ fontSize: 11, color: "#DC4444", fontWeight: 700, marginTop: 8 }}>D-12 · 마감 임박</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST MARQUEE */}
      <section style={{ borderTop: "1px solid rgba(47,62,114,0.07)", borderBottom: "1px solid rgba(47,62,114,0.07)", background: "#FBFBFE", overflow: "hidden", padding: "22px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px", display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#8B92A0", whiteSpace: "nowrap", flexShrink: 0 }}>실시간 반영 공고 기관</span>
          <div style={{ flex: 1, overflow: "hidden", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)", maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)" }}>
            <div style={{ display: "flex", gap: 44, width: "max-content", animation: "marquee 26s linear infinite", fontFamily: bricolageFont, fontSize: 17, fontWeight: 600, color: "#AEB6C2" }}>
              {(["중소벤처기업부","문화체육관광부","예술경영지원센터","창업진흥원","중소기업진흥공단","한국콘텐츠진흥원","K-Startup","중소벤처기업부","문화체육관광부","예술경영지원센터","창업진흥원","중소기업진흥공단","한국콘텐츠진흥원","K-Startup"] as string[]).map((o,i) => <span key={i}>{o}</span>)}
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "104px 40px 60px" }}>
        <div style={{ fontFamily: bricolageFont, fontSize: 14, fontWeight: 600, letterSpacing: "0.06em", color: "#DC4444" }}>THE PROBLEM</div>
        <h2 style={{ fontSize: 44, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-0.03em", margin: "14px 0 0", maxWidth: 720, fontFamily: bricolageFont }}>좋은 아이디어는 있는데,<br />사업계획서 앞에서 멈춰 있나요?</h2>
        <p style={{ fontSize: 18, lineHeight: 1.6, color: "#5A6273", margin: "18px 0 0", maxWidth: 600 }}>예비 창업자 대부분이 같은 벽에 부딪혀요. Stepup은 이 네 가지를 정확히 풀어줍니다.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginTop: 48 }}>
          {([
            { emoji: "🧭", title: "어디서부터 써야 할지 막막함", desc: "빈 문서 앞의 막막함. AI가 첫 질문부터 단계로 끌어줍니다." },
            { emoji: "📑", title: "낯선 양식과 어려운 용어", desc: "TAM·BM·피치덱… 용어를 몰라도 채워지는 검증된 프레임." },
            { emoji: "🔍", title: "흩어진 지원사업 공고", desc: "기관마다 흩어진 공고. 내 아이템에 맞는 것만 골라 드려요." },
            { emoji: "💬", title: "피드백 줄 사람이 없음", desc: "혼자 쓰면 비는 논리. 단계마다 AI가 약점을 짚어줍니다." },
          ] as Array<{emoji:string;title:string;desc:string}>).map((c) => (
            <div key={c.title} style={{ background: "#fff", border: "1px solid rgba(47,62,114,0.07)", borderRadius: 18, padding: "26px 22px" }}>
              <div style={{ fontSize: 26 }}>{c.emoji}</div>
              <div style={{ fontSize: 17, fontWeight: 700, margin: "14px 0 8px" }}>{c.title}</div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "#6B7280", margin: 0 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ background: "#2F3E72", color: "#EAEDF6", padding: "104px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 30, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: bricolageFont, fontSize: 14, fontWeight: 600, letterSpacing: "0.06em", color: "#8E8FF2" }}>HOW IT WORKS</div>
              <h2 style={{ fontSize: 44, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-0.03em", margin: "14px 0 0", fontFamily: bricolageFont }}>7단계만 따라오면,<br />사업계획서가 완성됩니다.</h2>
            </div>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: "#AEB6CC", maxWidth: 360, margin: 0 }}>각 단계에서 AI가 질문하고 초안을 씁니다. 단계를 마칠 때마다 그 내용에 맞는 지원사업이 자동으로 매칭돼요.</p>
          </div>
          <div style={{ marginTop: 64, display: "flex", flexDirection: "column" }}>
            {([
              { n: 1, title: "문제 발견", sub: "Problem", desc: "해결할 문제와 진짜 고객이 누구인지 명확히 합니다.", grant: "+ 예비창업패키지", isFirst: true, isLast: false },
              { n: 2, title: "시장·고객 리서치", sub: "Research", desc: "시장 규모(TAM·SAM·SOM)와 경쟁사를 데이터 기반으로 정리합니다.", grant: "+ 청년창업사관학교", isFirst: false, isLast: false },
              { n: 3, title: "솔루션 & MVP 설계", sub: "Solution", desc: "핵심 가치 제안과 최소 기능 제품(MVP)을 정의합니다.", grant: "+ 초기창업패키지", isFirst: false, isLast: false },
              { n: 4, title: "비즈니스 모델", sub: "Business Model", desc: "수익 구조와 가격 전략, 비용 구조를 설계합니다.", grant: "+ 콘텐츠 스타트업 육성", isFirst: false, isLast: false },
              { n: 5, title: "실행 로드맵", sub: "Execution", desc: "마일스톤과 팀 구성, 일정 계획을 세웁니다.", grant: "+ 창업도약패키지", isFirst: false, isLast: false },
              { n: 6, title: "재무 계획", sub: "Financials", desc: "추정 매출과 자금 소요·조달 계획을 작성합니다.", grant: "+ 예술인 창업지원", isFirst: false, isLast: false },
              { n: 7, title: "피치덱 완성", sub: "Pitch Deck", desc: "앞선 6단계가 자동으로 통합된 발표자료가 완성됩니다.", grant: "최종 산출물", isFirst: false, isLast: true },
            ] as Array<{n:number;title:string;sub:string;desc:string;grant:string;isFirst:boolean;isLast:boolean}>).map((s) => (
              <div key={s.n} style={{ display: "grid", gridTemplateColumns: "64px 1fr", gap: 24 }}>
                <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ width: 52, height: 52, borderRadius: "50%", background: s.isFirst ? "#8E8FF2" : s.isLast ? "#DC4444" : "rgba(142,143,242,0.16)", color: s.isFirst ? "#2F3E72" : s.isLast ? "#fff" : "#8E8FF2", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: bricolageFont, fontWeight: 700, fontSize: 20, position: "relative", zIndex: 2, border: (!s.isFirst && !s.isLast) ? "1px solid rgba(142,143,242,0.3)" : "none" }}>{s.n}</span>
                  {!s.isLast && <span style={{ position: "absolute", left: 31, top: 26, bottom: -26, width: 2, background: s.isFirst ? "linear-gradient(#8E8FF2, rgba(255,255,255,0.14))" : "rgba(255,255,255,0.14)", zIndex: 0 }} />}
                </div>
                <div style={{ paddingBottom: s.isLast ? 0 : 28, display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0, whiteSpace: "nowrap" }}>{s.title}</h3>
                      <span style={{ fontFamily: bricolageFont, fontSize: 13, color: "#7E86A8" }}>{s.sub}</span>
                    </div>
                    <p style={{ fontSize: 15, lineHeight: 1.6, color: "#AEB6CC", margin: "8px 0 0", maxWidth: 560 }}>{s.desc}</p>
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: s.isLast ? 700 : 600, color: s.isLast ? "#fff" : "#8E8FF2", background: s.isLast ? "#DC4444" : "transparent", border: s.isLast ? "none" : "1px solid rgba(142,143,242,0.35)", padding: "7px 13px", borderRadius: 100, whiteSpace: "nowrap" }}>{s.grant}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MATCHING */}
      <section id="match" style={{ maxWidth: 1200, margin: "0 auto", padding: "104px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "0.92fr 1.08fr", gap: 56, alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: bricolageFont, fontSize: 14, fontWeight: 600, letterSpacing: "0.06em", color: "#DC4444" }}>SMART MATCHING</div>
            <h2 style={{ fontSize: 44, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-0.03em", margin: "14px 0 0", fontFamily: bricolageFont }}>계획서를 쓰는 동안,<br />지원금이 찾아옵니다.</h2>
            <p style={{ fontSize: 18, lineHeight: 1.65, color: "#5A6273", margin: "20px 0 0" }}>아이템 분야·창업 단계·지역을 입력하면 RAG 엔진이 수백 개 공고를 분석해 <b style={{ color: "#1F2436" }}>적합도 순으로</b> 추천해요.</p>
            <div style={{ display: "flex", gap: 40, marginTop: 36 }}>
              {([{ n: "340+", label: "실시간 추적 공고" }, { n: "7개", label: "연동 정부·기관" }, { n: "94%", label: "상위 추천 적합도" }] as Array<{n:string;label:string}>).map((s) => (
                <div key={s.label}>
                  <div style={{ fontFamily: bricolageFont, fontSize: 38, fontWeight: 800, color: "#5A5BD6", lineHeight: 1 }}>{s.n}</div>
                  <div style={{ fontSize: 13.5, color: "#6B7280", marginTop: 6 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {([
              { pct: "94%", name: "예비창업패키지 2026", org: "중소벤처기업부 · 최대 1억원 · 일반형", d: "D-12", urgent: true },
              { pct: "88%", name: "초기창업패키지", org: "창업진흥원 · 최대 1억원 · 3년 이내", d: "D-30", urgent: false },
              { pct: "81%", name: "예술인 창업 지원사업", org: "예술경영지원센터 · 최대 3천만원", d: "D-45", urgent: false },
            ] as Array<{pct:string;name:string;org:string;d:string;urgent:boolean}>).map((g) => (
              <div key={g.name} style={{ background: "#fff", border: "1px solid rgba(47,62,114,0.08)", borderRadius: 16, padding: "20px 22px", display: "flex", alignItems: "center", gap: 18, boxShadow: "0 18px 36px -28px rgba(47,62,114,0.4)" }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: "#ECECFB", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: bricolageFont, fontWeight: 800, color: "#5A5BD6", fontSize: 17, flexShrink: 0 }}>{g.pct}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16.5, fontWeight: 700 }}>{g.name}</div>
                  <div style={{ fontSize: 13, color: "#6B7280", marginTop: 3 }}>{g.org}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: g.urgent ? "#DC4444" : "#5A5BD6" }}>{g.d}</div>
                  <div style={{ fontSize: 11.5, color: "#9198A6", marginTop: 2, whiteSpace: "nowrap" }}>{g.urgent ? "마감 임박" : "접수 중"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT PREVIEW */}
      <section id="preview" style={{ background: "#FBFBFE", borderTop: "1px solid rgba(47,62,114,0.07)", padding: "104px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px", textAlign: "center" }}>
          <div style={{ fontFamily: bricolageFont, fontSize: 14, fontWeight: 600, letterSpacing: "0.06em", color: "#5A5BD6" }}>THE PRODUCT</div>
          <h2 style={{ fontSize: 44, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-0.03em", margin: "14px 0 0", fontFamily: bricolageFont }}>AI와 대화하듯, 한 단계씩.</h2>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: "#5A6273", margin: "16px auto 0", maxWidth: 560 }}>질문에 답하면 AI가 초안을 쓰고, 당신은 다듬기만 하면 됩니다.</p>
        </div>
        <div style={{ maxWidth: 1080, margin: "52px auto 0", padding: "0 40px" }}>
          <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 40px 80px -30px rgba(47,62,114,0.4)", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 18px", background: "#F1F1F6", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
              {(["#E5675B","#F4BE4F","#61C554"] as string[]).map((c,i) => <span key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />)}
              <span style={{ flex: 1, textAlign: "center", fontSize: 12.5, color: "#8B92A0" }}>app.stepup.kr / write</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "210px 1fr 250px", minHeight: 440 }}>
              <div style={{ background: "#2F3E72", padding: "22px 16px", color: "#C2CAE2" }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "#7E86A8", marginBottom: 14 }}>로드맵 진행률 · 43%</div>
                <div style={{ height: 5, background: "rgba(255,255,255,0.12)", borderRadius: 100, overflow: "hidden", marginBottom: 18 }}><div style={{ width: "43%", height: "100%", background: "#8E8FF2", borderRadius: 100 }} /></div>
                {([
                  { n: "✓", label: "문제 발견", done: true, active: false },
                  { n: "✓", label: "시장·고객 리서치", done: true, active: false },
                  { n: "3", label: "솔루션 & MVP", active: true, done: false },
                  { n: "4", label: "비즈니스 모델", done: false, active: false },
                  { n: "5", label: "실행 로드맵", done: false, active: false },
                  { n: "6", label: "재무 계획", done: false, active: false },
                  { n: "7", label: "피치덱 완성", done: false, active: false },
                ] as Array<{n:string;label:string;done:boolean;active:boolean}>).map((s) => (
                  <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 9, marginBottom: 3, background: s.active ? "rgba(142,143,242,0.14)" : "transparent" }}>
                    <span style={{ width: 21, height: 21, borderRadius: "50%", background: s.done ? "rgba(142,143,242,0.28)" : s.active ? "#8E8FF2" : "rgba(255,255,255,0.1)", color: s.done ? "#C2CAE2" : s.active ? "#2F3E72" : "#6E7699", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: bricolageFont }}>{s.n}</span>
                    <span style={{ fontSize: 13, color: s.done ? "#9AA3C0" : s.active ? "#EAEDF6" : "#6E7699", fontWeight: s.active ? 700 : 400 }}>{s.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: "26px 28px", display: "flex", flexDirection: "column", gap: 14, textAlign: "left" }}>
                <div style={{ alignSelf: "flex-start", maxWidth: "88%" }}>
                  <div style={{ fontSize: 11, color: "#8B92A0", marginBottom: 5, fontWeight: 600 }}>Stepup AI</div>
                  <div style={{ background: "#F4F5FA", border: "1px solid #E6E9F0", borderRadius: "4px 14px 14px 14px", padding: "13px 16px", fontSize: 14, lineHeight: 1.6, color: "#2C3550" }}>STEP 2에서 정리한 시장 분석을 봤어요. 이제 <b>핵심 솔루션</b>을 한 문장으로 정의해 볼까요?</div>
                </div>
                <div style={{ alignSelf: "flex-end", maxWidth: "88%" }}>
                  <div style={{ background: "#5A5BD6", color: "#fff", borderRadius: "14px 4px 14px 14px", padding: "13px 16px", fontSize: 14, lineHeight: 1.6 }}>동네 예술가 작품을 월 구독으로 집에서 체험하고 마음에 들면 구매하는 서비스요.</div>
                </div>
                <div style={{ alignSelf: "flex-start", maxWidth: "92%" }}>
                  <div style={{ fontSize: 11, color: "#8B92A0", marginBottom: 5, fontWeight: 600 }}>Stepup AI · ✦ 초안 생성</div>
                  <div style={{ background: "#F4F5FA", border: "1px solid #E6E9F0", borderRadius: "4px 14px 14px 14px", padding: "14px 16px", fontSize: 14, lineHeight: 1.7, color: "#2C3550" }}>
                    좋아요. 사업계획서 문장으로 다듬으면:<br /><br />&ldquo;지역 예술가의 작품을 <b>구독형 큐레이션</b>으로 매달 집에서 체험하고, 마음에 들면 구매하는 서비스로 <b>온라인 미술품 구매의 거부감</b>을 해소합니다.&rdquo;
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "#fff", background: "#5A5BD6", padding: "9px 15px", borderRadius: 9 }}>저장하고 다음 단계 →</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "#2C3550", border: "1px solid #D5D9E2", padding: "9px 15px", borderRadius: 9 }}>수정 요청</span>
                  </div>
                </div>
              </div>
              <div style={{ background: "#FBFBFE", borderLeft: "1px solid rgba(47,62,114,0.07)", padding: "22px 18px", textAlign: "left" }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#6B7280", letterSpacing: "0.04em", marginBottom: 14 }}>🎯 이 단계 추천 지원사업</div>
                {([
                  { pct: "매칭 94%", name: "예비창업패키지 2026", org: "중기부 · 최대 1억원", d: "D-12", urgent: true },
                  { pct: "매칭 81%", name: "예술인 창업 지원사업", org: "예술경영지원센터 · 3천만원", d: "D-45", urgent: false },
                ] as Array<{pct:string;name:string;org:string;d:string;urgent:boolean}>).map((g) => (
                  <div key={g.name} style={{ background: "#fff", border: "1px solid #E6E9F0", borderRadius: 12, padding: "13px 14px", marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: "#5A5BD6", background: "#ECECFB", padding: "3px 8px", borderRadius: 100 }}>{g.pct}</span>
                      <span style={{ fontSize: 10.5, color: g.urgent ? "#DC4444" : "#5A5BD6", fontWeight: 700 }}>{g.d}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1F2436" }}>{g.name}</div>
                    <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 3 }}>{g.org}</div>
                  </div>
                ))}
                <div style={{ fontSize: 12, color: "#8B92A0", textAlign: "center", marginTop: 12 }}>계획서가 채워질수록<br />추천이 정교해져요</div>
              </div>
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <Link href="/dashboard" style={{ display: "inline-block", background: "#5A5BD6", color: "#fff", padding: "17px 34px", borderRadius: 100, fontSize: 17, fontWeight: 600, boxShadow: "0 14px 30px -10px rgba(90,91,214,0.55)", textDecoration: "none" }}>직접 작성해 보기 →</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" style={{ maxWidth: 1200, margin: "0 auto", padding: "104px 40px" }}>
        <div style={{ background: "#2F3E72", borderRadius: 28, padding: "72px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -100, right: "10%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(142,143,242,0.22), transparent 70%)", filter: "blur(8px)" }} />
          <div style={{ position: "relative", zIndex: 2 }}>
            <h2 style={{ fontSize: 46, lineHeight: 1.12, fontWeight: 800, letterSpacing: "-0.03em", color: "#EAEDF6", margin: 0, fontFamily: bricolageFont }}>오늘 아이디어를 적으면,<br />이번 주에 지원사업에 신청할 수 있어요.</h2>
            <p style={{ fontSize: 18, color: "#AEB6CC", margin: "22px 0 0" }}>가입 후 7단계 전부 무료. 카드 등록 없이 바로 시작하세요.</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 13, marginTop: 38 }}>
              <Link href="/dashboard" style={{ background: "#8E8FF2", color: "#2F3E72", padding: "18px 34px", borderRadius: 100, fontSize: 17, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>무료로 시작하기 →</Link>
              <a href="#how" style={{ padding: "18px 30px", borderRadius: 100, fontSize: 17, fontWeight: 600, border: "1.5px solid rgba(255,255,255,0.25)", color: "#EAEDF6", textDecoration: "none", whiteSpace: "nowrap" }}>작동 방식 보기</a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(47,62,114,0.08)", padding: "48px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: "#5A5BD6", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 21V11M12 11C12 7 9 4 4 4C4 9 8 11 12 11ZM12 11C12 6.5 15 3 21 3.5C20.5 9 16 11 12 11Z" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <span style={{ fontFamily: bricolageFont, fontWeight: 700, fontSize: 17 }}>Stepup</span>
            <span style={{ fontSize: 13, color: "#9198A6", marginLeft: 8 }}>아이디어에서 사업계획서까지, AI 창업 로드맵 코치</span>
          </div>
          <div style={{ fontSize: 13, color: "#9198A6" }}>© 2026 Stepup. All rights reserved.</div>
        </div>
      </footer>

    </div>
  );
}
