"use client";
import { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sxjxdmyhhnrgljmxfujo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4anhkbXloaG5yZ2xqbXhmdWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NjYzNDcsImV4cCI6MjA4ODI0MjM0N30.V_YboSipxMboF1EpLANd1F063a7ayCd9DE-e5_MZBuw';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function Home() {
  const [userId, setUserId] = useState(null);
  const [level, setLevel] = useState(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [isSetting, setIsSetting] = useState(false);
  
  // 設定可能なリスト
  const [symptomsList, setSymptomsList] = useState(["つわり", "生理痛", "PMS", "頭痛"]);
  const [requestsList, setRequestsList] = useState(["おかゆを作ってほしい", "静かにしてほしい"]);

  const colors = { bg: "#F4F9FF", card: "#FFFFFF", main: "#8EC6E8", text: "#334455", subText: "#8899AA" };

  useEffect(() => {
    let id = localStorage.getItem("yorisoi_user_id");
    if (!id) {
      id = "user_" + Math.random().toString(36).substring(2, 11);
      localStorage.setItem("yorisoi_user_id", id);
    }
    setUserId(id);
    fetchSettings(id);
  }, []);

  // 設定を読み込む
  const fetchSettings = async (uid) => {
    const { data } = await supabase.from('user_settings').select('*').eq('user_id', uid).single();
    if (data) {
      if (data.symptoms_list) setSymptomsList(data.symptoms_list);
      if (data.requests_list) setRequestsList(data.requests_list);
    }
  };

  // 設定を保存する
  const saveSettings = async () => {
    await supabase.from('user_settings').upsert({
      user_id: userId,
      symptoms_list: symptomsList,
      requests_list: requestsList
    }, { onConflict: 'user_id' });
    setIsSetting(false);
  };

  const saveStatus = async (l, s) => {
    await supabase.from('health_status').upsert({
      user_id: userId, level: l, symptoms: s.join("、"), emoji: "🌡️" 
    }, { onConflict: 'user_id' });
  };

  if (isSetting) {
    return (
      <div style={{ padding: "30px", backgroundColor: colors.bg, minHeight: "100vh" }}>
        <h2>⚙️ 設定</h2>
        <label>症状リスト（カンマ区切り）</label>
        <textarea 
          value={symptomsList.join(",")} 
          onChange={(e) => setSymptomsList(e.target.value.split(","))}
          style={{ width: "100%", height: "100px", marginBottom: "20px" }}
        />
        <label>おねがいリスト（カンマ区切り）</label>
        <textarea 
          value={requestsList.join(",")} 
          onChange={(e) => setRequestsList(e.target.value.split(","))}
          style={{ width: "100%", height: "100px", marginBottom: "20px" }}
        />
        <button onClick={saveSettings} style={{ width: "100%", padding: "15px", background: colors.main, color: "white", borderRadius: "10px", border: "none" }}>設定を保存</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "30px 20px", maxWidth: 450, margin: "0 auto", backgroundColor: colors.bg, minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1 style={{ color: colors.main }}>Yorisoi 🕊️</h1>
        <button onClick={() => setIsSetting(true)} style={{ background: "none", border: "none", fontSize: "24px" }}>⚙️</button>
      </div>

      <section style={{ marginBottom: "30px" }}>
        <h3>今の症状</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {symptomsList.map(s => (
            <button key={s} onClick={() => {
              const next = selectedSymptoms.includes(s) ? selectedSymptoms.filter(i => i !== s) : [...selectedSymptoms, s];
              setSelectedSymptoms(next);
              saveStatus(level, next);
            }} style={{ padding: "10px", background: selectedSymptoms.includes(s) ? colors.main : "white", border: "none", borderRadius: "10px" }}>{s}</button>
          ))}
        </div>
      </section>

      <section style={{ background: "white", padding: "20px", borderRadius: "20px" }}>
        <h3>しんどさレベル: {level}</h3>
        <input type="range" min="0" max="5" value={level} onChange={(e) => { setLevel(e.target.value); saveStatus(e.target.value, selectedSymptoms); }} style={{ width: "100%" }} />
        <div style={{ marginTop: "20px" }}>
          <h4>🍼 おねがい</h4>
          {requestsList.map(r => <div key={r}>・ {r}</div>)}
        </div>
      </section>
    </div>
  );
}
