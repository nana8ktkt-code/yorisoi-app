import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

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
  const [editSymptom, setEditSymptom] = useState("生理痛"); 
  const [editLevel, setEditLevel] = useState(0); 
  const [config, setConfig] = useState({ symptoms: ["生理痛", "つわり", "PMS", "頭痛", "だるい", "腹痛"], data: {} });

  const colors = { main: "#8E97FD", bg: "#F2F5FF", text: "#4A4A4A", shadow: "rgba(142, 151, 253, 0.2)" };

  useEffect(() => {
    let id = localStorage.getItem("yorisoi_user_id") || Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem("yorisoi_user_id", id);
    setMyId(id);

    return onSnapshot(doc(db, "users", id), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d.level !== undefined) setLevel(d.level);
        if (d.activeSymptom) setActiveSymptom(d.activeSymptom);
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
      <div style={{ padding: "20px", backgroundColor: colors.bg, minHeight: "100vh" }}>
        <button onClick={() => setIsSetting(false)} style={{padding:"10px", borderRadius:"10px", border:"none", background:"#fff", fontWeight:"bold", marginBottom:"20px"}}>◀ 戻る</button>
        <div style={{ background: "#fff", padding: "20px", borderRadius: "20px", boxShadow: `0 4px 15px ${colors.shadow}` }}>
          <label style={{fontSize:"12px", fontWeight:"bold", color:colors.main}}>① 症状を選ぶ</label>
          <select value={editSymptom} onChange={(e) => setEditSymptom(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "10px", marginBottom: "20px", border: `2px solid ${colors.bg}`, fontSize:"16px" }}>
            {config.symptoms.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <label style={{fontSize:"12px", fontWeight:"bold", color:colors.main}}>② レベルを選ぶ</label>
          <div style={{ display: "flex", gap: "5px", marginBottom: "20px" }}>
            {[0,1,2,3,4,5].map(l => (
              <button key={l} onClick={() => setEditLevel(l)} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: editLevel === l ? colors.main : colors.bg, color: editLevel === l ? "#fff" : colors.main }}>{l}</button>
            ))}
          </div>

          <label style={{fontSize:"12px", fontWeight:"bold"}}>👟 いまの状態</label>
          <textarea value={config.data[editSymptom]?.[editLevel]?.doing || ""} onChange={e => updateDetail("doing", e.target.value)} style={{width:"100%", height:"60px", marginBottom:"15px", borderRadius:"10px", padding:"10px", border:"1px solid #eee"}} />

          <label style={{fontSize:"12px", fontWeight:"bold"}}>🍼 お願い</label>
          <textarea value={config.data[editSymptom]?.[editLevel]?.requests || ""} onChange={e => updateDetail("requests", e.target.value)} style={{width:"100%", height:"60px", marginBottom:"15px", borderRadius:"10px", padding:"10px", border:"1px solid #eee"}} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", backgroundColor: colors.bg, minHeight: "100vh", textAlign: "center" }}>
      <div style={{display:"flex", justifyContent:"space-between", marginBottom:"20px"}}>
        <h2 style={{color:colors.main}}>Yorisoi🕊️</h2>
        <button onClick={() => setIsSetting(true)} style={{border:"none", background:"#fff", width:"40px", height:"40px", borderRadius:"50%"}}>⚙️</button>
      </div>
      <div style={{display:"flex", gap:"10px", overflowX:"auto", marginBottom:"20px"}}>
        {config.symptoms.map(s => (
          <button key={s} onClick={() => setActiveSymptom(s)} style={{padding:"10px 20px", borderRadius:"20px", border:"none", background:activeSymptom === s ? colors.main : "#fff", color:activeSymptom === s ? "#fff" : colors.text, whiteSpace:"nowrap"}}>{s}</button>
        ))}
      </div>
      <div style={{background:"#fff", padding:"30px", borderRadius:"30px", boxShadow:`0 10px 20px ${colors.shadow}`}}>
        <div style={{display:"flex", justifyContent:"space-around", marginBottom:"20px"}}>
          {[0,1,2,3,4,5].map(n => <button key={n} onClick={() => setLevel(n)} style={{width:"35px", height:"35px", borderRadius:"50%", border:"none", background:level === n ? colors.main : colors.bg, color:level === n ? "#fff" : colors.main}}>{n}</button>)}
        </div>
        <div style={{textAlign:"left", fontSize:"14px"}}>
          <p><strong>状態:</strong> {config.data[activeSymptom]?.[level]?.doing || "⚙️から設定してね"}</p>
          <p><strong>お願い:</strong> {config.data[activeSymptom]?.[level]?.requests || "未設定"}</p>
        </div>
      </div>
    </div>
  );
}
