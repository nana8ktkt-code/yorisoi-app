"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [step, setStep] = useState(1); // 1:症状, 2:レベル, 3:確認
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [level, setLevel] = useState(null);
  const [memo, setMemo] = useState("");
  const [isSettingMode, setIsSettingMode] = useState(false);
  const [editSymptom, setEditSymptom] = useState(null); // 設定画面でどの症状を編集するか

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

  // 起動時にデータを読み込む
  useEffect(() => {
    const initialData = {};
    symptomsList.forEach(s => {
      initialData[s] = {
        levels: [0, 1, 2, 3, 4, 5].map(() => ({ doing: [], request: [], ng: [] })),
        manual: "優しく見守ってね"
      };
    });
    const saved = localStorage.getItem("yorisoi_v6_presets");
    setPresets(saved ? JSON.parse(saved) : initialData);
  }, []);

  const saveToLocal = (newData) => {
    setPresets({ ...newData });
    localStorage.setItem("yorisoi_v6_presets", JSON.stringify(newData));
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

  const sendMessage = (type) => {
    let text = "";
    if (type === "status") {
      const current = presets[selectedSymptom].levels[level];
      const doing = current.doing.filter(t => t).map(t => `・${t}`).join("\n");
      const req = current.request.filter(t => t).map(t => `・${t}`).join("\n");
      const ng = current.ng.filter(t => t).map(t => `⚠️NG：${t}`).join("\n");
      text = `【Yorisoi🕊️】\n症状：${selectedSymptom} (Lv.${level})\n\n【やってること】\n${doing || "なし"}\n\n【おねがい】\n${req || "ゆっくりさせてね"}\n\n${ng}\n\nメモ：${memo}`;
    } else {
      text = "【Yorisoi🕊️】\n体調が少し落ち着きました。サポートありがとう！✨";
    }
    window.open(`https://line.me/R/msg/text/?${encodeURIComponent(text)}`, "_blank");
  };

  // --- 設定画面の表示 ---
  if (isSettingMode) {
    return (
      <div style={{ padding: "24px", maxWidth: "450px", margin: "0 auto", backgroundColor: colorTheme.base, minHeight: "100vh
