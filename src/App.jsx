import { useEffect, useMemo, useState } from "react";
import { dataClient, dataSource } from "./data/dataClient.js";
import { teams as initialTeams } from "./data/mockData.js";
import { getYouTubeEmbedUrl } from "./lib/youtube.js";
import LoginPage from "./LoginPage.jsx";

const routes = {
  home: "/",
  cgfs: "/cgfs",
  pvp: "/pvp",
  pvpDashboard: "/pvp/dashboard",
};

const exerciseDefaults = {
  title: "",
  description: "",
  exerciseType: "Base",
  durationSeconds: 600,
  ageGroups: ["12 anni"],
  typology: "Tecnica",
  subtype: "palleggio alzata",
  regime: "Metabolico",
  regimeSubtype: "Agilita",
  youtubeUrl: "",
  youtubeUrl2: "",
  imageUrl: "",
  imageUrl2: "",
};

const ageOptions = Array.from({ length: 16 }, (_, index) => `${index + 5} anni`);
const typologyOptions = ["Didattica", "Tecnica", "Sintetico", "Tattica", "Globale"];
const subtypeOptions = [
  "palleggio alzata",
  "palleggio ricezione",
  "bagher ricezione",
  "bagher difesa",
  "bagher appoggio",
  "schiacciata",
  "battuta",
  "muro",
  "spostamenti",
];
const regimeOptions = ["Metabolico", "Anabolico"];
const regimeSubtypeOptions = ["Forza", "Forza Esplosiva", "Agilita", "Rapidita"];

function navigate(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function useRoute() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return path;
}

function readStorage(key, fallback = "") {
  try {
    return window.localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    if (value) window.localStorage.setItem(key, value);
    else window.localStorage.removeItem(key);
  } catch {
    // Demo state only.
  }
}

export default function App() {
  const path = useRoute();
  const [currentArea, setCurrentArea] = useState(() => readStorage("currentArea"));
  const [selectedCoachId, setSelectedCoachId] = useState(() => readStorage("selectedCoachId"));
  const [staffProfiles, setStaffProfiles] = useState([]);
  const [authState, setAuthState] = useState("loading"); // "loading" | "ok" | "login"

  useEffect(() => writeStorage("currentArea", currentArea), [currentArea]);
  useEffect(() => writeStorage("selectedCoachId", selectedCoachId), [selectedCoachId]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(() => setAuthState("ok"))
      .catch(() => setAuthState("login"));
  }, []);

  useEffect(() => {
    if (authState === "ok") {
      dataClient.getCoachProfiles({ areaId: "pvp" }).then(setStaffProfiles).catch(() => {});
    }
  }, [authState]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthState("login");
  }

  function chooseArea(areaId) {
    setCurrentArea(areaId);
    if (areaId !== "pvp") setSelectedCoachId("");
    navigate(areaId === "cgfs" ? routes.cgfs : routes.pvp);
  }

  function changeCoach(coachId) {
    setSelectedCoachId(coachId);
    navigate(routes.pvpDashboard);
  }

  // La pagina sondaggio è pubblica: nessun controllo auth
  if (path.startsWith("/sondaggio/")) {
    return <PublicSurveyPage surveyId={path.split("/").pop()} />;
  }

  // Auth gate: blocca tutto il resto finché non si è autenticati
  if (authState === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f7fb", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#667085", fontSize: "14px" }}>Caricamento…</span>
      </div>
    );
  }
  if (authState === "login") {
    return <LoginPage onSuccess={() => setAuthState("ok")} />;
  }

  if (path === routes.cgfs) {
    return (
      <AppShell currentArea="cgfs" selectedCoachId={selectedCoachId} onAreaChange={chooseArea} onLogout={logout}>
        <CgfsExercises />
      </AppShell>
    );
  }

  if (path === routes.pvpDashboard) {
    if (!selectedCoachId) {
      navigate(routes.pvp);
      return null;
    }

    return (
      <AppShell
        currentArea="pvp"
        selectedCoachId={selectedCoachId}
        onAreaChange={chooseArea}
        onCoachChange={() => navigate(routes.pvp)}
        onLogout={logout}
      >
        <PvpDashboard
          selectedCoachId={selectedCoachId}
          staffProfiles={staffProfiles}
          setStaffProfiles={setStaffProfiles}
        />
      </AppShell>
    );
  }

  if (path === routes.pvp) {
    return (
      <AppShell currentArea="pvp" selectedCoachId={selectedCoachId} onAreaChange={chooseArea} onLogout={logout}>
        <PvpCoachSelect selectedCoachId={selectedCoachId} staffProfiles={staffProfiles} onSelect={changeCoach} />
      </AppShell>
    );
  }

  return <AreaChooser onChoose={chooseArea} />;
}

