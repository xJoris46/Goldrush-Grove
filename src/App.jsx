import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabaseClient";
import AuthScreen from "./AuthScreen.jsx";
import Game from "./Game.jsx";

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading
  const [profile, setProfile] = useState(null);
  const [city, setCity] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [fallbackUsername, setFallbackUsername] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) {
        setProfile(null);
        setCity(null);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    loadPlayerData(session.user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const loadPlayerData = async (userId) => {
    setLoadError("");
    const { data: profileRow, error: profileErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (profileErr) {
      setLoadError(profileErr.message);
      return;
    }
    if (!profileRow) {
      // Registered while email confirmation was still required, so the
      // profile row never got created. Ask for a username now.
      setProfile(null);
      setCity(null);
      return;
    }
    const { data: cityRow, error: cityErr } = await supabase
      .from("cities")
      .select("*")
      .eq("profile_id", userId)
      .maybeSingle();
    if (cityErr) {
      setLoadError(cityErr.message);
      return;
    }
    setProfile(profileRow);
    setCity(cityRow);
  };

  const createFallbackProfile = async (e) => {
    e.preventDefault();
    if (fallbackUsername.trim().length < 3) return;
    const userId = session.user.id;
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({ id: userId, username: fallbackUsername.trim() });
    if (profileError) {
      setLoadError(profileError.message);
      return;
    }
    const { error: cityError } = await supabase
      .from("cities")
      .insert({ profile_id: userId, grid: [], stats: {} });
    if (cityError) {
      setLoadError(cityError.message);
      return;
    }
    loadPlayerData(userId);
  };

  if (session === undefined) {
    return <CenteredMessage>Laden…</CenteredMessage>;
  }

  if (!session) {
    return <AuthScreen />;
  }

  if (loadError) {
    return <CenteredMessage>Er ging iets mis: {loadError}</CenteredMessage>;
  }

  if (session && profile === null && city === null) {
    // Either still loading, or the profile row is genuinely missing.
    return (
      <CenteredMessage>
        <form
          onSubmit={createFallbackProfile}
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
        >
          <div>Kies nog even een gebruikersnaam om verder te gaan:</div>
          <input
            value={fallbackUsername}
            onChange={(e) => setFallbackUsername(e.target.value)}
            placeholder="jouw-naam"
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #E3D5AE",
            }}
          />
          <button
            type="submit"
            style={{
              background: "#3A2E1F",
              color: "#FBF3E1",
              border: "none",
              borderRadius: 999,
              padding: "9px 0",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Verder
          </button>
        </form>
      </CenteredMessage>
    );
  }

  return (
    <Game
      session={session}
      initialProfile={profile}
      initialCity={city}
      onSignOut={() => supabase.auth.signOut()}
    />
  );
}

function CenteredMessage({ children }) {
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
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 320 }}>{children}</div>
    </div>
  );
}
