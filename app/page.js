"use client";
import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// あなたのFirebase設定（正確に反映済み）
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
  const [isSetting, setIsSetting] = useState(false);
  const [data, setData] = useState({});
  const userId = "main_user"; 

  useEffect(() => {
    return onSnapshot(doc(db, "users", userId), (s) => {
      if (s.exists()) setData(s.data().config || {});
    });
  }, []);

  const save = async (newData) => {
    await setDoc(doc(db, "users", userId), { config: newData }, { merge: true });
  };

  const addTag = (lv, field) => {
    const text = window.prompt(field === "doing" ? "今の状態を追加" : "お願いを追加");
    if (!text) return;
    const newData = { ...data };
    if (!newData[lv]) newData[lv] = { doing: [], requests: [] };
    if (!Array.isArray(newData[lv][field])) newData[lv][field] = [];
    newData[lv][field].push(text);
    setData(newData);
    save(newData);
  };

  // --- 設定画面 ---
  if (isSetting) {
    return (
      <div style={{ padding: "20px", background: "#f8f9fa", minHeight: "100vh", fontFamily: "sans-serif" }}>
        <button onClick={() => setIsSetting(false)} style={{marginBottom:"20px", padding:"10px", borderRadius:"10px", border:"1px solid #ccc"}}>◀ 戻る</button>
        <h2 style={{fontSize:"18px", marginBottom:"20px"}}>詳細設定（レベル別）</h2>
        {[0, 1, 2, 3, 4, 5].map(lv => (
          <div key={lv} style={{ background: "#fff", padding: "15px", borderRadius: "15px", marginBottom: "15px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
            <h3 style={{color:"#8E97FD"}}>レベル {lv}</h3>
            <div style={{marginBottom:"10px"}}>
              <p style={{fontSize:"12px", color:"#666"}}>👟 状態</p>
              <button onClick={() => addTag(lv, "doing")} style={{fontSize:"12px", border:"1px dashed #8E97FD", color:"#8E97FD", background:"none", padding:"4px 8px", borderRadius:"10px"}}>＋追加</button>
              <div style={{display:"flex", flexWrap:"wrap", gap:"5px", marginTop:"5px"}}>
                {(data[lv]?.doing || []).map((t, i) => <span key={i} style={{background:"#E0E7FF", padding:"4px 10px", borderRadius:"10px", fontSize:"13px"}}>{t}</span>)}
              </div>
            </div>
            <div>
              <p style={{fontSize:"12px", color:"#666"}}>🍼 お願い</p>
              <button onClick={() => addTag(lv, "requests")} style={{fontSize:"12px", border:"1px dashed #ff8e8e", color:"#ff8e8e", background:"none", padding:"4px 8px", borderRadius:"10px"}}>＋追加</button>
              <div style={{display:"flex", flexWrap:"wrap", gap:"5px", marginTop:"5px"}}>
                {(data[lv]?.requests || []).map((t, i) => <span key={i} style={{background:"#fff0f0", padding:"4px 10px", borderRadius:"10px", fontSize:"13px"}}>{t}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // --- メイン表示画面 ---
  return (
    <div style={{ padding: "20px", background: "#F2F5FF", minHeight: "100vh", fontFamily: "sans-serif", textAlign: "center" }}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px"}}>
        <h1 style={{color:"#8E97FD", margin:0, fontSize:"24px"}}>Yorisoi🕊️</h1>
        <button onClick={() => setIsSetting(true)} style={{background:"#fff", border:"none", borderRadius:"50%", width:"45px", height:"45px", boxShadow:"0 2px 5px rgba(0,0,0,0.1)"}}>⚙️</button>
      </div>
      
      <p style={{color:"#666"}}>今のつらさは？</p>
      <div style={{display:"flex", justifyContent:"space-between", marginBottom:"30px"}}>
        {[0, 1, 2, 3, 4, 5].map(n => (
          <button key={n} onClick={() => setLevel(n)} style={{width:"45px", height:"45px", borderRadius:"50%", border:"none", background:level === n ? "#8E97FD" : "#fff", color:level === n ? "#fff" : "#999", fontWeight:"bold", boxShadow:"0 2px 5px rgba(0,0,0,0.05)"}}>{n}</button>
        ))}
      </div>

      <div style={{background:"#fff", padding:"25px", borderRadius:"25px", textAlign:"left", boxShadow:"0 5px 15px rgba(0,0,0,0.05)"}}>
        <div style={{marginBottom:"20px"}}>
          <span style={{fontSize:"12px", background:"#8E97FD", color:"#fff", padding:"3px 10px", borderRadius:"10px"}}>今の状態</span>
          <div style={{marginTop:"10px", minHeight:"40px"}}>
            {(data[level]?.doing || []).map((t, i) => <div key={i} style={{margin:"5px 0", fontSize:"16px", color:"#444"}}>・{t}</div>)}
            {(!data[level]?.doing?.length) && <p style={{color:"#ccc", fontSize:"14px"}}>⚙️から設定してね</p>}
          </div>
        </div>
        <hr style={{border:"none", borderTop:"1px solid #eee", margin:"15px 0"}} />
        <div>
          <span style={{fontSize:"12px", background:"#FF8E8E", color:"#fff", padding:"3px 10px", borderRadius:"10px"}}>お願い</span>
          <div style={{marginTop:"10px", minHeight:"40px"}}>
            {(data[level]?.requests || []).map((t, i) => <div key={i} style={{margin:"5px 0", fontSize:"16px", color:"#444"}}>・{t}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
