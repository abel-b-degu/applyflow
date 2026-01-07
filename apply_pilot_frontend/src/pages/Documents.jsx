import { useEffect, useState } from "react";
import { api } from "../api";

export default function Documents() {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const data = await api.listDocuments();
                setDocs(Array.isArray(data) ? data : []);  // Prevents crash
            } catch (e) {
                setErr(e.message);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    function copyText(text) {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    }

    function downloadText(text, id) {
        const blob = new Blob([text], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `cover_letter_${id}.txt`;
        link.click();
    }

    if (loading) return <p>Loading documents...</p>;
    if (err) return <p style={{ color: "red" }}>{err}</p>;

    return (
        <div style={{ padding: 20 }}>
            <h1>Documents</h1>
            <p>Your generated cover letters</p>

            {docs.length === 0 ? (
                <p>No documents yet.</p>
            ) : (
                docs.map(doc => (
                    <div
                        key={doc.id}
                        style={{
                            border: "1px solid #555",
                            padding: 16,
                            borderRadius: 8,
                            marginBottom: 20,
                        }}
                    >
                        <h3>Cover Letter for Application #{doc.application_id}</h3>

                        <button onClick={() => copyText(doc.content)} style={buttonStyle}>
                            Copy
                        </button>

                        <button onClick={() => downloadText(doc.content, doc.id)} style={{ ...buttonStyle, background: "green" }}>
                            Download
                        </button>

                        <textarea
                            readOnly
                            value={doc.content || ""}
                            style={{
                                width: "100%",
                                height: "300px",
                                marginTop: 10,
                                background: "#222",
                                color: "#ddd",
                                padding: 10,
                                borderRadius: 8,
                            }}
                        />
                    </div>
                ))
            )}
        </div>
    );
}

const buttonStyle = {
    marginRight: 10,
    padding: "8px 14px",
    background: "#2563eb",
    color: "white",
    borderRadius: 6,
    cursor: "pointer",
    border: "none",
};
