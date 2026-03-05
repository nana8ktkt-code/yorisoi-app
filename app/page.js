"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [level, setLevel] = useState(0);
  const [memo, setMemo] = useState("");
  const [isSettingMode, setIsSettingMode] = useState(false);
  const [editSymptom, setEditSymptom] = useState("");

  const symptomsList = ["つわり", "生理痛", "PMS", "気持ちの浮き沈み", "頭痛", "喉が痛い", "腹痛", "熱がある", "体がだるい", "その他"];

  // 初期の色設定（ブルー系）に戻しました
  const colors = {
    bg: "#F9FDFF",    
    main: "#8EC6E8",  
    doing: "#EBF5FF", 
    request: "#FFF0F0", 
    ng: "#FFF5E6",     
    text: "#4A4A4A"
  };

  // おすすめの選択肢リスト
  const suggestions = {
    doing: ["薬を飲んだ", "横になっている", "温めている", "水分を摂っている", "安静にしている"],
    request: ["洗い物をお願い", "コンビニでゼリー買ってきて", "静かにしてほしい", "腰をさすって", "部屋を暗くして"],
    ng: ["「大丈夫？」と何度も聞かないで", "アドバイスしないで", "大きな音を立てないで", "強い匂いのものを食べないで"]
  };

  const initialData = {};
  symptomsList.forEach(s => {
    initialData[s] = {
      levels: [0, 1, 2, 3, 4, 5].map(() => ({ doing: [], request: [], ng: [] })),
      manual: "優しく見守ってね"
    };
  });

  const [presets, setPresets] = useState(initialData);

  useEffect(() => {
    const saved = localStorage.getItem("yorisoi_v8_presets");
    if (saved) setPresets(JSON.parse(saved));
  }, []);

  const saveToLocal = (newData) => {
    setPresets({ ...newData });
    localStorage.setItem("yorisoi_v8_presets", JSON.stringify(newData));
  };

  const toggleSymptom = (s) => {
    if (selectedSymptoms.includes(s)) {
      setSelectedSymptoms(selectedSymptoms.filter(item => item !== s));
    } else {
      setSelectedSymptoms([...selectedSymptoms, s]);
    }
  };

  const addAction = (symptom, lvl, type, value = "") => {
    const newData = { ...presets };
    newData[symptom].levels[lvl][type].push(value);
    saveToLocal(newData);
  };

  const updateAction = (symptom, lvl, type, index, value) => {
    const newData = { ...presets };
    newData[symptom].levels[lvl][type][index] = value;
    saveToLocal(newData);
  };

  const sendMessage = (type) => {
    let text = "";
    if (type === "status") {
      let doingList = []; let reqList = []; let ngList = []; let manuals = [];
      selectedSymptoms.forEach(s => {
        const current = presets[s].levels[level];
        doingList.push(...current.doing.filter(t => t));
        reqList.push(...current.request.filter(t => t));
        ngList.push(...current.ng.filter(t => t));
        manuals.push(`${s}: ${presets[s].manual}`);
      });
      text = `【Yorisoi🕊️現状報告】\n症状：${selectedSymptoms.join("、")}\nしんどさ：Lv.${level}\n\n【今やってること】\n${doingList.map(t => `・${t}`).join("\n") || "特になし"}\n\n【おねがい】\n${reqList.map(t => `・${t}`).join("\n") || "ゆっくりさせてね"}\n\n${ngList.length ? "⚠️NG：\n" + ngList.map(t => `・${t}`).join("\n") + "\n" : ""}\n【アドバイス】\n${manuals.join("\n")}\n\nメモ：${memo}`;
    } else {
      text = `【Yorisoi🕊️】\n体調が少し落ち着きました！\nサポートありがとう✨`;
    }
    window.open(`https://line.me/R/msg/text/?${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div style={{ padding: 20, maxWidth: 450, margin: "0 auto", backgroundColor: colors.bg, minHeight: "100vh", fontFamily: "sans-serif", color: colors.text }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: "24px", margin: 0, color: colors.main }}>Yorisoi 🕊️</h1>
        <button onClick={() => setIsSettingMode(!isSettingMode)} style={{ background: "white", border: `1px solid ${colors.main}`, borderRadius: 12, padding: "6px 12px", color: colors.main, fontWeight: "bold" }}>
          {isSettingMode ? "完了" : "設定⚙️"}
        </button>
      </header>

      {isSettingMode ? (
        <div>
          <select value={editSymptom} onChange={(e) => setEditSymptom(e.target.value)} style={{ width: "100%", padding: 12, marginBottom: 20, borderRadius: 8, border: `1px solid ${colors.main}` }}>
            <option value="">設定する症状を選択</option>
            {symptomsList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {editSymptom && (
            <div>
              {[0, 1, 2, 3, 4, 5].map(lvl => (
                <div key={lvl} style={{ border: "1px solid #EEE", padding: 15, marginBottom: 20, borderRadius: 12, background: "white" }}>
                  <div style={{ fontWeight: "bold", color: colors.main, marginBottom: 10 }}>レベル {lvl}</div>
                  {["doing", "request", "ng"].map(type => (
                    <div key={type} style={{ marginTop: 15 }}>
                      <div style={{ fontSize: "12px", color: "#888", marginBottom: 5 }}>{type === "doing" ? "やってること(青)" : type === "request" ? "おねがい(赤)" : "NG(黄)"}</div>
                      {presets[editSymptom].levels[lvl][type].map((item, idx) => (
                        <input key={idx} value={item} onChange={(e) => updateAction(editSymptom, lvl, type, idx, e.target.value)} 
                        style={{ width: "100%", marginBottom: 6, padding: 10, borderRadius: 6, border: "1px solid #EEE", boxSizing: "border-box", backgroundColor: type === "doing" ? colors.doing : type === "request" ? colors.request : colors.ng }} />
                      ))}
                      {/* おすすめ選択肢チップス */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "5px" }}>
                        {suggestions[type].map(sug => (
                          <button key={sug} onClick={() => addAction(editSymptom, lvl, type, sug)} style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "20px", border: "1px solid #DDD", background: "#fdfdfd" }}>+ {sug}</button>
                        ))}
                        <button onClick={() => addAction(editSymptom, lvl, type)} style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "20px", background: colors.main, color: "white", border: "none" }}>＋ 自由入力</button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <section style={{ marginBottom: 25 }}>
            <h3 style={{ fontSize: "16px", marginBottom: 12 }}>1. 今の症状（複数選択可）</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {symptomsList.map(s => (
                <button key={s} onClick={() => toggleSymptom(s)} style={{ 
                  padding: "15px 10px", borderRadius: 12, border: "1px solid #DDD", 
                  background: selectedSymptoms.includes(s) ? colors.main : "white", 
                  color: selectedSymptoms.includes(s) ? "white" : colors.text,
                  fontWeight: "bold", fontSize: "15px"
                }}>{s}</button>
              ))}
            </div>
          </section>

          {selectedSymptoms.length > 0 && (
            <>
              <section style={{ marginBottom: 25 }}>
                <h3 style={{ fontSize: "16px", marginBottom: 12 }}>2. しんどさレベル</h3>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 5 }}>
                  {[0, 1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setLevel(n)} style={{ 
                      width: "15%", height: 50, borderRadius: 10, border: `2px solid ${colors.main}`, 
                      background: level === n ? colors.main : "white", 
                      color: level === n ? "white" : colors.main, fontWeight: "bold" 
                    }}>{n}</button>
                  ))}
                </div>
              </section>

              <button onClick={() => sendMessage("status")} style={{ width: "100%", padding: 18, background: colors.main, color: "white", borderRadius: 35, border: "none", fontSize: "18px", fontWeight: "bold", marginBottom: 12, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>LINEで伝える</button>
              <button onClick={() => sendMessage("thanks")} style={{ width: "100%", padding: 12, background: "white", color: colors.main, borderRadius: 35, border: `2px solid ${colors.main}`, fontSize: "15px", fontWeight: "bold" }}>ありがとうを送信</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
