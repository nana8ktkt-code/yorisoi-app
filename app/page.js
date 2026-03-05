"use client";
import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// あなたの最新設定 (20:12のスクショから正確に写しました)
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

  const addTag = (lv, field) => {
    const text = window.prompt("追加したい内容を入力してください");
    if (!text) return;
    const newData = { ...config.data };
    if (!newData[activeSymptom]) newData[activeSymptom] = {};
    if (!newData[activeSymptom][lv]) newData[activeSymptom][lv] = { doing: [], requests: [] };
    if (!Array.isArray(newData[activeSymptom][lv][field])) newData[activeSymptom][lv][field] = [];
    
    newData[activeSymptom][lv][field].push(text);
    setConfig({ ...config, data: newData });
    saveToFirebase(newData);
  };

  const removeTag = (lv, field, index) => {
    const newData = { ...config.data };
    newData[activeSymptom][lv][field].splice(index, 1);
    setConfig({ ...config, data: newData });
    saveToFirebase(newData);
  };

  if (isSetting) {
    return (
      <div style={{ padding: "20px", background: "#f8f9fa", minHeight: "100vh", fontFamily: "sans-serif" }}>
        <button onClick={() => setIsSetting(false)} style={{padding:"10px 20px", borderRadius:"10px", border:"none", background:"#fff", fontWeight:"bold", marginBottom:"20px", boxShadow:"0 2px 5px rgba(0,0,0,0.1)"}}>◀ 戻る</button>
        <h2 style={{fontSize:"18px", color:"#333", marginBottom:"20px"}}>詳細設定: {activeSymptom}</h2>
        
        {[0, 1, 2, 3, 4, 5].map(lv => (
          <div key={lv} style={{ background: "#fff", padding: "15px", borderRadius: "15px", marginBottom: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "20px" }}>レベル {lv}</h3>
            
            <p style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>自分がしていること（背景：薄青）</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", background: "#eef6ff", padding: "10px", borderRadius: "10px", minHeight: "40px" }}>
              {(config.data[activeSymptom]?.[lv]?.doing || []).map((text, i) => (
                <span key={i} onClick={() => removeTag(lv, "doing", i)} style={{ background: "#fff", padding: "5px 12px", borderRadius: "20px", border: "1px solid #8E97FD", fontSize: "14px" }}>{text} ✕</span>
              ))}
              <button onClick={() => addTag(lv, "doing")} style={{ background: "#8E97FD", color: "#fff", border: "none", borderRadius: "20px", padding: "5px 15px", fontSize: "14px" }}>＋追加</button>
            </div>

            <p style={{ fontSize: "12px", color: "#666", marginTop: "15px", marginBottom: "5px" }}>してほしいこと（背景：薄赤）</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", background: "#fff0f0", padding: "10px", borderRadius: "10px", minHeight: "40px" }}>
              {(config.data[activeSymptom]?.[lv]?.requests || []).map((text, i) => (
                <span key={i} onClick={() => removeTag(lv, "requests", i)} style={{ background: "#fff", padding: "5px 12px", borderRadius: "20px", border: "1px solid #ff8e8e", fontSize: "14px" }}>{text} ✕</span>
              ))}
              <button onClick={() => addTag(lv, "requests")} style={{ background: "#ff8e8e", color: "#fff", border: "none", borderRadius: "20px", padding: "5px 15px", fontSize: "14px" }}>＋追加</button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", background: "#F2F5FF", minHeight: "100vh", textAlign: "center", fontFamily: "sans-serif" }}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px"}}>
        <h2 style={{color:"#8E97FD", margin:0}}>Yorisoi🕊️</h2>
        <button onClick={() => setIsSetting(true)} style={{background:"#fff", border:"none", borderRadius:"50%", width:"45px", height:"45px", boxShadow:"0 2px 5px rgba(0,0,0,0.1)"}}>⚙️</button>
      </div>
      <div style={{display:"flex", gap:"10px", overflowX:"auto", marginBottom:"20px", paddingBottom:"10px"}}>
        {config.symptoms.map(s => (
          <button key={s} onClick={() => setActiveSymptom(s)} style={{padding:"10px 20px", borderRadius:"20px", border:"none", background:activeSymptom === s ? "#8E97FD" : "#fff", color:activeSymptom === s ? "#fff" : "#4A4A4A", fontWeight:"bold", whiteSpace:"nowrap"}}>{s}</button>
        ))}
      </div>
      <div style={{background:"#fff", padding:"30px", borderRadius:"30px", boxShadow:"0 10px 20px rgba(0,0,0,0.05)"}}>
        <div style={{display:"flex", justifyContent:"space-around", marginBottom:"20px"}}>
          {[0,1,2,3,4,5].map(n => <button key={n} onClick={() => setLevel(n)} style={{width:"40px", height:"40px", borderRadius:"50%", border:"none", background:level === n ? "#8E97FD" : "#F2F5FF", color:level === n ? "#fff" : "#8E97FD", fontWeight:"bold"}}>{n}</button>)}
        </div>
        <div style={{textAlign:"left", background:"#F2F5FF", padding:"20px", borderRadius:"15px"}}>
          <p><strong>👟 状態:</strong></p>
          <div style={{display:"flex", flexWrap:"wrap", gap:"5px", marginBottom:"15px"}}>
            {(config.data[activeSymptom]?.[level]?.doing || []).map((t, i) => <span key={i} style={{background:"#fff", padding:"5px 12px", borderRadius:"15px", fontSize:"14px", border:"1px solid #8E97FD"}}>{t}</span>)}
          </div>
          <p><strong>🍼 お願い:</strong></p>
          <div style={{display:"flex", flexWrap:"wrap", gap:"5px"}}>
            {(config.data[activeSymptom]?.[level]?.requests || []).map((t, i) => <span key={i} style={{background:"#fff", padding:"5px 12px", borderRadius:"15px", fontSize:"14px", border:"1px solid #ff8e8e"}}>{t}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}
