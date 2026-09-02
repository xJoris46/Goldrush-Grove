import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabaseClient";
import FriendsPanel from "./FriendsPanel.jsx";

// ---- Game data (original content) ----
export const GRID_SIZE = 7;

export const BUILDING_TYPES = {
  house: {
    id: "house",
    name: "Cottage",
    emoji: "🏠",
    cost: 50,
    buildSeconds: 8,
    income: 12,
    incomeSeconds: 20,
    color: "#C97B4A",
    category: "income",
    unlockLevel: 1,
  },
  tree: {
    id: "tree",
    name: "Old Pine",
    emoji: "🌲",
    cost: 20,
    buildSeconds: 3,
    income: 0,
    incomeSeconds: 0,
    color: "#3F6B4A",
    category: "decor",
    unlockLevel: 1,
  },
  fountain: {
    id: "fountain",
    name: "Stone Fountain",
    emoji: "⛲",
    cost: 130,
    buildSeconds: 12,
    income: 0,
    incomeSeconds: 0,
    color: "#5B8AA6",
    category: "decor",
    unlockLevel: 2,
  },
  shop: {
    id: "shop",
    name: "Trading Post",
    emoji: "🏪",
    cost: 180,
    buildSeconds: 18,
    income: 40,
    incomeSeconds: 35,
    color: "#3C8C7C",
    category: "income",
    unlockLevel: 3,
  },
  bakery: {
    id: "bakery",
    name: "Bakery",
    emoji: "🥖",
    cost: 260,
    buildSeconds: 24,
    income: 62,
    incomeSeconds: 40,
    color: "#B9772E",
    category: "income",
    unlockLevel: 4,
  },
  mill: {
    id: "mill",
    name: "Windmill",
    emoji: "🌾",
    cost: 420,
    buildSeconds: 30,
    income: 95,
    incomeSeconds: 50,
    color: "#D4A62A",
    category: "income",
    unlockLevel: 5,
  },
  clocktower: {
    id: "clocktower",
    name: "Clocktower",
    emoji: "🕰️",
    cost: 340,
    buildSeconds: 26,
    income: 0,
    incomeSeconds: 0,
    color: "#7A5C8E",
    category: "decor",
    unlockLevel: 6,
  },
  harbor: {
    id: "harbor",
    name: "Harbor Dock",
    emoji: "⚓",
    cost: 700,
    buildSeconds: 45,
    income: 165,
    incomeSeconds: 65,
    color: "#2E6E8E",
    category: "income",
    unlockLevel: 8,
  },
  statue: {
    id: "statue",
    name: "Founder's Statue",
    emoji: "🗿",
    cost: 900,
    buildSeconds: 40,
    income: 0,
    incomeSeconds: 0,
    color: "#8C7853",
    category: "decor",
    unlockLevel: 10,
  },
  bank: {
    id: "bank",
    name: "Bank",
    emoji: "🏦",
    cost: 1400,
    buildSeconds: 70,
    income: 260,
    incomeSeconds: 80,
    color: "#4F7942",
    category: "income",
    unlockLevel: 12,
  },
  cinema: {
    id: "cinema",
    name: "Cinema",
    emoji: "🎬",
    cost: 1100,
    buildSeconds: 55,
    income: 0,
    incomeSeconds: 0,
    color: "#6B4C6B",
    category: "decor",
    unlockLevel: 15,
  },
  apartment: {
    id: "apartment",
    name: "Apartment Block",
    emoji: "🏬",
    cost: 2200,
    buildSeconds: 90,
    income: 380,
    incomeSeconds: 95,
    color: "#B0563E",
    category: "income",
    unlockLevel: 18,
  },
  wheel: {
    id: "wheel",
    name: "Ferris Wheel",
    emoji: "🎡",
    cost: 1600,
    buildSeconds: 60,
    income: 0,
    incomeSeconds: 0,
    color: "#C6588A",
    category: "decor",
    unlockLevel: 22,
  },
  stadium: {
    id: "stadium",
    name: "Stadium",
    emoji: "🏟️",
    cost: 3800,
    buildSeconds: 120,
    income: 560,
    incomeSeconds: 115,
    color: "#3E7A57",
    category: "income",
    unlockLevel: 28,
  },
  office: {
    id: "office",
    name: "Office Tower",
    emoji: "🏢",
    cost: 5600,
    buildSeconds: 140,
    income: 800,
    incomeSeconds: 130,
    color: "#436B8C",
    category: "income",
    unlockLevel: 35,
  },
  hotel: {
    id: "hotel",
    name: "Grand Hotel",
    emoji: "🏨",
    cost: 8200,
    buildSeconds: 160,
    income: 1150,
    incomeSeconds: 150,
    color: "#A6484A",
    category: "income",
    unlockLevel: 45,
  },
  skyscraper: {
    id: "skyscraper",
    name: "Skyscraper",
    emoji: "🌆",
    cost: 12000,
    buildSeconds: 180,
    income: 1700,
    incomeSeconds: 165,
    color: "#2E4A6B",
    category: "income",
    unlockLevel: 50,
  },
  monument: {
    id: "monument",
    name: "Founders' Monument",
    emoji: "🗽",
    cost: 9000,
    buildSeconds: 150,
    income: 0,
    incomeSeconds: 0,
    color: "#7A8C5A",
    category: "decor",
    unlockLevel: 65,
  },
  garden: {
    id: "garden",
    name: "Botanical Garden",
    emoji: "🌻",
    cost: 13000,
    buildSeconds: 170,
    income: 0,
    incomeSeconds: 0,
    color: "#5A8A6A",
    category: "decor",
    unlockLevel: 80,
  },
  cityhall: {
    id: "cityhall",
    name: "City Hall",
    emoji: "🏛️",
    cost: 20000,
    buildSeconds: 240,
    income: 0,
    incomeSeconds: 0,
    color: "#8C6B3E",
    category: "decor",
    unlockLevel: 100,
  },
};

