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
  const [activeTimer, setActiveTimer] = useState(null); // { blockIndex, seconds }

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
  weekDates.forEach((d) => { (workouts[d] || []).forEach((w) => { const t = WORKOUT_TYPES.find((x) => x.id === w.type); if (t && wgc[t.group] !== undefined) wgc[t.group]++; if (t && t.group === "engine" && w.duration) engineMin += w.duration; }); });
  const totalSessions = weekDates.reduce((s, d) => s + (workouts[d]?.length || 0), 0);
  let streak = 0; let sd = new Date();
  while (true) { const k = sd.toISOString().split("T")[0]; if (workouts[k] && workouts[k].length > 0) { streak++; sd.setDate(sd.getDate() - 1); } else { if (k === today) { sd.setDate(sd.getDate() - 1); continue; } break; } }

  const shiftDay = (dir) => { const d = new Date(selectedDate + "T12:00:00"); d.setDate(d.getDate() + dir); setSelectedDate(d.toISOString().split("T")[0]); };
  const shiftWeek = (dir) => { const d = new Date(selectedDate + "T12:00:00"); d.setDate(d.getDate() + dir * 7); setSelectedDate(d.toISOString().split("T")[0]); };

  const addWorkout = (dateKey, typeId) => {
    const type = WORKOUT_TYPES.find((t) => t.id === typeId);
    const exercises = BLOCK_TEMPLATES[typeId] ? buildExercisesFromBlocks(typeId) : [];
    const workout = { id: generateId(), type: typeId, label: type.label, date: dateKey, exercises, duration: null, notes: "", completed: false, createdAt: Date.now() };
    const updated = { ...workouts }; if (!updated[dateKey]) updated[dateKey] = []; updated[dateKey].push(workout);
    saveWorkouts(updated); setActiveWorkout(workout); setLogModal(false);
  };
  const updateWorkout = (dateKey, workoutId, changes) => {
    const updated = { ...workouts }; const idx = updated[dateKey]?.findIndex((w) => w.id === workoutId);
    if (idx >= 0) { updated[dateKey][idx] = { ...updated[dateKey][idx], ...changes }; saveWorkouts(updated); if (activeWorkout?.id === workoutId) setActiveWorkout({ ...updated[dateKey][idx] }); }
  };
  const deleteWorkout = (dateKey, workoutId) => {
    const updated = { ...workouts }; updated[dateKey] = updated[dateKey].filter((w) => w.id !== workoutId);
    if (updated[dateKey].length === 0) delete updated[dateKey]; saveWorkouts(updated); if (activeWorkout?.id === workoutId) setActiveWorkout(null);
  };
  const addExercise = () => { if (!activeWorkout) return; updateWorkout(activeWorkout.date, activeWorkout.id, { exercises: [...activeWorkout.exercises, { id: generateId(), name: "", block: "CUSTOM", blockIndex: 999, restSeconds: 90, sets: [{ reps: "", weight: "", done: false }] }] }); };
  const updateExercise = (exIdx, changes) => { if (!activeWorkout) return; const ex = [...activeWorkout.exercises]; ex[exIdx] = { ...ex[exIdx], ...changes }; updateWorkout(activeWorkout.date, activeWorkout.id, { exercises: ex }); };
  const deleteExercise = (exIdx) => { if (!activeWorkout) return; updateWorkout(activeWorkout.date, activeWorkout.id, { exercises: activeWorkout.exercises.filter((_, i) => i !== exIdx) }); };
  const addSet = (exIdx) => { if (!activeWorkout) return; const ex = [...activeWorkout.exercises]; const last = ex[exIdx].sets[ex[exIdx].sets.length - 1]; ex[exIdx].sets.push({ reps: last?.reps || "", weight: last?.weight || "", done: false }); updateWorkout(activeWorkout.date, activeWorkout.id, { exercises: ex }); };
  const updateSet = (exIdx, setIdx, changes) => { if (!activeWorkout) return; const ex = [...activeWorkout.exercises]; ex[exIdx].sets[setIdx] = { ...ex[exIdx].sets[setIdx], ...changes }; updateWorkout(activeWorkout.date, activeWorkout.id, { exercises: ex }); };
  const removeSet = (exIdx, setIdx) => { if (!activeWorkout) return; const ex = [...activeWorkout.exercises]; ex[exIdx].sets = ex[exIdx].sets.filter((_, i) => i !== setIdx); if (ex[exIdx].sets.length === 0) ex.splice(exIdx, 1); updateWorkout(activeWorkout.date, activeWorkout.id, { exercises: ex }); };

  const handleSetDone = (exIdx, si) => {
    const wasDone = activeWorkout.exercises[exIdx].sets[si].done;
    updateSet(exIdx, si, { done: !wasDone });
    if (!wasDone) {
      const ex = activeWorkout.exercises[exIdx];
      if (ex.restSeconds) setActiveTimer({ blockIndex: ex.blockIndex, seconds: ex.restSeconds });
    }
  };

  const perfectWeeks = useMemo(() => computePerfectWeeks(workouts), [workouts]);
  const historicalTotals = useMemo(() => computeHistoricalTotals(workouts), [workouts]);
  const weeklyVolume = useMemo(() => computeWeeklyVolume(workouts), [workouts]);
  const totalVolume = useMemo(() => weeklyVolume.reduce((s, w) => s + w.volume, 0), [weeklyVolume]);

  if (loading) return <div style={st.loadWrap}><div style={st.loadText}>LOADING</div></div>;

  // ============================================
  // WORKOUT DETAIL VIEW (superset blocks + timer)
  // ============================================
  if (activeWorkout) {
    const type = WORKOUT_TYPES.find((t) => t.id === activeWorkout.type);
    const isEngine = type?.group === "engine";

    // Group exercises by blockIndex
    const blocks = [];
    let currentBlock = null;
    activeWorkout.exercises.forEach((ex, i) => {
      const bi = ex.blockIndex !== undefined ? ex.blockIndex : i;
      if (!currentBlock || currentBlock.blockIndex !== bi) {
        currentBlock = { blockIndex: bi, label: ex.block || "EXERCISE", rest: ex.restSeconds || 0, exercises: [] };
        blocks.push(currentBlock);
      }
      currentBlock.exercises.push({ ...ex, _idx: i });
    });

    return (
      <div style={st.shell}>
        <button style={st.backBtn} onClick={() => { setActiveWorkout(null); setActiveTimer(null); }}>{"<"} BACK</button>
        <div style={{ ...st.detailBanner, borderLeftColor: type?.color }}>
          <div style={st.detailTop}>
            <span style={{ color: type?.color, fontSize: 14, fontWeight: 700, marginRight: 6 }}>{type?.icon}</span>
            <span style={st.detailLabel}>{activeWorkout.label}</span>
          </div>
          <div style={st.detailDate}>{DAYS[getDayIndex(activeWorkout.date)]} -- {activeWorkout.date}</div>
        </div>
        <div style={st.metaRow}>
          <div style={st.metaBlock}>
            <div style={st.metaTag}>DURATION (MIN){isEngine ? " *" : ""}</div>
            <input type="number" style={{ ...st.metaInput, borderColor: isEngine ? "#6B9A8A" : "#2E3A31" }} placeholder="min"
              value={activeWorkout.duration || ""}
              onChange={(e) => updateWorkout(activeWorkout.date, activeWorkout.id, { duration: parseInt(e.target.value) || null })} />
            {isEngine && <div style={{ fontSize: 8, color: "#6B9A8A", marginTop: 2, letterSpacing: 1 }}>COUNTS TO 90MIN TARGET</div>}
          </div>
          <div style={{ ...st.metaBlock, flex: 1 }}>
            <div style={st.metaTag}>NOTES</div>
            <input type="text" style={{ ...st.metaInput, width: "100%" }} placeholder="Session notes..."
              value={activeWorkout.notes}
              onChange={(e) => updateWorkout(activeWorkout.date, activeWorkout.id, { notes: e.target.value })} />
          </div>
        </div>

        {/* Superset Blocks */}
        <div style={st.exList}>
          {blocks.map((blk, bi) => (
            <div key={bi} style={st.blockCard}>
              <div style={st.blockHeader}>
                <span style={st.blockLabel}>{blk.label}</span>
                <span style={st.blockRest}>rest: {blk.rest >= 60 ? `${Math.round(blk.rest / 60)}m${blk.rest % 60 > 0 ? blk.rest % 60 + "s" : ""}` : `${blk.rest}s`}</span>
              </div>
              {blk.exercises.map((ex, ei) => (
                <div key={ex.id}>
                  {ei > 0 && <div style={st.supersetDivider}><span style={st.supersetTag}>SUPERSET</span></div>}
                  <div style={st.exInner}>
                    <div style={st.exHead}>
                      <input type="text" style={st.exName} value={ex.name} placeholder="Exercise name"
                        onChange={(e) => updateExercise(ex._idx, { name: e.target.value })} />
                      <button style={st.exDel} onClick={() => deleteExercise(ex._idx)}>x</button>
                    </div>
                    <div style={st.setLabels}>
                      <span style={{ ...st.setLbl, width: 28 }}>#</span>
                      <span style={st.setLbl}>REPS</span>
                      <span style={st.setLbl}>KG</span>
                      <span style={{ ...st.setLbl, width: 52 }}></span>
                    </div>
                    {ex.sets.map((set, si) => (
                      <div key={si} style={{ ...st.setRow, background: set.done ? "rgba(127,163,107,0.06)" : "transparent" }}>
                        <span style={st.setNum}>{si + 1}</span>
                        <input type="text" style={st.setIn} value={set.reps} placeholder="--"
                          onChange={(e) => updateSet(ex._idx, si, { reps: e.target.value })} />
                        <input type="text" style={st.setIn} value={set.weight} placeholder="--"
                          onChange={(e) => updateSet(ex._idx, si, { weight: e.target.value })} />
                        <div style={{ display: "flex", gap: 3 }}>
                          <button style={{ ...st.chk, background: set.done ? "#7FA36B" : "transparent", borderColor: set.done ? "#7FA36B" : "#3A4A3D" }}
                            onClick={() => handleSetDone(ex._idx, si)}>{set.done ? "V" : ""}</button>
                          <button style={st.rmSet} onClick={() => removeSet(ex._idx, si)}>-</button>
                        </div>
                      </div>
                    ))}
                    <button style={st.addSetBtn} onClick={() => addSet(ex._idx)}>+ SET</button>
                  </div>
                </div>
              ))}
              {/* Rest timer for this block */}
              {activeTimer && activeTimer.blockIndex === blk.blockIndex && (
                <RestTimer key={activeTimer.blockIndex + "-" + Date.now()} seconds={activeTimer.seconds} onDone={() => setActiveTimer(null)} />
              )}
            </div>
          ))}
        </div>

        <button style={st.addExBtn} onClick={addExercise}>+ ADD EXERCISE</button>
        <div style={st.actionRow}>
          <button style={{ ...st.completeBtn, background: activeWorkout.completed ? "#7FA36B" : "#5A7A50" }}
            onClick={() => updateWorkout(activeWorkout.date, activeWorkout.id, { completed: !activeWorkout.completed })}>
            {activeWorkout.completed ? "COMPLETED V" : "MARK COMPLETE"}
          </button>
          <button style={st.delBtn} onClick={() => deleteWorkout(activeWorkout.date, activeWorkout.id)}>DEL</button>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN VIEW
  // ============================================
  const dayName = DAYS[getDayIndex(selectedDate)];
  const dayWorkouts = workouts[selectedDate] || [];
  const isToday = selectedDate === today;
  const { startDay, daysInMonth } = getMonthDays(heatmapMonth.year, heatmapMonth.month);
  const monthLabel = new Date(heatmapMonth.year, heatmapMonth.month, 1).toLocaleString("en", { month: "long", year: "numeric" }).toUpperCase();

  return (
    <div style={st.shell}>
      <div style={st.header}>
        <div style={st.brandRow}>
          <span style={st.brandIcon}>[O]</span>
          <div>
            <div style={st.brandTitle}>OPERATOR</div>
            <div style={st.brandSub}>TRAINING LOG</div>
          </div>
        </div>
        <div style={st.statsRow}>
          <div style={st.statBox}><div style={st.statVal}>{totalSessions}</div><div style={st.statLbl}>WEEK</div></div>
          <div style={st.statDiv} />
          <div style={st.statBox}><div style={st.statVal}>{streak}</div><div style={st.statLbl}>STREAK</div></div>
        </div>
      </div>

      {(tab === "day" || tab === "week") && (
        <div style={st.targetSection}>
          <div style={st.targetGrid}>
            {WEEKLY_TARGETS.map((t) => {
              const isMin = t.unit === "min"; const cur = isMin ? engineMin : (wgc[t.group] || 0);
              const tgt = t.target; const hit = cur === tgt; const over = cur > tgt;
              const pct = Math.min((cur / tgt) * 100, 100);
              const sc = over ? "#9FCB7B" : hit ? "#9FCB7B" : cur > 0 ? "#B98A52" : "#4A5A4D";
              return (
                <div key={t.group} style={st.targetCard}>
                  <div style={st.targetHead}>
                    <span style={{ ...st.targetLabel, color: t.color }}>{t.label}</span>
                    <span style={{ ...st.targetCount, color: sc }}>{isMin ? `${cur}/${tgt}m` : `${cur}/${tgt}`}</span>
                  </div>
                  <div style={st.targetBarBg}><div style={{ ...st.targetBarFill, width: `${pct}%`, background: over || hit ? "#7FA36B" : cur > 0 ? t.color : "transparent" }} /></div>
                  {over && <div style={st.targetOver}>+{cur - tgt}{isMin ? "m" : ""} OVER</div>}
                  {hit && <div style={st.targetHit}>TARGET HIT</div>}
                  {!hit && !over && cur === 0 && <div style={st.targetUnder}>NOT STARTED</div>}
                  {!hit && !over && cur > 0 && <div style={st.targetUnder}>{tgt - cur}{isMin ? "m" : ""} TO GO</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={st.tabRow}>
        <button style={{ ...st.tabBtn, ...(tab === "day" ? st.tabActive : {}) }} onClick={() => setTab("day")}>DAY</button>
        <button style={{ ...st.tabBtn, ...(tab === "week" ? st.tabActive : {}) }} onClick={() => setTab("week")}>WEEK</button>
        <button style={{ ...st.tabBtn, ...(tab === "insights" ? st.tabActive : {}) }} onClick={() => setTab("insights")}>INSIGHTS</button>
      </div>

      {/* DAY */}
      {tab === "day" && (
        <>
          <div style={st.dayNav}>
            <button style={st.navBtn} onClick={() => shiftDay(-1)}>{"<"}</button>
            <button style={st.dayCenter} onClick={() => { if (!isToday) setSelectedDate(today); }}>
              <div style={st.dayBig}>{dayName}</div>
              <div style={st.dayDate}>{selectedDate.slice(5)}{isToday ? " -- TODAY" : ""}</div>
            </button>
            <button style={st.navBtn} onClick={() => shiftDay(1)}>{">"}</button>
          </div>
          {dayWorkouts.length > 0 && (
            <div style={st.section}><div style={st.sectionTag}>LOGGED</div>
              {dayWorkouts.map((w) => {
                const t = WORKOUT_TYPES.find((x) => x.id === w.type);
                const tS = w.exercises.reduce((s, ex) => s + ex.sets.length, 0);
                const dS = w.exercises.reduce((s, ex) => s + ex.sets.filter((x) => x.done).length, 0);
                return (
                  <button key={w.id} style={{ ...st.loggedCard, borderLeftColor: t?.color }} onClick={() => setActiveWorkout(w)}>
                    <div style={st.loggedTop}>
                      <span style={{ color: t?.color, fontSize: 12, fontWeight: 700 }}>{t?.icon}</span>
                      <span style={st.loggedLabel}>{w.label}</span>
                      {w.completed && <span style={st.loggedCheck}>V</span>}
                    </div>
                    <div style={st.loggedMeta}>
                      {w.duration ? <span>{fmtDur(w.duration)}</span> : null}
                      {tS > 0 && <span>{dS}/{tS} sets</span>}
                      {w.exercises.length > 0 && <span>{w.exercises.length} ex</span>}
                    </div>
                    {w.notes && <div style={st.loggedNotes}>{w.notes}</div>}
                  </button>
                );
              })}
            </div>
          )}
          {dayWorkouts.length === 0 && (
            <div style={st.emptyState}>
              <div style={{ fontSize: 28, color: "#2E3A31" }}>-</div>
              <div style={{ fontSize: 11, color: "#4A5A4D", letterSpacing: 3, marginTop: 4 }}>NO SESSIONS LOGGED</div>
            </div>
          )}
          <button style={st.logNewBtn} onClick={() => setLogModal(true)}>+ LOG SESSION</button>
          {!isToday && <button style={st.todayBtn} onClick={() => setSelectedDate(today)}>JUMP TO TODAY</button>}
        </>
      )}

      {/* WEEK */}
      {tab === "week" && (
        <>
          <div style={st.weekNav}>
            <button style={st.navBtn} onClick={() => shiftWeek(-1)}>{"<"}</button>
            <span style={st.weekRange}>{weekDates[0].slice(5)} -- {weekDates[6].slice(5)}</span>
            <button style={st.navBtn} onClick={() => shiftWeek(1)}>{">"}</button>
          </div>
          <div style={st.weekList}>
            {weekDates.map((dk, i) => {
              const dw = workouts[dk] || []; const isTd = dk === today;
              return (
                <button key={dk} style={{ ...st.weekRow, borderLeftColor: isTd ? "#7FA36B" : "transparent", background: isTd ? "#1A221C" : "transparent" }}
                  onClick={() => { setSelectedDate(dk); setTab("day"); }}>
                  <div style={st.weekDayCol}>
                    <span style={{ ...st.weekDayName, color: isTd ? "#9FCB7B" : "#6A7A6D" }}>{DAYS[i]}</span>
                    <span style={{ ...st.weekDayNum, color: isTd ? "#D7E0D2" : "#4A5A4D" }}>{dk.split("-")[2]}</span>
                  </div>
                  <div style={st.weekContent}>
                    {dw.length > 0 ? (
                      <div style={st.weekChips}>{dw.map((w) => { const t = WORKOUT_TYPES.find((x) => x.id === w.type); return (
                        <span key={w.id} style={{ ...st.weekChip, borderColor: t?.color + "55", background: t?.color + "10" }}>
                          <span style={{ color: t?.color, fontSize: 10, fontWeight: 700 }}>{t?.short}</span>
                          {w.completed && <span style={{ color: "#9FCB7B", fontSize: 10, marginLeft: 3 }}>V</span>}
                        </span>); })}</div>
                    ) : <span style={st.weekEmpty}>-</span>}
                  </div>
                  <span style={st.weekArrow}>{">"}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* INSIGHTS */}
      {tab === "insights" && (
        <div>
          <div style={st.insightNav}>
            {[{ key: "weight", label: "WEIGHT" },{ key: "streaks", label: "STREAKS" },{ key: "totals", label: "TOTALS" },{ key: "heatmap", label: "CALENDAR" },{ key: "volume", label: "VOLUME" }].map((s) => (
              <button key={s.key} style={{ ...st.insightNavBtn, ...(insightSection === s.key ? st.insightNavActive : {}) }}
                onClick={() => setInsightSection(s.key)}>{s.label}</button>
            ))}
          </div>
          {insightSection === "weight" && (
            <div>
              <div style={st.insightTitle}>BODYWEIGHT TRACKER</div>
              <div style={st.bwForm}>
                <input type="date" style={st.bwDateIn} value={bwDateInput} onChange={(e) => setBwDateInput(e.target.value)} />
                <input type="number" step="0.1" style={st.bwWeightIn} placeholder="kg" value={bwInput} onChange={(e) => setBwInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addBodyweight(); }} />
                <button style={st.bwAddBtn} onClick={addBodyweight}>LOG</button>
              </div>
              {bodyweightData.length >= 2 && (
                <div style={st.chartWrap}>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={bodyweightData.map((e) => ({ ...e, d: e.date.slice(5) }))}>
                      <XAxis dataKey="d" tick={{ fontSize: 9, fill: "#6A7A6D" }} axisLine={{ stroke: "#2E3A31" }} tickLine={false} />
                      <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 9, fill: "#6A7A6D" }} axisLine={{ stroke: "#2E3A31" }} tickLine={false} width={35} />
                      <Tooltip contentStyle={{ background: "#1A221C", border: "1px solid #2E3A31", fontSize: 11, color: "#D7E0D2" }} formatter={(v) => [`${v} kg`, "Weight"]} />
                      <Line type="monotone" dataKey="weight" stroke="#9FCB7B" strokeWidth={2} dot={{ r: 3, fill: "#9FCB7B" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              {bodyweightData.length < 2 && bodyweightData.length > 0 && <div style={st.emptyHint}>Log at least 2 entries to see the chart</div>}
              <div style={st.sectionTag}>RECENT ENTRIES</div>
              {bodyweightData.length === 0 && <div style={st.emptyHint}>No entries yet</div>}
              {[...bodyweightData].reverse().slice(0, 15).map((e) => (
                <div key={e.date} style={st.bwRow}><span style={st.bwRowDate}>{e.date}</span><span style={st.bwRowVal}>{e.weight} kg</span><button style={st.bwRowDel} onClick={() => deleteBodyweight(e.date)}>x</button></div>
              ))}
            </div>
          )}
          {insightSection === "streaks" && (
            <div>
              <div style={st.insightTitle}>CONSISTENCY</div>
              <div style={st.streakCard}><div style={st.streakBig}>{streak}</div><div style={st.streakLabel}>CURRENT DAY STREAK</div></div>
              <div style={st.sectionTag}>PERFECT WEEKS BY TYPE</div>
              <div style={st.emptyHint}>Week counts as perfect if target is met or exceeded</div>
              {WEEKLY_TARGETS.map((t) => { const d = perfectWeeks[t.group] || { perfect: 0, total: 0 }; const pct = d.total > 0 ? Math.round((d.perfect / d.total) * 100) : 0; return (
                <div key={t.group} style={st.perfectRow}>
                  <div style={st.perfectHead}><span style={{ ...st.perfectLabel, color: t.color }}>{t.label}</span><span style={st.perfectCount}>{d.perfect} / {d.total}</span></div>
                  <div style={st.targetBarBg}><div style={{ ...st.targetBarFill, width: `${pct}%`, background: t.color }} /></div>
                  <div style={st.perfectPct}>{pct}% HIT RATE</div>
                </div>); })}
            </div>
          )}
          {insightSection === "totals" && (
            <div>
              <div style={st.insightTitle}>ALL-TIME TOTALS</div>
              {[{ label: "GYM", ids: ["upper-press","lower","upper-pump","total"], color: "#9FCB7B" },{ label: "BJJ", ids: ["bjj-gi","bjj-nogi"], color: "#6BA8A0" },{ label: "BOXING", ids: ["boxing"], color: "#C4885A" },{ label: "ENGINE", ids: ["engine"], color: "#6B9A8A" },{ label: "MOBILITY", ids: ["mobility"], color: "#8A8E78" }].map((g) => {
                const ses = g.ids.reduce((s, id) => s + (historicalTotals[id]?.sessions || 0), 0);
                const min = g.ids.reduce((s, id) => s + (historicalTotals[id]?.minutes || 0), 0);
                return (<div key={g.label} style={st.totalRow}><span style={{ ...st.totalLabel, color: g.color }}>{g.label}</span><div style={st.totalNums}><span style={st.totalBig}>{ses}</span><span style={st.totalUnit}>sessions</span>{min > 0 && <><span style={{ ...st.totalBig, marginLeft: 12 }}>{fmtDur(min)}</span><span style={st.totalUnit}>total</span></>}</div></div>);
              })}
              <div style={{ ...st.sectionTag, marginTop: 20 }}>BREAKDOWN BY TYPE</div>
              {WORKOUT_TYPES.filter((t) => (historicalTotals[t.id]?.sessions || 0) > 0).map((t) => { const d = historicalTotals[t.id]; return (
                <div key={t.id} style={st.breakdownRow}><span style={{ color: t.color, fontSize: 12, fontWeight: 700 }}>{t.icon}</span><span style={st.breakdownLabel}>{t.label}</span><span style={st.breakdownVal}>{d.sessions}x</span>{d.minutes > 0 && <span style={st.breakdownMin}>{fmtDur(d.minutes)}</span>}</div>); })}
              {Object.values(historicalTotals).every((d) => d.sessions === 0) && <div style={st.emptyHint}>No workout data yet</div>}
            </div>
          )}
          {insightSection === "heatmap" && (
            <div>
              <div style={st.insightTitle}>TRAINING CALENDAR</div>
              <div style={st.heatNav}>
                <button style={st.navBtn} onClick={() => { const m = heatmapMonth.month === 0 ? 11 : heatmapMonth.month - 1; setHeatmapMonth({ year: heatmapMonth.month === 0 ? heatmapMonth.year - 1 : heatmapMonth.year, month: m }); }}>{"<"}</button>
                <span style={st.heatLabel}>{monthLabel}</span>
                <button style={st.navBtn} onClick={() => { const m = heatmapMonth.month === 11 ? 0 : heatmapMonth.month + 1; setHeatmapMonth({ year: heatmapMonth.month === 11 ? heatmapMonth.year + 1 : heatmapMonth.year, month: m }); }}>{">"}</button>
              </div>
              <div style={st.heatGrid}>
                {DAYS.map((d) => <div key={d} style={st.heatDayLabel}>{d.slice(0, 1)}</div>)}
                {Array.from({ length: startDay }, (_, i) => <div key={`e${i}`} style={st.heatCell} />)}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1; const ds = `${heatmapMonth.year}-${String(heatmapMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const cnt = (workouts[ds] || []).length; const hw = cnt > 0; const isTd = ds === today;
                  return (<div key={day} style={{ ...st.heatCell, background: hw ? cnt >= 3 ? "#7FA36B" : cnt >= 2 ? "rgba(127,163,107,0.45)" : "rgba(127,163,107,0.2)" : "#1A221C", border: isTd ? "1px solid #9FCB7B" : "1px solid #2E3A31" }}><span style={{ fontSize: 10, color: hw ? "#D7E0D2" : "#3A4A3D" }}>{day}</span></div>);
                })}
              </div>
              <div style={st.heatLegend}>
                <span style={st.heatLegItem}><span style={{ ...st.heatLegDot, background: "#1A221C" }} />Rest</span>
                <span style={st.heatLegItem}><span style={{ ...st.heatLegDot, background: "rgba(127,163,107,0.2)" }} />1</span>
                <span style={st.heatLegItem}><span style={{ ...st.heatLegDot, background: "rgba(127,163,107,0.45)" }} />2</span>
                <span style={st.heatLegItem}><span style={{ ...st.heatLegDot, background: "#7FA36B" }} />3+</span>
              </div>
            </div>
          )}
          {insightSection === "volume" && (
            <div>
              <div style={st.insightTitle}>VOLUME LIFTED</div>
              <div style={st.streakCard}><div style={st.streakBig}>{totalVolume > 1000 ? `${(totalVolume / 1000).toFixed(1)}t` : `${totalVolume}kg`}</div><div style={st.streakLabel}>ALL-TIME TOTAL</div></div>
              {weeklyVolume.length > 0 ? (
                <>
                  <div style={st.sectionTag}>WEEKLY VOLUME (KG)</div>
                  <div style={st.chartWrap}>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={weeklyVolume.slice(-12)}>
                        <XAxis dataKey="week" tick={{ fontSize: 9, fill: "#6A7A6D" }} axisLine={{ stroke: "#2E3A31" }} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: "#6A7A6D" }} axisLine={{ stroke: "#2E3A31" }} tickLine={false} width={40} tickFormatter={(v) => v > 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                        <Tooltip contentStyle={{ background: "#1A221C", border: "1px solid #2E3A31", fontSize: 11, color: "#D7E0D2" }} formatter={(v) => [`${v.toLocaleString()} kg`, "Volume"]} />
                        <Bar dataKey="volume" radius={[2, 2, 0, 0]}>{weeklyVolume.slice(-12).map((_, i) => <Cell key={i} fill="#7FA36B" />)}</Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={st.sectionTag}>RECENT WEEKS</div>
                  {[...weeklyVolume].reverse().slice(0, 8).map((w) => (<div key={w.week} style={st.volRow}><span style={st.volWeek}>w/{w.week}</span><span style={st.volVal}>{w.volume.toLocaleString()} kg</span></div>))}
                </>
              ) : <div style={st.emptyHint}>No volume data yet. Log gym sessions with reps and weight to track.</div>}
            </div>
          )}
        </div>
      )}

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

  // Block / Superset styles
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

  // Timer
  timerWrap: { padding: "10px 12px", borderTop: "1px solid #2E3A31", background: "#161E18" },
  timerBarBg: { height: 4, background: "#252F28", marginBottom: 8, borderRadius: 2 },
  timerBarFill: { height: 4, borderRadius: 2, transition: "width 1s linear" },
  timerRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  timerText: { fontSize: 13, fontWeight: 700, letterSpacing: 2 },
  timerStartBtn: { background: "#5A7A50", border: "none", color: "#D7E0D2", padding: "6px 14px", fontFamily: "inherit", fontSize: 10, letterSpacing: 2, cursor: "pointer", fontWeight: 700 },
  timerSkipBtn: { background: "none", border: "1px solid #2E3A31", color: "#8E9B8F", padding: "6px 14px", fontFamily: "inherit", fontSize: 10, letterSpacing: 2, cursor: "pointer" },

  // Insights
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
