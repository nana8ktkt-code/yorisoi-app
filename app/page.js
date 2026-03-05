import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// --- Firebase設定 ---
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
  const [activeSymptom, setActiveSymptom] = useState("生理痛"); // メイン画面で選択中の症状タブ
  const [isSetting, setIsSetting] = useState(false);
  const [myId, setMyId] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [inputPartnerId, setInputPartnerId] = useState("");
  const [isLinked, setIsLinked] = useState(false);
  const [showThanks, setShowThanks] = useState("");

  // 設定用：今編集しているタブ
  const [editSymptom, setEditSymptom] = useState("生理痛");
  const [editLevel, setEditLevel] = useState(0);

  // --- 症状ごとのレベル別データを管理する構造 ---
  const [config, setConfig] = useState({
    symptoms: ["生理痛", "頭痛", "腹痛", "だるい", "吐き気", "めまい"],
    // データ構造: { "生理痛": { 0: {requests: "", notToDo: ""}, 1: {...} }, "頭痛": {...} }
    data: {} 
  });

  const suggestions = {
    requests: [
      { cat: "🧼 家事", items: ["洗い物", "洗濯物", "ゴミ出し", "お風呂を沸かす"] },
      { cat: "🍱 食事", items: ["ゼリー飲料", "アイス", "温かい飲み物", "消化にいいもの"] },
      { cat: "🌡️ ケア", items: ["湯たんぽ", "部屋を暗く", "静かにして", "腰をさすって"] }
    ],
    notToDo: ["溜まった家事に触れないで", "今は話しかけないで", "大きな音NG", "匂いNG"]
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

  const toggleText = (field, value) => {
    const symptomData = config.data[editSymptom] || {};
    const levelData = symptomData[editLevel] || { requests: "", notToDo: "" };
    const currentText = levelData[field] || "";

    let newText = currentText.includes(value) 
      ? currentText.replace(value, "").replace(/、$/, "").replace(/^、/, "").replace(/、、/g, "、").trim()
      : currentText ? `${currentText}、${value}` : value;

    const newConfigData = {
      ...config.data,
      [editSymptom]: { ...symptomData, [editLevel]: { ...levelData, [field]: newText } }
    };
    setConfig({...config, data: newConfigData});
    saveToFirebase(level, activeSymptom, newConfigData);
  };

  const sendThank = async (msg) => {
    if (!partnerId) return alert("連携相手がいません");
    await setDoc(doc(db, "users", partnerId), { lastThank: msg }, { merge: true });
  };

  // 表示用データの取得
  const displayRequests = config.data[activeSymptom]?.[level]?.requests || "特になし";
  const displayNotToDo = config.data[activeSymptom]?.[level]?.notToDo || "特になし";

  if (isSetting) {
    return (
      <div style={{ padding: "20px", backgroundColor: colors.bg, minHeight: "100vh", fontFamily: "sans-serif" }}>
        <button onClick={() => setIsSetting(false)} style={{border:"none", background:"none", fontSize:"16px", marginBottom:"20px"}}>◀ 戻る</button>
        
        <h2 style={{fontSize:"18px", color:colors.main}}>🔗 連携コード: {myId}</h2>
        <div style={{ background: "white", padding: "10px", borderRadius: "10px", marginBottom: "20px", display:"flex", gap:"5px" }}>
            <input value={inputPartnerId} onChange={e => setInputPartnerId(e.target.value)} placeholder="相手のID" style={{flex:1, padding:"8px", borderRadius:"8px", border:"1px solid #ddd"}} />
            <button onClick={() => setDoc(doc(db, "users", myId), { partnerId: inputPartnerId }, { merge: true })} style={{background:colors.main, color:"white", border:"none", borderRadius:"8px", padding:"0 15px"}}>連携</button>
        </div>

        <h2 style={{fontSize:"18px", color:colors.main}}>⚙️ 症状別のお願い設定</h2>
        {/* 症状タブ選択 */}
        <div style={{ display: "flex", gap: "5px", marginBottom: "10px", overflowX: "auto", paddingBottom:"5px" }}>
          {config.symptoms.map(s => (
            <button key={s} onClick={() => setEditSymptom(s)} style={{ padding: "8px 15px", borderRadius: "20px", border: "none", background: editSymptom === s ? colors.main : "white", color: editSymptom === s ? "white" : colors.text, whiteSpace:"nowrap", fontSize:"12px" }}>{s}</button>
          ))}
        </div>

        {/* レベル選択 */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
          {[0, 1, 2, 3, 4, 5].map(l => (
            <button key={l} onClick={() => setEditLevel(l)} style={{ width: "35px", height: "35px", borderRadius: "50%", border: "none", background: editLevel === l ? colors.main : "white", color: editLevel === l ? "white" : colors.text, fontSize:"12px" }}>{l}</button>
          ))}
        </div>

        <div style={{ background: "white", padding: "15px", borderRadius: "15px" }}>
          <p style={{fontWeight:"bold", fontSize:"14px", marginBottom:"10px"}}>{editSymptom} Lv.{editLevel} の設定</p>
          {suggestions.requests.map(cat => (
            <div key={cat.cat} style={{marginBottom:"10px"}}>
              <div style={{fontSize:"10px", color:colors.main}}>{cat.cat}</div>
              <div style={{display:"flex", flexWrap:"wrap", gap:"4px"}}>
                {cat.items.map(s => (
                  <button key={s} onClick={() => toggleText("requests", s)} style={{fontSize:"10px", padding:"4px 8px", borderRadius:"15px", border:"1px solid #eee", background: config.data[editSymptom]?.[editLevel]?.requests?.includes(s) ? colors.main : "white", color: config.data[editSymptom]?.[editLevel]?.requests?.includes(s) ? "white" : colors.text}}>{s}</button>
                ))}
              </div>
            </div>
          ))}
          <p style={{fontSize:"10px", color:colors.main, marginTop:"10px"}}>🚫 遠慮してほしいこと</p>
          <div style={{display:"flex", flexWrap:"wrap", gap:"4px", marginBottom:"10px"}}>
            {suggestions.notToDo.map(s => (
              <button key={s} onClick={() => toggleText("notToDo", s)} style={{fontSize:"10px", padding:"4px 8px", borderRadius:"15px", border:"1px solid #eee", background: config.data[editSymptom]?.[editLevel]?.notToDo?.includes(s) ? colors.main : "white", color: config.data[editSymptom]?.[editLevel]?.notToDo?.includes(s) ? "white" : colors.text}}>{s}</button>
            ))}
          </div>
          <textarea 
            value={config.data[editSymptom]?.[editLevel]?.requests || ""} 
            onChange={e => {
                const newD = {...config.data, [editSymptom]: {...config.data[editSymptom], [editLevel]: {...(config.data[editSymptom]?.[editLevel] || {}), requests: e.target.value}}};
                setConfig({...config, data: newD});
                saveToFirebase(level, activeSymptom, newD);
            }} 
            style={{width:"100%", height:"60px", borderRadius:"10px", padding:"10px", border:"1px solid #eee", fontSize:"12px"}} 
            placeholder="自由記述..." 
          />
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
        <h1 style={{ fontSize: "22px", fontWeight: "800", color: colors.main }}>Yorisoi 🕊️</h1>
        <button onClick={() => setIsSetting(true)} style={{ background: "white", border: "none", width:"40px", height:"40px", borderRadius:"50%", boxShadow: `0 4px 10px ${colors.shadow}` }}>⚙️</button>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", overflowX: "auto", paddingBottom:"5px" }}>
        {config.symptoms.map(s => (
          <button key={s} onClick={() => { setActiveSymptom(s); saveToFirebase(level, s); }} style={{ padding: "10px 18px", borderRadius: "20px", border: "none", background: activeSymptom === s ? colors.main : "white", color: activeSymptom === s ? "white" : colors.text, fontWeight: "bold", whiteSpace:"nowrap", fontSize:"13px", boxShadow: activeSymptom === s ? `0 4px 10px ${colors.shadow}` : "none" }}>{s}</button>
        ))}
      </div>

      <section style={{ background: "white", padding: "25px", borderRadius: "30px", boxShadow: `0 10px 30px ${colors.shadow}`, textAlign:"center" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "25px" }}>
          {[0, 1, 2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => { setLevel(n); saveToFirebase(n, activeSymptom); }} style={{ width: "40px", height: "40px", borderRadius: "50%", border: "none", background: level === n ? colors.main : colors.bg, color: level === n ? "white" : colors.main, fontWeight: "bold" }}>{n}</button>
          ))}
        </div>

        <div style={{ background: colors.bg, padding: "20px", borderRadius: "20px", marginBottom: "20px" }}>
            <div style={{fontSize:"14px", color:colors.main, fontWeight:"bold", marginBottom:"5px"}}>{activeSymptom} レベル {level}</div>
            <div style={{ fontWeight: "bold", fontSize:"18px" }}>
                {level === 0 ? "元気だよ😊" : level === 5 ? "限界…たすけて😭" : "しんどい状態😰"}
            </div>
        </div>

        <div style={{ textAlign: "left", fontSize: "14px", borderTop:`1px dashed ${colors.main}`, paddingTop:"15px" }}>
          <div style={{marginBottom:"10px"}}><strong>🍼 お願い:</strong> {displayRequests}</div>
          <div style={{marginBottom:"15px"}}><strong>🚫 遠慮:</strong> {displayNotToDo}</div>
          
          <div style={{display:"flex", gap:"8px", justifyContent:"center"}}>
            <button onClick={() => sendThank("助かったよ！")} style={{padding:"8px 15px", borderRadius:"20px", border:`1px solid ${colors.main}`, background:"none", color:colors.main, fontSize:"12px", fontWeight:"bold"}}>🌸 感謝</button>
            <button onClick={() => sendThank("神対応！")} style={{padding:"8px 15px", borderRadius:"20px", border:`1px solid ${colors.main}`, background:"none", color:colors.main, fontSize:"12px", fontWeight:"bold"}}>✨ 神対応</button>
          </div>
        </div>
      </section>
    </div>
  );
}
