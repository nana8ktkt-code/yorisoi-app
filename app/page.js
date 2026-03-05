import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// --- Firebase設定（反映済み） ---
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
  const [isLinked, setIsLinked] = useState(false);
  const [showThanks, setShowThanks] = useState("");

  // 設定用：今どの症状を編集しているか
  const [editSymptom, setEditSymptom] = useState("生理痛");
  const [editLevel, setEditLevel] = useState(0);

  const [config, setConfig] = useState({
    symptoms: ["生理痛", "頭痛", "だるい", "吐き気", "めまい", "腹痛"],
    data: {} 
  });

  const colors = { main: "#8E97FD", bg: "#F2F5FF", text: "#4A4A4A", card: "#FFFFFF", shadow: "rgba(142, 151, 253, 0.2)" };

  // 起動時にデータを取得
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
        if (d.partnerId) { setIsLinked(true); setPartnerId(d.partnerId); }
        if (d.lastThank) { setShowThanks(d.lastThank); setTimeout(() => setShowThanks(""), 5000); }
      }
    });
    return () => unsub();
  }, []);

  const saveToFirebase = async (newLevel, newSymptom, newData) => {
    await setDoc(doc(db, "users", myId), { 
      level: newLevel, 
      activeSymptom: newSymptom,
      configData: newData || config.data,
      updatedAt: new Date()
    }, { merge: true });
  };

  const handleTextChange = (field, value) => {
    const symptomData = config.data[editSymptom] || {};
    const levelData = symptomData[editLevel] || { requests: "", notToDo: "" };
    
    const newConfigData = {
      ...config.data,
      [editSymptom]: { ...symptomData, [editLevel]: { ...levelData, [field]: value } }
    };
    setConfig({...config, data: newConfigData});
    saveToFirebase(level, activeSymptom, newConfigData);
  };

  const sendThank = async (msg) => {
    if (!partnerId) return alert("連携相手がいません");
    await setDoc(doc(db, "users", partnerId), { lastThank: msg }, { merge: true });
  };

  if (isSetting) {
    return (
      <div style={{ padding: "20px", backgroundColor: colors.bg, minHeight: "100vh", fontFamily: "sans-serif" }}>
        <button onClick={() => setIsSetting(false)} style={{border:"none", background:"white", padding:"8px 15px", borderRadius:"10px", marginBottom:"20px", fontWeight:"bold"}}>◀ 戻る</button>
        
        <h2 style={{fontSize:"18px", color:colors.main, marginBottom:"15px"}}>⚙️ 症状別のお願い設定</h2>
        
        {/* 1. 症状を選ぶタブ */}
        <p style={{fontSize:"13px", fontWeight:"bold", marginBottom:"5px"}}>① 編集する症状を選択：</p>
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", overflowX: "auto", paddingBottom:"10px" }}>
          {config.symptoms.map(s => (
            <button key={s} onClick={() => setEditSymptom(s)} style={{ padding: "10px 20px", borderRadius: "20px", border: "none", background: editSymptom === s ? colors.main : "white", color: editSymptom === s ? "white" : colors.text, whiteSpace:"nowrap", fontWeight:"bold", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>{s}</button>
          ))}
        </div>

        {/* 2. レベルを選ぶボタン */}
        <p style={{fontSize:"13px", fontWeight:"bold", marginBottom:"5px"}}>② しんどさレベルを選択：</p>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", background:"white", padding:"10px", borderRadius:"15px" }}>
          {[0, 1, 2, 3, 4, 5].map(l => (
            <button key={l} onClick={() => setEditLevel(l)} style={{ width: "40px", height: "40px", borderRadius: "50%", border: "none", background: editLevel === l ? colors.main : colors.bg, color: editLevel === l ? "white" : colors.main, fontWeight: "bold" }}>{l}</button>
          ))}
        </div>

        {/* 3. お願いの内容（自由記述） */}
        <div style={{ background: "white", padding: "20px", borderRadius: "20px", boxShadow: `0 4px 15px ${colors.shadow}` }}>
          <p style={{fontWeight:"bold", fontSize:"15px", marginBottom:"15px", color:colors.main}}>✨ 【{editSymptom} × Lv.{editLevel}】の設定</p>
          
          <label style={{fontSize:"12px", fontWeight:"bold", display:"block", marginBottom:"5px"}}>🍼 してほしいこと（自由記述）</label>
          <textarea 
            value={config.data[editSymptom]?.[editLevel]?.requests || ""} 
            onChange={e => handleTextChange("requests", e.target.value)}
            style={{width:"100%", height:"80px", borderRadius:"12px", padding:"12px", border:"1px solid #eee", fontSize:"14px", marginBottom:"15px"}} 
            placeholder="例：ゼリー買ってきて、腰をさすって..." 
          />

          <label style={{fontSize:"12px", fontWeight:"bold", display:"block", marginBottom:"5px"}}>🚫 遠慮してほしいこと（自由記述）</label>
          <textarea 
            value={config.data[editSymptom]?.[editLevel]?.notToDo || ""} 
            onChange={e => handleTextChange("notToDo", e.target.value)}
            style={{width:"100%", height:"80px", borderRadius:"12px", padding:"12px", border:"1px solid #eee", fontSize:"14px"}} 
            placeholder="例：話しかけないで、溜まった家事に触れないで..." 
          />
        </div>

        <div style={{ marginTop:"30px", background: "white", padding: "15px", borderRadius: "15px" }}>
            <p style={{fontSize:"12px", marginBottom:"5px"}}>🔗 あなたの連携ID: <strong>{myId}</strong></p>
            <div style={{display:"flex", gap:"5px"}}>
                <input value={inputPartnerId} onChange={e => setInputPartnerId(e.target.value)} placeholder="相手のIDを入力" style={{flex:1, padding:"8px", borderRadius:"8px", border:"1px solid #ddd"}} />
                <button onClick={() => setDoc(doc(db, "users", myId), { partnerId: inputPartnerId }, { merge: true })} style={{background:colors.main, color:"white", border:"none", borderRadius:"8px", padding:"0 15px", fontWeight:"bold"}}>連携</button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "30px 20px", maxWidth: 450, margin: "0 auto", backgroundColor: colors.bg, minHeight: "100vh", fontFamily: "sans-serif" }}>
      {showThanks && (
        <div style={{ position:"fixed", top:"20px", left:"50%", transform:"translateX(-50%)", background:colors.main, color:"white", padding:"15px 25px", borderRadius:"30px", boxShadow:"0 10px 20px rgba(0,0,0,0.2)", zIndex:100, fontWeight:"bold" }}>🌸 {showThanks}</div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "900", color: colors.main, margin:0 }}>Yorisoi 🕊️</h1>
        <button onClick={() => setIsSetting(true)} style={{ background: "white", border: "none", width:"45px", height:"45px", borderRadius:"50%", boxShadow: `0 5px 15px ${colors.shadow}`, fontSize:"20px" }}>⚙️</button>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "25px", overflowX: "auto", paddingBottom:"10px" }}>
        {config.symptoms.map(s => (
          <button key={s} onClick={() => { setActiveSymptom(s); saveToFirebase(level, s); }} style={{ padding: "12px 20px", borderRadius: "25px", border: "none", background: activeSymptom === s ? colors.main : "white", color: activeSymptom === s ? "white" : colors.text, fontWeight: "bold", whiteSpace:"nowrap", fontSize:"14px", boxShadow: activeSymptom === s ? `0 8px 15px ${colors.shadow}` : "0 2px 5px rgba(0,0,0,0.05)" }}>{s}</button>
        ))}
      </div>

      <section style={{ background: "white", padding: "30px", borderRadius: "35px", boxShadow: `0 20px 40px ${colors.shadow}`, textAlign:"center" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
          {[0, 1, 2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => { setLevel(n); saveToFirebase(n, activeSymptom); }} style={{ width: "45px", height: "45px", borderRadius: "50%", border: "none", background: level === n ? colors.main : colors.bg, color: level === n ? "white" : colors.main, fontWeight: "bold", fontSize:"16px" }}>{n}</button>
          ))}
        </div>

        <div style={{ background: colors.bg, padding: "25px", borderRadius: "25px", marginBottom: "25px" }}>
            <div style={{fontSize:"13px", color:colors.main, fontWeight:"bold", marginBottom:"5px"}}>{activeSymptom} Lv.{level}</div>
            <div style={{ fontWeight: "900", fontSize:"22px" }}>
                {level === 0 ? "元気だよ😊" : level === 5 ? "限界…たすけて😭" : "しんどい状態😰"}
            </div>
        </div>

        <div style={{ textAlign: "left", fontSize: "15px", borderTop:`2px dashed ${colors.bg}`, paddingTop:"20px" }}>
          <div style={{marginBottom:"15px", lineHeight:"1.6"}}><strong>🍼 お願い:</strong> <br/>{config.data[activeSymptom]?.[level]?.requests || "（未設定）"}</div>
          <div style={{marginBottom:"25px", lineHeight:"1.6"}}><strong>🚫 遠慮:</strong> <br/>{config.data[activeSymptom]?.[level]?.notToDo || "（未設定）"}</div>
          
          <div style={{display:"flex", gap:"10px", justifyContent:"center"}}>
            <button onClick={() => sendThank("助かったよ！")} style={{flex:1, padding:"12px", borderRadius:"15px", border:`2px solid ${colors.main}`, background:"none", color:colors.main, fontSize:"13px", fontWeight:"bold"}}>🌸 感謝</button>
            <button onClick={() => sendThank("神対応！")} style={{flex:1, padding:"12px", borderRadius:"15px", border:`2px solid ${colors.main}`, background:"none", color:colors.main, fontSize:"13px", fontWeight:"bold"}}>✨ 神対応</button>
          </div>
        </div>
      </section>
    </div>
  );
}
