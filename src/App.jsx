import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

// ============================================
// BLOCK-BASED EXERCISE TEMPLATES (Phase 1)
// ============================================

const BLOCK_TEMPLATES = {
  "upper-press": [
    { block: "CNS SUPERSET", rest: 45, exercises: [
      { name: "Med Ball Rotation Pass", setsN: 3, reps: "3/side" },
      { name: "Med Ball Slam", setsN: 3, reps: "5" },
    ]},
    { block: "CLUSTER SUPERSET", rest: 40, exercises: [
      { name: "DB Bench Press", setsN: 8, reps: "5" },
      { name: "TRX / Inverted Row", setsN: 8, reps: "10" },
    ]},
    { block: "SHOULDERS", rest: 150, exercises: [
      { name: "DB Shoulder Press", setsN: 3, reps: "10" },
    ]},
    { block: "CHEST / TRICEPS", rest: 150, exercises: [
      { name: "Push Up", setsN: 3, reps: "MAX" },
    ]},
    { block: "BICEPS", rest: 90, exercises: [
      { name: "DB Curl (Supinated)", setsN: 4, reps: "30" },
    ]},
  ],
  "lower": [
    { block: "CNS", rest: 60, exercises: [
      { name: "Trap Bar Jump", setsN: 3, reps: "5" },
    ]},
    { block: "CLUSTER", rest: 60, exercises: [
      { name: "Front Squat", setsN: 8, reps: "5" },
    ]},
    { block: "SINGLE-LEG CLUSTER", rest: 50, exercises: [
      { name: "DB Step Up", setsN: 8, reps: "5/side" },
    ]},
    { block: "GLUTES / HAMMIES", rest: 150, exercises: [
      { name: "Barbell Glute Bridge", setsN: 3, reps: "10" },
    ]},
    { block: "POSTERIOR CHAIN", rest: 90, exercises: [
      { name: "Back Extension", setsN: 3, reps: "MAX" },
    ]},
  ],
  "upper-pump": [
    { block: "CNS SUPERSET", rest: 45, exercises: [
      { name: "Med Ball Scoop Pass", setsN: 3, reps: "3/side" },
      { name: "Med Ball Overhead Throw", setsN: 3, reps: "5" },
    ]},
    { block: "CLUSTER SUPERSET", rest: 40, exercises: [
      { name: "DB Push-Press", setsN: 8, reps: "5" },
      { name: "Pull Up", setsN: 8, reps: "10" },
    ]},
    { block: "ARM ASSAULT", rest: 60, exercises: [
      { name: "DB Alt Curl (Seated)", setsN: 3, reps: "12" },
      { name: "DB French Press (Kneeling)", setsN: 3, reps: "15" },
    ]},
    { block: "ARM ANNIHILATION", rest: 60, exercises: [
      { name: "DB Alt Hammer Curl (Seated)", setsN: 3, reps: "12" },
      { name: "Cable Pushdown", setsN: 3, reps: "15" },
    ]},
    { block: "DELT DESTRUCTION", rest: 90, exercises: [
      { name: "DB Side Delt Raise (Seated)", setsN: 4, reps: "25" },
      { name: "DB Rear Delt Raise (Seated)", setsN: 4, reps: "25" },
    ]},
  ],
  "total": [
    { block: "CNS", rest: 60, exercises: [
      { name: "Resisted Sprint", setsN: 3, reps: "5s" },
    ]},
    { block: "CLUSTER", rest: 60, exercises: [
      { name: "Deadlift", setsN: 8, reps: "5" },
    ]},
    { block: "GORILLA SUPERSET", rest: 90, exercises: [
      { name: "Slight Decline DB Bench Press", setsN: 5, reps: "15" },
      { name: "1-Arm DB Row", setsN: 5, reps: "15" },
    ]},
    { block: "LEG PUMP", rest: 60, exercises: [
      { name: "DB Fwd to Rev Lunge", setsN: 4, reps: "10/side" },
    ]},
  ],
};

