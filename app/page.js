import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, updateDoc } from "firebase/firestore";

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
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [isSetting, setIsSetting] = useState(false);
  const [myId, setMyId] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [inputPartnerId, setInputPartnerId] = useState("");
  const [isLinked, setIsLinked] = useState(false);
  const [showThanks, setShowThanks] = useState("");
  const [currentLevelTab, setCurrentLevelTab] = useState(0);

  // --- これまでの設定データをすべて保持 ---
  const [config, setConfig] = useState({
    symptoms: ["頭痛", "腹痛", "だるい", "吐き気", "めまい", "生理痛"],
    levels: {
      0: { status: "元気！", emoji: "😊", doing: "", requests: "", notToDo: "" },
      1: { status: "ちょっと違和感", emoji: "🙂", doing: "", requests: "", notToDo: "" },
      2: { status: "しんどくなってきた", emoji: "😐", doing: "", requests: "", notToDo: "" },
      3: { status: "だいぶしんどい", emoji: "😰", doing: "", requests: "", notToDo: "" },
      4: { status: "動くのがやっと", emoji: "😣", doing: "", requests: "", notToDo: "" },
      5: { status: "限界…たすけて", emoji: "😭", doing: "", requests: "", notToDo: "" },
    }
  });

  const suggestions = {
    doing: ["横になって休んでいるよ", "薬を飲んで安静にしてる", "暗い部屋で寝てる", "食欲ないの", "少し落ち着いてきた"],
    requests: [
      { cat: "🧼 家事・身の回り", items: ["洗い物をお願いしたい", "洗濯物を取り込んでほしい", "ゴミ出しをお願い", "お風呂を沸かしてほしい"] },
      { cat: "🍱 食事・買い出し", items: ["消化にいいものを作ほしい", "コンビニでゼリー飲料買ってきて", "温かい飲み物を淹れてほしい", "アイス買ってきて"] },
      { cat: "🌡️ 環境・ケア", items: ["部屋を暗くしてほしい", "静かにしてほしい", "湯たんぽ（カイロ）を用意してほしい", "腰や肩をさすってほしい"] },
      { cat: "🕊️ 放置・見守り", items: ["放っておいてほしい（寝かせて）", "1〜2時間後に一度様子を見てほしい", "返信不要でスタンプだけ送って"] }
    ],
    notToDo: ["溜まった家事について触れないで", "今は話しかけないでほしい", "大きな音を立てないで", "部屋を明るくしないで", "強い匂いのものは控えて", "そっとしておいて"]
  };

  const colors = { main: "#8E97FD", bg: "#F2F5FF", text: "#4A4A4A", card: "#FFFFFF", shadow: "rgba(142, 151, 253, 0.2)" };

  // 起動時にデータを読み込み
  useEffect(() => {
    let id = localStorage.getItem("yorisoi_user_id");
    if (!id) {
      id = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem("yorisoi_user_id", id);
    }
    setMyId(id);

    const unsub = onSnapshot(doc(db, "users", id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.level !== undefined) setLevel(data.level);
        if (data.symptoms) setSelectedSymptoms(data.symptoms);
        if (data.partnerId) {
          setIsLinked(true);
          setPartnerId(data.partnerId);
        }
        if (data.lastThank) {
          setShowThanks(data.lastThank);
          setTimeout(() => setShowThanks(""), 5000);
        }
      }
    });
    return () => unsub();
  }, []);

  const updateStatus = async (newLevel, newSymptoms) => {
    await setDoc(doc(db, "users", myId), { 
      level: newLevel, 
      symptoms: newSymptoms,
      updatedAt: new Date()
    }, { merge: true });
  };

  const toggleSuggestion = (field, value) => {
    const currentText = config.levels[currentLevelTab][field] || "";
    let newText = currentText.includes(value) 
      ? currentText.replace(value, "").replace(/、$/, "").replace(/^、/, "").trim()
      : currentText ? `${currentText}、${value}` : value;
    setConfig({...config, levels: {...config.levels, [currentLevelTab]: {...config.levels[currentLevelTab], [field]: newText}}});
  };

  const handleLink = async () => {
    if (!inputPartnerId) return alert("IDを入れてね");
    await setDoc(doc(db, "users", myId), { partnerId: inputPartnerId }, { merge: true });
    alert("連携完了！相手の画面でもあなたのIDを入力してください。");
  };

  const sendThank = async (msg) => {
    if (!partnerId) return alert("連携相手がいません");
    await setDoc(doc(db, "users", partnerId), { lastThank: msg }, { merge: true });
  };

  if (isSetting) {
    return (
      <div style={{ padding: "20px", backgroundColor: colors.bg, minHeight: "100vh", fontFamily: "sans-serif" }}>
        <button onClick={() => setIsSetting(false)} style={{border:"none", background:"none", fontSize:"16px", marginBottom:"20px"}}>◀ 戻る</button>
        
        <h2 style={{fontSize:"18px", color:colors.main}}>🔗 パートナー連携</h2>
        <div style={{ background: "white", padding: "15px", borderRadius: "15px", marginBottom: "25px" }}>
          <p style={{fontSize:"12px"}}>あなたのID: <strong style={{fontSize:"18px", color:colors.main}}>{myId}</strong></p>
          <input value={inputPartnerId} onChange={e => setInputPartnerId(e.target.value)} placeholder="相手のIDを入力" style={{width:"100%", padding:"10px", borderRadius:"10px", border:"1px solid #ddd", marginTop:"10px"}} />
          <button onClick={handleLink} style={{width:"100%", marginTop:"10px", padding:"10px", background:colors.main, color:"white", borderRadius:"10px", border:"none", fontWeight:"bold"}}>連携する</button>
        </div>

        <h2 style={{fontSize:"18px", color:colors.main}}>⚙️ レベル別詳細設定</h2>
        <div style={{ display: "flex", gap: "5px", marginBottom: "15px", overflowX: "auto" }}>
          {[0, 1, 2, 3, 4, 5].map(l => (
            <button key={l} onClick={() => setCurrentLevelTab(l)} style={{ padding: "8px 12px", borderRadius: "10px", border: "none", background: currentLevelTab === l ? colors.main : "white", color: currentLevelTab === l ? "white" : colors.text }}>Lv{l}</button>
          ))}
        </div>

        <div style={{ background: "white", padding: "15px", borderRadius: "15px" }}>
          <p style={{fontWeight:"bold", fontSize:"14px", marginBottom:"10px"}}>レベル {currentLevelTab} のお願い</p>
          {suggestions.requests.map(cat => (
            <div key={cat.cat} style={{marginBottom:"10px"}}>
              <div style={{fontSize:"10px", fontWeight:"bold", color:colors.main}}>{cat.cat}</div>
              <div style={{display:"flex", flexWrap:"wrap", gap:"4px"}}>
                {cat.items.map(s => (
                  <button key={s} onClick={() => toggleSuggestion("requests", s)} style={{fontSize:"10px", padding:"4px 8px", borderRadius:"15px", border:"1px solid #eee", background: config.levels[currentLevelTab].requests.includes(s) ? colors.main : "white", color: config.levels[currentLevelTab].requests.includes(s) ? "white" : colors.text}}>{s}</button>
                ))}
              </div>
            </div>
          ))}
          <textarea value={config.levels[currentLevelTab].requests} onChange={e => setConfig({...config, levels: {...config.levels, [currentLevelTab]: { ...config.levels[currentLevelTab], requests: e.target.value}}})} style={{width:"100%", height:"60px", marginTop:"10px", borderRadius:"10px", padding:"10px", border:"1px solid #eee"}} placeholder="自由入力..." />
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

      <section style={{ marginBottom: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
          {config.symptoms.map(s => (
            <button key={s} onClick={() => {
              const newSymptoms = selectedSymptoms.includes(s) ? selectedSymptoms.filter(item => item !== s) : [...selectedSymptoms, s];
              setSelectedSymptoms(newSymptoms);
              updateStatus(level, newSymptoms);
            }} style={{ padding: "10px 5px", borderRadius: "12px", border: "none", background: selectedSymptoms.includes(s) ? colors.main : "white", color: selectedSymptoms.includes(s) ? "white" : colors.text, fontSize:"11px", fontWeight:"bold" }}>{s}</button>
          ))}
        </div>
      </section>

      <section style={{ background: "white", padding: "20px", borderRadius: "25px", boxShadow: `0 10px 30px ${colors.shadow}`, textAlign:"center" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          {[0, 1, 2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => { setLevel(n); updateStatus(n, selectedSymptoms); }} style={{ width: "38px", height: "38px", borderRadius: "50%", border: "none", background: level === n ? colors.main : colors.bg, color: level === n ? "white" : colors.main, fontWeight: "bold" }}>{n}</button>
          ))}
        </div>
        <div style={{ background: colors.bg, padding: "20px", borderRadius: "20px", marginBottom: "20px" }}>
          <div style={{ fontSize: "50px" }}>{config.levels[level].emoji}</div>
          <div style={{ fontWeight: "bold" }}>{config.levels[level].status}</div>
        </div>

        <div style={{ textAlign: "left", fontSize: "13px", marginBottom: "20px" }}>
          <div style={{marginBottom:"8px"}}><strong>🍼 お願い:</strong> {config.levels[level].requests || "特になし"}</div>
          <div><strong>🚫 遠慮:</strong> {config.levels[level].notToDo || "特になし"}</div>
        </div>

        <div style={{display:"flex", gap:"8px", justifyContent:"center"}}>
          <button onClick={() => sendThank("助かったよ！")} style={{padding:"6px 12px", borderRadius:"15px", border:`1px solid ${colors.main}`, background:"none", color:colors.main, fontSize:"11px", fontWeight:"bold"}}>🌸 感謝</button>
          <button onClick={() => sendThank("神対応！")} style={{padding:"6px 12px", borderRadius:"15px", border:`1px solid ${colors.main}`, background:"none", color:colors.main, fontSize:"11px", fontWeight:"bold"}}>✨ 神対応</button>
        </div>
      </section>
    </div>
  );
}
