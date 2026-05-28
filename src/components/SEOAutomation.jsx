import { useState } from "react";

export default function SEOAutomation() {

    // 키워드 선택값
    const [category, setCategory] = useState("");

    // 지역 선택값
    const [region, setRegion] = useState("광주");

    // 생성 결과
    const [result, setResult] = useState("");

    // 키워드 데이터
    const categories = [
        "생일 꽃다발",
        "결혼기념일 꽃",
        "회갑 꽃바구니",
        "개업 화환",
        "축하 화환",
    ];

    // SEO 생성 함수
    function generateSEO() {

        if (!category) {
            alert("키워드를 선택해주세요.");
            return;
        }

        // 네이버 SEO 제목
        const title =
            `${region} ${category} 추천 | Garden Studio 프리미엄 감성 꽃집`;

        // 네이버 SEO 태그
        const tags =
            `#${region}꽃집 #${region}${category.replaceAll(" ", "")} #프리미엄꽃집 #감성꽃집 #꽃배달 #개업화환 #결혼기념일꽃 #회갑꽃바구니`;

        // 감성 본문
        const content =
            `${region}에서 특별한 ${category}을 찾고 계신가요?

Garden Studio는 단순히 꽃을 판매하는 것이 아니라,
고객님의 감정을 디자인합니다.

고급 플라워 디자인과 감성 스타일링으로
생일, 결혼기념일, 회갑, 개업식 같은
소중한 순간을 더욱 특별하게 만들어드립니다.

특히 Garden Studio만의 프리미엄 감성 디자인은
일반적인 저가형 꽃이나 화환과는 완전히 다른 분위기를 제공합니다.

✔ 프리미엄 감성 플라워 디자인
✔ 고급 포장 스타일링
✔ 기념일 맞춤 제작
✔ 개업/축하 화환 전문
✔ 광주/나주 지역 배송 가능

지금 Garden Studio AI 상담 시스템으로
고객 상황에 맞는 꽃 추천을 받아보세요.
`;

        // 최종 결과 저장
        setResult(`
[SEO 제목]
${title}

[추천 태그]
${tags}

[네이버 블로그용 본문]
${content}
`);
    }

    // 복사 기능
    async function copyResult() {

        if (!result) {
            alert("먼저 SEO 문구를 생성해주세요.");
            return;
        }

        try {
            await navigator.clipboard.writeText(result);

            alert("SEO 문구가 복사되었습니다.");
        } catch (error) {
            alert("복사 실패");
        }
    }

    return (

        <section style={styles.wrap}>

            <div style={styles.card}>

                <p style={styles.badge}>
                    NAVER SEO AUTOMATION
                </p>

                <h2 style={styles.title}>
                    AI 네이버 SEO 자동화 직원
                </h2>

                <p style={styles.desc}>
                    광고비 없이 네이버 검색 유입을 늘리기 위한
                    감성 SEO 문구와 키워드를 자동 생성합니다.
                </p>

                {/* 지역 선택 */}
                <div style={styles.group}>

                    <h3 style={styles.groupTitle}>
                        지역 선택
                    </h3>

                    <div style={styles.buttonGrid}>

                        {["광주", "나주"].map((item) => (

                            <button
                                key={item}
                                type="button"
                                onClick={() => setRegion(item)}
                                style={{
                                    ...styles.button,
                                    ...(region === item
                                        ? styles.activeButton
                                        : {}),
                                }}
                            >
                                {item}
                            </button>

                        ))}

                    </div>

                </div>

                {/* 키워드 선택 */}
                <div style={styles.group}>

                    <h3 style={styles.groupTitle}>
                        SEO 키워드 선택
                    </h3>

                    <div style={styles.buttonGrid}>

                        {categories.map((item) => (

                            <button
                                key={item}
                                type="button"
                                onClick={() => setCategory(item)}
                                style={{
                                    ...styles.button,
                                    ...(category === item
                                        ? styles.activeButton
                                        : {}),
                                }}
                            >
                                {item}
                            </button>

                        ))}

                    </div>

                </div>

                {/* 생성 버튼 */}
                <button
                    onClick={generateSEO}
                    style={styles.generateButton}
                >
                    AI SEO 문구 생성하기
                </button>

                {/* 결과 */}
                {result && (

                    <div style={styles.resultBox}>

                        <h3 style={styles.resultTitle}>
                            생성 완료
                        </h3>

                        <pre style={styles.resultText}>
                            {result}
                        </pre>

                        <button
                            onClick={copyResult}
                            style={styles.copyButton}
                        >
                            원클릭 복사하기
                        </button>

                    </div>

                )}

            </div>

        </section>

    );
}

const styles = {

    wrap: {
        width: "100%",
        padding: "36px 16px",
        background:
            "linear-gradient(135deg, #fffaf3, #fff1ec)",
    },

    card: {
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "32px",
        borderRadius: "32px",
        background: "rgba(255,255,255,0.96)",
        border: "1px solid rgba(201,140,118,0.35)",
        boxShadow: "0 24px 60px rgba(166,93,75,0.16)",
    },

    badge: {
        display: "inline-block",
        padding: "8px 14px",
        borderRadius: "999px",
        background: "#fff0e8",
        color: "#b76e79",
        fontSize: "14px",
        fontWeight: "900",
    },

    title: {
        marginTop: "18px",
        fontSize: "38px",
        color: "#2f201b",
    },

    desc: {
        marginTop: "12px",
        fontSize: "18px",
        lineHeight: "1.8",
        color: "#6d5550",
    },

    group: {
        marginTop: "30px",
    },

    groupTitle: {
        marginBottom: "14px",
        fontSize: "22px",
        color: "#5a382f",
    },

    buttonGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "12px",
    },

    button: {
        padding: "18px 14px",
        borderRadius: "20px",
        border: "1px solid #e8cfc7",
        background: "#fff",
        color: "#4a312a",
        fontSize: "17px",
        fontWeight: "900",
        cursor: "pointer",
    },

    activeButton: {
        background:
            "linear-gradient(135deg, #ffb7a8, #f7d36a)",
        color: "#2d1b15",
        border: "1px solid #d99a77",
    },

    generateButton: {
        width: "100%",
        marginTop: "30px",
        padding: "20px",
        borderRadius: "20px",
        border: "none",
        background:
            "linear-gradient(135deg, #ffb7a8, #f7d36a)",
        color: "#2d1b15",
        fontSize: "20px",
        fontWeight: "900",
        cursor: "pointer",
    },

    resultBox: {
        marginTop: "34px",
        padding: "28px",
        borderRadius: "28px",
        background:
            "linear-gradient(135deg, #fff8f4, #ffe8e1)",
        border: "1px solid #ebc0b0",
    },

    resultTitle: {
        fontSize: "28px",
        color: "#b76e79",
    },

    resultText: {
        marginTop: "18px",
        whiteSpace: "pre-wrap",
        fontSize: "16px",
        lineHeight: "1.9",
        color: "#6d5550",
        fontFamily: "inherit",
    },

    copyButton: {
        width: "100%",
        marginTop: "24px",
        padding: "18px",
        borderRadius: "18px",
        border: "none",
        background: "#FEE500",
        color: "#111",
        fontSize: "18px",
        fontWeight: "900",
        cursor: "pointer",
    },

};