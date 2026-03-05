"use client";
import { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';

// ★Supabaseの設定（あなたのURLとKeyを埋め込み済み）
const SUPABASE_URL = 'https://sxjxdmyhhnrgljmxfujo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4anhkbXloaG5yZ2xqbXhmdWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NjYzNDcsImV4cCI6MjA4ODI0MjM0N30.V_YboSipxMboF1EpLANd1F063a7ayCd9DE-e5_MZBuw';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function Home() {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [level, setLevel] = useState(0);
  const [userId, setUserId] = useState(null);

  const colors = {
    bg: "#F4F9FF", card: "#FFFFFF", main: "#8EC6E8",
    text: "#334455", subText: "#8899AA", shadow: "rgba(142, 198, 232, 0.15)"
  };

  const symptomsList = ["つわり", "生理痛", "PMS", "心の浮き沈み", "頭痛", "だるい"];

  const levelGuides = {
    0: { status: "落ち着いています", emoji: "🌿" },
    1: { status: "少しだるい", emoji: "🙂" },
    2: { status: "しんどい", emoji: "😟" },
    3: { status: "話すのもしんどい", emoji: "😣" },
    4: { status: "かなりしんどい", emoji: "😫" },
    5: { status: "とにかく寝たい", emoji: "🚫" }
  };

  // 起動時にユーザーIDを取得・作成
  useEffect(() => {
    let id = localStorage.getItem("yorisoi_user_id");
    if (!id) {
      id = "user_" + Math.random().toString(36).substring(2, 11);
      localStorage.setItem("yorisoi_user_id", id);
    }
    setUserId(id);
  }, []);

  // ★Supabaseへ保存する処理
  const saveStatus = async (newLevel, newSymptoms) => {
    if (!userId) return;
    const { error } = await supabase
      .from('health_status')
      .upsert({ 
        user_id: userId,
        level: newLevel,
        symptoms: newSymptoms.join("、"),
        emoji: levelGuides[newLevel].emoji
      }, { onConflict: 'user_id' });

    if (error) console.error("保存失敗:", error.message);
  };

  const handleLevelChange = (n) => {
    setLevel(n);
    saveStatus(n, selectedSymptoms);
  };

  const handleSymptomClick = (s) => {
    const next = selectedSymptoms.includes(s) 
      ? selectedSymptoms.filter(i => i !== s) 
      : [...selectedSymptoms, s];
    setSelectedSymptoms(next);
    saveStatus(level, next);
  };

  const generateShareUrl = () => {
    // 公開後のURLを想定して発行
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/partner?id=${userId}`;
    
    // クリップボードにコピー
    navigator.clipboard.writeText(url);
    alert("パートナー専用URLをコピーしました！\nこのままLINEなどで送れます。\n\n" + url);
  };

  return (
    <div style={{ padding: "30px 20px", maxWidth: 450, margin: "0 auto", backgroundColor: colors.bg, minHeight: "100vh", fontFamily: "sans-serif", color: colors.text }}>
      <header style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: "24px", fontWeight: "800", color: colors.main, margin: 0 }}>Yorisoi 🕊️</h1>
        <p style={{ fontSize: "11px", color: colors.subText }}>大切な人に、今のあなたを届ける</p>
      </header>

      <section style={{ marginBottom: 35 }}>
        <h3 style={{ fontSize: "16px", marginBottom: "15px" }}>今の症状</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
          {symptomsList.map(s => {
            const isSelected = selectedSymptoms.includes(s);
            return (
              <button key={s} onClick={() => handleSymptomClick(s)} 
                style={{ padding: "15px", borderRadius: "15px", border: "none", background: isSelected ? colors.main : colors.card, color: isSelected ? "white" : colors.text, boxShadow: `0 4px 10px ${colors.shadow}`, fontWeight: "600" }}>
                {s}
              </button>
            );
          })}
        </div>
      </section>

      <section style={{ background: colors.card, padding: "25px", borderRadius: "30px", boxShadow: `0 15px 35px ${colors.shadow}` }}>
        <h3 style={{ textAlign: "center", fontSize: "16px" }}>しんどさレベル</h3>
        <div style={{ display: "flex", justifyContent: "space-between", margin: "20px 0" }}>
          {[0, 1, 2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => handleLevelChange(n)} style={{ width: "40px", height: "40px", borderRadius: "50%", border: "none", background: level === n ? colors.main : colors.bg, color: level === n ? "white" : colors.main, fontWeight: "800" }}>
              {n}
            </button>
          ))}
        </div>
        
        <div style={{ background: colors.bg, padding: "20px", borderRadius: "20px", textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "40px" }}>{levelGuides[level].emoji}</div>
          <div style={{ fontWeight: "800" }}>{levelGuides[level].status}</div>
        </div>

        <button onClick={generateShareUrl} style={{ width: "100%", padding: "15px", background: colors.main, color: "white", borderRadius: "20px", border: "none", fontWeight: "800", cursor: "pointer", boxShadow: `0 10px 20px ${colors.shadow}` }}>
          🔗 パートナー専用URLをコピーする
        </button>
      </section>
    </div>
  );
}
