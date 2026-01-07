import { Link } from "react-router-dom";

export default function NavBar() {
    return (
        <nav style={{ padding: "15px", borderBottom: "1px solid #444" }}>
            <Link to="/" style={{ marginRight: 20 }}>Dashboard</Link>
            <Link to="/applications" style={{ marginRight: 20 }}>Applications</Link>
            <Link to="/documents">Documents</Link>
        </nav>
    );
}