function buildExercisesFromBlocks(typeId) {
  const blocks = BLOCK_TEMPLATES[typeId];
  if (!blocks) return [];
  const exercises = [];
  blocks.forEach((b, bi) => {
    b.exercises.forEach((ex) => {
      exercises.push({
        id: generateId(),
        name: ex.name,
        block: b.block,
        blockIndex: bi,
        restSeconds: b.rest,
        sets: Array.from({ length: ex.setsN }, () => ({ reps: ex.reps, weight: "", done: false })),
      });
    });
  });
  return exercises;
}

// ============================================
// WORKOUT TYPES & TARGETS
// ============================================

const WORKOUT_TYPES = [
  { id: "upper-press", label: "UPPER PRESS", short: "PRESS", color: "#9FCB7B", icon: "UP", group: "gym" },
  { id: "lower", label: "LOWER", short: "LOWER", color: "#B98A52", icon: "LO", group: "gym" },
  { id: "upper-pump", label: "UPPER PUMP", short: "PUMP", color: "#7FA36B", icon: "PM", group: "gym" },
  { id: "total", label: "TOTAL", short: "TOTAL", color: "#A09070", icon: "TL", group: "gym" },
  { id: "bjj-gi", label: "BJJ GI", short: "GI", color: "#6BA8A0", icon: "GI", group: "bjj" },
  { id: "bjj-nogi", label: "BJJ NO-GI", short: "NO-GI", color: "#5B8E86", icon: "NG", group: "bjj" },
  { id: "boxing", label: "BOXING", short: "BOX", color: "#C4885A", icon: "BX", group: "boxing" },
  { id: "engine", label: "ENGINE", short: "ENG", color: "#6B9A8A", icon: "EN", group: "engine" },
  { id: "mobility", label: "MOBILITY", short: "MOB", color: "#8A8E78", icon: "MB", group: "other" },
];

const WEEKLY_TARGETS = [
  { group: "engine", label: "ENGINE", target: 90, unit: "min", color: "#6B9A8A" },
  { group: "bjj", label: "BJJ", target: 3, unit: "sessions", color: "#6BA8A0" },
  { group: "gym", label: "GYM", target: 2, unit: "sessions", color: "#9FCB7B" },
  { group: "boxing", label: "BOXING", target: 1, unit: "sessions", color: "#C4885A" },
];

// ============================================
// QUOTES
// ============================================

