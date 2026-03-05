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
    const suggestions = {
      doing: ["横になって休んでいるよ", "薬を飲んで安静にしてる", "暗い部屋で寝てる", "食欲ないの", "少し落ち着いてきた"],
      requests: [
        { cat: "🧼 家事・身の回り", items: ["洗い物をお願いしたい", "洗濯物を取り込んでほしい", "ゴミ出しをお願い", "お風呂を沸かしてほしい"] },
        { cat: "🍱 食事・買い出し", items: ["消化にいいものを作ってほしい", "コンビニでゼリー飲料買ってきて", "温かい飲み物を淹れてほしい", "アイス買ってきて"] },
        { cat: "🌡️ 環境・ケア", items: ["部屋を暗くしてほしい", "静かにしてほしい", "湯たんぽ（カイロ）を用意してほしい", "腰や肩をさすってほしい"] },
        { cat: "🕊️ 放置・見守り", items: ["放っておいてほしい（寝かせて）", "1〜2時間後に一度様子を見てほしい", "返信不要でスタンプだけ送って"] }
      ],
      notToDo: ["今は話しかけないでほしい", "大きな音を立てないで", "部屋を明るくしないで", "強い匂いのものは控えて", "そっとしておいて"]
    };

    const toggleSuggestion = (field, value) => {
      const currentText = config.levels[currentLevelTab][field] || "";
      let newText;
      if (currentText.includes(value)) {
        newText = currentText.replace(value, "").replace(/、$/, "").replace(/^、/, "").replace(/、、/g, "、").trim();
        if (newText.startsWith("、")) newText = newText.substring(1);
        if (newText.endsWith("、")) newText = newText.slice(0, -1);
      } else {
        newText = currentText ? `${currentText}、${value}` : value;
      }
      setConfig({...config, levels: {...config.levels, [currentLevelTab]: {...config.levels[currentLevelTab], [field]: newText}}});
    };

    return (
      <div style={{ padding: "20px", backgroundColor: colors.bg, minHeight: "100vh", color: colors.text }}>
        <button onClick={() => setIsSetting(false)} style={{marginBottom:"10px", border:"none", background:"none", fontSize:"16px"}}>◀ 戻る</button>
        <h2 style={{fontSize:"20px", marginBottom:"20px"}}>⚙️ レベル別の詳細設定</h2>
        
        <div style={{ display: "flex", gap: "8px", marginBottom: "15px", overflowX: "auto", padding: "5px 0" }}>
          {[0, 1, 2, 3, 4, 5].map(l => (
            <button key={l} onClick={() => setCurrentLevelTab(l)} style={{ padding: "10px 15px", borderRadius: "12px", border: "none", background: currentLevelTab === l ? colors.main : "white", color: currentLevelTab === l ? "white" : colors.text, fontWeight:"bold", boxShadow: `0 4px 10px ${colors.shadow}` }}>Lv{l}</button>
          ))}
        </div>

        <div style={{ background: "white", padding: "20px", borderRadius: "25px", boxShadow: `0 10px 30px ${colors.shadow}` }}>
          <h4 style={{marginTop:0, color:colors.main, marginBottom:"20px"}}>レベル {currentLevelTab} の設定</h4>
          
          {/* 症状イメージプルダウン */}
          <div style={{ marginBottom: "25px", padding: "15px", background: colors.bg, borderRadius: "18px", border: `1px solid ${colors.shadow}` }}>
            <label style={{ fontSize: "12px", fontWeight: "bold", display: "block", marginBottom: "8px", color: colors.main }}>🌡️ 症状をイメージする</label>
            <select style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #ddd", fontSize: "14px", backgroundColor: "white" }}>
              <option value="">症状を選んで確認...</option>
              {config.symptoms.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* 各入力項目 */}
          {[
            { label: "👟 いま、やっていること", field: "doing" },
            { label: "🍼 お願いしたいこと", field: "requests" },
            { label: "🚫 遠慮してほしいこと", field: "notToDo" }
          ].map((item) => (
            <div key={item.field} style={{ marginBottom: "25px" }}>
              <label style={{fontSize:"13px", fontWeight:"bold", display:"block", marginBottom:"8px"}}>{item.label}</label>
              
              <div style={{ background: colors.bg, padding: "10px", borderRadius: "15px", marginBottom: "10px" }}>
                {item.field === "requests" ? (
                  // お願いしたいこと（カテゴリー別表示）
                  suggestions[item.field].map(catGroup => (
                    <div key={catGroup.cat} style={{ marginBottom: "10px" }}>
                      <div style={{ fontSize: "10px", color: colors.main, fontWeight: "bold", marginBottom: "5px" }}>{catGroup.cat}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                        {catGroup.items.map(sug => (
                          <button key={sug} onClick={() => toggleSuggestion(item.field, sug)} style={{ fontSize: "11px", padding: "5px 10px", borderRadius: "20px", border: "1px solid", borderColor: config.levels[currentLevelTab][item.field]?.includes(sug) ? colors.main : "#ddd", background: config.levels[currentLevelTab][item.field]?.includes(sug) ? colors.main : "white", color: config.levels[currentLevelTab][item.field]?.includes(sug) ? "white" : colors.subText }}>{sug}</button>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  // その他（通常のチップス表示）
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                    {suggestions[item.field].map(sug => (
                      <button key={sug} onClick={() => toggleSuggestion(item.field, sug)} style={{ fontSize: "11px", padding: "5px 10px", borderRadius: "20px", border: "1px solid", borderColor: config.levels[currentLevelTab][item.field]?.includes(sug) ? colors.main : "#ddd", background: config.levels[currentLevelTab][item.field]?.includes(sug) ? colors.main : "white", color: config.levels[currentLevelTab][item.field]?.includes(sug) ? "white" : colors.subText }}>{sug}</button>
                    ))}
                  </div>
                )}
              </div>
              
              <textarea 
                value={config.levels[currentLevelTab][item.field]} 
                onChange={e => setConfig({...config, levels: {...config.levels, [currentLevelTab]: {...config.levels[currentLevelTab], [item.field]: e.target.value}}})} 
                style={{width:"100%", height:"50px", borderRadius:"12px", padding:"10px", border:"1px solid #eee", fontSize:"13px"}} 
                placeholder="または自由に記述..." 
              />
            </div>
          ))}
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
