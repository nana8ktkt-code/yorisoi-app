"use client";
import { useState } from "react";

export default function PartnerView() {
  // 本来はデータベースから取得しますが、まずは表示テスト用のデータ
  const data = {
    level: 3,
    symptoms: ["頭痛", "だるい"],
    status: "頭痛あり・話すのもしんどい",
    emoji: "😣",
    requests: ["おかゆを作ってほしい", "静かにしてほしい"],
    ngList: ["大きな音を立てないで"],
    updatedAt: "10:15"
  };

  const colors = {
    bg: "#F4F9FF", card: "#FFFFFF", main: "#8EC6E8", 
    text: "#334455", subText: "#8899AA", accent: "#FFB7B7"
  };

  return (
    <div style={{ padding: "40px 20px", maxWidth: 450, margin: "0 auto", backgroundColor: colors.bg, minHeight: "100vh", fontFamily: "sans-serif" }}>
      
      {/* 状況サマリーカード */}
      <div style={{ background: colors.card, padding: "30px", borderRadius: "32px", boxShadow: "0 20px 40px rgba(142,198,232,0.2)", textAlign: "center", marginBottom: "30px" }}>
        <div style={{ fontSize: "14px", color: colors.main, fontWeight: "bold", marginBottom: "10px" }}>現在のパートナーの状態</div>
        <div style={{ fontSize: "80px", marginBottom: "10px" }}>{data.emoji}</div>
        <h2 style={{ fontSize: "24px", fontWeight: "800", color: colors.text, margin: "0 0 5px 0" }}>レベル {data.level}</h2>
        <p style={{ fontSize: "16px", color: colors.subText, fontWeight: "600" }}>{data.status}</p>
        <div style={{ fontSize: "11px", color: "#CCC", marginTop: "15px" }}>最終更新: {data.updatedAt}</div>
      </div>

      {/* 具体的な症状 */}
      <div style={{ marginBottom: "30px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px", paddingLeft: "10px" }}>出ている症状</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {data.symptoms.map(s => (
            <span key={s} style={{ background: colors.main, color: "white", padding: "8px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "bold" }}>{s}</span>
          ))}
        </div>
      </div>

      {/* おねがいリスト（パートナーのToDo） */}
      <div style={{ background: "#FFF0F0", padding: "25px", borderRadius: "24px", marginBottom: "25px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#FF8E8E", marginBottom: "15px" }}>💍 おねがい（ToDo）</h3>
        {data.requests.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", background: "white", padding: "15px", borderRadius: "16px", marginBottom: "10px", boxShadow: "0 4px 10px rgba(255,142,142,0.1)" }}>
            <input type="checkbox" style={{ width: "20px", height: "20px", marginRight: "12px" }} />
            <span style={{ fontSize: "14px", fontWeight: "600", color: colors.text }}>{r}</span>
          </div>
        ))}
      </div>

      {/* NG事項 */}
      {data.ngList.length > 0 && (
        <div style={{ background: "#F5F5F5", padding: "20px", borderRadius: "20px", marginBottom: "35px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#666", marginBottom: "10px" }}>⚠️ 気をつけてほしいこと</h3>
          {data.ngList.map((ng, i) => (
            <p key={i} style={{ fontSize: "13px", color: "#888", margin: "5px 0" }}>・{ng}</p>
          ))}
        </div>
      )}

      {/* パートナーからのアクション */}
      <button style={{ 
        width: "100%", padding: "20px", background: colors.main, color: "white", 
        borderRadius: "24px", border: "none", fontSize: "16px", fontWeight: "800",
        boxShadow: "0 10px 20px rgba(142,198,232,0.3)"
      }}>
        了解！サポート中だよ 💙
      </button>
      <p style={{ textAlign: "center", fontSize: "12px", color: colors.subText, marginTop: "15px" }}>
        ボタンを押すと相手に「既読」が伝わります
      </p>

    </div>
  );
}