const QUOTES = [
  "Everything is going my way today",
  "The work I'm doing today is essential to the future I will have",
  "I am learning fast, look at all the things I've already learned",
  "There is no speed limit",
  "I am what I do and I author myself",
  "Everyday my body creates more testosterone and my muscles grow faster",
  "Abundance comes easy to me",
  "You get the same shit for two bodys as you get for ten",
  "How to solve a puzzle - does this defy the laws of physics?",
  "There are cathedrals everywhere for those with the eyes to see",
  "Art is powerful - only consume what you want to be imprinted on",
  "To choose is to kill the other lives I could have had",
  "In your mind there's no becoming, you simply are",
  "I'm not embarrassing myself enough - game mode",
  "If it's within your capacity it won't change you",
  "There are no limits. There are plateaus, but you must not stay there, you must go beyond them. If it kills you, it kills you. A man must constantly exceed his level.",
  "The hero and the coward both feel the same. People who watch you judge you on what you do, not how you feel.",
  "Above all, don't lie to yourself. The man who lies to himself comes to a point that he cannot distinguish the truth within him, or around him. - Dostoevsky",
  "The more you cling to things in this world the less you get in the next",
  "In the midst of winter, I found there was within me an invincible summer",
  "Satan has no power over us except when we choose to make ourselves vulnerable",
  "To whom much is given much is required",
  "Passion follows success",
  "When someone beats a rug the blows are not against the rug but against the dust in it",
  "The more you are favoured by God the harsher the punishment for your transgressions",
  "I'm letting slip the dogs of war",
  "May the gods keep the wolves in the hills and the women in our beds",
  "The art of living is more like wrestling than dancing - Marcus Aurelius",
  "God's challenges are an opportunity to improve - real Sufis ask God why am I not challenged more",
  "If you want to be a warrior you have to feel the weight of the sword",
  "Oh Lord you have not created all this without purpose (3:191)",
  "You're not tired you're sharpening your edge",
  "Everybody wants to be a bodybuilder nobody wants to lift heavy ass weights",
  "Improving energy should be the main focus so everything else falls in place",
  "I Must Become Faster, Stronger, Deadlier",
  "I Must Become More Knowledgeable, More Professional, More Capable",
  "If you take care of your responsibilities your rights come by itself",
  "Pick your pain: the pain of discipline, the pain of regret, or the pain of humiliation",
  "God's mercy goes hand in hand with his justice",
  "And the man who hesitates lets the world kill for him",
  "Until death all defeat is psychological",
  "Shaytan cannot force you to anything - Al waswas needs you to listen to him",
  "Boredom isn't stillness, boredom is sameness",
  "You are an intentional creation of an all-powerful God - act like it",
  "Gratitude does not make us more blessed, but we are more receptive of it",
  "What we do in life echoes in eternity",
  "Gazelle or lion, remember to run",
  "You're moving forward if you are simply moving with the trend",
  "Pray for courage, wisdom, understanding and tolerance",
  "Are there differences between what you want and what you're committed to?",
  "Prayer is real. What gets measured gets improved",
  "The closer to death you are the more alive you are",
  "What a beautiful hero's journey - being the person breaking your parents' trauma cycle",
  "You quote laws to men with swords",
  "Stress comes from not acting aligned with your values",
  "Wa la ghalib illallah - there is no victor except God",
  "Do not cry like a woman for what you couldn't defend as a man",
  "To sail is necessary, to live is not",
  "You can design everything about you and become anybody you want just by deciding and practicing it until it becomes unconscious",
  "The outer world consists of facts. But it is our inner world that guarantees us complete freedom",
  "God does not change man's condition until he changes his inner self (13:11)",
  "Fear does not prevent death it prevents life",
  "The truth has consequences - only seek it out if you are serious",
  "Your soul is just like your enemy. Once it finds you serious, it obeys you. If it finds weakness, it will take you as a prisoner.",
  "Build a system to the point in which your actions and thoughts become indistinguishable",
  "Why do we think we are entitled to things working out?",
  "If you believe in morality and God then you have a moral duty to take power and govern justly",
  "Alles so wie immer und es ballert",
  "Take all the time you need and not a second more",
  "God's validation > Man's validation",
  "Purpose + Discipline > Motivation",
  "Either increase sacrifice or reduce desire",
  "What the fuck has this got to do with chess?",
  "Monks by night, lions by day",
  "Everything needs maintenance otherwise it will fall",
  "Simply choose to be elite - what would the best version of you do, then step in those shoes",
  "Keep repenting, for the sick person hopes for life as long as his spirit remains",
  "There is no sweetness in jihad, there is but the jagged edges of swords. So prosecute the jihad against yourself.",
  "Is it a compliment or a substitute for action?",
  "Always act in a way that increases the options",
  "Idle hands are the devil's workshop, therefore to build is to worship",
  "The I cannot be disconnected from the physical body",
  "To be heedless in action is better than to be heedless to the point of inaction",
  "We crave connection but so much of the time we are not alive, neutralized. Mostly we are free-floating and disengaged. - Russell Brand",
];

function getDailyQuote() {
  var h = Math.floor(Date.now() / 14400000);
  return QUOTES[h % QUOTES.length];
}

