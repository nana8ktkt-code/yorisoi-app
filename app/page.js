// ログイン画面のイメージ（構想）
const LoginView = () => (
  <div style={{ padding: "60px 20px", textAlign: "center", background: colors.bg, minHeight: "100vh" }}>
    <div style={{ fontSize: "60px", marginBottom: "20px" }}>🕊️</div>
    <h1 style={{ color: colors.main, fontSize: "32px", fontWeight: "900" }}>Yorisoi</h1>
    <p style={{ color: colors.subText, marginBottom: "50px" }}>
      言葉にできないしんどさを、<br />大切な人に届けよう。
    </p>
    
    <button style={{ 
      width: "100%", padding: "18px", background: "#06C755", color: "white", 
      borderRadius: "30px", border: "none", fontSize: "16px", fontWeight: "bold",
      display: "flex", alignItems: "center", justifyContent: "center", gap: "10px"
    }}>
      <span style={{ fontSize: "20px" }}>LINE</span> LINEでログイン
    </button>
    
    <p style={{ fontSize: "11px", color: colors.subText, marginTop: "20px" }}>
      ログインすることで利用規約に同意したことになります
    </p>
  </div>
);
