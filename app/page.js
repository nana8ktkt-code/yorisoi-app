"use client";
import { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sxjxdmyhhnrgljmxfujo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4anhkbXloaG5yZ2xqbXhmdWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NjYzNDcsImV4cCI6MjA4ODI0MjM0N30.V_YboSipxMboF1EpLANd1F063a7ayCd9DE-e5_MZBuw';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function Home() {
  const [userId, setUserId] = useState(null);
  const [level, setLevel] = useState(0);
  const [isSetting, setIsSetting] = useState(false);
  const [currentLevelTab, setCurrentLevelTab] = useState(0);
  
  const [config, setConfig] = useState({
    symptoms: ["つわり", "生理痛", "頭痛"],
    levels: {
      0: { doing: "", requests: "", notToDo: "" },
      1: { doing: "", requests: "", notToDo: "" },
      2: { doing: "", requests: "", notToDo: "" },
      3: { doing: "", requests: "", notToDo: "" },
      4: { doing: "", requests: "", notToDo: "" },
      5: { doing: "", requests: "", notToDo: "" }
    }
  });

  const colors = { bg: "#F4F9FF", card: "#FFFFFF", main: "#8EC6E8", text: "#334455" };

  useEffect(() => {
    let id = localStorage.getItem("yorisoi_user_id");
    if (!id) {
      id = "user_" + Math.random().toString(36).substring(2, 11);
      localStorage.setItem("yorisoi_user_id", id);
    }
    setUserId(id);
    fetchSettings(id);
  }, []);

  const fetchSettings = async (uid) => {
    const { data } = await supabase.from('user_settings').select('level_config').eq('user_id', uid).single();
    if (data && data.level_config) setConfig(data.level_config);
  };

  const saveSettings = async () => {
    await supabase.from('user_settings').upsert({ user_id: userId, level_config: config }, { onConflict: 'user_id' });
    setIsSetting(false);
  };

  if (isSetting) {
    return (
      <div style={{ padding: "20px", backgroundColor: colors.bg, minHeight: "100vh" }}>
        <button onClick={() => setIsSetting(false)} style={{marginBottom:"10px"}}>◀ 戻る</button>
        <h2 style={{fontSize:"18px"}}>⚙️ レベル別の詳細設定</h2>
        
        <div style={{ display: "flex", gap: "5px", marginBottom: "15px", overflowX: "auto", padding: "5px 0" }}>
          {[0, 1, 2, 3, 4, 5].map(l => (
            <button key={l} onClick={() => setCurrentLevelTab(l)} style={{ padding: "8px 12px", borderRadius: "10px", border: "none", background: currentLevelTab === l ? colors.main : "white", color: currentLevelTab === l ? "white" : colors.text }}>Lv{l}</button>
          ))}
        </div>

        <div style={{ background: "white", padding: "20px", borderRadius: "20px" }}>
          <h4 style={{marginTop:0}}>レベル {currentLevelTab} の設定</h4>
          <p style={{fontSize:"12px", color:"#888"}}>そのレベルになったとき、パートナーに表示される内容です</p>
          
          <label style={{fontSize:"13px"}}>👟 いま、やっていること</label>
          <textarea value={config.levels[currentLevelTab].doing} onChange={e => setConfig({...config, levels: {...config.levels, [currentLevelTab]: {...config.levels[currentLevelTab], doing: e.target.value}}})} style={{width:"100%", height:"60px", marginBottom:"15px", borderRadius:"10px", padding:"10px", border:"1px solid #ddd"}} placeholder="例：横になって休んでいるよ" />

          <label style={{fontSize:"13px"}}>🍼 お願いしたいこと</label>
          <textarea value={config.levels[currentLevelTab].requests} onChange={e => setConfig({...config, levels: {...config.levels, [currentLevelTab]: {...config.levels[currentLevelTab], requests: e.target.value}}})} style={{width:"100%", height:"60px", marginBottom:"15px", borderRadius:"10px", padding:"10px", border:"1px solid #ddd"}} placeholder="例：温かい飲み物をいれてほしい" />

          <label style={{fontSize:"13px"}}>🚫 してほしくないこと</label>
          <textarea value={config.levels[currentLevelTab].notToDo} onChange={e => setConfig({...config, levels: {...config.levels, [currentLevelTab]: {...config.levels[currentLevelTab], notToDo: e.target.value}}})} style={{width:"100%", height:"60px", marginBottom:"15px", borderRadius:"10px", padding:"10px", border:"1px solid #ddd"}} placeholder="例：今は話しかけないでほしい" />
        </div>
        
        <button onClick={saveSettings} style={{ width: "100%", padding: "15px", background: colors.main, color: "white", borderRadius: "20px", border: "none", fontWeight: "bold", marginTop: "20px" }}>設定を保存する</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: 450, margin: "0 auto", backgroundColor: colors.bg, minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ color: colors.main, fontSize: "24px" }}>Yorisoi 🕊️</h1>
        <button onClick={() => setIsSetting(true)} style={{ background: "none", border: "none", fontSize: "24px" }}>⚙️</button>
      </div>

      <section style={{ background: "white", padding: "30px", borderRadius: "30px", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
        <h3 style={{fontSize:"16px", color:colors.text, marginBottom:"20px"}}>今のしんどさ：レベル {level}</h3>
        <input type="range" min="0" max="5" value={level} onChange={(e) => setLevel(e.target.value)} style={{ width: "100%", marginBottom: "30px" }} />
        
        <div style={{ textAlign: "left", background: colors.bg, padding: "20px", borderRadius: "20px" }}>
          <div style={{marginBottom:"15px"}}><strong>👟 やっていること</strong><br/><span style={{fontSize:"14px"}}>{config.levels[level].doing || "（設定なし）"}</span></div>
          <div style={{marginBottom:"15px"}}><strong>🍼 お願いしたいこと</strong><br/><span style={{fontSize:"14px"}}>{config.levels[level].requests || "（設定なし）"}</span></div>
          <div><strong>🚫 してほしくないこと</strong><br/><span style={{fontSize:"14px"}}>{config.levels[level].notToDo || "（設定なし）"}</span></div>
        </div>
      </section>
    </div>
  );
}