// ============================================
// HELPERS
// ============================================

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const getTodayKey = () => new Date().toISOString().split("T")[0];
const getDayIndex = (dateStr) => { const d = new Date(dateStr + "T12:00:00"); return d.getDay() === 0 ? 6 : d.getDay() - 1; };
const generateId = () => Math.random().toString(36).substr(2, 9);
const fmtDur = (mins) => { if (!mins) return ""; const h = Math.floor(mins / 60); const m = mins % 60; return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ""}` : `${m}m`; };
const fmtTimer = (s) => { const m = Math.floor(s / 60); const sec = s % 60; return `${m}:${String(sec).padStart(2, "0")}`; };

function getISOWeekKey(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d); mon.setDate(diff);
  return mon.toISOString().split("T")[0];
}
function computeAllWeekKeys(workouts) {
  const keys = new Set();
  Object.keys(workouts).forEach((dk) => keys.add(getISOWeekKey(dk)));
  return Array.from(keys).sort();
}
function computePerfectWeeks(workouts) {
  const weekKeys = computeAllWeekKeys(workouts);
  const results = {};
  WEEKLY_TARGETS.forEach((t) => { results[t.group] = { perfect: 0, total: weekKeys.length }; });
  weekKeys.forEach((ws) => {
    const wd = Array.from({ length: 7 }, (_, i) => { const d = new Date(ws + "T12:00:00"); d.setDate(d.getDate() + i); return d.toISOString().split("T")[0]; });
    const gc = { engine: 0, bjj: 0, gym: 0, boxing: 0 }; let em = 0;
    wd.forEach((d) => { (workouts[d] || []).forEach((w) => { const t = WORKOUT_TYPES.find((x) => x.id === w.type); if (t && gc[t.group] !== undefined) gc[t.group]++; if (t && t.group === "engine" && w.duration) em += w.duration; }); });
    WEEKLY_TARGETS.forEach((t) => { if ((t.unit === "min" ? em : gc[t.group]) >= t.target) results[t.group].perfect++; });
  });
  return results;
}
function computeHistoricalTotals(workouts) {
  const totals = {}; WORKOUT_TYPES.forEach((t) => { totals[t.id] = { sessions: 0, minutes: 0 }; });
  Object.values(workouts).forEach((da) => { da.forEach((w) => { if (totals[w.type]) { totals[w.type].sessions++; if (w.duration) totals[w.type].minutes += w.duration; } }); });
  return totals;
}
function computeWeeklyVolume(workouts) {
  const wm = {};
  Object.entries(workouts).forEach(([dk, da]) => { const wk = getISOWeekKey(dk); da.forEach((w) => { const t = WORKOUT_TYPES.find((x) => x.id === w.type); if (!t || t.group !== "gym") return; w.exercises.forEach((ex) => { ex.sets.forEach((s) => { const r = parseFloat(s.reps); const wt = parseFloat(s.weight); if (!isNaN(r) && !isNaN(wt) && r > 0 && wt > 0) { if (!wm[wk]) wm[wk] = 0; wm[wk] += r * wt; } }); }); }); });
  return Object.entries(wm).sort(([a], [b]) => a.localeCompare(b)).map(([wk, vol]) => ({ week: wk.slice(5), volume: Math.round(vol) }));
}

function getWeightComparison(kg) {
  const items = [
    { name: "house cat", kg: 4.5 },
    { name: "golden retriever", kg: 32 },
    { name: "adult human", kg: 80 },
    { name: "gorilla", kg: 160 },
    { name: "grand piano", kg: 480 },
    { name: "horse", kg: 500 },
    { name: "white rhino", kg: 2300 },
    { name: "elephant", kg: 6000 },
    { name: "London bus", kg: 12500 },
    { name: "T-Rex", kg: 8000 },
    { name: "cement truck", kg: 33000 },
    { name: "M1 Abrams tank", kg: 60000 },
    { name: "Boeing 737", kg: 41000 },
    { name: "blue whale", kg: 140000 },
    { name: "Space Shuttle", kg: 78000 },
    { name: "Statue of Liberty", kg: 204000 },
    { name: "Eiffel Tower", kg: 7300000 },
    { name: "cruise ship", kg: 100000000 },
  ];
  var valid = items.filter(function(it) { return kg / it.kg >= 0.5; });
  var seed = Math.floor(Date.now() / 86400000);
  var pick1 = valid[seed % valid.length];
  var pick2 = valid[(seed + 3) % valid.length];
  var fmt = function(it) { var n = kg / it.kg; if (n >= 10) return Math.round(n) + " " + it.name + "s"; if (n >= 1) return n.toFixed(1) + " " + it.name + "s"; return (n * 100).toFixed(0) + "% of a " + it.name; };
  if (!pick1) return "";
  if (pick1 === pick2 || !pick2) return "= " + fmt(pick1);
  return "= " + fmt(pick1) + "  /  " + fmt(pick2);
}

function getMonthDays(year, month) {
  const first = new Date(year, month, 1);
  return { startDay: first.getDay() === 0 ? 6 : first.getDay() - 1, daysInMonth: new Date(year, month + 1, 0).getDate() };
}

// ============================================
// REST TIMER COMPONENT
// ============================================

function RestTimer({ seconds, onDone }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            setFinished(true);
            try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) {}
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, remaining]);

  const pct = seconds > 0 ? ((seconds - remaining) / seconds) * 100 : 100;

  return (
    <div style={st.timerWrap}>
      <div style={st.timerBarBg}>
        <div style={{ ...st.timerBarFill, width: `${pct}%`, background: finished ? "#9FCB7B" : "#7FA36B" }} />
      </div>
      <div style={st.timerRow}>
        <span style={{ ...st.timerText, color: finished ? "#9FCB7B" : "#D7E0D2" }}>
          {finished ? "REST DONE" : fmtTimer(remaining) + " / " + fmtTimer(seconds)}
        </span>
        {!running && !finished && (
          <button style={st.timerStartBtn} onClick={() => setRunning(true)}>START</button>
        )}
        {running && (
          <button style={st.timerSkipBtn} onClick={() => { clearInterval(intervalRef.current); setRunning(false); setFinished(true); }}>SKIP</button>
        )}
        {finished && (
          <button style={st.timerSkipBtn} onClick={onDone}>OK</button>
        )}
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function WorkoutTracker() {
  const [workouts, setWorkouts] = useState({});
  const [selectedDate, setSelectedDate] = useState(getTodayKey());
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logModal, setLogModal] = useState(false);
  const [tab, setTab] = useState("day");
  const [bodyweightData, setBodyweightData] = useState([]);
  const [bwInput, setBwInput] = useState("");
  const [bwDateInput, setBwDateInput] = useState(getTodayKey());
  const [insightSection, setInsightSection] = useState("weight");
  const [heatmapMonth, setHeatmapMonth] = useState(() => { const n = new Date(); return { year: n.getFullYear(), month: n.getMonth() }; });
  const [activeTimer, setActiveTimer] = useState(null);

  useEffect(() => {
    try {
      const w = localStorage.getItem("operator-workouts");
      if (w) setWorkouts(JSON.parse(w));
      const bw = localStorage.getItem("operator-bodyweight");
      if (bw) setBodyweightData(JSON.parse(bw));
    } catch (e) {}
    setLoading(false);
  }, []);

  const saveWorkouts = useCallback((data) => {
    setWorkouts(data);
    try { localStorage.setItem("operator-workouts", JSON.stringify(data)); } catch (e) {}
  }, []);
  const saveBodyweight = useCallback((data) => {
    setBodyweightData(data);
    try { localStorage.setItem("operator-bodyweight", JSON.stringify(data)); } catch (e) {}
  }, []);
  const addBodyweight = () => {
    const val = parseFloat(bwInput); if (isNaN(val) || val <= 0) return;
    saveBodyweight([...bodyweightData.filter((e) => e.date !== bwDateInput), { date: bwDateInput, weight: val }].sort((a, b) => a.date.localeCompare(b.date)));
    setBwInput("");
  };
  const deleteBodyweight = (date) => saveBodyweight(bodyweightData.filter((e) => e.date !== date));

  const getWeekDates = (fd) => {
    const d = new Date((fd || selectedDate) + "T12:00:00"); const dy = d.getDay(); const diff = d.getDate() - dy + (dy === 0 ? -6 : 1);
    const mon = new Date(d); mon.setDate(diff);
    return Array.from({ length: 7 }, (_, i) => { const dt = new Date(mon); dt.setDate(mon.getDate() + i); return dt.toISOString().split("T")[0]; });
  };
  const weekDates = getWeekDates(); const today = getTodayKey();
  const wgc = { engine: 0, bjj: 0, gym: 0, boxing: 0 }; let engineMin = 0;
  weekDates.forEa
