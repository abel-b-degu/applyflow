import { useEffect, useState } from "react";
import { api } from "./api";
import "./App.css";

export default function App() {
  const [apps, setApps] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [company, setCompany] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [jobUrl, setJobUrl] = useState("");

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const data = await api.listApplications();
      setApps(data);
      if (data.length && selectedId == null) setSelectedId(data[0].id);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    setErr("");
    try {
      const created = await api.createApplication({
        company,
        role_title: roleTitle,
        job_url: jobUrl || null,
      });
      setCompany("");
      setRoleTitle("");
      setJobUrl("");
      await load();
      setSelectedId(created.id);
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "30px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: 6 }}>ApplyPilot</h1>
      <p style={{ marginTop: 0, opacity: 0.7 }}>
        Click an application → paste job description → generate a cover letter.
      </p>

      {err && (
        <div style={{ background: "#fee2e2", color: "#7f1d1d", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          {err}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 16 }}>
        {/* LEFT */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0 }}>Applications</h2>
            <button onClick={load} style={btn}>Refresh</button>
          </div>

          {loading ? (
            <p>Loading…</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
              {apps.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedId(a.id)}
                  style={{
                    textAlign: "left",
                    padding: 10,
                    borderRadius: 12,
                    border: selectedId === a.id ? "2px solid #2563eb" : "1px solid #e5e7eb",
                    background: "transparent",
                    color: "inherit",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{a.company}</div>
                  <div style={{ opacity: 0.8 }}>{a.role_title}</div>
                  <div style={{ opacity: 0.7, fontSize: 12 }}>{a.status}</div>
                </button>
              ))}
            </div>
          )}

          <div style={{ height: 16 }} />

          <div style={subCard}>
            <h3 style={{ marginTop: 0 }}>New Application</h3>
            <form onSubmit={onCreate} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" required style={input} />
              <input value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} placeholder="Role title" required style={input} />
              <input value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} placeholder="Job URL (optional)" style={input} />
              <button type="submit" style={btn}>Create</button>
            </form>
          </div>
        </div>

        {/* RIGHT */}
        <div style={card}>
          <h2 style={{ marginTop: 0 }}>Application Detail</h2>
          {!selectedId ? (
            <p>Select an application.</p>
          ) : (
            <DetailPanel appId={selectedId} />
          )}
        </div>
      </div>
    </div>
  );
}

function DetailPanel({ appId }) {
  const [app, setApp] = useState(null);
  const [jobText, setJobText] = useState("");
  const [letter, setLetter] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    setBusy(true);
    try {
      const a = await api.getApplication(appId);
      setApp(a);

      try {
        const jd = await api.getJobDescription(appId);
        setJobText(jd?.raw_text || "");
      } catch {
        setJobText("");
      }

      setLetter("");
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId]);

  async function saveJD() {
    setErr("");
    setBusy(true);
    try {
      await api.upsertJobDescription(appId, { raw_text: jobText });
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function generate() {
    setErr("");
    setBusy(true);
    try {
      await api.upsertJobDescription(appId, { raw_text: jobText });
      const doc = await api.generateCoverLetter(appId);
      setLetter(doc.content);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {err && (
        <div style={{ background: "#fee2e2", color: "#7f1d1d", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          {err}
        </div>
      )}

      {app ? (
        <>
          <div style={{ fontWeight: 800, fontSize: 18 }}>{app.company}</div>
          <div style={{ opacity: 0.8, marginBottom: 10 }}>{app.role_title}</div>

          <label style={{ fontWeight: 700 }}>Job Description</label>
          <textarea
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            rows={10}
            placeholder="Paste the job description here…"
            style={{ ...input, width: "100%", fontFamily: "inherit" }}
          />

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button onClick={saveJD} disabled={busy || !jobText.trim()} style={btn}>
              Save JD
            </button>
            <button onClick={generate} disabled={busy || !jobText.trim()} style={{ ...btn, background: "#111827", borderColor: "#111827" }}>
              Generate Cover Letter
            </button>
          </div>

          {letter && (
            <div style={{ marginTop: 16 }}>
              <h3 style={{ marginBottom: 8 }}>Generated Cover Letter</h3>
              <pre style={{
                whiteSpace: "pre-wrap",
                background: "#0b1220",
                border: "1px solid #1e293b",
                padding: 12,
                borderRadius: 12,
                overflow: "auto"
              }}>
                {letter}
              </pre>
            </div>
          )}
        </>
      ) : (
        <p>Loading…</p>
      )}
    </div>
  );
}

const card = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 14,
};

const subCard = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 14,
};

const input = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  background: "transparent",
  color: "inherit",
};

const btn = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #2563eb",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
};