const PALETTE_ORDER = [
  "house",
  "tree",
  "fountain",
  "shop",
  "bakery",
  "mill",
  "clocktower",
  "harbor",
  "statue",
  "bank",
  "cinema",
  "apartment",
  "wheel",
  "stadium",
  "office",
  "hotel",
  "skyscraper",
  "monument",
  "garden",
  "cityhall",
];

// Reward for leveling up. Coins are claimed by the player (chest-open
// moment). Milestone levels unlock a new building (defined by that
// building's own `unlockLevel` above); every other level still gives a
// scaling coin bonus so leveling always feels worth it, all the way to
// (and past) level 100 — no need to hand-write a reward for every level.
function levelReward(level) {
  const unlock = Object.values(BUILDING_TYPES).find(
    (b) => b.unlockLevel === level
  );
  const base = Math.round(35 * Math.pow(level, 1.25));
  if (unlock) {
    const coins = base + Math.round(unlock.cost * 0.4);
    const note =
      unlock.category === "decor"
        ? level >= 50
          ? "New landmark unlocked"
          : "New decoration unlocked"
        : "New income building unlocked";
    return { coins, unlock: unlock.id, note };
  }
  return { coins: base, note: "Bonus coins" };
}

function xpNeeded(level) {
  return Math.round(65 * Math.pow(level, 1.2));
}

