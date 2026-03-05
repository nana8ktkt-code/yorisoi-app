import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, updateDoc } from "firebase/firestore";

// --- Firebase設定（あなたのキーを反映済み） ---
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

// --- アプリ本体 ---
export default function YorisoiApp() {
  const [level, setLevel] = useState(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [isSetting, setIsSetting] = useState(false);
  const [pairingCode, setPairingCode] = useState(""); // 自分の連携コード
  const [partnerCode, setPartnerCode] = useState(""); // 入力する相手のコード
  const [isLinked, setIsLinked] = useState(false); // 連携済みか

  // 初期設定データ
  const [config, setConfig] = useState({
    symptoms: ["頭痛", "腹痛", "だるい", "吐き気", "めまい", "腰痛"],
    levels: {
      0: { status: "元気！", emoji: "😊", doing: "", requests: "", notToDo: "" },
      1: { status: "ちょっと違和感", emoji: "🙂", doing: "", requests: "", notToDo: "" },
      2: { status: "しんどくなってきた", emoji: "😐", doing: "", requests: "", notToDo: "" },
      3: { status: "だいぶしんどい", emoji: "😰", doing: "", requests: "", notToDo: "" },
      4: { status: "動くのがやっと", emoji: "😣", doing: "", requests: "", notToDo: "" },
      5: { status: "限界…たすけて", emoji: "😭", doing: "", requests: "", notToDo: "" },
    }
  });

  const colors = { main: "#8E97FD", bg: "#F2F5FF", text: "#4A4A4A", card: "#FFFFFF", shadow: "rgba(142, 151, 253, 0.2)" };

  // 1. 起動時に自分用のIDを作成（簡易的な連携用）
  useEffect(() => {
    const myId = localStorage.getItem("my_yorisoi_id") || Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem("my_yorisoi_id", myId);
    setPairingCode(myId);

    // 自分のデータを監視
    const unsub = onSnapshot(doc(db, "users", myId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setLevel(data.level || 0);
        setSelectedSymptoms(data.symptoms || []);
        if (data.partnerId) setIsLinked(true);
      }
    });
    return () => unsub();
  }, []);

  // 2. パートナーと連携する
  const linkPartner = async () => {
    if (!partnerCode) return alert("コードを入力してね");
    await updateDoc(doc(db, "users", pairingCode), { partnerId: partnerCode });
    setIsLinked(true);
    alert("パートナーとつながりました！");
  };

  // 3. レベル変更をリアルタイム送信
  const handleLevelChange = async (n) => {
    setLevel(n);
    await setDoc(doc(db, "users", pairingCode), { level: n, symptoms: selectedSymptoms }, { merge: true });
  };

  // --- 設定画面やメイン画面のUI ---
  if (isSetting) {
    return (
      <div style={{ padding: "20px", backgroundColor: colors.bg, minHeight: "100vh" }}>
        <button onClick={() => setIsSetting(false)}>◀ 戻る</button>
        <h2>⚙️ 連携と設定</h2>
        <div style={{ background: "white", padding: "20px", borderRadius: "20px", marginBottom: "20px" }}>
          <p>あなたの連携コード: <strong>{pairingCode}</strong></p>
          <input 
            placeholder="相手のコードを入力" 
            value={partnerCode} 
            onChange={(e) => setPartnerCode(e.target.value)}
            style={{ padding: "10px", borderRadius: "10px", border: "1px solid #ddd", width: "100%" }}
          />
          <button onClick={linkPartner} style={{ width: "100%", marginTop: "10px", background: colors.main, color: "white", padding: "10px", borderRadius: "10px", border: "none" }}>パートナーと連携する</button>
        </div>
        <p style={{fontSize: "12px", color: "#888"}}>※将来的にここから詳細設定もできるようになります</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "30px 20px", maxWidth: 450, margin: "0 auto", backgroundColor: colors.bg, minHeight: "100vh", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "800", color: colors.main }}>Yorisoi 🕊️</h1>
        <button onClick={() => setIsSetting(true)} style={{ background: "white", border: "none", borderRadius: "50%", width: "45px", height: "45px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>⚙️</button>
      </div>

      <div style={{ background: "white", padding: "25px", borderRadius: "30px", textAlign: "center", boxShadow: `0 10px 30px ${colors.shadow}` }}>
        <p style={{ color: colors.main, fontWeight: "bold" }}>{isLinked ? "✅ 連携中" : "🔗 未連携（設定から連携してね）"}</p>
        <div style={{ display: "flex", justifyContent: "space-between", margin: "20px 0" }}>
          {[0, 1, 2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => handleLevelChange(n)} style={{ width: "42px", height: "42px", borderRadius: "50%", border: "none", background: level === n ? colors.main : colors.bg, color: level === n ? "white" : colors.main, fontWeight: "bold" }}>{n}</button>
          ))}
        </div>
        <div style={{ background: colors.bg, padding: "20px", borderRadius: "20px" }}>
          <div style={{ fontSize: "50px" }}>{config.levels[level].emoji}</div>
          <div style={{ fontSize: "18px", fontWeight: "bold" }}>{config.levels[level].status}</div>
        </div>
      </div>
      
      <p style={{textAlign:"center", marginTop:"20px", fontSize:"12px", color:"#888"}}>
        レベルを変えると、パートナーの画面も自動で更新されます。
      </p>
    </div>
  );
}
