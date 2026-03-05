import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// --- Firebase設定（変更なし） ---
const firebaseConfig = {
  apiKey: "AIzaSyC3S7sO5trehM1cNHozo6cc49D8V4rXSqg",
  authDomain: "yorisoi-app-89ce7.firebaseapp.com",
  projectId: "yorisoi-app-89ce7",
  storageBucket: "yorisoi-app-89ce7.firebasestorage.app",
  messagingSenderId: "509189105205",
  appId: "1:509189105205:web:7ffc405665e85fed92f37c",
  measurementId: "G-SZEFW40W4C"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function YorisoiApp() {
  const [level, setLevel] = useState(0);
  const [activeSymptom, setActiveSymptom] = useState("生理痛");
  const [isSetting, setIsSetting] = useState(false);
  const [myId, setMyId] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [inputPartnerId, setInputPartnerId] = useState("");
  const [showThanks, setShowThanks] = useState("");

  // 【最重要】設定画面で「いま何を編集しているか」を管理するステート
  const [editSymptom, setEditSymptom] = useState("生理痛"); 
  const [editLevel, setEditLevel] = useState(0); 

  const [config, setConfig] = useState({
    symptoms: ["生理痛", "つわり", "PMS", "頭痛", "だるい", "腹痛"],
    data: {} 
  });

  const suggestions = {
    doing: ["横になって休んでる", "薬を飲んで安静にしてる", "暗い部屋で寝てる", "食欲がない", "少し落ち着いてきた"],
    requests: [
      { cat: "🧼 家事", items: ["洗い物をお願い", "洗濯物をお願い", "ゴミ出しをお願い", "お風呂を沸かして"] },
      { cat: "🍱 食事", items: ["ゼリー買ってきて", "消化にいいもの", "温かい飲み物", "アイス買ってきて"] },
      { cat: "🌡️ ケア", items: ["湯たんぽ用意して", "部屋を暗くして", "腰をさすって", "静かにしてほしい"] }
    ],
    notToDo: ["家事に触れないで", "話しかけないで", "大きな音NG", "匂いNG", "そっとしておいて"]
  };

  const colors = { main: "#8E97FD", bg: "#F2F5FF", text: "#4A4A4A", card: "#FFFFFF", shadow: "rgba(142, 151, 253, 0.2)" };

  useEffect(() => {
    let id = localStorage.getItem("yorisoi_user_id");
    if (!id) {
      id = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem("yorisoi_user_id", id);
    }
    setMyId(id);

    const unsub = onSnapshot(doc(db, "users", id), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d.level !== undefined) setLevel(d.level);
        if (d.activeSymptom) setActiveSymptom(d.activeSymptom);
        if (d.configData) setConfig(prev => ({...prev, data: d.configData}));
        if (d.partnerId) setPartnerId(d.partnerId);
        if (d.lastThank) { setShowThanks(d.lastThank); setTimeout(() => setShowThanks(""), 5000); }
      }
    });
    return () => unsub();
  }, []);

  const saveAllConfig = async (newData) => {
    await setDoc(doc(db, "users", myId), { 
      configData: newData,
      updatedAt: new Date()
    }, { merge: true });
  };

  const toggleSuggestion = (field, value) => {
    const newData = { ...config.data };
    if (!newData[editSymptom]) newData[editSymptom] = {};
    if (!newData[editSymptom][editLevel]) newData[editSymptom][editLevel] = { doing: "", requests: "", notToDo: "" };

    const currentText = newData[editSymptom][editLevel][field] || "";
    let newText;
    if (currentText.includes(value)) {
      newText = currentText.split('、').filter(item => item !== value).join('、');
    } else {
      newText = currentText ? `${currentText}、${value}` : value;
    }

    newData[editSymptom][editLevel][field] = newText;
    setConfig({ ...config, data: newData });
    saveAllConfig(newData);
  };

  const handleManualInput = (field, value) => {
    const newData = { ...config.data };
    if (!newData[editSymptom]) newData[editSymptom] = {};
    if (!newData[editSymptom][editLevel]) newData[editSymptom][editLevel] = { doing: "", requests: "", notToDo: "" };

    newData[editSymptom][editLevel][field] = value;
    setConfig({ ...config, data: newData });
    saveAllConfig(newData);
  };

  const sendThank = async (msg) => {
    if (!partnerId) return alert("連携相手がいません");
    await setDoc(doc(db, "users", partnerId), { lastThank: msg }, { merge: true });
  };

  if (isSetting) {
    return (
      <div style={{ padding: "20px", backgroundColor: colors.bg, minHeight: "100vh", fontFamily: "sans-serif" }}>
        {/* ヘッダーエリア */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
          <button onClick={() => setIsSetting(false)} style={{border:"none", background:"white", padding:"10px 15px", borderRadius:"12px", fontWeight:"bold", boxShadow: `0 4px 10px ${colors.shadow}`, cursor:"pointer"}}>◀ 戻る</button>
          <h2 style={{marginLeft: "15px", fontSize:"18px", color: colors.main, fontWeight:"800", margin:0}}>詳細設定</h2>
        </div>
        
        {/* 【ここが重要！】ステップ形式の設定エリア */}
        <div style={{ background: "white", padding: "20px", borderRadius: "25px", boxShadow: `0 10px 30px ${colors.shadow}` }}>
          
          {/* STEP 1: 症状の選択（プルダウン） */}
          <div style={{ marginBottom: "25px" }}>
            <label style={{ fontSize: "12px", fontWeight: "bold", color: colors.main, display: "block", marginBottom: "10px" }}>① 設定したい症状を選んでください</label>
            <select 
              value={editSymptom} 
              onChange={(e) => setEditSymptom(e.target.value)} 
              style={{ width: "100%", padding: "15px", borderRadius: "15px", border: `2px solid ${colors.bg}`, fontSize: "16px", backgroundColor:"#fff", fontWeight: "bold", appearance: "none", cursor: "pointer" }}
            >
              {config.symptoms.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* STEP 2: レベルの選択 */}
          <div style={{ marginBottom: "25px" }}>
            <label style={{ fontSize: "12px", fontWeight: "bold", color: colors.main, display: "block", marginBottom: "10px" }}>② その症状の「レベル」を選んでください</label>
            <div style={{ display: "flex", gap: "8px", justifyContent: "space-between" }}>
              {[0, 1, 2, 3, 4, 5].map(l => (
                <button key={l} onClick={() => setEditLevel(l)} style={{ flex: 1, height: "45px", borderRadius: "12px", border: "none", background: editLevel === l ? colors.main : colors.bg, color: editLevel === l ? "white" : colors.main, fontWeight:"bold", fontSize: "16px", cursor: "pointer", transition: "0.2s" }}>{l}</button>
              ))}
            </div>
          </div>

          <hr style={{ border: "none", borderTop: `1px solid ${colors.bg}`, margin: "25px 0" }} />

          {/* STEP 3: 詳細の中身 */}
          <h3 style={{ fontSize: "14px", textAlign: "center", color: colors.text, marginBottom: "20px" }}>
            「{editSymptom} Lv.{editLevel}」の時の設定
          </h3>

          <div style={{marginBottom:"20px"}}>
            <label style={{fontSize:"13px", fontWeight:"bold", display:"block", marginBottom:"8px"}}>👟 いま、やっていること</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
              {suggestions.doing.map(s => (
                <button key={s} onClick={() => toggleSuggestion("doing", s)} style={{ fontSize: "11px", padding: "6px 12px", borderRadius: "20px", border: "1px solid", borderColor: config.data[editSymptom]?.[editLevel]?.doing?.includes(s) ? colors.main : "#eee", background: config.data[editSymptom]?.[editLevel]?.doing?.includes(s) ? colors.main : "white", color: config.data[editSymptom]?.[editLevel]?.doing?.includes(s) ? "white" : colors.text }}>{s}</button>
              ))}
            </div>
            <textarea value={config.data[editSymptom]?.[editLevel]?.doing || ""} onChange={e => handleManualInput("doing", e.target.value)} style={{width:"100%", height:"60px", borderRadius:"12px", padding:"10px", border:"1px solid #eee", fontSize:"14px", boxSizing:"border-box"}} placeholder="自由入力..." />
          </div>

          <div style={{marginBottom:"20px"}}>
            <label style={{fontSize:"13px", fontWeight:"bold", display:"block", marginBottom:"8px"}}>🍼 お願いしたいこと</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
              {suggestions.requests.map(cat => cat.items.map(s => (
                <button key={s} onClick={() => toggleSuggestion("requests", s)} style={{ fontSize: "11px", padding: "6px 12px", borderRadius: "20px", border: "1px solid", borderColor: config.data[editSymptom]?.[editLevel]?.requests?.includes(s) ? colors.main : "#eee", background: config.data[editSymptom]?.[editLevel]?.requests?.includes(s) ? colors.main : "white", color: config.data[editSymptom]?.[editLevel]?.requests?.includes(s) ? "white" : colors.text }}>{s}</button>
              )))}
            </div>
            <textarea value={config.data[editSymptom]?.[editLevel]?.requests || ""} onChange={e => handleManualInput("requests", e.target.value)} style={{width:"100%", height:"60px", borderRadius:"12px", padding:"10px", border:"1px solid #eee", fontSize:"14px", boxSizing:"border-box"}} placeholder="自由入力..." />
          </div>

          <div style={{marginBottom:"10px"}}>
            <label style={{fontSize:"13px", fontWeight:"bold", display:"block", marginBottom:"8px"}}>🚫 遠慮してほしいこと</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
              {suggestions.notToDo.map(s => (
                <button key={s} onClick={() => toggleSuggestion("notToDo", s)} style={{ fontSize: "11px", padding: "6px 12px", borderRadius: "20px", border: "1px solid", borderColor: config.data[editSymptom]?.[editLevel]?.notToDo?.includes(s) ? colors.main : "#eee", background: config.data[editSymptom]?.[editLevel]?.notToDo?.includes(s) ? colors.main : "white", color: config.data[editSymptom]?.[editLevel]?.notToDo?.includes(s) ? "white" : colors.text }}>{s}</button>
              ))}
            </div>
            <textarea value={config.data[editSymptom]?.[editLevel]?.notToDo || ""} onChange={e => handleManualInput("notToDo", e.target.value)} style={{width:"100%", height:"60px", borderRadius:"12px", padding:"10px", border:"1px solid #eee", fontSize:"14px", boxSizing:"border-box"}} placeholder="自由入力..." />
          </div>

        </div>
      </div>
    );
  }

  // --- メイン画面 ---
  return (
    <div style={{ padding: "30px 20px", maxWidth: 450, margin: "0 auto", backgroundColor: colors.bg, minHeight: "100vh", fontFamily: "sans-serif" }}>
      {showThanks && (
        <div style={{ position:"fixed", top:"20px", left:"50%", transform:"translateX(-50%)", background:colors.main, color:"white", padding:"15px 25px", borderRadius:"30px", boxShadow:"0 10px 20px rgba(0,0,0,0.2)", zIndex:100, fontWeight:"bold" }}>🌸 {showThanks}</div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "900", color: colors.main, margin:0 }}>Yorisoi 🕊️</h1>
        <button onClick={() => setIsSetting(true)} style={{ background: "white", border: "none", width:"45px", height:"45px", borderRadius:"50%", boxShadow: `0 5px 15px ${colors.shadow}`, fontSize:"20px", cursor:"pointer" }}>⚙️</button>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "25px", overflowX: "auto", paddingBottom:"10px" }}>
        {config.symptoms.map(s => (
          <button key={s} onClick={() => { setActiveSymptom(s); setDoc(doc(db, "users", myId), { activeSymptom: s }, { merge: true }); }} style={{ padding: "12px 20px", borderRadius: "25px", border: "none", background: activeSymptom === s ? colors.main : "white", color: activeSymptom === s ? "white" : colors.text, fontWeight: "bold", whiteSpace:"nowrap", fontSize:"14px", boxShadow: activeSymptom === s ? `0 8px 15px ${colors.shadow}` : "0 2px 5px rgba(0,0,0,0.05)", cursor:"pointer" }}>{s}</button>
        ))}
      </div>

      <section style={{ background: "white", padding: "30px", borderRadius: "35px", boxShadow: `0 20px 40px ${colors.shadow}`, textAlign:"center" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
          {[0, 1, 2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => { setLevel(n); setDoc(doc(db, "users", myId), { level: n }, { merge: true }); }} style={{ width: "45px", height: "45px", borderRadius: "50%", border: "none", background: level === n ? colors.main : colors.bg, color: level === n ? "white" : colors.main, fontWeight: "bold", cursor:"pointer" }}>{n}</button>
          ))}
        </div>

        <div style={{ background: colors.bg, padding: "20px", borderRadius: "20px", marginBottom: "25px" }}>
            <div style={{fontSize:"13px", color:colors.main, fontWeight:"bold", marginBottom:"5px"}}>{activeSymptom} Lv.{level}</div>
            <div style={{ fontWeight: "900", fontSize:"22px" }}>
                {level === 0 ? "元気だよ😊" : level === 5 ? "限界…たすけて😭" : "しんどい😰"}
            </div>
        </div>

        <div style={{ textAlign: "left", fontSize: "14px", borderTop:`1px dashed ${colors.bg}`, paddingTop:"20px" }}>
          <div style={{marginBottom:"15px", lineHeight:1.5}}><strong>👟 いまの状態:</strong> <br/><span style={{color:colors.text}}>{config.data[activeSymptom]?.[level]?.doing || "（⚙️から設定してね）"}</span></div>
          <div style={{marginBottom:"15px", lineHeight:1.5}}><strong>🍼 お願い:</strong> <br/><span style={{color:colors.text}}>{config.data[activeSymptom]?.[level]?.requests || "（未設定）"}</span></div>
          <div style={{marginBottom:"25px", lineHeight:1.5}}><strong>🚫 遠慮:</strong> <br/><span style={{color:colors.text}}>{config.data[activeSymptom]?.[level]?.notToDo || "（未設定）"}</span></div>
          
          <div style={{display:"flex", gap:"10px", justifyContent:"center"}}>
            <button onClick={() => sendThank("助かったよ！")} style={{flex:1, padding:"12px", borderRadius:"15px", border:`2px solid ${colors.main}`, background:"none", color:colors.main, fontSize:"12px", fontWeight:"bold", cursor:"pointer"}}>🌸 感謝</button>
            <button onClick={() => sendThank("神対応！")} style={{flex:1, padding:"12px", borderRadius:"15px", border:`2px solid ${colors.main}`, background:"none", color:colors.main, fontSize:"12px", fontWeight:"bold", cursor:"pointer"}}>✨ 神対応</button>
          </div>
        </div>
      </section>
    </div>
  );
}
