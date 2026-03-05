"use client";
import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// Firebaseの設定（あなたの画像から正確に写しました）
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
  const userId = "main_user"; // 固定のIDでまずは確実に動かします

  useEffect(() => {
    return onSnapshot(doc(db, "users", userId), (s) => {
      if (s.exists()) setData(s.data().config || {});
    });
  }, []);

  const save = async (newData) => {
    await setDoc(doc(db, "users", userId), { config: newData });
  };

  const addTag = (lv, field) => {
    const text = window.prompt("内容を入力してください");
    if (!text) return;
    const newData = { ...data };
    if (!newData[lv]) newData[lv] = { doing: [], requests: [] };
    newData[lv][field] = [...(newData[lv][field] || []), text];
    setData(newData);
    save(newData);
  };

  if (isSetting) {
    return (
      <div style={{ padding: "20px", background: "#F2F5FF", minHeight: "100vh" }}>
        <button onClick={() => setIsSetting(false)}>◀ 戻る</button>
        <h2>⚙️ レベル別の詳細設定</h2>
        {[0, 1, 2, 3, 4, 5].map(lv => (
          <div key={lv} style={{ background: "#fff", padding: "15px", borderRadius: "15px", marginBottom: "15px" }}>
            <h3>レベル {lv}</h3>
            <p>👟 いま、やっていること</p>
            <button onClick={() => addTag(lv, "doing")}>＋追加</button>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "5px" }}>
              {(data[lv]?.doing || []).map((t, i) => <span key={i} style={{ background: "#E0E7FF", padding: "5px 10px", borderRadius: "10px" }}>{t}</span>)}
            </div>
            <p>🍼 お願いしたいこと</p>
            <button onClick={() => addTag(lv, "requests")}>＋追加</button>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "5px" }}>
              {(data[lv]?.requests || []).map((t, i) => <span key={i} style={{ background: "#FEE2E2", padding: "5px 10px", borderRadius: "10px" }}>{t}</span>)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", textAlign: "center", background: "#F2F5FF", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Yorisoi🕊️</h1>
        <button onClick={() => setIsSetting(true)} style={{ fontSize: "24px", border: "none", background: "none" }}>⚙️</button>
      </div>
      <div style={{ display: "flex", justifyContent: "space-around", margin: "20px 0" }}>
        {[0, 1, 2, 3, 4, 5].map(n => (
          <button key={n} onClick={() => setLevel(n)} style={{ width: "40px", height: "40px", borderRadius: "50%", background: level === n ? "#8E97FD" : "#fff" }}>{n}</button>
        ))}
      </div>
      <div style={{ background: "#fff", padding: "20px", borderRadius: "20px", textAlign: "left" }}>
        <p><strong>👟 状態:</strong></p>
        {(data[level]?.doing || []).map((t, i) => <div key={i}>・{t}</div>)}
        <p><strong>🍼 お願い:</strong></p>
        {(data[level]?.requests || []).map((t, i) => <div key={i}>・{t}</div>)}
      </div>
    </div>
  );
}
