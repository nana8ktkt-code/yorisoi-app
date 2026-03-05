"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [level, setLevel] = useState(0);
  const [isSettingMode, setIsSettingMode] = useState(false);
  const [editSymptom, setEditSymptom] = useState("");
  const [periodDates, setPeriodDates] = useState([]); 
  const [sharePeriodStatus, setSharePeriodStatus] = useState(false);

  const symptomsList = ["つわり", "生理痛", "PMS", "気持ちの浮き沈み", "頭痛", "喉が痛い", "腹痛", "熱がある", "体がだるい", "その他"];
  const colors = { bg: "#F9FDFF", main: "#8EC6E8", doing: "#EBF5FF", request: "#FFF0F0", ng: "#FFF5E6", text: "#4A4A4A", accent: "#FFB7B7" };

  // おすすめ選択肢（復活！）
  const suggestions = {
    doing: ["薬を飲んだ", "横になっている", "温めている", "水分を摂っている", "安静にしている"],
    request: ["洗い物をお願い", "コンビニでゼリー買ってきて", "静かにしてほしい", "腰をさすって", "部屋を暗くして"],
    ng: ["「大丈夫？」と何度も聞かないで", "アドバイスしないで", "大きな音を立てないで", "強い匂いのものを食べないで"]
  };

  const initialData = {};
  symptomsList.forEach(s => {
    initialData[s] = { levels: [0,1,2,3,4,5].map(() => ({ doing: [], request: [], ng: [] })), manual: "優しく見守ってね" };
  });

  const [presets, setPresets] = useState(initialData);

  useEffect(() => {
    const saved = localStorage.getItem("yorisoi_v11_presets");
    if (saved) setPresets(JSON.parse(saved));
    const savedDates = localStorage.getItem("yorisoi_period_dates");
    if (savedDates) setPeriodDates(JSON.parse(savedDates));
    const savedShare = localStorage.getItem("yorisoi_share_period");
    if (savedShare) setSharePeriodStatus(JSON.parse(savedShare));
  }, []);

  const saveToLocal = (newData) => {
    setPresets({ ...newData });
    localStorage.setItem("yorisoi_v11_presets", JSON.stringify(newData));
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

  const sendMessage = (type, subType = "") => {
    let text = "";
    if (type === "status") {
      let doingList = []; let reqList = []; let ngList = [];
      selectedSymptoms.forEach(s => {
        const current = presets[s].levels[level];
        doingList.push(...current.doing.filter(t => t));
        reqList.push(...current.request.filter(t => t));
        ngList.push(...current.ng.filter(t => t));
      });
      const todayStr = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;
      const periodAlert = (sharePeriodStatus && periodDates.includes(todayStr)) ? "【生理期間中です🩸】\n" : "";
      text = `${periodAlert}【Yorisoi🕊️現状報告】\n症状：${selectedSymptoms.join("、")}\nしんどさ：Lv.${level}\n\n【今やってること】\n${doingList.map(t => `・${t}`).join("\n") || "特になし"}\n\n【おねがい】\n${reqList.map(t => `・${t}`).join("\n") || "ゆっくりさせてね"}\n\n${ngList.length ? "⚠️NG：\n" + ngList.map(t => `・${t}`).join("\n") + "\n" : ""}`;
    } else if (type === "thanks") {
      text = `【Yorisoi🕊️】\n体調が少し落ち着きました！\n${subType || "サポートありがとう✨"}`;
    }
    window.open(`https://line.me/R/msg/text/?${encodeURIComponent(text)}`, "_blank");
  };

  const renderCalendar = () => {
    const now = new Date();
    const year = now.getFullYear(); const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    return (
      <div style={{ background: "white", padding: "15px", borderRadius: "16px", marginTop: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", textAlign: "center" }}>{year}年 {month + 1}月</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "5px", textAlign: "center", fontSize: "12px" }}>
          {["日", "月", "火", "水", "木", "金", "土"].map(d => <div key={d} style={{ color: "#AAA" }}>{d}</div>)}
          {days.map((d, i) => {
            const dateStr = `${year}-${month + 1}-${d}`;
            const isSelected = periodDates.includes(dateStr);
            return (
              <div key={i} onClick={() => d && (setPeriodDates(prev => {
                const newDates = prev.includes(dateStr) ? prev.filter(p => p !== dateStr) : [...prev, dateStr];
                localStorage.setItem("yorisoi_period_dates", JSON.stringify(newDates));
                return newDates;
              }))} style={{
                height: "35px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                borderRadius: "8px", background: isSelected ? colors.accent : "transparent", color: isSelected ? "white" : colors.text,
                border: d ? "1px solid #F0F0F0" : "none"
              }}>{d}</div>
            );
          })}
        </div>
      </div>
    );
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
          {editSymptom && [0,1,2,3,4,5].map(lvl => (
            <div key={lvl} style={{ border: "1px solid #EEE", padding: 15, marginBottom: 20, borderRadius: 12, background: "white" }}>
              <div style={{ fontWeight: "bold", color: colors.main, marginBottom: 10 }}>レベル {lvl}</div>
              {["doing", "request", "ng"].map(type => (
                <div key={type} style={{ marginTop: 15 }}>
                  <div style={{ fontSize: "12px", color: "#888", marginBottom: 5 }}>{type === "doing" ? "やってること" : type === "request" ? "おねがい" : "NG"}</div>
                  {presets[editSymptom].levels[lvl][type].map((item, idx) => (
                    <input key={idx} value={item} onChange={(e) => updateAction(editSymptom, lvl, type, idx, e.target.value)} style={{ width: "100%", marginBottom: 6, padding: 10, borderRadius: 6, border: "1px solid #EEE", boxSizing: "border-box", backgroundColor: type === "doing" ? colors.doing : type === "request" ? colors.request : colors.ng }} />
                  ))}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "5px" }}>
                    {suggestions[type].map(sug => <button key={sug} onClick={() => addAction(editSymptom, lvl, type, sug)} style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "20px", border: "1px solid #DDD", background: "#fdfdfd" }}>+ {sug}</button>)}
                    <button onClick={() => addAction(editSymptom, lvl, type)} style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "20px", background: colors.main, color: "white", border: "none" }}>＋ 自由入力</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div>
          <section style={{ marginBottom: 25 }}>
            <h3 style={{ fontSize: "16px", marginBottom: 12 }}>1. 今の症状</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {symptomsList.map(s => (
                <button key={s} onClick={() => setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(i => i !== s) : [...prev, s])} style={{ padding: "15px 10px", borderRadius: 12, border: "1px solid #DDD", background: selectedSymptoms.includes(s) ? colors.main : "white", color: selectedSymptoms.includes(s) ? "white" : colors.text, fontWeight: "bold", fontSize: "15px" }}>{s}</button>
              ))}
            </div>
          </section>

          {selectedSymptoms.length > 0 && (
            <section style={{ marginBottom: 25 }}>
              <h3 style={{ fontSize: "16px", marginBottom: 12 }}>2. しんどさ</h3>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 5 }}>
                {[0, 1, 2, 3, 4, 5].map(n => <button key={n} onClick={() => setLevel(n)} style={{ width: "15%", height: 50, borderRadius: 10, border: `2px solid ${colors.main}`, background: level === n ? colors.main : "white", color: level === n ? "white" : colors.main, fontWeight: "bold", fontSize: "18px" }}>{n}</button>)}
              </div>
              <button onClick={() => sendMessage("status")} style={{ width: "100%", padding: 18, background: colors.main, color: "white", borderRadius: 35, border: "none", fontSize: "18px", fontWeight: "bold", marginTop: 20 }}>LINEで伝える</button>
              <div style={{ marginTop: 10, display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {["家事助かった！", "ゼリーありがとう", "静かにしてくれて感謝"].map(t => (
                  <button key={t} onClick={() => sendMessage("thanks", t)} style={{ flex: 1, padding: "8px", fontSize: "12px", borderRadius: "20px", border: `1px solid ${colors.main}`, color: colors.main, background: "white" }}>{t}</button>
                ))}
              </div>
            </section>
          )}

          <div style={{ marginTop: 30, borderTop: "1px solid #EEE", paddingTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "16px", margin: 0 }}>📅 カレンダー</h3>
              <label style={{ fontSize: "11px", display: "flex", alignItems: "center" }}>
                <input type="checkbox" checked={sharePeriodStatus} onChange={() => setSharePeriodStatus(!sharePeriodStatus)} /> 生理中を共有
              </label>
            </div>
            {renderCalendar()}
          </div>
        </div>
      )}
    </div>
  );
}