// Missions: ordered, one active at a time, increasing difficulty.
const QUESTS = [
  {
    id: "q1",
    title: "First Cottage",
    desc: "Place your first Cottage.",
    target: 1,
    getProgress: (ctx) => Math.min(1, ctx.stats.byType.house || 0),
    reward: { coins: 40 },
  },
  {
    id: "q2",
    title: "Growing Village",
    desc: "Place 3 Cottages in total.",
    target: 3,
    getProgress: (ctx) => Math.min(3, ctx.stats.byType.house || 0),
    reward: { coins: 90, xp: 15 },
  },
  {
    id: "q3",
    title: "First Harvest",
    desc: "Collect income 3 times.",
    target: 3,
    getProgress: (ctx) => Math.min(3, ctx.stats.totalCollections),
    reward: { coins: 70 },
  },
  {
    id: "q4",
    title: "Rising Star",
    desc: "Reach level 3.",
    target: 3,
    getProgress: (ctx) => Math.min(3, ctx.level),
    reward: { coins: 130 },
  },
  {
    id: "q5",
    title: "Open for Trade",
    desc: "Place a Trading Post.",
    target: 1,
    getProgress: (ctx) => Math.min(1, ctx.stats.byType.shop || 0),
    reward: { coins: 110 },
  },
  {
    id: "q6",
    title: "Small Town",
    desc: "Have 5 buildings standing at once.",
    target: 5,
    getProgress: (ctx) => Math.min(5, ctx.buildingsOnMap),
    reward: { coins: 160 },
  },
  {
    id: "q7",
    title: "Steady Income",
    desc: "Earn 1,000 coins from collecting.",
    target: 1000,
    getProgress: (ctx) => Math.min(1000, ctx.stats.lifetimeEarned),
    reward: { coins: 220 },
  },
  {
    id: "q8",
    title: "Windmill Power",
    desc: "Place a Windmill.",
    target: 1,
    getProgress: (ctx) => Math.min(1, ctx.stats.byType.mill || 0),
    reward: { coins: 260 },
  },
  {
    id: "q9",
    title: "Local Legend",
    desc: "Reach level 6.",
    target: 6,
    getProgress: (ctx) => Math.min(6, ctx.level),
    reward: { coins: 320 },
  },
  {
    id: "q10",
    title: "Bustling Grove",
    desc: "Have 10 buildings standing at once.",
    target: 10,
    getProgress: (ctx) => Math.min(10, ctx.buildingsOnMap),
    reward: { coins: 400 },
  },
  {
    id: "q11",
    title: "Merchant Empire",
    desc: "Earn 5,000 coins from collecting.",
    target: 5000,
    getProgress: (ctx) => Math.min(5000, ctx.stats.lifetimeEarned),
    reward: { coins: 550 },
  },
  {
    id: "q12",
    title: "Founder of Goldrush",
    desc: "Reach level 10.",
    target: 10,
    getProgress: (ctx) => Math.min(10, ctx.level),
    reward: { coins: 900 },
  },
  // --- mid-game ---
  {
    id: "q13",
    title: "Bakery Boom",
    desc: "Place a Bakery.",
    target: 1,
    getProgress: (ctx) => Math.min(1, ctx.stats.byType.bakery || 0),
    reward: { coins: 180 },
  },
  {
    id: "q14",
    title: "Metropolis",
    desc: "Have 15 buildings standing at once.",
    target: 15,
    getProgress: (ctx) => Math.min(15, ctx.buildingsOnMap),
    reward: { coins: 480 },
  },
  {
    id: "q15",
    title: "Harvest Master",
    desc: "Collect income 50 times.",
    target: 50,
    getProgress: (ctx) => Math.min(50, ctx.stats.totalCollections),
    reward: { coins: 520 },
  },
  {
    id: "q16",
    title: "Coin Baron",
    desc: "Earn 10,000 coins from collecting.",
    target: 10000,
    getProgress: (ctx) => Math.min(10000, ctx.stats.lifetimeEarned),
    reward: { coins: 900 },
  },
  {
    id: "q17",
    title: "Harbor Ambitions",
    desc: "Place a Harbor Dock.",
    target: 1,
    getProgress: (ctx) => Math.min(1, ctx.stats.byType.harbor || 0),
    reward: { coins: 650 },
  },
  // --- end-game ---
  {
    id: "q18",
    title: "Founder's Statue",
    desc: "Place the Founder's Statue.",
    target: 1,
    getProgress: (ctx) => Math.min(1, ctx.stats.byType.statue || 0),
    reward: { coins: 800, xp: 40 },
  },
  {
    id: "q19",
    title: "Tycoon",
    desc: "Have 20 buildings standing at once.",
    target: 20,
    getProgress: (ctx) => Math.min(20, ctx.buildingsOnMap),
    reward: { coins: 1300 },
  },
  {
    id: "q20",
    title: "Harvest Legend",
    desc: "Collect income 120 times.",
    target: 120,
    getProgress: (ctx) => Math.min(120, ctx.stats.totalCollections),
    reward: { coins: 1400 },
  },
  {
    id: "q21",
    title: "Coin Emperor",
    desc: "Earn 25,000 coins from collecting.",
    target: 25000,
    getProgress: (ctx) => Math.min(25000, ctx.stats.lifetimeEarned),
    reward: { coins: 1800 },
  },
  {
    id: "q22",
    title: "Grove Immortal",
    desc: "Build at least one of every building type.",
    target: Object.keys(BUILDING_TYPES).length,
    getProgress: (ctx) =>
      Object.keys(BUILDING_TYPES).filter(
        (id) => (ctx.stats.byType[id] || 0) > 0
      ).length,
    reward: { coins: 2200, xp: 80 },
  },
];

