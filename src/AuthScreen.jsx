import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function AuthScreen() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        if (username.trim().length < 3) {
          setError("Kies een gebruikersnaam van minstens 3 tekens.");
          setLoading(false);
          return;
        }
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;

        // If email confirmation is off, there's a session right away and
        // we can create the profile + city rows immediately.
        if (data.session) {
          const userId = data.user.id;
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({ id: userId, username: username.trim() });
          if (profileError) throw profileError;
          const { error: cityError } = await supabase
            .from("cities")
            .insert({ profile_id: userId, grid: [], stats: {} });
          if (cityError) throw cityError;
        } else {
          setError(
            "Account aangemaakt. Check je e-mail om te bevestigen, en log dan in."
          );
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword(
          { email, password }
        );
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err.message || "Er ging iets mis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #FBF3E1 0%, #F3E5C4 100%)",
        fontFamily: "'Georgia', 'Iowan Old Style', serif",
        color: "#3A2E1F",
        padding: 20,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#FFFDF7",
          borderRadius: 18,
          padding: "32px 28px",
          width: "100%",
          maxWidth: 340,
          boxShadow: "0 6px 0 rgba(58,46,31,0.2)",
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
          Goldrush Grove
        </div>
        <div style={{ fontSize: 13, opacity: 0.65, marginBottom: 20 }}>
          {mode === "login" ? "Log in op je stad" : "Maak een nieuw account"}
        </div>

        {mode === "register" && (
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Gebruikersnaam</label>
            <input
              style={inputStyle}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="jouw-naam"
              required
            />
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>E-mail</label>
          <input
            style={inputStyle}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jij@voorbeeld.nl"
            required
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Wachtwoord</label>
          <input
            style={inputStyle}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="minstens 6 tekens"
            minLength={6}
            required
          />
        </div>

        {error && (
          <div
            style={{
              background: "#F6DCC7",
              color: "#7A3B1E",
              borderRadius: 8,
              padding: "8px 10px",
              fontSize: 12.5,
              marginBottom: 14,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            background: "#3A2E1F",
            color: "#FBF3E1",
            border: "none",
            borderRadius: 999,
            padding: "11px 0",
            fontWeight: 700,
            fontSize: 15,
            cursor: loading ? "default" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading
            ? "Even geduld…"
            : mode === "login"
            ? "Inloggen"
            : "Account aanmaken"}
        </button>

        <div
          style={{
            textAlign: "center",
            fontSize: 12.5,
            marginTop: 16,
            opacity: 0.75,
          }}
        >
          {mode === "login" ? (
            <>
              Nog geen account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
                style={linkStyle}
              >
                Registreren
              </button>
            </>
          ) : (
            <>
              Al een account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                style={linkStyle}
              >
                Inloggen
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 11.5,
  fontWeight: 700,
  opacity: 0.65,
  marginBottom: 4,
};

const inputStyle = {
  width: "100%",
  border: "1px solid #E3D5AE",
  borderRadius: 8,
  padding: "9px 11px",
  fontSize: 14,
  fontFamily: "inherit",
  boxSizing: "border-box",
  background: "#FBF3E1",
  color: "#3A2E1F",
};

const linkStyle = {
  background: "none",
  border: "none",
  color: "#B9772E",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 12.5,
  padding: 0,
  fontFamily: "inherit",
  textDecoration: "underline",
};
