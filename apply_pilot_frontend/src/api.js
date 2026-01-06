const API_BASE = import.meta.env.VITE_API_BASE_URL;

async function request(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options,
    });

    if (!res.ok) {
        let detail = "";
        try {
            const data = await res.json();
            detail = data?.detail ? ` - ${JSON.stringify(data.detail)}` : "";
        } catch { }
        throw new Error(`${res.status} ${res.statusText}${detail}`);
    }

    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

export const api = {
    listApplications: () => request("/applications"),
    createApplication: (payload) =>
        request("/applications", { method: "POST", body: JSON.stringify(payload) }),

    getApplication: (id) => request(`/applications/${id}`),

    upsertJobDescription: (id, payload) =>
        request(`/applications/${id}/job`, { method: "POST", body: JSON.stringify(payload) }),
    getJobDescription: (id) => request(`/applications/${id}/job`),

    generateCoverLetter: (id) =>
        request(`/applications/${id}/cover-letter`, { method: "POST" }),
};
