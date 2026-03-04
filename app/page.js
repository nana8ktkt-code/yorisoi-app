"use client";
import { useState } from "react";

export default function Home() {
  const [level, setLevel] = useState(0);
  const [symptoms, setSymptoms] = useState([]);

  const symptomsList = ["喉が痛い", "頭痛", "腹痛", "生理痛"];
  const levelText = ["元気", "少ししんどい", "しんどい", "かなりしんどい", "つらい", "限界"];

  const toggleSymptom = (item) => {
    setSymptoms((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    );
  };

  return (
    <div style={{ padding: 24, maxWidth: 400, margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", color: "#4A4A4A" }}>Yorisoi 🕊️</h1>

      <h3>しんどさレベル</h3>
      <div style={{ display: "flex", gap: 8 }}>
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setLevel(n)}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "1px solid #8EC6E8",
              background: level === n ? "#CFE8F6" : "white",
            }}
          >
            {n}
          </button>
        ))}
      </div>
      <p>{levelText[level]}</p>

      <h3>どんなしんどさ？</h3>
      {symptomsList.map((item) => (
        <div
          key={item}
          onClick={() => toggleSymptom(item)}
          style={{
            padding: 12,
            borderRadius: 8,
            border: "1px solid #DDD",
            marginBottom: 8,
            background: symptoms.includes(item) ? "#CFE8F6" : "white",
            cursor: "pointer",
          }}
        >
          {item}
        </div>
      ))}

      <button
        style={{
          marginTop: 24,
          width: "100%",
          padding: 12,
          background: "#8EC6E8",
          color: "white",
          borderRadius: 8,
          border: "none",
        }}
      >
        よりそい相手に伝える
      </button>
    </div>
  );
}
