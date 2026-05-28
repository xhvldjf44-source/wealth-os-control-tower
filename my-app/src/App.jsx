import "./App.css";

function App() {
  return (<div className="app">

    ```
    <aside className="sidebar">
      <h1>👑 AI 부의 연구소</h1>

      <ul>
        <li>📊 관제탑</li>
        <li>💎 보석주 탐색</li>
        <li>🐋 고래 추적</li>
        <li>📑 DART 분석</li>
        <li>🧠 AI 산업지도</li>
        <li>📚 나의 공부방</li>
        <li>📝 투자일지</li>
      </ul>
    </aside>

    <main className="main">

      <section className="hero">
        <h2>국내 최고 AI 투자 관제센터</h2>

        <p>
          시장의 공포와 탐욕을 읽고,
          진짜 보석주를 발굴하는 미래형 투자 시스템
        </p>

        <input
          type="text"
          placeholder="종목명을 입력하세요 (예: 삼성전자)"
        />

        <button>AI 분석 시작</button>
      </section>

      <section className="cards">

        <div className="card">
          <h3>🐋 고래 추적</h3>
          <p>기관 +85억 순매수</p>
          <p>외국인 +120억 유입</p>
          <p>거래량 3.8배 증가</p>
        </div>

        <div className="card">
          <h3>📑 DART 실체 분석</h3>
          <p>실적 성장 확인</p>
          <p>부채 안정</p>
          <p>현금흐름 양호</p>
        </div>

        <div className="card">
          <h3>🔥 유튜브 심리</h3>
          <p>시장 관심도 급증</p>
          <p>과열 위험 낮음</p>
          <p>초기 보석 가능성</p>
        </div>

      </section>

      <section className="study">

        <h2>📚 나의 공부방</h2>

        <div className="study-box">
          <h3>오늘의 깨달음</h3>

          <p>
            공포 속에서 기관이 매집할 때,
            미래의 큰 기회가 숨어있다.
          </p>
        </div>

        <div className="study-box">
          <h3>오늘 읽을 경제 키워드</h3>

          <ul>
            <li>AI 데이터센터</li>
            <li>HBM 반도체</li>
            <li>원전 / SMR</li>
            <li>전력 인프라</li>
          </ul>
        </div>

      </section>

    </main>
  </div>
  );
}

export default App;