// Repeatable daily-style tasks. Note: since this prototype has no
// account/server backend yet, these refresh immediately on completion
// rather than resetting at midnight — a real daily reset needs a backend
// that tracks time per player, which ties into the "online" version.
const DAILY_POOL = [
  {
    type: "collect",
    target: 5,
    title: "Quick Harvest",
    desc: "Collect income 5 times",
    reward: { coins: 60, xp: 10 },
  },
  {
    type: "collect",
    target: 10,
    title: "Harvest Festival",
    desc: "Collect income 10 times",
    reward: { coins: 120, xp: 20 },
  },
  {
    type: "build",
    target: 2,
    title: "Build Something",
    desc: "Place 2 buildings",
    reward: { coins: 70, xp: 10 },
  },
  {
    type: "build",
    target: 4,
    title: "Construction Spree",
    desc: "Place 4 buildings",
    reward: { coins: 140, xp: 20 },
  },
  {
    type: "earn",
    target: 300,
    title: "Coin Counter",
    desc: "Earn 300 coins from collecting",
    reward: { coins: 90, xp: 15 },
  },
  {
    type: "earn",
    target: 800,
    title: "Coin Stacker",
    desc: "Earn 800 coins from collecting",
    reward: { coins: 200, xp: 25 },
  },
];

const DAILY_SLOT_COUNT = 3;

function statFor(type, stats) {
  if (type === "collect") return stats.totalCollections;
  if (type === "build") return stats.totalBuilt;
  if (type === "earn") return stats.lifetimeEarned;
  return 0;
}

function randomDailySlot(existingTemplateIdx, stats) {
  let idx;
  do {
    idx = Math.floor(Math.random() * DAILY_POOL.length);
  } while (idx === existingTemplateIdx && DAILY_POOL.length > 1);
  const template = DAILY_POOL[idx];
  return {
    templateIdx: idx,
    baseline: statFor(template.type, stats),
    key: `${idx}-${Date.now()}-${Math.random()}`,
  };
}

function emptyGrid() {
  return Array.from({ length: GRID_SIZE * GRID_SIZE }, () => null);
}

function fmt(n) {
  return Math.floor(n).toLocaleString("en-US");
}

