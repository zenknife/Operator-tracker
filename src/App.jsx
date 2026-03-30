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

//      )}

      {/* LOG MODAL */}
      {logModal && (
        <div style={st.overlay} onClick={() => setLogModal(false)}>
          <div style={st.modal} onClick={(e) => e.stopPropagation()}>
            <div style={st.modalTitle}>LOG SESSION -- {dayName}</div>
            <div style={st.modalGroup}>
              <div style={st.modalGroupLabel}>GYM -- HC 1.2 PHASE 1</div>
              {WORKOUT_TYPES.filter((t) => t.group === "gym").map((type) => {
                const tmpl = BLOCK_TEMPLATES[type.id];
                return (
                  <button key={type.id} style={{ ...st.modalItem, borderLeftColor: type.color }} onClick={() => addWorkout(selectedDate, type.id)}>
                    <span style={{ color: type.color, fontSize: 14, fontWeight: 700 }}>{type.icon}</span>
                    <div>
                      <div style={st.modalItemLabel}>{type.label}</div>
                      {tmpl && <div style={{ fontSize: 9, color: "#5A6A5D", marginTop: 1 }}>{tmpl.length} blocks</div>}
                    </div>
                  </button>
                );
              })}
            </div>
            <div style={st.modalGroup}>
              <div style={st.modalGroupLabel}>COMBAT / CONDITIONING</div>
              {WORKOUT_TYPES.filter((t) => ["bjj", "boxing", "engine"].includes(t.group)).map((type) => (
                <button key={type.id} style={{ ...st.modalItem, borderLeftColor: type.color }} onClick={() => addWorkout(selectedDate, type.id)}>
                  <span style={{ color: type.color, fontSize: 14, fontWeight: 700 }}>{type.icon}</span>
                  <div>
                    <div style={st.modalItemLabel}>{type.label}</div>
                    {type.group === "engine" && <div style={{ fontSize: 9, color: "#6B9A8A", marginTop: 1 }}>Log duration for 90min target</div>}
                  </div>
                </button>
              ))}
            </div>
            <div style={st.modalGroup}>
              <div style={st.modalGroupLabel}>OTHER</div>
              {WORKOUT_TYPES.filter((t) => t.group === "other").map((type) => (
                <button key={type.id} style={{ ...st.modalItem, borderLeftColor: type.color }} onClick={() => addWorkout(selectedDate, type.id)}>
                  <span style={{ color: type.color, fontSize: 14, fontWeight: 700 }}>{type.icon}</span>
                  <div><div style={st.modalItemLabel}>{type.label}</div></div>
                </button>
              ))}
            </div>
            <button style={st.modalCancel} onClick={() => setLogModal(false)}>CANCEL</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// STYLES
// ============================================

const st = {
  shell: { fontFamily: "'JetBrains Mono','SF Mono','Fira Code',monospace", background: "#111613", color: "#A8B2A6", minHeight: "100vh", padding: "16px 14px 40px", maxWidth: 480, margin: "0 auto", boxSizing: "border-box" },
  loadWrap: { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#111613", fontFamily: "monospace" },
  loadText: { color: "#7FA36B", fontSize: 13, letterSpacing: 6 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 0, paddingBottom: 14, borderBottom: "1px solid #2E3A31" },
  brandRow: { display: "flex", alignItems: "center", gap: 10 },
  brandIcon: { fontSize: 16, color: "#7FA36B", fontWeight: 700 },
  brandTitle: { fontSize: 13, fontWeight: 700, letterSpacing: 4, color: "#D7E0D2" },
  brandSub: { fontSize: 7, letterSpacing: 3, color: "#6A7A6D", marginTop: 1 },
  statsRow: { display: "flex", alignItems: "center", gap: 12 },
  statBox: { textAlign: "center" },
  statVal: { fontSize: 20, fontWeight: 700, color: "#D7E0D2", lineHeight: 1 },
  statLbl: { fontSize: 7, letterSpacing: 2, color: "#6A7A6D", marginTop: 3 },
  statDiv: { width: 1, height: 26, background: "#2E3A31" },
  targetSection: { padding: "14px 0 12px", borderBottom: "1px solid #2E3A31", marginBottom: 14 },
  targetGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  targetCard: { padding: "10px 12px", border: "1px solid #2E3A31", background: "#1A221C" },
  targetHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  targetLabel: { fontSize: 9, letterSpacing: 2, fontWeight: 700 },
  targetCount: { fontSize: 14, fontWeight: 700 },
  targetBarBg: { height: 3, background: "#252F28", marginBottom: 4 },
  targetBarFill: { height: 3, transition: "width 0.3s" },
  targetOver: { fontSize: 7, letterSpacing: 2, color: "#9FCB7B", fontWeight: 700 },
  targetUnder: { fontSize: 7, letterSpacing: 2, color: "#4A5A4D" },
  targetHit: { fontSize: 7, letterSpacing: 2, color: "#9FCB7B" },
  tabRow: { display: "flex", marginBottom: 16 },
  tabBtn: { flex: 1, background: "none", border: "none", borderBottom: "2px solid #252F28", color: "#4A5A4D", fontFamily: "inherit", fontSize: 10, letterSpacing: 2, padding: "10px 0", cursor: "pointer", fontWeight: 700 },
  tabActive: { color: "#D7E0D2", borderBottomColor: "#7FA36B" },
  dayNav: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  navBtn: { background: "#1A221C", border: "1px solid #2E3A31", color: "#8E9B8F", padding: "10px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: 13 },
  dayCenter: { textAlign: "center", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" },
  dayBig: { fontSize: 24, fontWeight: 700, letterSpacing: 6, color: "#D7E0D2" },
  dayDate: { fontSize: 10, color: "#6A7A6D", letterSpacing: 1, marginTop: 2 },
  section: { marginBottom: 16 },
  sectionTag: { fontSize: 8, letterSpacing: 3, color: "#6A7A6D", marginBottom: 8 },
  loggedCard: { display: "flex", flexDirection: "column", gap: 5, padding: "14px", borderLeft: "3px solid", border: "1px solid #2E3A31", background: "#1A221C", cursor: "pointer", fontFamily: "inherit", textAlign: "left", width: "100%", boxSizing: "border-box", marginBottom: 6 },
  loggedTop: { display: "flex", alignItems: "center", gap: 8 },
  loggedLabel: { fontSize: 13, fontWeight: 700, letterSpacing: 2, color: "#D7E0D2" },
  loggedCheck: { fontSize: 12, color: "#9FCB7B", marginLeft: "auto", fontWeight: 700 },
  loggedMeta: { display: "flex", gap: 14, fontSize: 10, color: "#6A7A6D", letterSpacing: 1 },
  loggedNotes: { fontSize: 10, color: "#4A5A4D", fontStyle: "italic", marginTop: 2 },
  emptyState: { textAlign: "center", padding: "44px 0" },
  logNewBtn: { width: "100%", background: "#1A221C", border: "1px dashed #3A4A3D", color: "#8E9B8F", padding: "14px", fontFamily: "inherit", fontSize: 11, letterSpacing: 3, cursor: "pointer", marginBottom: 8, marginTop: 8 },
  todayBtn: { width: "100%", background: "none", border: "1px solid #2E3A31", color: "#7FA36B", padding: "10px", fontFamily: "inherit", fontSize: 10, letterSpacing: 3, cursor: "pointer" },
  weekNav: { display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 14 },
  weekRange: { fontSize: 11, letterSpacing: 2, color: "#6A7A6D" },
  weekList: { display: "flex", flexDirection: "column" },
  weekRow: { display: "flex", alignItems: "center", padding: "14px 10px", borderLeft: "3px solid transparent", background: "none", border: "none", borderBottom: "1px solid #252F28", cursor: "pointer", fontFamily: "inherit", width: "100%", textAlign: "left", boxSizing: "border-box" },
  weekDayCol: { width: 48, display: "flex", flexDirection: "column", alignItems: "center", gap: 1, flexShrink: 0 },
  weekDayName: { fontSize: 9, letterSpacing: 2, fontWeight: 700 },
  weekDayNum: { fontSize: 16, fontWeight: 300 },
  weekContent: { flex: 1, paddingLeft: 10 },
  weekChips: { display: "flex", flexWrap: "wrap", gap: 5 },
  weekChip: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", border: "1px solid" },
  weekEmpty: { fontSize: 14, color: "#252F28" },
  weekArrow: { fontSize: 18, color: "#3A4A3D", flexShrink: 0 },
  overlay: { position: "fixed", inset: 0, background: "rgba(10,14,12,0.88)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100 },
  modal: { background: "#161E18", border: "1px solid #2E3A31", borderBottom: "none", padding: "20px 14px 28px", width: "100%", maxWidth: 480, borderRadius: "14px 14px 0 0", maxHeight: "85vh", overflowY: "auto" },
  modalTitle: { fontSize: 10, letterSpacing: 3, color: "#6A7A6D", marginBottom: 16, textAlign: "center" },
  modalGroup: { marginBottom: 12 },
  modalGroupLabel: { fontSize: 8, letterSpacing: 3, color: "#4A5A4D", marginBottom: 6 },
  modalItem: { display: "flex", alignItems: "center", gap: 12, padding: "14px 12px", borderLeft: "3px solid", border: "1px solid #2E3A31", background: "#1A221C", cursor: "pointer", fontFamily: "inherit", width: "100%", boxSizing: "border-box", marginBottom: 4 },
  modalItemLabel: { fontSize: 12, letterSpacing: 2, color: "#A8B2A6" },
  modalCancel: { width: "100%", background: "none", border: "1px solid #2E3A31", color: "#6A7A6D", padding: "12px", fontFamily: "inherit", fontSize: 10, letterSpacing: 3, cursor: "pointer", marginTop: 12 },
  backBtn: { background: "none", border: "none", color: "#8E9B8F", fontFamily: "inherit", fontSize: 11, cursor: "pointer", padding: 0, marginBottom: 16, letterSpacing: 2 },
  detailBanner: { borderLeft: "3px solid", padding: "12px 14px", marginBottom: 20, background: "#1A221C" },
  detailTop: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 },
  detailLabel: { fontSize: 16, fontWeight: 700, letterSpacing: 3, color: "#D7E0D2" },
  detailDate: { fontSize: 10, color: "#6A7A6D", letterSpacing: 1 },
  metaRow: { display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" },
  metaBlock: { display: "flex", flexDirection: "column", gap: 4 },
  metaTag: { fontSize: 7, letterSpacing: 2, color: "#6A7A6D" },
  metaInput: { background: "#111613", border: "1px solid #2E3A31", color: "#D7E0D2", padding: "10px", fontFamily: "inherit", fontSize: 12, outline: "none", width: 70, boxSizing: "border-box" },
  exList: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 },
  blockCard: { border: "1px solid #2E3A31", background: "#1A221C", padding: 0, overflow: "hidden" },
  blockHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#202A22", borderBottom: "1px solid #2E3A31" },
  blockLabel: { fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#D7E0D2" },
  blockRest: { fontSize: 9, color: "#6A7A6D", letterSpacing: 1 },
  supersetDivider: { borderTop: "1px dashed #2E3A31", padding: "4px 12px", background: "#161E18" },
  supersetTag: { fontSize: 8, letterSpacing: 2, color: "#4A5A4D" },
  exInner: { padding: "10px 12px" },
  exHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  exName: { background: "none", border: "none", borderBottom: "1px solid #2E3A31", color: "#D7E0D2", fontFamily: "inherit", fontSize: 12, fontWeight: 700, letterSpacing: 1, padding: "4px 0", flex: 1, outline: "none" },
  exDel: { background: "none", border: "none", color: "#4A5A4D", fontSize: 18, cursor: "pointer", padding: "0 6px" },
  setLabels: { display: "flex", gap: 8, marginBottom: 4, paddingBottom: 4, borderBottom: "1px solid #252F28" },
  setLbl: { fontSize: 7, letterSpacing: 2, color: "#4A5A4D", width: 48, textAlign: "center" },
  setRow: { display: "flex", alignItems: "center", gap: 8, padding: "3px 0" },
  setNum: { width: 28, textAlign: "center", fontSize: 11, color: "#4A5A4D" },
  setIn: { width: 48, background: "#111613", border: "1px solid #2E3A31", color: "#D7E0D2", padding: "8px 4px", fontFamily: "inherit", fontSize: 12, textAlign: "center", outline: "none", boxSizing: "border-box" },
  chk: { width: 28, height: 28, border: "1px solid", background: "none", color: "#D7E0D2", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 },
  rmSet: { width: 28, height: 28, border: "1px solid #2E3A31", background: "none", color: "#4A5A4D", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  addSetBtn: { background: "none", border: "1px dashed #3A4A3D", color: "#6A7A6D", padding: "5px", fontFamily: "inherit", fontSize: 9, letterSpacing: 2, cursor: "pointer", marginTop: 6, width: "100%" },
  addExBtn: { background: "#1A221C", border: "1px dashed #3A4A3D", color: "#8E9B8F", padding: "14px", fontFamily: "inherit", fontSize: 11, letterSpacing: 3, cursor: "pointer", width: "100%", marginBottom: 16 },
  actionRow: { display: "flex", gap: 10 },
  completeBtn: { flex: 1, border: "none", color: "#111613", padding: "14px", fontFamily: "inherit", fontSize: 11, letterSpacing: 3, cursor: "pointer", fontWeight: 700 },
  delBtn: { background: "none", border: "1px solid #2E3A31", color: "#A0604A", padding: "14px 18px", fontFamily: "inherit", fontSize: 10, letterSpacing: 2, cursor: "pointer" },
  timerWrap: { padding: "10px 12px", borderTop: "1px solid #2E3A31", background: "#161E18" },
  timerBarBg: { height: 4, background: "#252F28", marginBottom: 8, borderRadius: 2 },
  timerBarFill: { height: 4, borderRadius: 2, transition: "width 1s linear" },
  timerRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  timerText: { fontSize: 13, fontWeight: 700, letterSpacing: 2 },
  timerStartBtn: { background: "#5A7A50", border: "none", color: "#D7E0D2", padding: "6px 14px", fontFamily: "inherit", fontSize: 10, letterSpacing: 2, cursor: "pointer", fontWeight: 700 },
  timerSkipBtn: { background: "none", border: "1px solid #2E3A31", color: "#8E9B8F", padding: "6px 14px", fontFamily: "inherit", fontSize: 10, letterSpacing: 2, cursor: "pointer" },
  insightNav: { display: "flex", gap: 4, marginBottom: 18, overflowX: "auto", paddingBottom: 4 },
  insightNavBtn: { background: "#1A221C", border: "1px solid #2E3A31", color: "#6A7A6D", fontFamily: "inherit", fontSize: 9, letterSpacing: 1, padding: "7px 10px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 },
  insightNavActive: { color: "#D7E0D2", borderColor: "#7FA36B", background: "#202A22" },
  insightTitle: { fontSize: 13, fontWeight: 700, letterSpacing: 3, color: "#D7E0D2", marginBottom: 16 },
  bwForm: { display: "flex", gap: 8, marginBottom: 16 },
  bwDateIn: { background: "#1A221C", border: "1px solid #2E3A31", color: "#D7E0D2", padding: "8px", fontFamily: "inherit", fontSize: 11, outline: "none", flex: 1, boxSizing: "border-box", colorScheme: "dark" },
  bwWeightIn: { background: "#1A221C", border: "1px solid #2E3A31", color: "#D7E0D2", padding: "8px", fontFamily: "inherit", fontSize: 12, outline: "none", width: 70, boxSizing: "border-box", textAlign: "center" },
  bwAddBtn: { background: "#5A7A50", border: "none", color: "#D7E0D2", padding: "8px 14px", fontFamily: "inherit", fontSize: 10, letterSpacing: 2, cursor: "pointer", fontWeight: 700 },
  chartWrap: { marginBottom: 16 },
  bwRow: { display: "flex", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #252F28", gap: 10 },
  bwRowDate: { fontSize: 10, color: "#6A7A6D", letterSpacing: 1, flex: 1 },
  bwRowVal: { fontSize: 12, color: "#D7E0D2", fontWeight: 700 },
  bwRowDel: { background: "none", border: "none", color: "#3A4A3D", fontSize: 16, cursor: "pointer", padding: "0 4px" },
  emptyHint: { fontSize: 10, color: "#4A5A4D", letterSpacing: 1, marginBottom: 12 },
  streakCard: { textAlign: "center", padding: "20px 0", marginBottom: 20, border: "1px solid #2E3A31", background: "#1A221C" },
  streakBig: { fontSize: 36, fontWeight: 700, color: "#D7E0D2", lineHeight: 1 },
  streakLabel: { fontSize: 9, letterSpacing: 3, color: "#6A7A6D", marginTop: 6 },
  perfectRow: { marginBottom: 14 },
  perfectHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  perfectLabel: { fontSize: 10, letterSpacing: 2, fontWeight: 700 },
  perfectCount: { fontSize: 12, color: "#D7E0D2", fontWeight: 700 },
  perfectPct: { fontSize: 8, letterSpacing: 2, color: "#4A5A4D" },
  totalRow: { padding: "12px 0", borderBottom: "1px solid #252F28" },
  totalLabel: { fontSize: 10, letterSpacing: 2, fontWeight: 700 },
  totalNums: { display: "flex", alignItems: "baseline", gap: 4, marginTop: 4 },
  totalBig: { fontSize: 18, fontWeight: 700, color: "#D7E0D2" },
  totalUnit: { fontSize: 9, color: "#6A7A6D", letterSpacing: 1 },
  breakdownRow: { display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #252F28" },
  breakdownLabel: { fontSize: 10, color: "#8E9B8F", letterSpacing: 1, flex: 1 },
  breakdownVal: { fontSize: 12, color: "#D7E0D2", fontWeight: 700 },
  breakdownMin: { fontSize: 10, color: "#6A7A6D" },
  heatNav: { display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 14 },
  heatLabel: { fontSize: 11, letterSpacing: 2, color: "#6A7A6D" },
  heatGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginBottom: 12 },
  heatDayLabel: { textAlign: "center", fontSize: 9, color: "#4A5A4D", letterSpacing: 1, paddingBottom: 4 },
  heatCell: { aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #2E3A31", background: "#1A221C" },
  heatLegend: { display: "flex", gap: 14, justifyContent: "center", marginTop: 8 },
  heatLegItem: { display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "#6A7A6D" },
  heatLegDot: { width: 10, height: 10, display: "inline-block", border: "1px solid #2E3A31" },
  volRow: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #252F28" },
  volWeek: { fontSize: 10, color: "#6A7A6D", letterSpacing: 1 },
  volVal: { fontSize: 12, color: "#D7E0D2", fontWeight: 700 },
};
