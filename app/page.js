"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [level, setLevel] = useState(0);
  const [memo, setMemo] = useState("");
  const [isSettingMode, setIsSettingMode] = useState(false);

  const symptomsList = ["生理痛", "PMS", "気持ちの浮き沈み", "頭痛", "腹痛", "熱がある", "体がだるい", "その他"];
  
  const initialData = {};
  symptomsList.forEach(s => {
    initialData[s] = {
      levels: [0, 1, 2, 3, 4, 5].map(() => ({
        doing: [], // 自分がしてる
        request: [], // してほしい
        ng: [] // やめてほしい(NG)
      })),
      manual: "優しく見守ってね" // 相手用マニュアル
    };
  });

  const [presets, setPresets] = useState(initialData);

  useEffect(() => {
    const saved = localStorage.getItem("yorisoi_v4_presets");
    if (saved) setPresets(JSON.parse(saved));
  }, []);

  const saveToLocal = (newData) => {
    setPresets(newData);
    localStorage.setItem("yorisoi_v4_presets", JSON.stringify(newData));
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

  // メッセージ送信機能
  const sendMessage = (type) => {
    let text = "";
    if (type === "status") {
      const current = presets[selectedSymptom].levels[level];
      const doing = current.doing.filter(t => t).map(t => `・${t}`).join("\n");
      const req = current.request.filter(t => t).map(t => `・${t}`).join("\n");
      const ng = current.ng.filter(t => t).map(t => `⚠️NG：${t}`).join("\n");
      
      text = `【Yorisoi🕊️現状報告】\n症状：${selectedSymptom}\nしんどさ：Lv.${level}\n\n【今やってること】\n${doing || "特になし"}\n\n【おねがい】\n${req || "ゆっくりさせてね"}\n\n${ng ? ng + "\n" : ""}\n【アドバイス】\n${presets[selectedSymptom].manual}\n\nメモ：${memo}`;
    } else {
      text = `【Yorisoi🕊️】\n体調が少し落ち着きました！\nさっきはサポートありがとう。助かったよ✨`;
    }
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
        <div>
          <h3 style={{ fontSize: "16px", color: "#555" }}>設定モード</h3>
          <select onChange={(e) => setSelectedSymptom(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 15 }}>
            <option value="">症状を選んで設定</option>
            {symptomsList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {selectedSymptom && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: "14px", fontWeight: "bold" }}>💡 相手への基本マニュアル</label>
                <textarea value={presets[selectedSymptom].manual} onChange={(e) => {
                  const newData = {...presets};
                  newData[selectedSymptom].manual = e.target.value;
                  saveToLocal(newData);
                }} style={{ width: "100%", padding: 8, marginTop: 5, borderRadius: 5, border: "1px solid #DDD" }} />
              </div>

              {[0, 1, 2, 3, 4, 5].map(lvl => (
                <div key={lvl} style={{ border: "1px solid #EEE", padding: 10, marginBottom: 15, borderRadius: 8, background: "white" }}>
                  <div style={{ fontWeight: "bold", color: "#8EC6E8" }}>レベル {lvl}</div>
                  
                  {["doing", "request", "ng"].map(type => (
                    <div key={type} style={{ marginTop: 10 }}>
                      <div style={{ fontSize: "11px", color: "#888" }}>{type === "doing" ? "自分がしてる" : type === "request" ? "してほしい" : "NG（やめて）"}</div>
                      {presets[selectedSymptom].levels[lvl][type].map((item, idx) => (
                        <input key={idx} value={item} onChange={(e) => updateAction(selectedSymptom, lvl, type, idx, e.target.value)} 
                        style={{ width: "100%", marginBottom: 4, padding: 6, borderRadius: 4, border: "1px solid #EEE", backgroundColor: type === "doing" ? "#EBF5FF" : type === "request" ? "#FFF0F0" : "#FFF5E6" }} />
                      ))}
                      <button onClick={() => addAction(selectedSymptom, lvl, type)} style={{ fontSize: "10px", padding: "2px 8px" }}>＋</button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <section style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: "15px", color: "#666" }}>1. 今の症状</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {symptomsList.map(s => (
                <button key={s} onClick={() => setSelectedSymptom(s)} style={{ padding: 10, borderRadius: 8, border: "1px solid #DDD", background: selectedSymptom === s ? "#8EC6E8" : "white", color: selectedSymptom === s ? "white" : "#333" }}>{s}</button>
              ))}
            </div>
          </section>

          {selectedSymptom && (
            <>
              <section style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: "15px", color: "#666" }}>2. しんどさレベル</h3>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  {[0, 1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setLevel(n)} style={{ width: 45, height: 45, borderRadius: "50%", border: "2px solid #8EC6E8", background: level === n ? "#8EC6E8" : "white", color: level === n ? "white" : "#8EC6E8", fontWeight: "bold" }}>{n}</button>
                  ))}
                </div>
              </section>

              <section style={{ marginBottom: 20, padding: 15, background: "white", borderRadius: 10, border: "1px solid #E0E0E0" }}>
                <div style={{ fontSize: "14px", fontWeight: "bold", color: "#444", marginBottom: 10 }}>✨ あなたの専用プラン</div>
                {/* プレビュー表示 */}
                {presets[selectedSymptom].levels[level].request.map((t, i) => t && <div key={i} style={{ background: "#FFF0F0", padding: "6px", borderRadius: 4, marginBottom: 4, fontSize: "13px" }}>🎁 {t}</div>)}
                {presets[selectedSymptom].levels[level].ng.map((t, i) => t && <div key={i} style={{ background: "#FFF5E6", padding: "6px", borderRadius: 4, marginBottom: 4, fontSize: "13px" }}>⚠️ {t}</div>)}
              </section>

              <button onClick={() => sendMessage("status")} style={{ width: "100%", padding: 16, background: "#8EC6E8", color: "white", borderRadius: 30, border: "none", fontSize: "16px", fontWeight: "bold", marginBottom: 10 }}>LINEで伝える</button>
              <button onClick={() => sendMessage("thanks")} style={{ width: "100%", padding: 12, background: "white", color: "#8EC6E8", borderRadius: 30, border: "2px solid #8EC6E8", fontSize: "14px", fontWeight: "bold" }}>回復！ありがとうを送る</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
