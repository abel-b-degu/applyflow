import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";

export default function ApplicationDetail() {
    const { id } = useParams();
    const [app, setApp] = useState(null);
    const [jobText, setJobText] = useState("");
    const [msg, setMsg] = useState("");
    const [err, setErr] = useState("");

    async function load() {
        try {
            setErr("");
            const data = await api.getApplication(id);
            setApp(data);

            const jd = await api.getJobDescription(id);
            setJobText(jd?.raw_text || "");
        } catch (e) {
            setErr(e.message);
        }
    }

    useEffect(() => {
        load();
    }, [id]);

    async function saveJD() {
        try {
            setMsg("Saving...");
            await api.upsertJobDescription(id, { raw_text: jobText });
            setMsg("Job description saved!");
        } catch (e) {
            setErr(e.message);
        }
    }

    async function generateLetter() {
        try {
            setMsg("Generating cover letter...");
            await api.generateCoverLetter(id);
            setMsg("Cover letter generated! Check the Documents page.");
        } catch (e) {
            setErr(e.message);
        }
    }

    if (!app) return <p>Loading...</p>;

    return (
        <div>
            <h1>{app.company}</h1>
            <h3>{app.role_title}</h3>

            {msg && <p style={{ color: "green" }}>{msg}</p>}
            {err && <p style={{ color: "red" }}>{err}</p>}

            <h2>Job Description</h2>
            <textarea
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                placeholder="Paste job description here..."
                style={{ width: "100%", height: 200 }}
            />

            <br />
            <button onClick={saveJD}>Save JD</button>
            <button onClick={generateLetter} style={{ marginLeft: 10 }}>
                Generate Cover Letter
            </button>
        </div>
    );
}
