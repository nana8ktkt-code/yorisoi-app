"use client";
import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// あなたのFirebase設定を反映済み
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
        if (d.configData) setConfig(prev => ({...prev, data: d.configData}));
      }
    });
  }, []);

  const saveToFirebase = async (newData) => {
    try {
      await setDoc(doc(db, "users", myId), { configData: newData }, { merge: true });
    } catch (e) { console.error("Firebase Save Error:", e); }
  };

  const addTag = (lv, field) => {
    const text = window.prompt(field === "doing" ? "今の状態（例：横になりたい）を追加" : "お願い（例：洗い物してほしい）を追加");
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
    if(!window.confirm("この項目を削除しますか？")) return;
    const newData = { ...config.data };
    newData[activeSymptom][lv][field].splice(index, 1);
    setConfig({ ...config, data: newData });
    saveToFirebase(newData);
  };

  if (isSetting) {
    return (
      <div style={{ padding: "20px", background: "#F9FAFB", minHeight: "100vh", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
          <button onClick={() => setIsSetting(false)} style={{ padding: "10px", background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>◀</button>
          <h2 style={{ margin: 0, fontSize: "18px", flex: 1, textAlign: "center" }}>{activeSymptom} の詳細設定</h2>
        </div>

        {[0, 1, 2, 3, 4, 5].map(lv => (
          <div key={lv} style={{ background: "#fff", padding: "15px", borderRadius: "16px", marginBottom: "15px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 12px 0", color: "#8E97FD" }}>Lv.{lv}</h3>
            
            <div style={{ marginBottom: "15px" }}>
              <p style={{ fontSize: "12px", color: "#999", marginBottom: "8px" }}>👟 いまの状態</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {(config.data[activeSymptom]?.[lv]?.doing || []).map((t, i) => (
                  <span key={i} onClick={() => removeTag(lv, "doing", i)} style={{ background: "#E0E7FF", color: "#4338CA", padding: "6px 12px", borderRadius: "20px", fontSize: "13px" }}>{t} ✕</span>
                ))}
                <button onClick={() => addTag(lv, "doing")} style={{ border: "1px dashed #8E97FD", color: "#8E97FD", background: "none", padding: "6px 12px", borderRadius: "20px", fontSize: "13px" }}>＋追加</button>
              </div>
            </div>

            <div>
              <p style={{ fontSize: "12px", color: "#999", marginBottom: "8px" }}>🍼 おねがい</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {(config.data[activeSymptom]?.[lv]?.requests || []).map((t, i) => (
                  <span key={i} onClick={() => removeTag(lv, "requests", i)} style={{ background: "#FEE2E2", color: "#B91C1C", padding: "6px 12px", borderRadius: "20px", fontSize: "13px" }}>{t} ✕</span>
                ))}
                <button onClick={() => addTag(lv, "requests")} style={{ border: "1px dashed #FF8E8E", color: "#FF8E8E", background: "none", padding: "6px 12px", borderRadius: "20px", fontSize: "13px" }}>＋追加</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", background: "#F2F5FF", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ color: "#8E97FD", fontSize: "24px", margin: 0 }}>Yorisoi🕊️</h1>
        <button onClick={() => setIsSetting(true)} style={{ background: "#fff", border: "none", width: "45px", height: "45px", borderRadius: "50%", boxShadow: "0 2px 6px rgba(0,0,0,0.1)", fontSize: "20px" }}>⚙️</button>
      </header>

      <nav style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "10px", marginBottom: "20px" }}>
        {config.symptoms.map(s => (
          <button key={s} onClick={() => setActiveSymptom(s)} style={{ padding: "10px 20px", borderRadius: "25px", border: "none", background: activeSymptom === s ? "#8E97FD" : "#fff", color: activeSymptom === s ? "#fff" : "#666", fontWeight: "bold", whiteSpace: "nowrap", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>{s}</button>
        ))}
      </nav>

      <main style={{ background: "#fff", padding: "25px", borderRadius: "30px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
        <p style={{ color: "#666", marginBottom: "15px" }}>今のつらさは？</p>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
          {[0, 1, 2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => setLevel(n)} style={{ width: "45px", height: "45px", borderRadius: "50%", border: "none", background: level === n ? "#8E97FD" : "#F3F4F6", color: level === n ? "#fff" : "#9CA3AF", fontWeight: "bold", transition: "0.2s" }}>{n}</button>
          ))}
        </div>

        <div style={{ textAlign: "left", background: "#F9FAFB", padding: "20px", borderRadius: "20px" }}>
          <div style={{ marginBottom: "20px" }}>
            <span style={{ fontSize: "12px", background: "#8E97FD", color: "#fff", padding: "3px 10px", borderRadius: "10px" }}>今の状態</span>
            <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {(config.data[activeSymptom]?.[level]?.doing || []).map((t, i) => (
                <span key={i} style={{ background: "#fff", border: "1px solid #E0E7FF", padding: "6px 12px", borderRadius: "15px", fontSize: "14px", color: "#4338CA" }}>{t}</span>
              ))}
              {(!config.data[activeSymptom]?.[level]?.doing?.length) && <span style={{ color: "#9CA3AF", fontSize: "14px" }}>⚙️から設定してね</span>}
            </div>
          </div>
          <div>
            <span style={{ fontSize: "12px", background: "#FF8E8E", color: "#fff", padding: "3px 10px", borderRadius: "10px" }}>お願い</span>
            <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {(config.data[activeSymptom]?.[level]?.requests || []).map((t, i) => (
                <span key={i} style={{ background: "#fff", border: "1px solid #FEE2E2", padding: "6px 12px", borderRadius: "15px", fontSize: "14px", color: "#B91C1C" }}>{t}</span>
              ))}
              {(!config.data[activeSymptom]?.[level]?.requests?.length) && <span style={{ color: "#9CA3AF", fontSize: "14px" }}>未設定</span>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
