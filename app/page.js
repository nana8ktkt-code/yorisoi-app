"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [level, setLevel] = useState(0);
  const [symptoms, setSymptoms] = useState([]);
  const [memo, setMemo] = useState("");
  // 各症状ごとの「お願い」を保存するステート
  const [presets, setPresets] = useState({
    "喉が痛い": "のど飴とはちみつ買ってきて",
    "頭痛": "部屋を暗くして静かにしててほしい",
    "腹痛": "湯たんぽ準備してほしい",
    "生理痛": "鎮痛剤と温かい飲み物お願い",
    "熱がある": "アイスノン替えてほしい",
    "咳が出る": "加湿器つけてほしい",
    "体がだるい": "家事代わってほしい",
    "吐き気": "エチケット袋と水お願い"
  });
  const [isSettingMode, setIsSettingMode] = useState(false);

  const levelText = ["元気", "少ししんどい", "しんどい", "かなりしんどい", "つらい", "限界"];

  // アプリ起動時に、保存された設定を読み込む
  useEffect(() => {
    const savedPresets = localStorage.getItem("yorisoi_presets");
    if (savedPresets) setPresets(JSON.parse(savedPresets));
  }, []);

  // 設定を保存する
  const savePresets = (key, value) => {
    const newPresets = { ...presets, [key]: value };
    setPresets(newPresets);
    localStorage.setItem("yorisoi_presets", JSON.stringify(newPresets));
  };

  const toggleSymptom = (item) => {
    setSymptoms((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    );
  };

  const sendToPartner = () => {
    // 選択された症状に対応する「お願い」を全部つなげる
    const myRequests = symptoms.map(s => `・${s}：${presets[s]}`).join("\n");
    const text = `【Yorisoi🕊️】\nしんどさ：${levelText[level]}\n症状：${symptoms.join(", ")}\n\n【おねがい】\n${myRequests || "ゆっくりさせてね"}\n\nメモ：${memo}`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://line.me/R/msg/text/?${encodedText}`, "_blank");
  };

  return (
    <div style={{ padding: 24, maxWidth: 400, margin: "0 auto", backgroundColor: "#F9FDFF", minHeight: "100vh" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ color: "#4A4A4A", fontSize: "24px" }}>Yorisoi 🕊️</h1>
        <button 
          onClick={() => setIsSettingMode(!isSettingMode)}
          style={{ background: "none", border: "1px solid #8EC6E8", borderRadius: 12, padding: "4px 8px", fontSize: "12px", color: "#8EC6E8" }}
        >
          {isSettingMode ? "完了" : "設定⚙️"}
        </button>
      </header>

      {isSettingMode ? (
        <section style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: "16px", color: "#666" }}>元気な時に「お願い」を登録</h3>
          <p style={{ fontSize: "12px", color: "#999" }}>症状を選んだ時に、相手に送るメッセージを編集できます。</p>
          {Object.keys(presets).map((symptom) => (
            <div key={symptom} style={{ marginBottom: 12 }}>
              <label style={{ fontSize: "14px", fontWeight: "bold" }}>{symptom}</label>
              <input
                type="text"
                value={presets[symptom]}
                onChange={(e) => savePresets(symptom, e.target.value)}
                style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #DDD", marginTop: 4 }}
              />
            </div>
          ))}
          <button onClick={() => setIsSettingMode(false)} style={{ width: "100%", padding: 12, background: "#8EC6E8", color: "white", borderRadius: 8, border: "none" }}>設定を終わる</button>
        </section>
      ) : (
        <>
          <section style={{ margin: "24px 0" }}>
            <h3 style={{ fontSize: "16px", color: "#666" }}>しんどさレベル</h3>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setLevel(n)} style={{ width: 45, height: 45, borderRadius: "50%", border: "2px solid #8EC6E8", background: level === n ? "#8EC6E8" : "white", color: level === n ? "white" : "#8EC6E8", fontWeight: "bold" }}>{n}</button>
              ))}
            </div>
            <p style={{ textAlign: "center", fontWeight: "bold", marginTop: 10 }}>{levelText[level]}</p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: "16px", color: "#666" }}>どんなしんどさ？</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {Object.keys(presets).map((item) => (
                <div key={item} onClick={() => toggleSymptom(item)} style={{ padding: 12, textAlign: "center", borderRadius: 8, border: "1px solid #DDD", background: symptoms.includes(item) ? "#CFE8F6" : "white", fontSize: "14px" }}>
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: "16px", color: "#666" }}>自由記述（メモ）</h3>
            <textarea
              placeholder="例：今日はゆっくり寝たい..."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #DDD", minHeight: 60 }}
            />
          </section>

          <button onClick={sendToPartner} style={{ width: "100%", padding: 16, background: "#8EC6E8", color: "white", borderRadius: 30, border: "none", fontSize: "16px", fontWeight: "bold", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
            よりそい相手にLINEで伝える
          </button>
        </>
      )}
    </div>
  );
}
