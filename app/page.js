"use client";
import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// あなたのFirebase設定画面の内容をそのまま反映しました
const firebaseConfig = {
  apiKey: "AIzaSyC3S7sO5trehM1cNHOzo6cc49D8V4rXSqg",
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
  const [editSymptom, setEditSymptom] = useState("生理痛");
  const [editLevel, setEditLevel] = useState(0);
  const [config, setConfig] = useState({ 
    symptoms: ["生理痛", "つわり", "PMS", "頭痛", "だるい", "腹痛"], 
    data: {} 
  });

  const colors = { main: "#8E97FD", bg: "#F2F5FF", text: "#4A4A4A", shadow: "rgba(142, 151, 253, 0.2)" };

  useEffect(() => {
    // ユーザーIDの設定
    let id = localStorage.getItem("yorisoi_user_id") || Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem("yorisoi_user_id", id);
    setMyId(id);

    // データのリアルタイム読み込み
    return onSnapshot(doc(db, "users", id), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d.configData) setConfig(prev => ({ ...prev, data: d.configData }));
      }
    });
  }, []);

  const saveToFirebase = async (newData) => {
    try {
      await setDoc(doc(db, "users", myId), { configData: newData }, { merge: true });
    } catch (e) {
      console.error("保存失敗:", e);
    }
  };

  const updateDetail = (field, value) => {
    const newData = { ...config.data };
    if (!newData[editSymptom]) newData[editSymptom] = {};
    if (!newData[editSymptom][editLevel]) newData[editSymptom][editLevel] = {};
    newData[editSymptom][editLevel][field] = value;
    setConfig({ ...config, data: newData });
    saveToFirebase(newData);
  };

  if (isSetting) {
    return (
      <div style={{ padding: "20px", backgroundColor: colors.bg, minHeight: "100vh", fontFamily: "sans-serif" }}>
        <button onClick={() => setIsSetting(false)} style={{padding:"10px 20px", borderRadius:"10px", border:"none", background:"#fff", fontWeight:"bold", marginBottom:"20px", boxShadow:`0 4px 10px ${colors.shadow}`}}>◀ 戻る</button>
        
        <div style={{ background: "#fff", padding: "25px", borderRadius: "25px", boxShadow: `0 10px 20px ${colors.shadow}` }}>
          <h2 style={{fontSize:"18px", color:colors.main, marginBottom:"20px", marginTop:0}}>⚙️ 詳細設定</h2>
          
          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "13px", fontWeight: "bold", display: "block", marginBottom: "8px", color: colors.main }}>① 編集する症状を選ぶ</label>
            <select 
              value={editSymptom} 
              onChange={(e) => setEditSymptom(e.target.value)} 
              style={{ width: "100%", padding: "12px", borderRadius: "10px", border: `2px solid ${colors.bg}`, fontSize: "16px", backgroundColor:"#fff" }}
            >
              {config.symptoms.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: "25px" }}>
            <label style={{ fontSize: "13px", fontWeight: "bold", display: "block", marginBottom: "8px", color: colors.main }}>② レベルを選ぶ</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {[0,1,2,3,4,5].map(l => (
                <button key={l} onClick={() => setEditLevel(l)} style={{ flex: 1, height: "40px", borderRadius: "10px", border: "none", background: editLevel === l ? colors.main : colors.bg, color: editLevel === l ? "#fff" : colors.main, fontWeight: "bold" }}>{l}</button>
              ))}
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${colors.bg}`, paddingTop: "20px" }}>
            <p style={{fontSize:"14px", fontWeight:"bold", textAlign:"center", marginBottom:"15px"}}>【{editSymptom} Lv.{editLevel}】</p>
            <textarea value={config.data[editSymptom]?.[editLevel]?.doing || ""} onChange={e => updateDetail("doing", e.target.value)} placeholder="いまの状態（例：横になってる）" style={{width:"100%", height:"60px", marginBottom:"15px", borderRadius:"10px", padding:"10px", border:"1px solid #ddd", boxSizing:"border-box"}} />
            <textarea value={config.data[editSymptom]?.[editLevel]?.requests || ""} onChange={e => updateDetail("requests", e.target.value)} placeholder="お願い（例：水買ってきて）" style={{width:"100%", height:"60px", borderRadius:"10px", padding:"10px", border:"1px solid #ddd", boxSizing:"border-box"}} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "30px 20px", backgroundColor: colors.bg, minHeight: "100vh", fontFamily: "sans-serif", textAlign: "center" }}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"25px"}}>
        <h1 style={{color:colors.main, margin:0, fontSize:"24px"}}>Yorisoi 🕊️</h1>
        <button onClick={() => setIsSetting(true)} style={{border:"none", background:"#fff", width:"45px", height:"45px", borderRadius:"50%", boxShadow:`0 5px 15px ${colors.shadow}`, fontSize:"20px"}}>⚙️</button>
      </div>

      <div style={{display:"flex", gap:"10px", overflowX:"auto", marginBottom:"25px", paddingBottom:"5px"}}>
        {config.symptoms.map(s => (
          <button key={s} onClick={() => setActiveSymptom(s)} style={{padding:"12px 22px", borderRadius:"25px", border:"none", background:activeSymptom === s ? colors.main : "#fff", color:activeSymptom === s ? "#fff" : colors.text, whiteSpace:"nowrap", fontWeight:"bold"}}>{s}</button>
        ))}
      </div>

      <div style={{background:"#fff", padding:"35px 25px", borderRadius:"35px", boxShadow:`0 15px 30px ${colors.shadow}`}}>
        <div style={{display:"flex", justifyContent:"space-between", marginBottom:"30px"}}>
          {[0,1,2,3,4,5].map(n => <button key={n} onClick={() => setLevel(n)} style={{width:"40px", height:"40px", borderRadius:"50%", border:"none", background:level === n ? colors.main : colors.bg, color:level === n ? "#fff" : colors.main, fontWeight:"bold"}}>{n}</button>)}
        </div>
        <div style={{textAlign:"left", background:colors.bg, padding:"20px", borderRadius:"20px", fontSize:"15px"}}>
          <div style={{marginBottom:"10px"}}><strong>👟 状態:</strong><br/>{config.data[activeSymptom]?.[level]?.doing || "⚙️から設定してね"}</div>
          <div><strong>🍼 お願い:</strong><br/>{config.data[activeSymptom]?.[level]?.requests || "未設定"}</div>
        </div>
      </div>
    </div>
  );
}
