import { useEffect, useState } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";

export default function Applications() {
    const [apps, setApps] = useState([]);
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
        } catch (e) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function onCreate(e) {
        e.preventDefault();
        setErr("");

        try {
            await api.createApplication({
                company,
                role_title: roleTitle,
                job_url: jobUrl || null,
            });

            setCompany("");
            setRoleTitle("");
            setJobUrl("");

            await load();
        } catch (e) {
            setErr(e.message);
        }
    }

    return (
        <div>
            <h1>Applications</h1>

            {err && <p style={{ color: "red" }}>{err}</p>}

            <button onClick={load}>Refresh</button>

            {loading ? (
                <p>Loading...</p>
            ) : apps.length === 0 ? (
                <p>No applications yet.</p>
            ) : (
                <ul>
                    {apps.map((a) => (
                        <li key={a.id}>
                            <Link to={`/applications/${a.id}`}>
                                <b>{a.company}</b> — {a.role_title} ({a.status})
                            </Link>
                        </li>
                    ))}
                </ul>
            )}

            <h2>New Application</h2>

            <form onSubmit={onCreate} style={{ marginTop: 10 }}>
                <input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Company"
                    required
                />

                <input
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="Role title"
                    required
                />

                <input
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="Job URL (optional)"
                />

                <button type="submit">Create</button>
            </form>
        </div>
    );
}
