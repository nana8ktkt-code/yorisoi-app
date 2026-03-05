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
  const [currentLevelTab, setCurrentLevelTab] = useState(0);
  
  const [config, setConfig] = useState({
    symptoms: ["つわり", "生理痛", "PMS", "心の浮き沈み", "頭痛", "だるい", "喉が痛い", "腰痛", "腹痛"],
    levels: {
      0: { doing: "", requests: "", notToDo: "" },
      1: { doing: "", requests: "", notToDo: "" },
      2: { doing: "", requests: "", notToDo: "" },
      3: { doing: "", requests: "", notToDo: "" },
      4: { doing: "", requests: "", notToDo: "" },
      5: { doing: "", requests: "", notToDo: "" }
    }
  });

  const levelGuides = {
    0: { status: "落ち着いています", emoji: "🌿" },
    1: { status: "少しだるい", emoji: "🙂" },
    2: { status: "しんどい", emoji: "😟" },
    3: { status: "話すのもしんどい", emoji: "😣" },
    4: { status: "かなりしんどい", emoji: "😫" },
    5: { status: "とにかく寝たい", emoji: "🚫" }
  };

  const colors = { bg: "#F4F9FF", card: "#FFFFFF", main: "#8EC6E8", text: "#334455", subText: "#8899AA", shadow: "rgba(142, 198, 232, 0.15)" };

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
    if (data && data.level_config) {
      setConfig({
        ...data.level_config,
        // ここで最新のリストを強制的に読み込ませます
        symptoms: ["つわり", "生理痛", "PMS", "心の浮き沈み", "頭痛", "だるい", "喉が痛い", "腰痛", "腹痛"]
      });
    }
  };

  const saveSettings = async () => {
    await supabase.from('user_settings').upsert({ user_id: userId, level_config: config }, { onConflict: 'user_id' });
    setIsSetting(false);
  };

  const saveStatus = async (l, s) => {
    if (!userId) return;
    await supabase.from('health_status').upsert({
      user_id: userId,
      level: l,
      symptoms: s.join("、"),
      emoji: levelGuides[l].emoji,
      doing: config.levels[l].doing,
      requests: config.levels[l].requests,
      not_to_do: config.levels[l].notToDo
    }, { onConflict: 'user_id' });
  };

  const handleLevelChange = (n) => {
    setLevel(n);
    saveStatus(n, selectedSymptoms);
  };

  const handleSymptomClick = (s) => {
    const next = selectedSymptoms.includes(s) ? selectedSymptoms.filter(i => i !== s) : [...selectedSymptoms, s];
    setSelectedSymptoms(next);
    saveStatus(level, next);
  };

