"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [step, setStep] = useState(1); // 1:症状, 2:レベル, 3:確認
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [level, setLevel] = useState(null);
  const [memo, setMemo] = useState("");
  const [isSettingMode, setIsSettingMode] = useState(false);

  const symptomsList = ["生理痛", "PMS", "気持ちの浮き沈み", "頭痛", "腹痛", "熱がある", "体がだるい", "その他"];
  const colorTheme = {
    base: "#F2F0E9", // 優しいベージュ
    main: "#8A9A5B", // セージグリーン
    accent: "#B2AC88",
    doing: "#DDEEFF", // 青：自分がしてる
    request: "#FFE5E5", // 赤：してほしい
    ng: "#FFF2E0", // オレンジ：NG
    text: "#4A4A4A"
  };

  const [presets, setPresets] = useState({});

  useEffect(() => {
    const initialData = {};
    symptomsList.forEach(s => {
      initialData[s] = {
        levels: [0,1,2,3,4,5].map(() => ({ doing: [], request: [], ng: [] })),
        manual: "優しく見守ってね"
      };
    });
    const saved = localStorage.getItem("yorisoi_v5_presets");
    setPresets(saved ? JSON.parse(saved) : initialData);
  }, []);

  const saveToLocal = (newData) => {
    setPresets(newData);
    localStorage.setItem("yorisoi_v5_presets", JSON.stringify(newData));
  };

  const sendMessage = (type) => {
    let text = "";
    if (type === "status") {
      const current = presets[selectedSymptom].levels[level];
      const doing = current.doing.filter(t => t).map(t => `・${t}`).join("\n");
      const req = current.request.filter(t => t).map(t => `・${t}`).join("\n");
      const ng = current.ng.filter(t => t).map(t => `⚠️NG：${t}`).join("\n");
      text = `【Yorisoi🕊️】\n症状：${selectedSymptom} (Lv.${level})\n\n【やってること】\n${doing || "なし"}\n\n【おねがい】\n${req || "ゆっくりさせてね"}\n\n${ng}\n\nメモ：${memo}`;
    } else {
      text = "【Yorisoi🕊️】\n少し落ち着きました。サポートありがとう！✨";
    }
    window.open(`https://line.me/R/msg/text/?${encodeURIComponent(text)}`, "_blank");
  };

  // 共通のボタンパーツ
  const BigButton = ({ onClick, children, active, color }) => (
    <button onClick={onClick} style={{
      width: "100%", padding: "20px", marginBottom: "12px", borderRadius: "16px",
      border: active ? `3px solid ${colorTheme.main}` : "1px solid #DDD",
      background: active ? colorTheme.accent : "white",
      color: active ? "white" : colorTheme.text,
      fontSize: "18px", fontWeight: "bold", boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      transition: "0.2s"
    }}>{children}</button>
  );

  if (isSettingMode) return (
    /* 設定画面（略：前回のロジックを維持しつつ色をベージュ系に） */
    <div style={{ padding: 20, backgroundColor: colorTheme.base, minHeight: "100vh" }}>
      <button onClick={() => setIsSettingMode(false)} style={{ marginBottom: 20 }}>戻る</button>
      <h2 style={{ color: colorTheme.text }}>設定：元気な時に書いてね</h2>
      {/* ...ここに前回の設定UIをベージュ配色で配置... */}
      <p style={{ fontSize: "12px" }}>※症状ごとの詳細設定はここから</p>
      {symptomsList.map(s => (
        <button key={s} onClick={() => {setSelectedSymptom(s); /*設定詳細へ*/}} style={{ display: "block", margin: "10px 0" }}>{s}を編集</button>
      ))}
    </div>
  );

  return (
    <div style={{ padding: "24px", maxWidth: "450px", margin: "0 auto", backgroundColor: colorTheme.base, minHeight: "100vh", color: colorTheme.text, fontFamily: "'Hiragino Kaku Gothic ProN', sans-serif" }}>
      
      <header style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "28px", margin: 0 }}>Yorisoi 🕊️</h1>
        <p style={{ fontSize: "14px", opacity: 0.7 }}>あなたの「しんどい」を届けます</p>
      </header>

      {/* ステップ1：症状選択 */}
      {step === 1 && (
        <div className="fade-in">
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>今、どんな感じ？</h2>
          {symptomsList.map(s => (
            <BigButton key={s} onClick={() => { setSelectedSymptom(s); setStep(2); }}>{s}</BigButton>
          ))}
        </div>
      )}

      {/* ステップ2：レベル選択 */}
      {step === 2 && (
        <div className="fade-in">
          <h2 style={{ textAlign: "center", marginBottom: "10px" }}>しんどさはどれくらい？</h2>
          <p style={{ textAlign: "center", marginBottom: "30px", fontSize: "14px" }}>数字が大きいほどつらい状態です</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            {[0, 1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => { setLevel(n); setStep(3); }} style={{
                height: "80px", borderRadius: "16px", fontSize: "24px", fontWeight: "bold",
                border: "1px solid #DDD", background: "white", color: colorTheme.main
              }}>{n}</button>
            ))}
          </div>
          <button onClick={() => setStep(1)} style={{ width: "100%", marginTop: "30px", background: "none", border: "none", color: colorTheme.main }}>← 症状を選び直す</button>
        </div>
      )}

      {/* ステップ3：確認・送信 */}
      {step === 3 && (
        <div className="fade-in">
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>これで送るね</h2>
          
          <div style={{ background: "white", padding: "20px", borderRadius: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginBottom: "20px" }}>
            <div style={{ marginBottom: "15px", borderBottom: "1px solid #EEE", paddingBottom: "10px" }}>
              <strong>{selectedSymptom}</strong> / レベル <strong>{level}</strong>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <div style={{ fontSize: "12px", color: "#66A", marginBottom: "4px" }}>● やってること</div>
              {presets[selectedSymptom]?.levels[level].doing.map((t, i) => (
                <div key={i} style={{ background: colorTheme.doing, padding: "8px", borderRadius: "8px", fontSize: "14px", marginBottom: "4px" }}>{t}</div>
              ))}
            </div>

            <div style={{ marginBottom: "12px" }}>
              <div style={{ fontSize: "12px", color: "#A66", marginBottom: "4px" }}>● おねがい</div>
              {presets[selectedSymptom]?.levels[level].request.map((t, i) => (
                <div key={i} style={{ background: colorTheme.request, padding: "8px", borderRadius: "8px", fontSize: "14px", marginBottom: "4px" }}>{t}</div>
              ))}
            </div>

            {presets[selectedSymptom]?.levels[level].ng.length > 0 && (
              <div>
                <div style={{ fontSize: "12px", color: "#A63", marginBottom: "4px" }}>● NG（しないで）</div>
                {presets[selectedSymptom]?.levels[level].ng.map((t, i) => (
                  <div key={i} style={{ background: colorTheme.ng, padding: "8px", borderRadius: "8px", fontSize: "14px", marginBottom: "4px" }}>{t}</div>
                ))}
              </div>
            )}
          </div>

          <textarea placeholder="付け加えたいメッセージがあれば..." value={memo} onChange={(e) => setMemo(e.target.value)}
            style={{ width: "100%", padding: "15px", borderRadius: "12px", border: "1px solid #DDD", marginBottom: "20px", boxSizing: "border-box" }} />

          <button onClick={() => sendMessage("status")} style={{
            width: "100%", padding: "20px", background: colorTheme.main, color: "white",
            borderRadius: "40px", border: "none", fontSize: "18px", fontWeight: "bold",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)", marginBottom: "15px"
          }}>LINEでパートナーに送る</button>

          <button onClick={() => setStep(1)} style={{ width: "100%", background: "none", border: "none", color: colorTheme.text, opacity: 0.6 }}>やり直す</button>
        </div>
      )}

      {/* 回復ボタン（常に下部に置くか、ステップ3の下に） */}
      {step !== 1 && (
        <div style={{ marginTop: "40px", textAlign: "center" }}>
           <button onClick={() => setIsSettingMode(true)} style={{ color: colorTheme.main, background: "none", border: "none" }}>⚙️ 設定を変更する</button>
        </div>
      )}
    </div>
  );
}