export default function GoldrushGrove({
  session,
  initialProfile,
  initialCity,
  onSignOut,
}) {
  const userId = session.user.id;
  const savedStats = initialCity?.stats || {};
  const savedCore = savedStats.core || {
    byType: {},
    totalBuilt: 0,
    totalCollections: 0,
    lifetimeEarned: 0,
  };

  const [coins, setCoins] = useState(initialProfile?.coins ?? 260);
  const [grid, setGrid] = useState(
    initialCity?.grid && initialCity.grid.length ? initialCity.grid : emptyGrid
  );
  const [selected, setSelected] = useState("house");
  const [now, setNow] = useState(Date.now());
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const [progress, setProgress] = useState({
    level: initialProfile?.level ?? 1,
    xp: initialProfile?.xp ?? 0,
  });
  const [rewardQueue, setRewardQueue] = useState([]); // [{level, coins, unlock?, note}]
  const [openChest, setOpenChest] = useState(false); // animation state for active reward card

  const [stats, setStats] = useState(savedCore);
  const [completedQuestIds, setCompletedQuestIds] = useState(
    savedStats.completedQuestIds || []
  );
  const [questBanner, setQuestBanner] = useState(null);
  const questBannerTimer = useRef(null);

  const [dailySlots, setDailySlots] = useState(
    () =>
      savedStats.dailySlots ||
      Array.from({ length: DAILY_SLOT_COUNT }, () =>
        randomDailySlot(-1, savedCore)
      )
  );

  const [saveStatus, setSaveStatus] = useState("saved"); // "saved" | "saving" | "error"
  const [showFriends, setShowFriends] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  // Keep the latest game state in a ref so the autosave interval always
  // reads current values without needing to be re-created on every change.
  const latestState = useRef();
  latestState.current = {
    coins,
    grid,
    progress,
    stats,
    completedQuestIds,
    dailySlots,
  };

  useEffect(() => {
    const saveNow = async () => {
      const s = latestState.current;
      setSaveStatus("saving");
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({
          coins: s.coins,
          level: s.progress.level,
          xp: s.progress.xp,
        })
        .eq("id", userId);
      const { error: cityErr } = await supabase
        .from("cities")
        .update({
          grid: s.grid,
          stats: {
            core: s.stats,
            completedQuestIds: s.completedQuestIds,
            dailySlots: s.dailySlots,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("profile_id", userId);
      setSaveStatus(profileErr || cityErr ? "error" : "saved");
    };
    const id = setInterval(saveNow, 6000);
    // Save once when the tab is being closed / navigated away, on a
    // best-effort basis.
    window.addEventListener("beforeunload", saveNow);
    return () => {
      clearInterval(id);
      window.removeEventListener("beforeunload", saveNow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1400);
  }, []);

  const addXp = useCallback((amount) => {
    setProgress((prev) => {
      let { level, xp } = prev;
      xp += amount;
      const gained = [];
      while (xp >= xpNeeded(level)) {
        xp -= xpNeeded(level);
        level += 1;
        gained.push(level);
      }
      if (gained.length) {
        setRewardQueue((q) => [
          ...q,
          ...gained.map((lv) => ({ level: lv, ...levelReward(lv) })),
        ]);
      }
      return { level, xp };
    });
  }, []);

  const placeBuilding = (idx) => {
    const def = BUILDING_TYPES[selected];
    if (def.unlockLevel > progress.level) {
      showToast(`Unlocks at level ${def.unlockLevel}`);
      return;
    }
    if (grid[idx]) {
      showToast("That plot is already taken.");
      return;
    }
    if (coins < def.cost) {
      showToast("Not enough coins yet.");
      return;
    }
    setCoins((c) => c - def.cost);
    setGrid((g) => {
      const next = [...g];
      next[idx] = {
        type: def.id,
        builtAt: Date.now(),
        buildMs: def.buildSeconds * 1000,
        lastCollect: Date.now(),
      };
      return next;
    });
    addXp(6 + Math.round(def.cost / 12));
    setStats((s) => ({
      ...s,
      totalBuilt: s.totalBuilt + 1,
      byType: { ...s.byType, [def.id]: (s.byType[def.id] || 0) + 1 },
    }));
  };

  const collect = (idx) => {
    const cell = grid[idx];
    if (!cell) return;
    const def = BUILDING_TYPES[cell.type];
    const constructing = now - cell.builtAt < cell.buildMs;
    if (constructing || def.income === 0) return;
    const elapsed = now - cell.lastCollect;
    const cycles = Math.floor(elapsed / (def.incomeSeconds * 1000));
    if (cycles <= 0) return;
    const earned = cycles * def.income;
    setCoins((c) => c + earned);
    setGrid((g) => {
      const next = [...g];
      next[idx] = {
        ...cell,
        lastCollect: cell.lastCollect + cycles * def.incomeSeconds * 1000,
      };
      return next;
    });
    showToast(`+${earned} coins`);
    addXp(2 + Math.round(earned / 6));
    setStats((s) => ({
      ...s,
      totalCollections: s.totalCollections + 1,
      lifetimeEarned: s.lifetimeEarned + earned,
    }));
  };

  // Check the current mission against the latest stats/level/board and
  // cascade to the next one if several were completed at once.
  useEffect(() => {
    const current = QUESTS.find((q) => !completedQuestIds.includes(q.id));
    if (!current) return;
    const ctx = {
      stats,
      level: progress.level,
      buildingsOnMap: grid.filter(Boolean).length,
    };
    if (current.getProgress(ctx) >= current.target) {
      setCompletedQuestIds((ids) => [...ids, current.id]);
      setCoins((c) => c + current.reward.coins);
      if (current.reward.xp) addXp(current.reward.xp);
      setQuestBanner({ kind: "mission", title: current.title, coins: current.reward.coins });
      clearTimeout(questBannerTimer.current);
      questBannerTimer.current = setTimeout(() => setQuestBanner(null), 2400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats, progress.level, grid, completedQuestIds]);

  // Check each daily slot; on completion, grant reward and roll a fresh one.
  useEffect(() => {
    dailySlots.forEach((slot, slotIdx) => {
      const template = DAILY_POOL[slot.templateIdx];
      const currentVal = statFor(template.type, stats);
      const doneAmount = currentVal - slot.baseline;
      if (doneAmount >= template.target) {
        setCoins((c) => c + template.reward.coins);
        if (template.reward.xp) addXp(template.reward.xp);
        setQuestBanner({
          kind: "daily",
          title: template.title,
          coins: template.reward.coins,
        });
        clearTimeout(questBannerTimer.current);
        questBannerTimer.current = setTimeout(
          () => setQuestBanner(null),
          2400
        );
        setDailySlots((slots) => {
          const next = [...slots];
          next[slotIdx] = randomDailySlot(slot.templateIdx, stats);
          return next;
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats]);

  const activeQuest = QUESTS.find((q) => !completedQuestIds.includes(q.id));
  const activeQuestProgress = activeQuest
    ? activeQuest.getProgress({
        stats,
        level: progress.level,
        buildingsOnMap: grid.filter(Boolean).length,
      })
    : null;

  const activeReward = rewardQueue[0];

  const claimReward = () => {
    if (!activeReward) return;
    setCoins((c) => c + activeReward.coins);
    setOpenChest(false);
    setRewardQueue((q) => q.slice(1));
  };

  const totalBuildings = grid.filter(Boolean).length;
  const xpPct = Math.min(
    100,
    (progress.xp / xpNeeded(progress.level)) * 100
  );

  return (
    <div
      style={{
        fontFamily: "'Georgia', 'Iowan Old Style', serif",
        background: "linear-gradient(180deg, #FBF3E1 0%, #F3E5C4 100%)",
        minHeight: "100%",
        padding: "20px 16px 32px",
        color: "#3A2E1F",
        position: "relative",
      }}
    >
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes chestBounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-4px) rotate(-4deg); }
          75% { transform: translateY(-4px) rotate(4deg); }
        }
        @keyframes burst {
          0% { transform: scale(0.3); opacity: 1; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.15); }
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          maxWidth: 720,
          margin: "0 auto 10px",
          borderBottom: "3px solid #3A2E1F",
          paddingBottom: 10,
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 0.3 }}>
            Goldrush Grove
          </div>
          <div style={{ fontSize: 13, opacity: 0.65, marginTop: 2 }}>
            {initialProfile?.username || "Speler"} · {totalBuildings} plot
            {totalBuildings === 1 ? "" : "s"} claimed
          </div>
          <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>
            {saveStatus === "saving"
              ? "Opslaan…"
              : saveStatus === "error"
              ? "Opslaan mislukt"
              : "Opgeslagen"}
            {" · "}
            <button
              onClick={onSignOut}
              style={{
                background: "none",
                border: "none",
                color: "#B9772E",
                textDecoration: "underline",
                cursor: "pointer",
                fontSize: 11,
                padding: 0,
                fontFamily: "inherit",
              }}
            >
              Uitloggen
            </button>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setShowFriends(true)}
            style={{
              background: "#FFFDF7",
              border: "1px solid #E3D5AE",
              color: "#3A2E1F",
              borderRadius: 10,
              padding: "8px 14px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            👥 Buren
          </button>
          <div
            style={{
              background: "#3A2E1F",
              color: "#FBF3E1",
              borderRadius: 10,
              padding: "8px 16px",
              fontSize: 20,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            🪙 {fmt(coins)}
          </div>
        </div>
      </div>

      {showFriends && (
        <FriendsPanel userId={userId} onClose={() => setShowFriends(false)} />
      )}

      {/* XP bar */}
      <div style={{ maxWidth: 720, margin: "0 auto 16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12.5,
            marginBottom: 4,
            opacity: 0.8,
          }}
        >
          <span
            style={{
              background: "#E7B23C",
              color: "#3A2E1F",
              fontWeight: 700,
              borderRadius: 999,
              width: 22,
              height: 22,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
            }}
          >
            {progress.level}
          </span>
          <span>
            {Math.round(progress.xp)} / {xpNeeded(progress.level)} XP to
            level {progress.level + 1}
          </span>
        </div>
        <div
          style={{
            height: 10,
            borderRadius: 999,
            background: "#E3D5AE",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${xpPct}%`,
              background:
                "linear-gradient(90deg, #E7B23C, #D4A62A)",
              transition: "width 300ms ease",
            }}
          />
        </div>
      </div>

      {/* Mission tracker */}
      {activeQuest ? (
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto 16px",
            background: "#FFFDF7",
            borderRadius: 12,
            padding: "10px 14px",
            boxShadow: "0 1px 0 rgba(58,46,31,0.15)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 8,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: 0.5,
                  opacity: 0.55,
                  fontWeight: 700,
                }}
              >
                MISSION
              </div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>
                {activeQuest.title}
              </div>
              <div style={{ fontSize: 12.5, opacity: 0.75 }}>
                {activeQuest.desc}
              </div>
            </div>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: "#B9772E",
                whiteSpace: "nowrap",
              }}
            >
              +{activeQuest.reward.coins}c
            </div>
          </div>
          <div
            style={{
              height: 7,
              borderRadius: 999,
              background: "#E3D5AE",
              overflow: "hidden",
              marginTop: 8,
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${(activeQuestProgress / activeQuest.target) * 100}%`,
                background: "linear-gradient(90deg, #3C8C7C, #2E6E8E)",
                transition: "width 300ms ease",
              }}
            />
          </div>
          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 3 }}>
            {activeQuest.target > 1
              ? `${Math.floor(activeQuestProgress)} / ${activeQuest.target}`
              : activeQuestProgress >= 1
              ? "Complete"
              : "Not yet"}
          </div>
        </div>
      ) : (
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto 16px",
            textAlign: "center",
            fontSize: 12.5,
            opacity: 0.6,
          }}
        >
          All missions complete — for now.
        </div>
      )}

      {/* Daily-style repeatable tasks */}
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto 16px",
          background: "#FFFDF7",
          borderRadius: 12,
          padding: "10px 14px",
          boxShadow: "0 1px 0 rgba(58,46,31,0.15)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: 0.5,
            opacity: 0.55,
            fontWeight: 700,
            marginBottom: 6,
          }}
        >
          DAILY TASKS
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {dailySlots.map((slot, i) => {
            const template = DAILY_POOL[slot.templateIdx];
            const done = Math.max(
              0,
              Math.min(
                template.target,
                statFor(template.type, stats) - slot.baseline
              )
            );
            return (
              <div key={slot.key}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12.5,
                  }}
                >
                  <span>
                    <strong>{template.title}</strong> — {template.desc}
                  </span>
                  <span style={{ color: "#B9772E", fontWeight: 700 }}>
                    +{template.reward.coins}c
                  </span>
                </div>
                <div
                  style={{
                    height: 5,
                    borderRadius: 999,
                    background: "#E3D5AE",
                    overflow: "hidden",
                    marginTop: 3,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${(done / template.target) * 100}%`,
                      background: "linear-gradient(90deg, #D4A62A, #E7B23C)",
                      transition: "width 300ms ease",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Palette */}
      <div
        style={{
          display: "flex",
          gap: 8,
          maxWidth: 720,
          margin: "0 auto 16px",
          flexWrap: "wrap",
        }}
      >
        {PALETTE_ORDER.map((key) => {
          const def = BUILDING_TYPES[key];
          const active = selected === key;
          const locked = def.unlockLevel > progress.level;
          const affordable = coins >= def.cost;
          return (
            <button
              key={key}
              onClick={() => setSelected(key)}
              style={{
                cursor: "pointer",
                border: active ? "2px solid #3A2E1F" : "2px solid transparent",
                background: active ? "#F3E5C4" : "#FFFDF7",
                borderRadius: 12,
                padding: "8px 12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 84,
                opacity: locked ? 0.45 : affordable ? 1 : 0.6,
                boxShadow: "0 1px 0 rgba(58,46,31,0.15)",
                position: "relative",
              }}
            >
              <span style={{ fontSize: 22 }}>{locked ? "🔒" : def.emoji}</span>
              <span style={{ fontSize: 12, fontWeight: 600, marginTop: 2 }}>
                {def.name}
              </span>
              <span style={{ fontSize: 11, opacity: 0.7 }}>
                {locked ? `Lvl ${def.unlockLevel}` : `${def.cost}c`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div
        style={{
          maxWidth: 560,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gap: 5,
          background: "#3F6B4A",
          padding: 8,
          borderRadius: 14,
          boxShadow: "0 6px 0 rgba(58,46,31,0.25)",
        }}
      >
        {grid.map((cell, idx) => {
          const def = cell ? BUILDING_TYPES[cell.type] : null;
          const constructing = cell
            ? now - cell.builtAt < cell.buildMs
            : false;
          const buildProgress = cell
            ? Math.min(1, (now - cell.builtAt) / cell.buildMs)
            : 0;
          let readyToCollect = false;
          if (cell && !constructing && def.income > 0) {
            readyToCollect =
              now - cell.lastCollect >= def.incomeSeconds * 1000;
          }
          return (
            <button
              key={idx}
              onClick={() => (cell ? collect(idx) : placeBuilding(idx))}
              title={def ? def.name : "Empty plot"}
              style={{
                position: "relative",
                aspectRatio: "1 / 1",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background: cell
                  ? def.color
                  : "repeating-linear-gradient(45deg,#4A7A56,#4A7A56 6px,#446F4F 6px,#446F4F 12px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                overflow: "hidden",
              }}
            >
              {cell && (
                <span style={{ opacity: constructing ? 0.4 : 1 }}>
                  {def.emoji}
                </span>
              )}
              {constructing && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 5,
                    background: "rgba(0,0,0,0.25)",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${buildProgress * 100}%`,
                      background: "#FBF3E1",
                    }}
                  />
                </div>
              )}
              {readyToCollect && (
                <div
                  style={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: "#E7B23C",
                    boxShadow: "0 0 0 2px #FBF3E1",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div
        style={{
          maxWidth: 560,
          margin: "14px auto 0",
          fontSize: 12.5,
          opacity: 0.7,
          textAlign: "center",
        }}
      >
        Building and collecting both earn XP. Complete missions for bonus
        coins, and level up to unlock new buildings.
      </div>

      {questBanner && (
        <div
          style={{
            position: "fixed",
            top: 18,
            left: "50%",
            transform: "translateX(-50%)",
            background:
              questBanner.kind === "daily" ? "#D4A62A" : "#3C8C7C",
            color: "#FBF3E1",
            padding: "10px 20px",
            borderRadius: 12,
            fontSize: 13.5,
            fontWeight: 700,
            boxShadow: "0 4px 0 rgba(58,46,31,0.25)",
            zIndex: 60,
            animation: "popIn 220ms ease",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 600 }}>
            {questBanner.kind === "daily" ? "TASK COMPLETE" : "MISSION COMPLETE"}
          </div>
          {questBanner.title} · +{questBanner.coins} coins
        </div>
      )}

      {toast && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            bottom: 24,
            transform: "translateX(-50%)",
            background: "#3A2E1F",
            color: "#FBF3E1",
            padding: "8px 16px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {toast}
        </div>
      )}

      {/* Level-up reward modal */}
      {activeReward && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(58,46,31,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#FBF3E1",
              borderRadius: 20,
              padding: "28px 24px",
              width: "100%",
              maxWidth: 320,
              textAlign: "center",
              boxShadow: "0 10px 0 rgba(58,46,31,0.3)",
              animation: "popIn 260ms ease",
            }}
          >
            <div
              style={{
                fontSize: 13,
                letterSpacing: 1,
                fontWeight: 700,
                color: "#B9772E",
              }}
            >
              LEVEL {activeReward.level}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, margin: "4px 0 18px" }}>
              You leveled up!
            </div>

            <div
              style={{
                position: "relative",
                height: 90,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              {openChest && (
                <>
                  <span
                    style={{
                      position: "absolute",
                      fontSize: 60,
                      animation: "burst 500ms ease-out forwards",
                    }}
                  >
                    ✨
                  </span>
                  <span
                    style={{
                      position: "absolute",
                      left: "20%",
                      fontSize: 22,
                      animation: "sparkle 900ms ease-in-out infinite",
                    }}
                  >
                    ⭐
                  </span>
                  <span
                    style={{
                      position: "absolute",
                      right: "18%",
                      top: 4,
                      fontSize: 18,
                      animation: "sparkle 900ms ease-in-out infinite 200ms",
                    }}
                  >
                    ⭐
                  </span>
                </>
              )}
              <span
                style={{
                  fontSize: 56,
                  display: "inline-block",
                  animation: openChest ? "none" : "chestBounce 1.1s ease-in-out infinite",
                  cursor: openChest ? "default" : "pointer",
                }}
                onClick={() => !openChest && setOpenChest(true)}
              >
                {openChest ? "🎁" : "🎁"}
              </span>
            </div>

            {!openChest ? (
              <button
                onClick={() => setOpenChest(true)}
                style={{
                  background: "#E7B23C",
                  border: "none",
                  borderRadius: 999,
                  padding: "10px 24px",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                  boxShadow: "0 3px 0 rgba(58,46,31,0.35)",
                }}
              >
                Open reward
              </button>
            ) : (
              <>
                <div style={{ fontSize: 15, marginBottom: 4 }}>
                  {activeReward.note}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#B9772E",
                    marginBottom: 16,
                  }}
                >
                  +{activeReward.coins} coins
                  {activeReward.unlock && (
                    <div style={{ fontSize: 15, marginTop: 4 }}>
                      {BUILDING_TYPES[activeReward.unlock].emoji}{" "}
                      {BUILDING_TYPES[activeReward.unlock].name}
                    </div>
                  )}
                </div>
                <button
                  onClick={claimReward}
                  style={{
                    background: "#3A2E1F",
                    color: "#FBF3E1",
                    border: "none",
                    borderRadius: 999,
                    padding: "10px 24px",
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: "pointer",
                  }}
                >
                  Claim
                </button>
              </>
            )}

            {rewardQueue.length > 1 && (
              <div style={{ fontSize: 11, opacity: 0.6, marginTop: 10 }}>
                {rewardQueue.length - 1} more reward
                {rewardQueue.length - 1 === 1 ? "" : "s"} waiting
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