if (isSetting) {
    return (
      <div style={{ padding: "20px", backgroundColor: colors.bg, minHeight: "100vh", color: colors.text }}>
        <button onClick={() => setIsSetting(false)} style={{marginBottom:"10px", border:"none", background:"none", fontSize:"16px"}}>◀ 戻る</button>
        <h2 style={{fontSize:"20px", marginBottom:"20px"}}>⚙️ レベル別の詳細設定</h2>
        
        {/* レベル選択タブ */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "15px", overflowX: "auto", padding: "5px 0" }}>
          {[0, 1, 2, 3, 4, 5].map(l => (
            <button key={l} onClick={() => setCurrentLevelTab(l)} style={{ padding: "10px 15px", borderRadius: "12px", border: "none", background: currentLevelTab === l ? colors.main : "white", color: currentLevelTab === l ? "white" : colors.text, fontWeight:"bold", boxShadow: `0 4px 10px ${colors.shadow}` }}>Lv{l}</button>
          ))}
        </div>

        <div style={{ background: "white", padding: "20px", borderRadius: "25px", boxShadow: `0 10px 30px ${colors.shadow}` }}>
          <h4 style={{marginTop:0, color:colors.main, marginBottom:"20px"}}>レベル {currentLevelTab} の設定をつくる</h4>
          
          {/* ① 症状プルダウン（ポップアップなし） */}
          <div style={{ marginBottom: "25px", padding: "15px", background: colors.bg, borderRadius: "18px", border: `1px solid ${colors.shadow}` }}>
            <label style={{ fontSize: "12px", fontWeight: "bold", display: "block", marginBottom: "8px", color: colors.main }}>
              🌡️ どの症状のときの設定ですか？（確認）
            </label>
            <select 
              style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #ddd", fontSize: "14px", backgroundColor: "white" }}
              onChange={(e) => {
                // ポップアップを削除しました
              }}
            >
              <option value="">症状を選んでイメージを膨らませる...</option>
              {config.symptoms.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <hr style={{ border: "none", borderTop: "1px dashed #eee", marginBottom: "20px" }} />

          {/* ② 具体的なメッセージを書く */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{fontSize:"13px", fontWeight:"bold", display:"block", marginBottom:"5px"}}>👟 いま、やっていること</label>
            <textarea value={config.levels[currentLevelTab].doing} onChange={e => setConfig({...config, levels: {...config.levels, [currentLevelTab]: {...config.levels[currentLevelTab], doing: e.target.value}}})} style={{width:"100%", height:"60px", borderRadius:"12px", padding:"10px", border:"1px solid #eee", fontSize:"14px"}} placeholder="例：横になって休んでいるよ" />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{fontSize:"13px", fontWeight:"bold", display:"block", marginBottom:"5px"}}>🍼 お願いしたいこと</label>
            <textarea value={config.levels[currentLevelTab].requests} onChange={e => setConfig({...config, levels: {...config.levels, [currentLevelTab]: {...config.levels[currentLevelTab], requests: e.target.value}}})} style={{width:"100%", height:"60px", borderRadius:"12px", padding:"10px", border:"1px solid #eee", fontSize:"14px"}} placeholder="例：温かい飲み物をいれてほしい" />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label style={{fontSize:"13px", fontWeight:"bold", display:"block", marginBottom:"5px"}}>🚫 遠慮してほしいこと</label>
            <textarea value={config.levels[currentLevelTab].notToDo} onChange={e => setConfig({...config, levels: {...config.levels, [currentLevelTab]: {...config.levels[currentLevelTab], notToDo: e.target.value}}})} style={{width:"100%", height:"60px", borderRadius:"12px", padding:"10px", border:"1px solid #eee", fontSize:"14px"}} placeholder="例：今は話しかけないでそっとしておいて" />
          </div>
        </div>
        
        <button onClick={saveSettings} style={{ width: "100%", padding: "18px", background: colors.main, color: "white", borderRadius: "20px", border: "none", fontWeight: "bold", marginTop: "25px", fontSize: "16px", boxShadow: `0 10px 20px ${colors.shadow}` }}>設定を保存する</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "30px 20px", maxWidth: 450, margin: "0 auto", backgroundColor: colors.bg, minHeight: "100vh", fontFamily: "sans-serif", color: colors.text }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: colors.main, margin: 0 }}>Yorisoi 🕊️</h1>
          <p style={{ fontSize: "11px", color: colors.subText }}>大切な人に、今のあなたを届ける</p>
        </div>
        <button onClick={() => setIsSetting(true)} style={{ background: "white", border: "none", fontSize: "20px", width:"45px", height:"45px", borderRadius:"50%", boxShadow: `0 5px 15px ${colors.shadow}` }}>⚙️</button>
      </div>

      <section style={{ marginBottom: 35 }}>
        <h3 style={{ fontSize: "16px", marginBottom: "15px" }}>今の症状</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
          {config.symptoms.map(s => (
            <button key={s} onClick={() => handleSymptomClick(s)} 
              style={{ padding: "12px 5px", borderRadius: "15px", border: "none", background: selectedSymptoms.includes(s) ? colors.main : colors.card, color: selectedSymptoms.includes(s) ? "white" : colors.text, boxShadow: `0 4px 10px ${colors.shadow}`, fontWeight: "600", fontSize:"12px" }}>
              {s}
            </button>
          ))}
        </div>
      </section>

      <section style={{ background: colors.card, padding: "25px", borderRadius: "30px", boxShadow: `0 15px 35px ${colors.shadow}`, textAlign:"center" }}>
        <h3 style={{ fontSize: "16px", marginBottom:"20px" }}>しんどさレベル</h3>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "25px" }}>
          {[0, 1, 2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => handleLevelChange(n)} style={{ width: "42px", height: "42px", borderRadius: "50%", border: "none", background: level === n ? colors.main : colors.bg, color: level === n ? "white" : colors.main, fontWeight: "800", fontSize:"16px", transition:"0.2s" }}>
              {n}
            </button>
          ))}
        </div>
        
        <div style={{ background: colors.bg, padding: "25px", borderRadius: "25px", textAlign: "center", marginBottom: "25px" }}>
          <div style={{ fontSize: "50px", marginBottom:"10px" }}>{levelGuides[level].emoji}</div>
          <div style={{ fontWeight: "800", fontSize: "18px", color: colors.text }}>{levelGuides[level].status}</div>
        </div>

        <div style={{ textAlign: "left", fontSize: "14px", borderTop: `1px dashed ${colors.main}`, paddingTop: "20px" }}>
          <div style={{marginBottom:"15px"}}><strong>👟 やっていること</strong><br/><span style={{color:colors.subText}}>{config.levels[level].doing || "（未設定）"}</span></div>
          <div style={{marginBottom:"15px"}}><strong>🍼 お願いしたいこと</strong><br/><span style={{color:colors.subText}}>{config.levels[level].requests || "（未設定）"}</span></div>
          <div><strong>🚫 遠慮してほしいこと</strong><br/><span style={{color:colors.subText}}>{config.levels[level].notToDo || "（未設定）"}</span></div>
        </div>
      </section>
    </div>
  );
}
