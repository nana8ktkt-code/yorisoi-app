"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [level, setLevel] = useState(0);
  const [memo, setMemo] = useState("");
  const [isSettingMode, setIsSettingMode] = useState(false);

  // 症状リスト
  const symptomsList = ["生理痛", "PMS", "気持ちの浮き沈み", "頭痛", "腹痛", "熱がある", "体がだるい", "その他"];
  
  // 初期設定データ（レベル別の対処法）
  const initialData = {};
  symptomsList.forEach(s => {
    initialData[s] = {
      levels: [0, 1, 2, 3, 4, 5].map(() => ({
        doing: [], // 自分がしていること
        request: [] // してほしいこと
      }))
    };
  });

  const [presets, setPresets] = useState(initialData);

  useEffect(() => {
    const saved = localStorage.getItem("yorisoi_v3_presets");
    if (saved) setPresets(JSON.parse(saved));
  }, []);

  const saveToLocal = (newData) => {
    setPresets(newData);
    localStorage.setItem("yorisoi_v3_presets", JSON.stringify(newData));
  };

  const addAction = (symptom, lvl, type) => {
    const newData = { ...presets };
    newData[symptom].levels[lvl][type].push("");
    saveToLocal(newData);
  };

  const updateAction = (symptom, lvl, type, index, value) => {
    const newData = { ...presets };
    newData[symptom].levels[lvl][type][index] = value;
    saveToLocal(newData);
  };

  const sendToPartner = () => {
    const current = presets[selectedSymptom].levels[level];
    const doingText = current.doing.filter(t => t).map(t => `・${t}`).join("\n");
    const reqText = current.request.filter(t => t).map(t => `・${t}`).join("\n");
    
    const text = `【Yorisoi🕊️】\n症状：${selectedSymptom}\nしんどさ：レベル${level}\n\n【今やってること】\n${doingText || "特になし"}\n\n【してほしいこと】\n${reqText || "ゆっくりさせてね"}\n\n【メモ】\n${memo}`;
    window.open(`https://line.me/R/msg/text/?${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div style={{ padding: 20, maxWidth: 450, margin: "0 auto", backgroundColor: "#F9FDFF", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ color: "#4A4A4A", fontSize: "22px" }}>Yorisoi 🕊️</h1>
        <button onClick={() => setIsSettingMode(!isSettingMode)} style={{ background: "none", border: "1px solid #8EC6E8", borderRadius: 12, padding: "5px 10px", color: "#8EC6E8" }}>
          {isSettingMode ? "完了" : "設定⚙️"}
        </button>
      </header>

      {isSettingMode ? (
        /* 設定モード */
        <div>
          <h3 style={{ fontSize: "16px", color: "#555" }}>レベル別対処法の登録</h3>
          <select onChange={(e) => setSelectedSymptom(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 15 }}>
            <option value="">症状を選んで設定</option>
            {symptomsList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {selectedSymptom && (
            <div>
              {[0, 1, 2, 3, 4, 5].map(lvl => (
                <div key={lvl} style={{ border: "1px solid #EEE", padding: 10, marginBottom: 10, borderRadius: 8, background: "white" }}>
                  <div style={{ fontWeight: "bold", marginBottom: 5 }}>レベル {lvl}</div>
                  
                  <div style={{ color: "#66A", fontSize: "12px" }}>自分がしていること（背景：薄青）</div>
                  {presets[selectedSymptom].levels[lvl].doing.map((item, idx) => (
                    <input key={idx} value={item} onChange={(e) => updateAction(selectedSymptom, lvl, "doing", idx, e.target.value)} style={{ width: "100%", marginBottom: 5, padding: 5, backgroundColor: "#EBF5FF", border: "1px solid #BCD" }} />
                  ))}
                  <button onClick={() => addAction(selectedSymptom, lvl, "doing")} style={{ fontSize: "12px", marginBottom: 10 }}>＋追加</button>

                  <div style={{ color: "#A66", fontSize: "12px" }}>してほしいこと（背景：薄赤）</div>
                  {presets[selectedSymptom].levels[lvl].request.map((item, idx) => (
                    <input key={idx} value={item} onChange={(e) => updateAction(selectedSymptom, lvl, "request", idx, e.target.value)} style={{ width: "100%", marginBottom: 5, padding: 5, backgroundColor: "#FFF0F0", border: "1px solid #DCB" }} />
                  ))}
                  <button onClick={() => addAction(selectedSymptom, lvl, "request")} style={{ fontSize: "12px" }}>＋追加</button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* メインモード */
        <div>
          <section style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: "15px", color: "#666" }}>1. 症状は？</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {symptomsList.map(s => (
                <button key={s} onClick={() => setSelectedSymptom(s)} style={{ padding: 10, borderRadius: 8, border: "1px solid #DDD", background: selectedSymptom === s ? "#8EC6E8" : "white", color: selectedSymptom === s ? "white" : "#333" }}>{s}</button>
              ))}
            </div>
          </section>

          {selectedSymptom && (
            <>
              <section style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: "15px", color: "#666" }}>2. しんどさレベルは？</h3>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  {[0, 1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setLevel(n)} style={{ width: 45, height: 45, borderRadius: "50%", border: "2px solid #8EC6E8", background: level === n ? "#8EC6E8" : "white", color: level === n ? "white" : "#8EC6E8", fontWeight: "bold" }}>{n}</button>
                  ))}
                </div>
              </section>

              <section style={{ marginBottom: 20, padding: 15, background: "white", borderRadius: 10, border: "1px solid #E0E0E0" }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#444" }}>今のプラン</h4>
                {presets[selectedSymptom].levels[level].doing.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: "11px", color: "#66A" }}>実行中</div>
                    {presets[selectedSymptom].levels[level].doing.map((t, i) => t && <div key={i} style={{ background: "#EBF5FF", padding: "4px 8px", borderRadius: 4, margin: "2px 0", fontSize: "13px" }}>{t}</div>)}
                  </div>
                )}
                {presets[selectedSymptom].levels[level].request.length > 0 && (
                  <div>
                    <div style={{ fontSize: "11px", color: "#A66" }}>おねがい</div>
                    {presets[selectedSymptom].levels[level].request.map((t, i) => t && <div key={i} style={{ background: "#FFF0F0", padding: "4px 8px", borderRadius: 4, margin: "2px 0", fontSize: "13px" }}>{t}</div>)}
                  </div>
                )}
              </section>

              <textarea placeholder="自由記述・メモ..." value={memo} onChange={(e) => setMemo(e.target.value)} style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #DDD", minHeight: 60, marginBottom: 20, boxSizing: "border-box" }} />

              <button onClick={sendToPartner} style={{ width: "100%", padding: 16, background: "#8EC6E8", color: "white", borderRadius: 30, border: "none", fontSize: "16px", fontWeight: "bold", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                LINEで今の状態を伝える
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
