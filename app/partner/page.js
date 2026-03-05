"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sxjxdmyhhnrgljmxfujo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4anhkbXloaG5yZ2xqbXhmdWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NjYzNDcsImV4cCI6MjA4ODI0MjM0N30.V_YboSipxMboF1EpLANd1F063a7ayCd9DE-e5_MZBuw';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function PartnerContent() {
  const searchParams = useSearchParams();
  const partnerId = searchParams.get("id");
  const [data, setData] = useState(null);

  const colors = {
    bg: "#F4F9FF", card: "#FFFFFF", main: "#8EC6E8", 
    text: "#334455", subText: "#8899AA"
  };

  useEffect(() => {
    if (!partnerId) return;

    // Supabaseからリアルタイムでデータを取得
    const fetchStatus = async () => {
      const { data } = await supabase
        .from('health_status')
        .select('*')
        .eq('user_id', partnerId)
        .single();
      if (data) setData(data);
    };

    fetchStatus();

    // データの変更を監視（リアルタイム更新）
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'health_status', filter: `user_id=eq.${partnerId}` }, 
        (payload) => setData(payload.new)
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [partnerId]);

  if (!data) return <div style={{textAlign:"center", padding:"50px"}}>読み込み中...</div>;

  return (
    <div style={{ padding: "40px 20px", maxWidth: 450, margin: "0 auto", backgroundColor: colors.bg, minHeight: "100vh", fontFamily: "sans-serif" }}>
      <div style={{ background: colors.card, padding: "30px", borderRadius: "32px", textAlign: "center", marginBottom: "30px", boxShadow: "0 20px 40px rgba(142,198,232,0.2)" }}>
        <div style={{ fontSize: "14px", color: colors.main, fontWeight: "bold", marginBottom: "10px" }}>現在のパートナーの状態</div>
        <div style={{ fontSize: "80px", marginBottom: "10px" }}>{data.emoji}</div>
        <h2 style={{ fontSize: "24px", color: colors.text }}>レベル {data.level}</h2>
        <p style={{ color: colors.subText }}>症状：{data.symptoms}</p>
      </div>
      
      <button style={{ width: "100%", padding: "20px", background: colors.main, color: "white", borderRadius: "24px", border: "none", fontSize: "16px", fontWeight: "800" }}>
        了解！サポート中だよ 💙
      </button>
    </div>
  );
}

export default function PartnerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PartnerContent />
    </Suspense>
  );
}
