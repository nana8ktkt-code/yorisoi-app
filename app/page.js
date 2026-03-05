"use client";
import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// あなたの18:09のスクショの数値を反映済みです
const firebaseConfig = {
  apiKey: "AIzaSyC3S7sO5trehM1cNHOzo6cc49D8V4rXSqg",
  authDomain: "yorisoi-app-89ce7.firebaseapp.com",
  projectId: "yorisoi-app-89ce7",
  storageBucket: "yorisoi-app-89ce7.firebasestorage.app",
  messagingSenderId: "509189105205",
  appId: "1:509189105205:web:abeedf0458e0a811904731",
  measurementId: "G-CXVZST5T5R"
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
  const [config, setConfig] = useState({ symptoms: ["生理痛", "つわり", "PMS", "頭痛", "だるい", "腹痛"], data: {} });

  useEffect(() => {
    let id = localStorage.getItem("yorisoi_user_id") || Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem("yorisoi_user_id", id);
    setMyId(id);
    return onSnapshot(doc(db, "users", id), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d.configData) setConfig(prev => ({...prev, data: d.configData}));
      }
    });
  }, []);

  const saveToFirebase = async (newData) => {
    await setDoc(doc(db, "users", myId), { configData: newData }, { merge: true });
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
      <div style={{ padding: "20px", background: "#F2F5FF", minHeight: "100vh", fontFamily: "sans-serif" }}>
        <button onClick={() => setIsSetting(false)} style={{padding:"10px 15px", borderRadius:"10px", border:"none", background:"#fff", fontWeight:"bold", marginBottom:"20px"}}>◀ 戻る</button>
        <div style={{ background: "#fff", padding: "20px", borderRadius: "20px" }}>
          <p style={{fontSize:"12px", fontWeight:"bold", color:"#8E97FD"}}>① 症状を選ぶ</p>
          <select value={editSymptom} onChange={(e) => setEditSymptom(e.target.value)} style={{ width: "100%", padding: "10px", marginBottom: "20px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "16px" }}>
            {config.symptoms.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <p style={{fontSize:"12px", fontWeight:"bold", color:"#8E97FD"}}>② レベルを選ぶ</p>
          <div style={{ display: "flex", gap: "5px", marginBottom: "20px" }}>
            {[0,1,2,3,4,5].map(l => (
              <button key={l} onClick={() => setEditLevel(l)} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: editLevel === l ? "#8E97FD" : "#fff", color: editLevel === l ? "#fff" : "#8E97FD", border: "1px solid #8E97FD", fontWeight: "bold" }}>{l}</button>
            ))}
          </div>
          <textarea value={config.data[editSymptom]?.[editLevel]?.doing || ""} onChange={e => updateDetail("doing", e.target.value)} placeholder="いまの状態" style={{width:"100%", height:"60px", marginBottom:"10px", borderRadius:"8px", padding:"10px", border:"1px solid #ddd", boxSizing:"border-box"}} />
          <textarea value={config.data[editSymptom]?.[editLevel]?.requests || ""} onChange={e => updateDetail("requests", e.target.value)} placeholder="お願い" style={{width:"100%", height:"60px", borderRadius:"8px", padding:"10px", border:"1px solid #ddd", boxSizing:"border-box"}} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "30px 20px", background: "#F2F5FF", minHeight: "100vh", textAlign: "center", fontFamily: "sans-serif" }}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px"}}>
        <h2 style={{color:"#8E97FD", margin:0}}>Yorisoi🕊️</h2>
        <button onClick={() => setIsSetting(true)} style={{fontSize:"20px", background:"#fff", border:"none", borderRadius:"50%", width:"45px", height:"45px", boxShadow:"0 2px 5px rgba(0,0,0,0.1)"}}>⚙️</button>
      </div>
      <div style={{display:"flex", gap:"10px", overflowX:"auto", marginBottom:"20px", paddingBottom:"10px"}}>
        {config.symptoms.map(s => (
          <button key={s} onClick={() => setActiveSymptom(s)} style={{padding:"10px 20px", borderRadius:"20px", border:"none", background:activeSymptom === s ? "#8E97FD" : "#fff", color:activeSymptom === s ? "#fff" : "#4A4A4A", fontWeight:"bold", whiteSpace:"nowrap", boxShadow:"0 2px 5px rgba(0,0,0,0.05)"}}>{s}</button>
        ))}
      </div>
      <div style={{background:"#fff", padding:"30px", borderRadius:"30px", boxShadow:"0 10px 20px rgba(0,0,0,0.05)"}}>
        <div style={{display:"flex", justifyContent:"space-around", marginBottom:"20px"}}>
          {[0,1,2,3,4,5].map(n => <button key={n} onClick={() => setLevel(n)} style={{width:"40px", height:"40px", borderRadius:"50%", border:"none", background:level === n ? "#8E97FD" : "#F2F5FF", color:level === n ? "#fff" : "#8E97FD", fontWeight:"bold"}}>{n}</button>)}
        </div>
        <div style={{textAlign:"left", background:"#F2F5FF", padding:"20px", borderRadius:"15px"}}>
          <p><strong>👟 状態:</strong><br/>{config.data[activeSymptom]?.[level]?.doing || "⚙️から設定してね"}</p>
          <p><strong>🍼 お願い:</strong><br/>{config.data[activeSymptom]?.[level]?.requests || "未設定"}</p>
        </div>
      </div>
    </div>
  );
}

