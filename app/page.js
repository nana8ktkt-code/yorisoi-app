"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [level, setLevel] = useState(0);
  const [isSettingMode, setIsSettingMode] = useState(false);
  const [editSymptom, setEditSymptom] = useState("");
  const [periodDates, setPeriodDates] = useState([]); 
  const [sharePeriodStatus, setSharePeriodStatus] = useState(false);

  const symptomsList = ["つわり", "生理痛", "PMS", "気持ちの浮き沈み", "頭痛", "喉が痛い", "腹痛", "熱がある", "体がだるい", "その他"];
  const colors = { bg: "#F9FDFF", main: "#8EC6E8", doing: "#EBF5FF", request: "#FFF0F0", ng: "#FFF5E6", text: "#4A4A4A", accent: "#FFB7B7" };

  // レベルごとの「状態の目安」を定義（ここが重要！）
  const levelGuides = {
    1: { status: "少しだるい・会話OK", request: ["家事は半分手伝ってほしい"], ng: [] },
    3: { status: "頭痛あり・話すのもしんどい", request: ["洗い物をお願い", "ごはんをお願い"], ng: ["そっとしておいてほしい"] },
    5: { status: "会話無理・とにかく寝たい", request: ["水だけ置いておいてほしい"], ng: ["話しかけないでほしい"] }
  };

  const suggestions = {
    doing: ["薬を飲んだ", "声が出ません", "温めている", "水分を摂っている", "安静にしている"],
    request: ["おかゆを作ってほしい", "うどんを作ってほしい", "静かにしてほしい", "腰をさすって", "部屋を暗くして"],
    ng: ["とにかく寝かせて", "アドバイスしないで", "大きな音を立てないで", "強い匂いのものを食べないで"]
  };

  const initialData = {};
  symptomsList.forEach(s => {
    initialData[s] = { 
      levels: [0,1,2,3,4,5].map((l) => ({ 
        doing: [], 
        // レベル1,3,5にデフォルトでご要望の内容をセット
        request: levelGuides[l] ? [...levelGuides[l].request] : [], 
        ng: levelGuides[l] ? [...levelGuides[l].ng] : [] 
      })), 
      manual: "優しく見守ってね" 
    };
  });

  const [presets, setPresets] = useState(initialData);

  useEffect(() => {
    const saved = localStorage.getItem("yorisoi_v14_presets");
    if (saved) setPresets(JSON.parse(saved));
    const savedDates = localStorage.getItem("yorisoi_period_dates");
    if (savedDates) setPeriodDates(JSON.parse(savedDates));
    const savedShare = localStorage.getItem("yorisoi_share_period");
    if (savedShare) setSharePeriodStatus(JSON.parse(savedShare));
  }, []);

  // LINE送信ロジックに「レベルの目安」を追加
  const sendMessage = (type, subType = "", cardData = null) => {
    let text = "";
    if (type === "status") {
      let doingList = []; let reqList = []; let ngList = [];
      selectedSymptoms.forEach(s => {
        const current = presets[s].levels[level];
        doingList.push(...current.doing.filter(t => t));
        reqList.push(...current.request.filter(t => t));
        ngList.push(...current.ng.filter(t => t));
      });
      
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
      const periodAlert = (sharePeriodStatus && periodDates.includes(todayStr)) ? "【生理期間中です🩸】\n" : "";
      
      // レベルに応じた状態メッセージを差し込み
      const guideText = levelGuides[level] ? `\n(状態目安: ${levelGuides[level].status})` : "";

      text = `${periodAlert}【Yorisoi🕊️現状報告】\n症状：${selectedSymptoms.join("、")}\nしんどさ：Lv.${level}${guideText}\n\n【今やってること】\n${doingList.map(t => `・${t}`).join("\n") || "特になし"}\n\n【おねがい】\n${reqList.map(t => `・${t}`).join("\n") || "ゆっくりさせてね"}\n\n${ngList.length ? "⚠️NG：\n" + ngList.map(t => `・${t}`).join("\n") + "\n" : ""}`;
    } else if (type === "thanks") {
      text = `【Yorisoi🕊️】\n体調が少し落ち着きました！\n${subType || "サポートありがとう✨"}`;
    }
    window.open(`https://line.me/R/msg/text/?${encodeURIComponent(text)}`, "_blank");
  };

  // ... (renderCalendar, return部分は前回と同じなので省略)
  // ※ 設定画面での表示もレベルごとの目安が見えるように微調整するのがおすすめです。
