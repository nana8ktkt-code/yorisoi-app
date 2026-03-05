"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [level, setLevel] = useState(0);
  const [isSettingMode, setIsSettingMode] = useState(false);
  const [editSymptom, setEditSymptom] = useState("");
  const [periodDates, setPeriodDates] = useState([]); 
  const [sharePeriodStatus, setSharePeriodStatus] = useState(false); // 生理中であることを共有するか

  const symptomsList = ["つわり", "生理痛", "PMS", "気持ちの浮き沈み", "頭痛", "喉が痛い", "腹痛", "熱がある", "体がだるい", "その他"];

  const colors = {
    bg: "#F9FDFF", main: "#8EC6E8", doing: "#EBF5FF", request: "#FFF0F0", ng: "#FFF5E6", text: "#4A4A4A", accent: "#FFB7B7"
  };

  const initialData = {};
  symptomsList.forEach(s => {
    initialData[s] = { levels: [0, 1, 2, 3, 4, 5].map(() => ({ doing: [], request: [], ng: [] })), manual: "優しく見守ってね" };
  });

  const [presets, setPresets] = useState(initialData);

  useEffect(() => {
    const saved = localStorage.getItem("yorisoi_v10_presets");
    if (saved) setPresets(JSON.parse(saved));
    const savedDates = localStorage.getItem("yorisoi_period_dates");
    if (savedDates) setPeriodDates(JSON.parse(savedDates));
    const savedShare = localStorage.getItem("yorisoi_share_period");
    if (savedShare) setSharePeriodStatus(JSON.parse(savedShare));
  }, []);

  const saveToLocal = (newData) => {
    setPresets({ ...newData });
    localStorage.setItem("yorisoi_v10_presets", JSON.stringify(newData));
  };

  const togglePeriodDate = (dateStr) => {
    let newDates = [...periodDates];
    if (newDates.includes(dateStr)) {
      newDates = newDates.filter(d => d !== dateStr);
    } else {
      newDates.push(dateStr);
    }
    setPeriodDates(newDates);
    localStorage.setItem("yorisoi_period_dates", JSON.stringify(newDates));
  };

  const handleShareToggle = () => {
    const newVal = !sharePeriodStatus;
    setSharePeriodStatus(newVal);
    localStorage.setItem("yorisoi_share_period", JSON.stringify(newVal));
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

      // 今日が生理日かどうか判定
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
      const isPeriodToday = periodDates.includes(todayStr);

      // 共有設定がONかつ今日が生理日なら、メッセージに付け加える
      const periodAlert = (sharePeriodStatus && isPeriodToday) ? "【生理期間中です🩸】\n" : "";

      text = `${periodAlert}【Yorisoi🕊️現状報告】\n症状：${selectedSymptoms.join("、")}\nしんどさ：Lv.${level}\n\n【やってること】\n${doingList.map(t => `・${t}`).join("\n") || "特になし"}\n\n【おねがい】\n${reqList.map(t => `・${t}`).join("\n") || "ゆっくりさせてね"}\n\n${ngList.length ? "⚠️NG：\n" + ngList.map(t => `・${t}`).join("\n") + "\n" : ""}\n【アドバイス】\n${manuals.join("\n")}`;
    } else {
      text = `【Yorisoi🕊️】\n体調が少し落ち着きました！サポートありがとう✨`;
    }
    window.open(`https://line.me/R/msg/text/?${encodeURIComponent(text)}`, "_blank");
  };

  const renderCalendar = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
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
              <div key={i} onClick={() => d && togglePeriodDate(dateStr)} style={{
                height: "35px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                borderRadius: "8px", background: isSelected ? colors.accent : "transparent", color: isSelected ? "white" : colors.text,
                border: d ? "1px solid #F0F0F0" : "none"
              }}>
                {d}
              </div>
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
        /* 設定モードは前回同様 */
        <div>
          <select value={editSymptom} onChange={(e) => setEditSymptom(e.target.value)} style={{ width: "100%", padding: 12, marginBottom: 20, borderRadius: 8, border: `1px solid ${colors.main}` }}>
            <option value="">設定する症状を選択</option>
            {symptomsList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {editSymptom && (
