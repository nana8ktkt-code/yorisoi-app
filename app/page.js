"use client";
import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// 手順1で新しく発行された内容に書き換えてください！
const firebaseConfig = {
  apiKey: "AIzaSyC3S7sO5trehM1cNHOzo6cc49D8V4rXSqg",
  authDomain: "yorisoi-app-89ce7.firebaseapp.com",
  projectId: "yorisoi-app-89ce7",
  storageBucket: "yorisoi-app-89ce7.firebasestorage.app",
  messagingSenderId: "509189105205",
  appId: "ここに新しく発行されたappIdを貼る", 
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

  useEffect(() => {
    let id = localStorage.getItem("yorisoi_user_id") || Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem("yorisoi_user_id", id);
    setMyId(id);

    return onSnapshot(doc(db, "users", id), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d.configData) setConfig(prev => ({ ...prev, data: d.configData }));
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
      <div style={{ padding: "20px", background: "#F2F5FF", minHeight: "100vh" }}>
        <button onClick={() => setIsSetting(false)} style={{padding:"10px", marginBottom:"20px", borderRadius:"10px", border:"none", background:"#fff"}}>◀ 戻る</button>
        <div style={{ background: "#fff", padding: "20px", borderRadius: "20px" }}>
          <p style={{fontWeight:"bold", color:"#8E97FD"}}>① 編集する症状を選ぶ（ここがプルダウンです）</p>
          <select value={editSymptom} onChange={(e) => setEditSymptom(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "10px", marginBottom: "20px", border: "1px solid #ddd", fontSize: "16px" }}>
            {config.symptoms.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <p style={{fontWeight:"bold", color:"#8E97FD"}}>② レベルを選ぶ</p>
          <div style={{ display: "flex", gap: "5px", marginBottom: "20px" }}>
            {[0,1,2,3,4,5].map(l => (
              <button key={l} onClick={() => setEditLevel(l)} style={{ flex: 1, padding: "10px", background: editLevel === l ? "#8E97FD" : "#eee", color: editLevel === l ? "#fff" : "#4A4A4A", border:"none", borderRadius:"8px" }}>{l}</button>
            ))}
          </div>
          <textarea value={config.data[editSymptom]?.[editLevel]?.doing || ""} onChange={e => updateDetail("doing", e.target.value)} placeholder="いまの状態" style={{width:"100%", height:"60px", marginBottom:"10px", borderRadius:"8px", padding:"10px", border:"1px solid #ddd", boxSizing:"border-box"}} />
          <textarea value={config.data[editSymptom]?.[editLevel]?.requests || ""} onChange={e => updateDetail("requests", e.target.value)} placeholder="お願い" style={{width:"100%", height:"60px", borderRadius:"8px", padding:"10px", border:"1px solid #ddd", boxSizing:"border-box"}} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", background: "#F2F5FF", minHeight: "100vh", textAlign: "center" }}>
      <div style={{display:"flex", justifyContent:"space-between", marginBottom:"20px"}}>
        <h2 style={{color:"#8E97FD"}}>Yorisoi🕊️</h2>
        <button style={{border:"none", background:"#fff", width:"40px", height:"40px", borderRadius:"50%"}} onClick={() => setIsSetting(true)}>⚙️</button>
      </div>
      <p>⚙️ボタンを押して設定を開いてください</p>
    </div>
  );
}
