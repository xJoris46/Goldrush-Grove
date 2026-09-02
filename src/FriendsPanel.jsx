import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { BUILDING_TYPES, GRID_SIZE } from "./Game.jsx";

export default function FriendsPanel({ userId, onClose }) {
  const [tab, setTab] = useState("friends"); // "friends" | "requests" | "search"
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [friends, setFriends] = useState([]); // [{friendshipId, profile}]
  const [incoming, setIncoming] = useState([]); // [{friendshipId, profile}]
  const [error, setError] = useState("");
  const [viewingCity, setViewingCity] = useState(null); // {profile, city} | null

  useEffect(() => {
    loadFriendsAndRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadFriendsAndRequests = async () => {
    setError("");
    const { data, error: err } = await supabase
      .from("friendships")
      .select("id, status, requester_id, addressee_id")
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
    if (err) {
      setError(err.message);
      return;
    }
    const otherIds = data.map((row) =>
      row.requester_id === userId ? row.addressee_id : row.requester_id
    );
    let profilesById = {};
    if (otherIds.length) {
      const { data: profileRows, error: profErr } = await supabase
        .from("profiles")
        .select("id, username, level, coins")
        .in("id", otherIds);
      if (profErr) {
        setError(profErr.message);
        return;
      }
      profilesById = Object.fromEntries(profileRows.map((p) => [p.id, p]));
    }

    const acceptedList = [];
    const incomingList = [];
    data.forEach((row) => {
      const otherId =
        row.requester_id === userId ? row.addressee_id : row.requester_id;
      const profile = profilesById[otherId];
      if (!profile) return;
      if (row.status === "accepted") {
        acceptedList.push({ friendshipId: row.id, profile });
      } else if (row.status === "pending" && row.addressee_id === userId) {
        incomingList.push({ friendshipId: row.id, profile });
      }
    });
    setFriends(acceptedList);
    setIncoming(incomingList);
  };

  const runSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError("");
    const { data, error: err } = await supabase
      .from("profiles")
      .select("id, username, level")
      .ilike("username", `%${query.trim()}%`)
      .neq("id", userId)
      .limit(10);
    setSearching(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSearchResults(data);
  };

  const sendRequest = async (targetId) => {
    setError("");
    const { error: err } = await supabase
      .from("friendships")
      .insert({ requester_id: userId, addressee_id: targetId });
    if (err) {
      setError(err.message);
      return;
    }
    setSearchResults((r) => r.filter((p) => p.id !== targetId));
  };

  const acceptRequest = async (friendshipId) => {
    setError("");
    const { error: err } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", friendshipId);
    if (err) {
      setError(err.message);
      return;
    }
    loadFriendsAndRequests();
  };

  const declineOrRemove = async (friendshipId) => {
    setError("");
    const { error: err } = await supabase
      .from("friendships")
      .delete()
      .eq("id", friendshipId);
    if (err) {
      setError(err.message);
      return;
    }
    loadFriendsAndRequests();
  };

  const openCity = async (profile) => {
    setError("");
    const { data, error: err } = await supabase
      .from("cities")
      .select("grid")
      .eq("profile_id", profile.id)
      .maybeSingle();
    if (err) {
      setError(err.message);
      return;
    }
    setViewingCity({ profile, grid: data?.grid || [] });
  };

  if (viewingCity) {
    return (
      <Overlay onClose={onClose}>
        <div style={{ marginBottom: 10 }}>
          <button onClick={() => setViewingCity(null)} style={backBtn}>
            ← Terug
          </button>
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>
          {viewingCity.profile.username}'s stad
        </div>
        <div style={{ fontSize: 12.5, opacity: 0.65, marginBottom: 14 }}>
          Level {viewingCity.profile.level}
        </div>
        <ReadOnlyGrid grid={viewingCity.grid} />
      </Overlay>
    );
  }

  return (
    <Overlay onClose={onClose}>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>
        Buren
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {[
          ["friends", `Vrienden (${friends.length})`],
          ["requests", `Verzoeken (${incoming.length})`],
          ["search", "Zoeken"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              ...tabBtn,
              background: tab === key ? "#3A2E1F" : "#F3E5C4",
              color: tab === key ? "#FBF3E1" : "#3A2E1F",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <div style={errorBox}>{error}</div>}

      {tab === "search" && (
        <div>
          <form
            onSubmit={runSearch}
            style={{ display: "flex", gap: 6, marginBottom: 12 }}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Gebruikersnaam…"
              style={inputStyle}
            />
            <button type="submit" style={smallBtn} disabled={searching}>
              {searching ? "…" : "Zoek"}
            </button>
          </form>
          {searchResults.map((p) => (
            <Row key={p.id}>
              <span>
                {p.username} <small style={dim}>Lvl {p.level}</small>
              </span>
              <button onClick={() => sendRequest(p.id)} style={smallBtn}>
                Toevoegen
              </button>
            </Row>
          ))}
        </div>
      )}

      {tab === "requests" && (
        <div>
          {incoming.length === 0 && (
            <div style={dim}>Geen openstaande verzoeken.</div>
          )}
          {incoming.map((r) => (
            <Row key={r.friendshipId}>
              <span>
                {r.profile.username}{" "}
                <small style={dim}>Lvl {r.profile.level}</small>
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => acceptRequest(r.friendshipId)}
                  style={smallBtn}
                >
                  Accepteren
                </button>
                <button
                  onClick={() => declineOrRemove(r.friendshipId)}
                  style={smallBtnGhost}
                >
                  Weigeren
                </button>
              </div>
            </Row>
          ))}
        </div>
      )}

      {tab === "friends" && (
        <div>
          {friends.length === 0 && (
            <div style={dim}>Nog geen vrienden — zoek iemand op.</div>
          )}
          {friends.map((f) => (
            <Row key={f.friendshipId}>
              <span>
                {f.profile.username}{" "}
                <small style={dim}>Lvl {f.profile.level}</small>
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => openCity(f.profile)} style={smallBtn}>
                  Bezoek stad
                </button>
                <button
                  onClick={() => declineOrRemove(f.friendshipId)}
                  style={smallBtnGhost}
                >
                  Verwijder
                </button>
              </div>
            </Row>
          ))}
        </div>
      )}
    </Overlay>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(58,46,31,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 70,
        padding: 20,
      }}
    >
      <div
        style={{
          background: "#FBF3E1",
          borderRadius: 18,
          padding: "22px 20px",
          width: "100%",
          maxWidth: 420,
          maxHeight: "80vh",
          overflowY: "auto",
          fontFamily: "'Georgia', 'Iowan Old Style', serif",
          color: "#3A2E1F",
          boxShadow: "0 8px 0 rgba(58,46,31,0.25)",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 16,
            background: "none",
            border: "none",
            fontSize: 16,
            cursor: "pointer",
            opacity: 0.6,
          }}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

function ReadOnlyGrid({ grid }) {
  const cells = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) =>
    grid[i] || null
  );
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
        gap: 4,
        background: "#3F6B4A",
        padding: 6,
        borderRadius: 10,
      }}
    >
      {cells.map((cell, idx) => {
        const def = cell ? BUILDING_TYPES[cell.type] : null;
        return (
          <div
            key={idx}
            style={{
              aspectRatio: "1 / 1",
              borderRadius: 6,
              background: def
                ? def.color
                : "repeating-linear-gradient(45deg,#4A7A56,#4A7A56 6px,#446F4F 6px,#446F4F 12px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            {def ? def.emoji : ""}
          </div>
        );
      })}
    </div>
  );
}

function Row({ children }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "9px 2px",
        borderBottom: "1px solid #EADFC0",
        fontSize: 13.5,
      }}
    >
      {children}
    </div>
  );
}

const dim = { opacity: 0.55, fontSize: 12 };

const tabBtn = {
  border: "none",
  borderRadius: 999,
  padding: "6px 12px",
  fontSize: 12.5,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "inherit",
};

const smallBtn = {
  background: "#3A2E1F",
  color: "#FBF3E1",
  border: "none",
  borderRadius: 999,
  padding: "6px 12px",
  fontSize: 12.5,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "inherit",
  whiteSpace: "nowrap",
};

const smallBtnGhost = {
  ...smallBtn,
  background: "none",
  color: "#A6484A",
  border: "1px solid #E3D5AE",
};

const backBtn = {
  background: "none",
  border: "none",
  color: "#B9772E",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 13,
  padding: 0,
  fontFamily: "inherit",
};

const inputStyle = {
  flex: 1,
  border: "1px solid #E3D5AE",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 13.5,
  fontFamily: "inherit",
  background: "#FFFDF7",
  color: "#3A2E1F",
};

const errorBox = {
  background: "#F6DCC7",
  color: "#7A3B1E",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 12.5,
  marginBottom: 12,
};
