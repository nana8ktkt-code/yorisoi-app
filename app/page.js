"use client";
import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { Settings, Heart, LogOut, Save, CheckCircle2 } from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyC3S7sO5trehM1cNHOzo6cc49D8V4rXSqg",
  authDomain: "yorisoi-app-89ce7.firebaseapp.com",
  projectId: "yorisoi-app-89ce7",
  storageBucket: "yorisoi-app-89ce7.firebasestorage.app",
  messagingSenderId: "509189105205",
  appId: "1:509189105205:web:7ffc405665e85fed92f37c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const levelFeelings = ["落ち着いたよ", "違和感あり", "ちょっとしんどい", "しんどい", "かなりつらい", "限界"];
const levelEmojis = ["🍃", "😅", "😷", "😭", "🥶", "🤮"];
const moodOptions = [
  { emoji: "🙂", label: "落ち着いてる" },
  { emoji: "😢", label: "寂しい" },
  { emoji: "😡", label: "イライラ" },
  { emoji: "😴", label: "眠い" },
  { emoji: "🤢", label: "気持ち悪い" }
];

const softFontFace = '"Hiragino Maru Gothic ProN", "Meiryo", sans-serif';

const getHint = (lv) => {
  if (lv === 0) return "落ち着いているみたい。今のうちに家事や準備を済ませておこう🕊️";
  if (lv <= 1) return "少し違和感があるみたい。無理させないように気にかけてあげてね。";
  if (lv <= 3) return "しんどくなってきました。『何かできることある？』と聞いてみて。";
  return "かなりつらそう。今は設定の『遠慮してほしいこと』を守って、静かに見守るのが一番のケアだよ。";
};

const getDynamicBg = (lv, mode) => {
  if (mode === "🌿") return "#f2f2f2"; 
  if (mode === "🐶") return "#fff3e0"; 
  const colors = ["#f0fcf4", "#f4fcf0", "#fffbe6", "#fff5f0", "#fff0f5", "#f5f0ff"];
  return colors[lv] || "#f0f7ff";
};