function AppShell({ children, currentArea, selectedCoachId, onAreaChange, onCoachChange, onLogout }) {
  return (
    <div className={`app theme-${currentArea || "neutral"}`}>
      <header className="topbar">
        <button className="brand-button" type="button" onClick={() => navigate(routes.home)}>
          <span className="brand-mark">PVP</span>
          <span>
            <strong>PVP / CGFS Portal</strong>
            <small>Modulo operativo demo</small>
          </span>
        </button>
        <div className="area-switch" aria-label="Cambio area">
          <button
            className={currentArea === "cgfs" ? "active cgfs-control" : "cgfs-control"}
            type="button"
            onClick={() => onAreaChange("cgfs")}
          >
            CGFS
          </button>
          <button
            className={currentArea === "pvp" ? "active pvp-control" : "pvp-control"}
            type="button"
            onClick={() => onAreaChange("pvp")}
          >
            PVP
          </button>
        </div>
        <div className="topbar-status">
          <span className="data-source">Dati: {dataSource}</span>
          {currentArea === "pvp" && selectedCoachId && onCoachChange ? (
            <button className="coach-change" type="button" onClick={onCoachChange}>
              Cambia allenatore
            </button>
          ) : null}
          <button className="logout-button" type="button" onClick={onLogout}>
            Esci
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}

function AreaChooser({ onChoose }) {
  return (
    <main className="chooser-screen">
      <section className="chooser-copy">
        <div className="brand-lockup">
          <span className="brand-mark large">PVP</span>
          <div>
            <h1>PVP / CGFS Portal</h1>
            <p>Modulo operativo demo per separare percorsi formativi CGFS e attivita sportive PVP.</p>
          </div>
        </div>
        <div className="area-cards">
          <button className="area-card cgfs-card" type="button" onClick={() => onChoose("cgfs")}>
            <span className="area-code">CGFS</span>
            <strong>Centro di Formazione e Sviluppo</strong>
            <small>Catalogo esercizi condiviso, video e progressione formativa.</small>
          </button>
          <button className="area-card pvp-card" type="button" onClick={() => onChoose("pvp")}>
            <span className="area-code">PVP</span>
            <strong>Prato Volley Project</strong>
            <small>Calendari, allenamenti, roster, staff, sondaggi e partite.</small>
          </button>
        </div>
      </section>
      <section className="chooser-preview" aria-label="Anteprima modulo">
        <div className="preview-header">
          <span>Anteprima operativa</span>
          <strong>CGFS + PVP</strong>
        </div>
        <div className="preview-grid">
          <div className="preview-panel blue">
            <span>Database esercizi condiviso</span>
            <strong>Campi tecnici, fasce eta, video YouTube e immagini</strong>
          </div>
          <div className="preview-panel black">
            <span>Area sportiva PVP</span>
            <strong>Allenamento odierno, presenze, grafici, sondaggi e staff</strong>
          </div>
          <div className="mini-calendar">
            {["Lun", "Mar", "Mer", "Gio", "Ven"].map((day) => (
              <div key={day}>
                <span>{day}</span>
                <b />
                <b />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function CgfsExercises() {
  const [query, setQuery] = useState("");
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [formOpen, setFormOpen] = useState(true);

  useEffect(() => {
    dataClient.getExercises({ query }).then((items) => {
      setExercises(items);
      setSelectedExercise((current) => current || items[0] || null);
    });
  }, [query]);

  async function saveExercise(form) {
    const exercise = await dataClient.createExercise({
      ...form,
      areaId: "shared",
      title: form.title.trim(),
      duration: formatDuration(form.durationSeconds),
      category: form.typology,
      objective: form.subtype,
      youtubeUrl: form.youtubeUrl,
    });
    setExercises((items) => [exercise, ...items]);
    setSelectedExercise(exercise);
  }

  return (
    <main className="workspace cgfs-workspace no-sidebar">
      <section className="content-area">
        <div className="section-header">
          <div>
            <p>Area CGFS</p>
            <h1>Catalogo esercizi</h1>
          </div>
          <button className="primary-button" type="button" onClick={() => setFormOpen(true)}>
            Aggiungi esercizio
          </button>
        </div>
        <ExerciseCatalog
          exercises={exercises}
          query={query}
          setQuery={setQuery}
          selectedExercise={selectedExercise}
          setSelectedExercise={setSelectedExercise}
        />
      </section>
      {formOpen ? (
        <aside className="form-drawer wide-form">
          <ExerciseForm title="Aggiungi esercizio" onClose={() => setFormOpen(false)} onSave={saveExercise} />
        </aside>
      ) : null}
    </main>
  );
}

function ExerciseCatalog({ exercises, query, setQuery, selectedExercise, setSelectedExercise }) {
  const embedUrl = getYouTubeEmbedUrl(selectedExercise?.youtubeUrl);
  return (
    <>
      <div className="toolbar">
        <label className="search-box">
          <span>Cerca</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nome, tipologia, sottosezione, regime"
          />
        </label>
        <span className="result-count">{exercises.length} esercizi trovati</span>
      </div>
      <div className="exercise-layout">
        <div className="exercise-list">
          {exercises.map((exercise) => (
            <button
              key={exercise.id}
              className={selectedExercise?.id === exercise.id ? "exercise-row selected" : "exercise-row"}
              type="button"
              onClick={() => setSelectedExercise(exercise)}
            >
              <span className="thumb">
                <span className="play-symbol" />
              </span>
              <span>
                <strong>{exercise.title}</strong>
                <small>{exercise.subtype || exercise.objective} · {exercise.ageGroups?.join(", ") || exercise.players}</small>
              </span>
            </button>
          ))}
        </div>
        <article className="detail-panel">
          {selectedExercise ? (
            <>
              <div className="video-frame">
                {embedUrl ? (
                  <iframe
                    title={`Video ${selectedExercise.title}`}
                    src={embedUrl}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="empty-video">Video YouTube non collegato</div>
                )}
              </div>
              <h2>{selectedExercise.title}</h2>
              <p>{selectedExercise.description}</p>
              <div className="meta-grid">
                <span>{selectedExercise.exerciseType || "Base"}</span>
                <span>{selectedExercise.typology || selectedExercise.category}</span>
                <span>{selectedExercise.duration || formatDuration(selectedExercise.durationSeconds)}</span>
              </div>
            </>
          ) : (
            <p>Nessun esercizio selezionato.</p>
          )}
        </article>
      </div>
    </>
  );
}

function ExerciseForm({ title, onSave, onClose }) {
  const [form, setForm] = useState(exerciseDefaults);
  const minutes = Math.round(Number(form.durationSeconds || 0) / 60);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleAge(age) {
    setForm((current) => ({
      ...current,
      ageGroups: current.ageGroups.includes(age)
        ? current.ageGroups.filter((item) => item !== age)
        : [...current.ageGroups, age],
    }));
  }

  function submit(event) {
    event.preventDefault();
    onSave(form);
    setForm(exerciseDefaults);
  }

  return (
    <>
      <div className="drawer-header">
        <h2>{title}</h2>
        <button className="text-button" type="button" onClick={onClose}>
          Chiudi
        </button>
      </div>
      <form className="exercise-form" onSubmit={submit}>
        <label>
          Titolo *
          <input value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="Palleggio sulla testa" required />
        </label>
        <label>
          Descrizione
          <textarea value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Spiegazione dell'esercizio" />
        </label>
        <div className="field-row">
          <label>
            Tipo esercizio
            <select value={form.exerciseType} onChange={(event) => update("exerciseType", event.target.value)}>
              <option>Base</option>
              <option>Variante</option>
            </select>
          </label>
          <label>
            Durata (secondi)
            <input
              type="number"
              min="0"
              step="30"
              value={form.durationSeconds}
              onChange={(event) => update("durationSeconds", event.target.value)}
            />
          </label>
        </div>
        <div className="duration-note">Visualizzazione automatica: {minutes} minuti</div>
        <fieldset>
          <legend>Fascia eta</legend>
          <div className="chip-grid">
            {ageOptions.map((age) => (
              <label className="check-chip" key={age}>
                <input type="checkbox" checked={form.ageGroups.includes(age)} onChange={() => toggleAge(age)} />
                {age}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="field-row">
          <label>
            Tipologia
            <select value={form.typology} onChange={(event) => update("typology", event.target.value)}>
              {typologyOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            Sottosezione tipologia
            <select value={form.subtype} onChange={(event) => update("subtype", event.target.value)}>
              {subtypeOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>
        <div className="field-row">
          <label>
            Regime
            <select value={form.regime} onChange={(event) => update("regime", event.target.value)}>
              {regimeOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            Sottosezione regime
            <select value={form.regimeSubtype} onChange={(event) => update("regimeSubtype", event.target.value)}>
              {regimeSubtypeOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>
        <div className="field-row">
          <label>
            Video YouTube 1
            <input value={form.youtubeUrl} onChange={(event) => update("youtubeUrl", event.target.value)} placeholder="URL o identificativo video" />
          </label>
          <label>
            Video YouTube 2
            <input value={form.youtubeUrl2} onChange={(event) => update("youtubeUrl2", event.target.value)} placeholder="URL o identificativo video" />
          </label>
        </div>
        <div className="field-row">
          <label>
            Immagine URL 1
            <input value={form.imageUrl} onChange={(event) => update("imageUrl", event.target.value)} placeholder="URL immagine" />
          </label>
          <label>
            Immagine URL 2
            <input value={form.imageUrl2} onChange={(event) => update("imageUrl2", event.target.value)} placeholder="URL immagine" />
          </label>
        </div>
        <button className="primary-button full" type="submit">Salva esercizio condiviso</button>
      </form>
    </>
  );
}

function PvpCoachSelect({ selectedCoachId, staffProfiles, onSelect }) {
  return (
    <main className="coach-screen">
      <section className="coach-card">
        <p>Area PVP</p>
        <h1>Seleziona allenatore</h1>
        <span className="muted">Scegli il profilo operativo per filtrare squadre, roster, calendari e report.</span>
        <div className="coach-list">
          {staffProfiles.map((coach) => (
            <button
              key={coach.id}
              className={selectedCoachId === coach.id ? "coach-row selected" : "coach-row"}
              type="button"
              onClick={() => onSelect(coach.id)}
            >
              <span>{coach.fullName.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>
              <strong>{coach.fullName}</strong>
              <small>
                {coach.role}
                {coach.teamId ? ` · ${teamLabelById(coach.teamId)}` : " · tutte le squadre"}
                {coach.email ? ` · ${coach.email}` : ""}
              </small>
            </button>
          ))}
        </div>
      </section>
      <section className="coach-preview">
        <div className="stat-strip">
          <div><strong>{staffProfiles.length}</strong><span>profili staff</span></div>
          <div><strong>6</strong><span>societa</span></div>
          <div><strong>7</strong><span>categorie</span></div>
        </div>
        <div className="operations-list">
          {["Calendario allenamenti", "Allenamento odierno", "Giocatrici e squadre", "Staff tecnico", "Sondaggi"].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>
    </main>
  );
}

function PvpDashboard({ selectedCoachId, staffProfiles, setStaffProfiles }) {
  const [dashboard, setDashboard] = useState(null);
  const [activeSection, setActiveSection] = useState("Calendario allenamenti");
  const [workouts, setWorkouts] = useState([]);
  const [teams, setTeams] = useState([]);
  const [roster, setRoster] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [matches, setMatches] = useState([]);
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    dataClient.getPvpDashboard({ coachProfileId: selectedCoachId }).then((data) => {
      setDashboard(data);
      setWorkouts(data.workouts);
      setTeams(data.teams);
      setRoster(data.roster);
      setSurveys(data.surveys);
      setMatches(data.matches);
      setExercises(data.exercises);
    });
  }, [selectedCoachId]);

  if (!dashboard) return <main className="loading-screen">Caricamento area PVP...</main>;

  const selectedStaffProfile = staffProfiles.find((item) => item.id === selectedCoachId);
  const canManage = selectedCoachId === "coach-admin";
  const liveDashboard = {
    ...dashboard,
    coach: selectedStaffProfile || dashboard.coach,
    ownTeamId: selectedStaffProfile?.teamId || "",
    workouts,
    teams,
    roster,
    surveys,
    staff: staffProfiles,
    matches,
    exercises,
  };

  return (
    <main className="workspace pvp-workspace">
      <SidebarNav
        title="PVP"
        items={["Calendario allenamenti", "Allenamento odierno", "Database esercizi", "Partite / Amichevoli", "Report", "Giocatrici e squadre", "Staff tecnico", "Sondaggi"]}
        active={activeSection}
        onSelect={setActiveSection}
      />
      <section className="content-area">
        <div className="section-header">
          <div>
            <p>{dashboard.coach?.fullName}</p>
            <h1>{activeSection}</h1>
          </div>
          <span className="season-chip">Stagione 2025/2026</span>
        </div>
        <PvpSection
          activeSection={activeSection}
          dashboard={liveDashboard}
          setWorkouts={setWorkouts}
          setTeams={setTeams}
          setRoster={setRoster}
          setSurveys={setSurveys}
          setStaff={setStaffProfiles}
          setMatches={setMatches}
          setExercises={setExercises}
          canManage={canManage}
        />
      </section>
    </main>
  );
}

function PvpSection(props) {
  const { activeSection, dashboard } = props;

  if (activeSection === "Calendario allenamenti") {
    return <CalendarWithCharts dashboard={dashboard} />;
  }

  if (activeSection === "Allenamento odierno") {
    return <TodayWorkout dashboard={dashboard} setWorkouts={props.setWorkouts} />;
  }

  if (activeSection === "Giocatrici e squadre") {
    return <TeamsPlayers dashboard={dashboard} setTeams={props.setTeams} setRoster={props.setRoster} canManage={props.canManage} />;
  }

  if (activeSection === "Partite / Amichevoli") {
    return <CrudList title="Partite / Amichevoli" items={dashboard.matches} setItems={props.setMatches} fields={["opponent", "date", "result"]} labelField="opponent" />;
  }

  if (activeSection === "Database esercizi") {
    return <PvpExerciseDatabase exercises={dashboard.exercises} setExercises={props.setExercises} />;
  }

  if (activeSection === "Sondaggi") {
    return <SurveysSection surveys={dashboard.surveys} setSurveys={props.setSurveys} />;
  }

  if (activeSection === "Staff tecnico") {
    return (
      <CrudList
        title="Staff tecnico"
        items={dashboard.staff}
        setItems={props.setStaff}
        fields={["fullName", "role", "teamId", "phone", "email"]}
        labelField="fullName"
        canManage={props.canManage}
        lockedMessage="Il profilo Coach e fisso e non puo essere rimosso."
      />
    );
  }

  if (activeSection === "Report") {
    return <AttendanceReport dashboard={dashboard} />;
  }

  return (
    <div className="dashboard-grid">
      <DataPanel title="Carico tecnico" items={["Tecnica: 42%", "Tattica: 28%", "Globale: 30%"]} />
      <DataPanel title="Note staff" items={["Ricezione e cambio palla in crescita", "Aggiornare roster U16", "Aprire sondaggio benessere"]} />
    </div>
  );
}

function AttendanceReport({ dashboard }) {
  const years = ["2025", "2026"];
  const months = [
    ["", "Tutti i mesi"],
    ["01", "Gennaio"],
    ["02", "Febbraio"],
    ["03", "Marzo"],
    ["04", "Aprile"],
    ["05", "Maggio"],
    ["06", "Giugno"],
    ["07", "Luglio"],
    ["08", "Agosto"],
    ["09", "Settembre"],
    ["10", "Ottobre"],
    ["11", "Novembre"],
    ["12", "Dicembre"],
  ];
  const [filters, setFilters] = useState({
    month: "",
    year: "2025",
    teamId: dashboard.ownTeamId || "",
    athleteId: "",
  });

  const rows = useMemo(() => buildAttendanceRows(dashboard), [dashboard]);
  const filteredRows = rows.filter((row) => {
    const matchesYear = !filters.year || row.year === filters.year;
    const matchesMonth = !filters.month || row.month === filters.month;
    const matchesTeam = !filters.teamId || row.teamId === filters.teamId;
    const matchesAthlete = !filters.athleteId || row.athleteId === filters.athleteId;
    return matchesYear && matchesMonth && matchesTeam && matchesAthlete;
  });

  const total = filteredRows.length;
  const present = filteredRows.filter((row) => row.present).length;
  const percentage = total ? Math.round((present / total) * 100) : 0;
  const athletesForFilter = filters.teamId
    ? dashboard.roster.filter((athlete) => athlete.teamId === filters.teamId)
    : dashboard.roster;

  function updateFilter(field, value) {
    setFilters((current) => ({
      ...current,
      [field]: value,
      ...(field === "teamId" ? { athleteId: "" } : {}),
    }));
  }

  function downloadCsv() {
    const header = ["Anno", "Mese", "Data", "Squadra", "Atleta", "Ruolo", "Presente"];
    const body = filteredRows.map((row) => [
      row.year,
      row.monthLabel,
      row.dateLabel,
      row.teamName,
      row.athleteName,
      row.role,
      row.present ? "Si" : "No",
    ]);
    const csv = [header, ...body]
      .map((line) => line.map((cell) => `"${String(cell).replaceAll("\"", "\"\"")}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `report-presenze-${filters.year || "tutti"}-${filters.month || "anno"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="stacked-section">
      <section className="data-panel">
        <h2>Report presenze</h2>
        {dashboard.ownTeamId ? (
          <p className="muted">Filtro iniziale sulla squadra associata al profilo: {teamName(dashboard, dashboard.ownTeamId)}.</p>
        ) : (
          <p className="muted">Profilo Coach: vista iniziale su tutte le squadre.</p>
        )}
        <div className="report-filters">
          <label>
            Mese
            <select value={filters.month} onChange={(event) => updateFilter("month", event.target.value)}>
              {months.map(([value, label]) => <option value={value} key={label}>{label}</option>)}
            </select>
          </label>
          <label>
            Anno
            <select value={filters.year} onChange={(event) => updateFilter("year", event.target.value)}>
              {years.map((year) => <option key={year}>{year}</option>)}
            </select>
          </label>
          <label>
            Squadra
            <select value={filters.teamId} onChange={(event) => updateFilter("teamId", event.target.value)}>
              <option value="">Tutte le squadre</option>
              {dashboard.teams.map((team) => <option value={team.id} key={team.id}>{team.name}</option>)}
            </select>
          </label>
          <label>
            Atleta
            <select value={filters.athleteId} onChange={(event) => updateFilter("athleteId", event.target.value)}>
              <option value="">Tutte le atlete</option>
              {athletesForFilter.map((athlete) => <option value={athlete.id} key={athlete.id}>{athlete.fullName}</option>)}
            </select>
          </label>
          <button className="primary-button" type="button" onClick={downloadCsv}>
            Scarica report
          </button>
        </div>
        <div className="report-summary">
          <div><strong>{percentage}%</strong><span>presenza media</span></div>
          <div><strong>{present}</strong><span>presenze</span></div>
          <div><strong>{total - present}</strong><span>assenze</span></div>
          <div><strong>{total}</strong><span>righe filtrate</span></div>
        </div>
      </section>
      <section className="data-panel">
        <h2>Dettaglio presenze</h2>
        <div className="report-table">
          <div className="report-table-head">
            <span>Data</span>
            <span>Squadra</span>
            <span>Atleta</span>
            <span>Esito</span>
          </div>
          {filteredRows.map((row) => (
            <div className="report-table-row" key={`${row.workoutId}-${row.athleteId}`}>
              <span>{row.dateLabel}</span>
              <span>{row.teamName}</span>
              <span>{row.athleteName}</span>
              <strong>{row.present ? "Presente" : "Assente"}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function CalendarWithCharts({ dashboard }) {
  const chartData = getExercisePercentages(dashboard.exercises);
  return (
    <>
      <div className="calendar-board">
        {["Lun 19", "Mar 20", "Mer 21", "Gio 22", "Ven 23", "Sab 24"].map((day) => (
          <div className="calendar-day" key={day}>
            <strong>{day}</strong>
            {dashboard.workouts.filter((workout) => workout.day === day).map((workout) => (
              <article key={workout.id}>
                <span>{workout.time}</span>
                <b>{teamName(dashboard, workout.teamId)}</b>
                <small>{workout.title}</small>
              </article>
            ))}
          </div>
        ))}
      </div>
      <section className="chart-section">
        <h2>Percentuali esercizi in archivio</h2>
        <div className="chart-grid">
          {chartData.map((item) => (
            <div className="bar-row" key={item.label}>
              <span>{item.label}</span>
              <div><b style={{ width: `${item.percent}%` }} /></div>
              <strong>{item.percent}%</strong>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function TodayWorkout({ dashboard, setWorkouts }) {
  const [draft, setDraft] = useState({ title: "Allenamento odierno", teamId: dashboard.ownTeamId || dashboard.teams[0]?.id || "", time: "18:30 - 20:00", exerciseIds: [] });
  const [session, setSession] = useState(null);
  const attendancePlayers = dashboard.roster.filter((athlete) => !draft.teamId || athlete.teamId === draft.teamId);

  function toggleExercise(id) {
    setDraft((current) => ({
      ...current,
      exerciseIds: current.exerciseIds.includes(id)
        ? current.exerciseIds.filter((item) => item !== id)
        : [...current.exerciseIds, id],
    }));
  }

  function scheduleWorkout() {
    const workout = {
      id: `workout-${Date.now()}`,
      areaId: "pvp",
      seasonId: "2025-2026",
      teamId: draft.teamId,
      title: draft.title,
      day: "Oggi",
      time: draft.time,
      status: "calendarizzato",
      exerciseIds: draft.exerciseIds,
      attendance: attendancePlayers.map((athlete) => ({ athleteId: athlete.id, present: true })),
    };
    setWorkouts((items) => [workout, ...items]);
    setSession(workout);
  }

  function toggleAttendance(athleteId) {
    setSession((current) => ({
      ...current,
      attendance: current.attendance.map((item) => item.athleteId === athleteId ? { ...item, present: !item.present } : item),
    }));
  }

  return (
    <div className="split-grid">
      <section className="data-panel">
        <h2>Calendarizza sessione</h2>
        <div className="form-stack">
          <label>Titolo<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
          <label>Squadra<select value={draft.teamId} onChange={(event) => setDraft({ ...draft, teamId: event.target.value })}>{dashboard.teams.map((team) => <option value={team.id} key={team.id}>{team.name}</option>)}</select></label>
          <label>Orario<input value={draft.time} onChange={(event) => setDraft({ ...draft, time: event.target.value })} /></label>
          <fieldset>
            <legend>Esercizi dall'archivio</legend>
            <div className="data-list compact">
              {dashboard.exercises.map((exercise) => (
                <label className="check-line" key={exercise.id}>
                  <input type="checkbox" checked={draft.exerciseIds.includes(exercise.id)} onChange={() => toggleExercise(exercise.id)} />
                  {exercise.title}
                </label>
              ))}
            </div>
          </fieldset>
          <button className="primary-button full" type="button" onClick={scheduleWorkout}>Crea e apri allenamento</button>
        </div>
      </section>
      <section className="data-panel">
        <h2>Compilazione allenamento effettivo</h2>
        {session ? (
          <>
            <p>{session.title} · {teamName(dashboard, session.teamId)} · {session.time}</p>
            <h3>Presenze</h3>
            <div className="data-list compact">
              {session.attendance.map((item) => {
                const athlete = dashboard.roster.find((entry) => entry.id === item.athleteId);
                return (
                  <label className="check-line" key={item.athleteId}>
                    <input type="checkbox" checked={item.present} onChange={() => toggleAttendance(item.athleteId)} />
                    {athlete?.fullName || item.athleteId}
                  </label>
                );
              })}
            </div>
            <h3>Esercizi svolti</h3>
            <div className="data-list compact">
              {session.exerciseIds.map((id) => <span key={id}>{dashboard.exercises.find((exercise) => exercise.id === id)?.title}</span>)}
            </div>
          </>
        ) : (
          <p>Calendarizza una sessione per aprire la compilazione e registrare le presenze.</p>
        )}
      </section>
    </div>
  );
}

function PvpExerciseDatabase({ exercises, setExercises }) {
  const [formOpen, setFormOpen] = useState(false);

  async function saveExercise(form) {
    const exercise = await dataClient.createExercise({
      ...form,
      areaId: "shared",
      title: form.title.trim(),
      duration: formatDuration(form.durationSeconds),
      category: form.typology,
      objective: form.subtype,
      youtubeUrl: form.youtubeUrl,
    });
    setExercises((items) => [exercise, ...items]);
  }

  return (
    <div className="stacked-section">
      <div className="section-actions">
        <button className="primary-button" type="button" onClick={() => setFormOpen(true)}>Aggiungi esercizio condiviso</button>
      </div>
      {formOpen ? (
        <section className="data-panel">
          <ExerciseForm title="Nuovo esercizio database" onClose={() => setFormOpen(false)} onSave={saveExercise} />
        </section>
      ) : null}
      <DataPanel title="Esercizi disponibili per CGFS e PVP" items={exercises.map((exercise) => `${exercise.title} · ${exercise.typology || exercise.category} · ${exercise.subtype || exercise.objective}`)} />
    </div>
  );
}

function SurveysSection({ surveys, setSurveys }) {
  const [draft, setDraft] = useState({ title: "", question: "", type: "Scelta multipla" });

  function addSurvey() {
    if (!draft.title.trim()) return;
    setSurveys((items) => [
      {
        id: `survey-${Date.now()}`,
        areaId: "pvp",
        title: draft.title,
        status: "aperto",
        responses: 0,
        questions: [{ text: draft.question || "Domanda del sondaggio", type: draft.type }],
      },
      ...items,
    ]);
    setDraft({ title: "", question: "", type: "Scelta multipla" });
  }

  function updateSurvey(id, patch) {
    setSurveys((items) => items.map((survey) => survey.id === id ? { ...survey, ...patch } : survey));
  }

  return (
    <div className="split-grid">
      <section className="data-panel">
        <h2>Nuovo sondaggio</h2>
        <div className="form-stack">
          <label>Titolo<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Benessere pre-gara" /></label>
          <label>Quesito<input value={draft.question} onChange={(event) => setDraft({ ...draft, question: event.target.value })} placeholder="Come ti senti oggi?" /></label>
          <label>Tipo domanda<select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value })}>
            {["Scelta multipla", "Risposta aperta", "Scala lineare", "Caselle di controllo", "Si/No"].map((item) => <option key={item}>{item}</option>)}
          </select></label>
          <button className="primary-button full" type="button" onClick={addSurvey}>Aggiungi sondaggio</button>
        </div>
      </section>
      <section className="data-panel">
        <h2>Sondaggi</h2>
        <div className="data-list">
          {surveys.map((survey) => (
            <article className="managed-row" key={survey.id}>
              <div>
                <strong>{survey.title}</strong>
                <small>{survey.status || "aperto"} · {survey.responses} risposte · /sondaggio/{survey.id}</small>
              </div>
              <button type="button" onClick={() => updateSurvey(survey.id, { status: survey.status === "chiuso" ? "aperto" : "chiuso" })}>{survey.status === "chiuso" ? "Apri" : "Chiudi"}</button>
              <button type="button" onClick={() => setSurveys((items) => items.filter((item) => item.id !== survey.id))}>Rimuovi</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function TeamsPlayers({ dashboard, setTeams, setRoster, canManage }) {
  return (
    <div className="split-grid">
      <CrudList title="Giocatrici" items={dashboard.roster} setItems={setRoster} fields={["fullName", "role", "teamId"]} labelField="fullName" canManage={canManage} />
      <CrudList title="Squadre" items={dashboard.teams} setItems={setTeams} fields={["name", "court", "levelId"]} labelField="name" canManage={canManage} />
    </div>
  );
}

function CrudList({ title, items, setItems, fields, labelField, canManage = true, lockedMessage = "" }) {
  const empty = Object.fromEntries(fields.map((field) => [field, ""]));
  const [draft, setDraft] = useState(empty);

  function addItem() {
    if (!draft[labelField]?.trim()) return;
    setItems((current) => [{ ...draft, id: `${labelField}-${Date.now()}` }, ...current]);
    setDraft(empty);
  }

  return (
    <section className="data-panel">
      <h2>{title}</h2>
      {canManage ? (
        <div className="form-stack inline-form">
          {fields.map((field) => (
            <label key={field}>{field}<input value={draft[field]} onChange={(event) => setDraft({ ...draft, [field]: event.target.value })} /></label>
          ))}
          <button className="primary-button" type="button" onClick={addItem}>Aggiungi</button>
        </div>
      ) : (
        <div className="permission-note">Solo il profilo Coach puo aggiungere o rimuovere elementi in questa sezione.</div>
      )}
      <div className="data-list">
        {items.map((item) => (
          <article className="managed-row" key={item.id}>
            <div>
              <strong>{item[labelField]}</strong>
              <small>{fields.filter((field) => field !== labelField).map((field) => item[field]).filter(Boolean).join(" · ")}</small>
              {item.locked && lockedMessage ? <small>{lockedMessage}</small> : null}
            </div>
            {canManage ? (
              <button
                type="button"
                disabled={item.locked}
                onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}
              >
                {item.locked ? "Bloccato" : "Rimuovi"}
              </button>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function PublicSurveyPage({ surveyId }) {
  const [submitted, setSubmitted] = useState(false);
  return (
    <main className="public-survey">
      <section className="coach-card">
        <p>Sondaggio PVP</p>
        <h1>Risposta sondaggio</h1>
        <span className="muted">Pagina pubblica demo: /sondaggio/{surveyId}</span>
        {submitted ? (
          <div className="success-box">Risposta registrata. In produzione il nome e cognome potranno rispondere una sola volta.</div>
        ) : (
          <form className="form-stack" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
            <label>Nome<input required /></label>
            <label>Cognome<input required /></label>
            <label>Scelta multipla<select><option>Molto bene</option><option>Bene</option><option>Da monitorare</option></select></label>
            <label>Risposta aperta<textarea placeholder="Scrivi la tua risposta" /></label>
            <label>Scala lineare<input type="range" min="1" max="5" defaultValue="3" /></label>
            <button className="primary-button full" type="submit">Invia risposta</button>
          </form>
        )}
      </section>
    </main>
  );
}

function SidebarNav({ title, items, active, onSelect }) {
  return (
    <aside className="sidebar">
      <strong>{title}</strong>
      <nav>
        {items.map((item) => (
          <button
            key={item}
            className={active === item ? "active" : ""}
            type="button"
            onClick={() => onSelect?.(item)}
          >
            <span className="nav-dot" />
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
}

function DataPanel({ title, items }) {
  return (
    <section className="data-panel">
      <h2>{title}</h2>
      <div className="data-list">
        {items.length ? items.map((item) => <span key={item}>{item}</span>) : <span>Nessun dato disponibile.</span>}
      </div>
    </section>
  );
}

function teamName(dashboard, teamId) {
  return dashboard.teams.find((team) => team.id === teamId)?.name || "Squadra";
}

function teamLabelById(teamId) {
  return initialTeams.find((team) => team.id === teamId)?.name || teamId;
}

function formatDuration(seconds) {
  const value = Number(seconds || 0);
  return `${Math.round(value / 60)} min`;
}

function getExercisePercentages(exercises) {
  const total = exercises.length || 1;
  const counts = exercises.reduce((acc, exercise) => {
    const label = exercise.typology || exercise.category || "Non classificato";
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).map(([label, count]) => ({ label, percent: Math.round((count / total) * 100) }));
}

function buildAttendanceRows(dashboard) {
  const monthByDay = {
    "Lun 19": ["05", "Maggio", "19/05/2025"],
    "Mar 20": ["05", "Maggio", "20/05/2025"],
    "Mer 21": ["05", "Maggio", "21/05/2025"],
    "Gio 22": ["05", "Maggio", "22/05/2025"],
    "Ven 23": ["05", "Maggio", "23/05/2025"],
    "Sab 24": ["05", "Maggio", "24/05/2025"],
    Oggi: ["06", "Giugno", "08/06/2026"],
  };

  return dashboard.workouts.flatMap((workout, workoutIndex) => {
    const team = dashboard.teams.find((item) => item.id === workout.teamId);
    const athletes = dashboard.roster.filter((athlete) => athlete.teamId === workout.teamId);
    const [month, monthLabel, dateLabel] = monthByDay[workout.day] || ["05", "Maggio", workout.day || "Data da definire"];
    const year = workout.day === "Oggi" ? "2026" : "2025";

    return athletes.map((athlete, athleteIndex) => ({
      workoutId: workout.id,
      athleteId: athlete.id,
      athleteName: athlete.fullName,
      role: athlete.role,
      teamId: workout.teamId,
      teamName: team?.name || "Squadra",
      year,
      month,
      monthLabel,
      dateLabel,
      present: (workoutIndex + athleteIndex) % 5 !== 0,
    }));
  });
}