export default function YorisoiApp() {
  const [showIntro, setShowIntro] = useState(true);
  const [pairCode, setPairCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [role, setRole] = useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [level, setLevel] = useState(0);
  const [data, setData] = useState({});
  const [status, setStatus] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [isSetting, setIsSetting] = useState(false);
  const [activeSettingSymptom, setActiveSettingSymptom] = useState("生理痛");
  const [settingLevel, setSettingLevel] = useState(0);
  const [customInput, setCustomInput] = useState({ doing: "", requests: "", notToDo: "" });

  const defaultSymptoms = ["つわり", "生理痛", "PMS", "頭痛", "腹痛", "だるい", "のどが痛い", "熱がある"];
  const defaultPlan = {
    doing: ["横になって休んでる", "薬飲んでる", "食欲がない", "少し落ち着いてきた", "声がでません", "お風呂入れない"],
    requests: [
      { cat: "🧼 家事", items: ["洗い物をお願い", "洗濯物をお願い", "ゴミ出しをお願い"] },
      { cat: "🍱 食事", items: ["お寿司たべたいな", "おかゆ食べたい", "Ｃ1000出してきてほしいな"] },
      { cat: "🌡️ ケア", items: ["腰をさすって", "部屋あたたかくして", "部屋を暗くして"] }
    ],
    notToDo: ["話しかけないで", "大きな音NG", "匂いNG", "そっとしておいて"]
  };

  useEffect(() => {
    const savedCode = localStorage.getItem('yorisoi_pairCode');
    const savedRole = localStorage.getItem('yorisoi_role');
    if (savedCode && savedRole) {
      setPairCode(savedCode);
      setRole(savedRole);
      setShowIntro(false);
    }
  }, []);

  useEffect(() => {
    if (!pairCode) return;
    const unsubStatus = onSnapshot(doc(db, "pairs", pairCode), (s) => {
      if (s.exists()) {
        const newData = s.data();
        setStatus(newData);
        setCompletedTasks(newData.completedTasks || []);
        if(newData.symptoms) setSelectedSymptoms(newData.symptoms);
        if(newData.level !== undefined) setLevel(newData.level);
      }
    });
    const unsubConfig = onSnapshot(doc(db, "configs", pairCode), (s) => { 
      if (s.exists()) setData(s.data()); 
    });
    return () => { unsubStatus(); unsubConfig(); };
  }, [pairCode]);

  const saveLogin = (code, r) => {
    localStorage.setItem('yorisoi_pairCode', code);
    localStorage.setItem('yorisoi_role', r);
    setPairCode(code);
    setRole(r);
    setShowIntro(false);
  };

  const logout = () => {
    if(confirm("ログアウトしますか？")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const startAsReporter = async () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const initData = {};
    defaultSymptoms.forEach(symptom => {
      initData[symptom] = {};
      for (let lv = 0; lv <= 5; lv++) {
        initData[symptom][lv] = {
          doing: [...defaultPlan.doing],
          requests: defaultPlan.requests.flatMap(r => r.items),
          notToDo: [...defaultPlan.notToDo]
        };
      }
    });

    try {
      await setDoc(doc(db, "configs", code), initData);
      await setDoc(doc(db, "pairs", code), { 
        level: 0, 
        feeling: "落ち着いたよ", 
        emoji: "🍃",
        completedTasks: [],
        thanksMessage: "",
        activeDoing: [],
        activeRequests: [],
        activeNotToDo: []
      });
      saveLogin(code, 'her');
    } catch (e) {
      alert("エラーが発生しました。");
    }
  };

  const loginAsReporterWithCode = async () => {
    if (!inputCode || inputCode.length < 4) return alert("有効なコードを入力してください");
    try {
      const docSnap = await getDoc(doc(db, "configs", inputCode.toUpperCase()));
      if (docSnap.exists()) {
        saveLogin(inputCode.toUpperCase(), 'her');
      } else {
        alert("該当するコードが見つかりませんでした");
      }
    } catch (e) {
      alert("通信エラーが発生しました");
    }
  };

  const startAsSupporter = async () => {
    if (!inputCode || inputCode.length < 4) return alert("コードを入力してください");
    const code = inputCode.toUpperCase();
    try {
      const docSnap = await getDoc(doc(db, "configs", code));
      if (docSnap.exists()) {
        saveLogin(code, 'him');
      } else {
        alert("該当するコードが見つかりませんでした");
      }
    } catch (e) {
      alert("通信エラーが発生しました");
    }
  };

  const updateStatus = async (newSyms, newLv, mood = null, mode = null) => {
    if (!pairCode) return;
    await setDoc(doc(db, "pairs", pairCode), {
      symptoms: newSyms, 
      level: newLv, 
      feeling: levelFeelings[newLv], 
      emoji: levelEmojis[newLv],
      mood: mood !== null ? (status?.mood === mood ? "" : mood) : (status?.mood || ""),
      mode: mode !== null ? (status?.mode === mode ? "" : mode) : (status?.mode || ""),
      updatedAt: new Date().getTime(), 
      completedTasks: completedTasks
    }, { merge: true });
  };

  const saveCustomText = async (type) => {
    const text = customInput[type];
    if (!text.trim() || !pairCode) return;
    const newData = { ...data };
    if (!newData[activeSettingSymptom]) newData[activeSettingSymptom] = {};
    if (!newData[activeSettingSymptom][settingLevel]) newData[activeSettingSymptom][settingLevel] = { doing: [], requests: [], notToDo: [] };
    if (!newData[activeSettingSymptom][settingLevel][type].includes(text)) {
      newData[activeSettingSymptom][settingLevel][type] = [...newData[activeSettingSymptom][settingLevel][type], text];
      setData(newData);
      await setDoc(doc(db, "configs", pairCode), newData);
      setCustomInput({ ...customInput, [type]: "" });
    }
  };

  const toggleConfigItemSelection = async (type, item) => {
    if (!pairCode) return;
    const current = status?.[type] || [];
    const next = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
    await setDoc(doc(db, "pairs", pairCode), { [type]: next }, { merge: true });
  };

  const toggleTask = async (task) => {
    const isCompleting = !completedTasks.includes(task);
    const updated = isCompleting
      ? [...completedTasks, task]
      : completedTasks.filter(t => t !== task);
    setCompletedTasks(updated);
    await setDoc(doc(db, "pairs", pairCode), {
      completedTasks: updated,
      lastCompletedTask: isCompleting ? task : (status?.lastCompletedTask || ""),
      thanksMessage: isCompleting ? "" : (status?.thanksMessage || "")
    }, { merge: true });
  };

  const resetTasks = async () => {
    if (!pairCode) return;
    await setDoc(doc(db, "pairs", pairCode), {
      completedTasks: [],
      lastCompletedTask: "",
      thanksMessage: ""
    }, { merge: true });
  };

  const currentBg = getDynamicBg(status?.level || 0, status?.mode);

  if (showIntro && !pairCode) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: softFontFace, background: '#f0f7ff', minHeight: '100vh' }}>
        <Heart size={64} color="#9ebbd7" style={{ marginTop: '60px' }} />
        <h1 style={{ color: '#9ebbd7', fontSize: '32px', margin: '20px 0 40px' }}>YORISOI</h1>
        <div style={{ marginBottom: '40px' }}>
            <p style={{ fontSize: '13px', color: '#9ebbd7', marginBottom: '15px' }}>新しくはじめる</p>
            <button onClick={startAsReporter} className="push-btn" style={{ width: '100%', padding: '22px', borderRadius: '30px', background: '#9ebbd7', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>おつたえ側ではじめる 🕊️</button>
        </div>
        <div style={{ padding: '25px', background: '#fff', borderRadius: '30px', boxShadow: '0 10px 25px rgba(158,187,215,0.1)' }}>
          <p style={{ fontSize: '13px', color: '#9ebbd7', marginBottom: '15px' }}>招待コードでログイン</p>
          <input type="text" placeholder="コードを入力" value={inputCode} onChange={(e) => setInputCode(e.target.value.toUpperCase())} style={{ width: '100%', padding: '15px', textAlign: 'center', border: '1px solid #f0f7ff', borderRadius: '15px', fontSize: '20px', marginBottom: '15px', color: '#5a7d9a' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={startAsSupporter} className="push-btn" style={{ width: '100%', padding: '15px', borderRadius: '20px', background: '#f0f7ff', color: '#9ebbd7', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>みまもり側として参加 🤝</button>
            <button onClick={loginAsReporterWithCode} style={{ background: 'none', border: 'none', color: '#ccc', fontSize: '12px', textDecoration: 'underline', cursor: 'pointer' }}>おつたえ側として再ログイン</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px 20px', maxWidth: '500px', margin: '0 auto', fontFamily: softFontFace, background: currentBg, minHeight: '100vh', transition: '0.5s' }}>
      {isSetting ? (
        <div style={{ background: '#fff', padding: '25px', borderRadius: '30px', minHeight: '80vh' }}>
          <button onClick={() => setIsSetting(false)} className="push-btn" style={{ padding: '10px 20px', background: '#f0f7ff', borderRadius: '15px', color: '#9ebbd7', marginBottom: '20px', border: 'none' }}>◀ 戻る</button>
          <select value={activeSettingSymptom} onChange={(e) => setActiveSettingSymptom(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '15px', marginBottom: '20px' }}>
            {defaultSymptoms.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
            {[0, 1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setSettingLevel(n)} style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: settingLevel === n ? '#9ebbd7' : '#eee', color: '#fff' }}>{n}</button>
            ))}
          </div>
          {[{type:'activeDoing', label:'💪 今の状態', icon:'👟'}, {type:'activeRequests', label:'☺️ お願い', icon:'📋'}, {type:'activeNotToDo', label:'🥺 遠慮してほしいこと', icon:'⚠️'}].map(field => (
            <div key={field.type} style={{ marginBottom: '20px' }}>
              <p style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>{field.label}</p>
              <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                <input value={customInput[field.type === 'activeDoing' ? 'doing' : field.type === 'activeRequests' ? 'requests' : 'notToDo']} onChange={(e) => setCustomInput({...customInput, [field.type === 'activeDoing' ? 'doing' : field.type === 'activeRequests' ? 'requests' : 'notToDo']: e.target.value})} placeholder="項目を入力..." style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #eee', fontSize: '13px' }} />
                <button onClick={() => saveCustomText(field.type === 'activeDoing' ? 'doing' : field.type === 'activeRequests' ? 'requests' : 'notToDo')} style={{ padding: '10px', background: '#9ebbd7', color: '#fff', borderRadius: '10px', border: 'none' }}><Save size={18}/></button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {data[activeSettingSymptom]?.[settingLevel]?.[field.type === 'activeDoing' ? 'doing' : field.type === 'activeRequests' ? 'requests' : 'notToDo']?.map(item => {
                  const isSelected = status?.[field.type]?.includes(item);
                  return (
                    <span key={item} onClick={() => toggleConfigItemSelection(field.type, item)} style={{ padding: '8px 12px', background: isSelected ? '#9ebbd7' : '#f9f9f9', color: isSelected ? '#fff' : '#555', borderRadius: '15px', fontSize: '12px', cursor: 'pointer', border: '1px solid #eee', transition: '0.2s' }}>
                      {item}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontWeight: 'bold', color: '#9ebbd7' }}>ID: {pairCode}</span>
            <div style={{ display: 'flex', gap: '15px' }}>
              <Settings onClick={() => setIsSetting(true)} color="#9ebbd7" style={{cursor: 'pointer'}} />
              <LogOut onClick={logout} color="#f87171" size={20} style={{cursor: 'pointer'}} />
            </div>
          </header>

          {role === 'her' ? (
            <div className="fade-in">
              {status?.completedTasks && status.completedTasks.length > 0 && (
                <div className="fade-in" style={{ marginBottom: '25px' }}>
                  <div style={{ background: '#fffbe6', padding: '18px', borderRadius: '25px', border: '2px solid #fff5ad', marginBottom: '12px', textAlign: 'left', color: '#8a6d3b', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                    <p style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px', textAlign: 'center' }}>✨ パートナーが完了してくれました！</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                      {status.completedTasks.map((task, idx) => (
                        <div key={idx} style={{ fontSize: '14px', paddingLeft: '10px' }}>✅ {task}</div>
                      ))}
                    </div>
                    <button onClick={resetTasks} style={{ width: '100%', padding: '8px', borderRadius: '12px', background: '#fff5ad', color: '#8a6d3b', border: '1px solid #e6db95', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}><CheckCircle2 size={14} /> 確認したよ（リストを消す）</button>
                  </div>
                  <div style={{ background: '#fff', padding: '20px', borderRadius: '30px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                    <p style={{ fontSize: '13px', color: '#9ebbd7', marginBottom: '15px' }}>気持ちを伝えよう 🥰</p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                      {[{ text: "ありがとう", emoji: "😭" }, { text: "だいすき♡", emoji: "🥰" }, { text: "助かった", emoji: "😇" }].map(item => (
                        <button key={item.text} onClick={async () => { await setDoc(doc(db, "pairs", pairCode), { thanksMessage: item.text + item.emoji }, { merge: true }); alert("気持ちを伝えました！"); }} style={{ padding: '10px 16px', borderRadius: '15px', border: '1px solid #9ebbd7', background: status?.thanksMessage === (item.text + item.emoji) ? '#9ebbd7' : '#fff', color: status?.thanksMessage === (item.text + item.emoji) ? '#fff' : '#9ebbd7', fontSize: '13px', cursor: 'pointer' }}>{item.text}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

      {/* --- ここから追加 --- */}
              <div style={{ marginTop: '30px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
                <button 
                  onClick={() => { navigator.clipboard.writeText(pairCode); alert("コピーしました！"); }} 
                  style={{ background: 'none', border: 'none', color: '#9ebbd7', fontSize: '12px', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  招待コード（{pairCode}）をコピー
                </button>
                
                <div style={{ display: 'flex', gap: '15px' }}>
                  <a 
                    href={`https://line.me/R/msg/text/?YORISOIの招待コードです：${pairCode}%0Aアプリで入力して連携してね！`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ fontSize: '11px', color: '#06C755', textDecoration: 'none', fontWeight: 'bold', border: '1px solid #06C755', padding: '8px 12px', borderRadius: '20px' }}
                  >
                    LINEで送る
                  </a>
                  
                  <a 
                    href={`mailto:?subject=YORISOIの招待コード&body=アプリでこちらのコードを入力してね：${pairCode}`}
                    style={{ fontSize: '11px', color: '#5a7d9a', textDecoration: 'none', fontWeight: 'bold', border: '1px solid #5a7d9a', padding: '8px 12px', borderRadius: '20px' }}
                  >
                    メールで送る
                  </a>
                </div>
              </div>
              {/* --- ここまで追加 --- */}
