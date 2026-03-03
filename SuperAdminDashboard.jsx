import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers, setRole } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

const ROLES = ["USER", "ADMIN", "MODERATOR"];

const roleStyle = (role) => {
    if (role === "ADMIN") return { color: "#ff6b6b", background: "rgba(255,107,107,0.15)", border: "1px solid rgba(255,107,107,0.3)" };
    if (role === "MODERATOR") return { color: "#ffa94d", background: "rgba(255,169,77,0.15)", border: "1px solid rgba(255,169,77,0.3)" };
    return { color: "#74c0fc", background: "rgba(116,192,252,0.15)", border: "1px solid rgba(116,192,252,0.3)" };
};

const navItems = [
    { icon: "⊞", label: "Dashboard", key: "dashboard" },
    { icon: "👥", label: "Utilisateurs", key: "users" },
    { icon: "🏆", label: "Clubs", key: "clubs" },
    { icon: "📅", label: "Événements", key: "events" },
    { icon: "⚙️", label: "Paramètres", key: "settings" },
];

function Avatar({ name }) {
    const initials = name ? name.charAt(0).toUpperCase() : "?";
    const colors = ["#e74c3c", "#e67e22", "#2ecc71", "#3498db", "#9b59b6", "#1abc9c"];
    const color = colors[name ? name.charCodeAt(0) % colors.length : 0];
    return (
        <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: color, display: "flex", alignItems: "center",
            justifyContent: "center", fontWeight: 700, fontSize: 14,
            color: "white", flexShrink: 0
        }}>
            {initials}
        </div>
    );
}

export default function SuperAdminDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState("ALL");
    const [updatingId, setUpdatingId] = useState(null);
    const [activeNav, setActiveNav] = useState("users");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (err) {
            setError(err.message || "Erreur lors du chargement");
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (email, newRole, userId) => {
        setUpdatingId(userId);
        try {
            await setRole(email, newRole);
            setSuccess(`Rôle mis à jour pour ${email}`);
            fetchUsers();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.message || "Erreur mise à jour");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleLogout = () => { logout(); navigate("/login"); };

    const filteredUsers = users.filter((u) => {
        const matchSearch = u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
        const matchRole = filterRole === "ALL" || u.role === filterRole;
        return matchSearch && matchRole;
    });

    const stats = [
        { label: "Utilisateurs", value: users.length, icon: "👥", change: "+12%", color: "#74c0fc" },
        { label: "Admins", value: users.filter(u => u.role === "ADMIN").length, icon: "🛡️", change: "+5%", color: "#69db7c" },
        { label: "Modérateurs", value: users.filter(u => u.role === "MODERATOR").length, icon: "⚡", change: "+8%", color: "#ffa94d" },
        { label: "Clubs actifs", value: 0, icon: "🏆", change: "—", color: "#e74c3c" },
    ];

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#0d0d0d", color: "white", fontFamily: "'Segoe UI', sans-serif" }}>


            <div style={{
                width: sidebarCollapsed ? 68 : 230,
                background: "#111",
                borderRight: "1px solid #1e1e1e",
                display: "flex", flexDirection: "column",
                transition: "width 0.25s ease",
                flexShrink: 0,
                position: "sticky", top: 0,
                height: "100vh", overflow: "hidden"
            }}>

                <div style={{ padding: "22px 18px", borderBottom: "1px solid #1e1e1e" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: "#e74c3c", display: "flex",
                            alignItems: "center", justifyContent: "center",
                            fontSize: 18, flexShrink: 0
                        }}>🛡️</div>
                        {!sidebarCollapsed && (
                            <div>
                                <div style={{ fontWeight: 900, fontSize: 15, letterSpacing: 2, color: "#e74c3c" }}>RUGBY</div>
                                <div style={{ fontSize: 9, color: "#444", letterSpacing: 3 }}>SUPER ADMIN</div>
                            </div>
                        )}
                    </div>
                </div>


                <nav style={{ flex: 1, padding: "14px 10px" }}>
                    {navItems.map((item) => (
                        <div
                            key={item.key}
                            onClick={() => setActiveNav(item.key)}
                            style={{
                                display: "flex", alignItems: "center", gap: 12,
                                padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                                marginBottom: 2,
                                background: activeNav === item.key ? "rgba(231,76,60,0.15)" : "transparent",
                                color: activeNav === item.key ? "#e74c3c" : "#555",
                                transition: "all 0.2s", whiteSpace: "nowrap"
                            }}
                            onMouseEnter={e => { if (activeNav !== item.key) e.currentTarget.style.background = "#1a1a1a"; e.currentTarget.style.color = "#aaa"; }}
                            onMouseLeave={e => { if (activeNav !== item.key) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#555"; } }}
                        >
                            <span style={{ fontSize: 17, flexShrink: 0 }}>{item.icon}</span>
                            {!sidebarCollapsed && <span style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</span>}
                        </div>
                    ))}
                </nav>


                <div style={{ padding: "14px 10px", borderTop: "1px solid #1e1e1e" }}>
                    {!sidebarCollapsed && (
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, padding: "8px 12px" }}>
                            <Avatar name={user?.username || user?.email} />
                            <div style={{ overflow: "hidden" }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#ddd", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {user?.username || "Admin"}
                                </div>
                                <div style={{ fontSize: 10, color: "#555" }}>Super Admin</div>
                            </div>
                        </div>
                    )}
                    <div
                        onClick={handleLogout}
                        style={{
                            display: "flex", alignItems: "center", gap: 12,
                            padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                            color: "#e74c3c", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap"
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(231,76,60,0.1)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                        <span style={{ fontSize: 17 }}>🚪</span>
                        {!sidebarCollapsed && "Déconnexion"}
                    </div>
                </div>
            </div>


            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>


                <div style={{
                    padding: "14px 28px",
                    borderBottom: "1px solid #1e1e1e",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "#0d0d0d", position: "sticky", top: 0, zIndex: 10
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 20, padding: 4 }}
                        >☰</button>
                        <div style={{ position: "relative" }}>
                            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#444" }}>🔍</span>
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{
                                    background: "#161616", border: "1px solid #222",
                                    color: "white", padding: "8px 16px 8px 36px",
                                    borderRadius: 8, fontSize: 13, outline: "none", width: 260
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2ecc71" }} />
                        <span style={{ color: "#555", fontSize: 13 }}>{user?.username || user?.email}</span>
                        <Avatar name={user?.username || user?.email} />
                    </div>
                </div>


                <div style={{ flex: 1, padding: "28px", overflowY: "auto" }}>

                    <div style={{ marginBottom: 24 }}>
                        <h2 style={{ margin: 0, fontWeight: 900, fontSize: 20, letterSpacing: 1 }}>
                            GESTION DES <span style={{ color: "#e74c3c" }}>UTILISATEURS</span>
                        </h2>
                        <p style={{ color: "#444", margin: "4px 0 0", fontSize: 13 }}>
                            {filteredUsers.length} utilisateurs trouvés
                        </p>
                    </div>


                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
                        {stats.map((s) => (
                            <div key={s.label} style={{
                                background: "#111", border: "1px solid #1e1e1e",
                                borderRadius: 12, padding: "18px 20px",
                                display: "flex", alignItems: "center", gap: 14
                            }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 10,
                                    background: `${s.color}18`,
                                    display: "flex", alignItems: "center",
                                    justifyContent: "center", fontSize: 20, flexShrink: 0
                                }}>{s.icon}</div>
                                <div>
                                    <div style={{ fontSize: 26, fontWeight: 900, lineHeight: 1 }}>{s.value}</div>
                                    <div style={{ color: "#555", fontSize: 11, marginTop: 4 }}>{s.label}</div>
                                    <div style={{ color: "#2ecc71", fontSize: 11, marginTop: 2 }}>{s.change}</div>
                                </div>
                            </div>
                        ))}
                    </div>


                    {error && (
                        <div style={{ background: "rgba(231,76,60,0.1)", border: "1px solid #e74c3c", color: "#e74c3c", padding: "10px 16px", borderRadius: 8, marginBottom: 14, fontSize: 13 }}>
                            ❌ {error}
                        </div>
                    )}
                    {success && (
                        <div style={{ background: "rgba(46,204,113,0.1)", border: "1px solid #2ecc71", color: "#2ecc71", padding: "10px 16px", borderRadius: 8, marginBottom: 14, fontSize: 13 }}>
                            ✅ {success}
                        </div>
                    )}


                    <div style={{ display: "flex", gap: 8, marginBottom: 18, alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                            {["ALL", "USER", "ADMIN", "MODERATOR"].map((r) => (
                                <button key={r} onClick={() => setFilterRole(r)} style={{
                                    padding: "6px 14px", borderRadius: 6, cursor: "pointer",
                                    border: `1px solid ${filterRole === r ? "#e74c3c" : "#222"}`,
                                    background: filterRole === r ? "rgba(231,76,60,0.15)" : "#111",
                                    color: filterRole === r ? "#e74c3c" : "#555",
                                    fontSize: 11, fontWeight: 700, letterSpacing: 1
                                }}>{r}</button>
                            ))}
                        </div>
                        <button onClick={fetchUsers} style={{
                            background: "#111", border: "1px solid #222", color: "#666",
                            padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12
                        }}>🔄 Actualiser</button>
                    </div>


                    {loading ? (
                        <div style={{ textAlign: "center", padding: 80, color: "#444" }}>
                            <div style={{ fontSize: 28, marginBottom: 10 }}>⏳</div>
                            Chargement...
                        </div>
                    ) : (
                        <div style={{ background: "#111", borderRadius: 12, border: "1px solid #1e1e1e", overflow: "hidden" }}>

                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "2fr 2fr 120px 120px 100px 140px",
                                padding: "12px 24px",
                                background: "#141414",
                                color: "#444", fontSize: 10, letterSpacing: 2, fontWeight: 700
                            }}>
                                <span>UTILISATEUR</span>
                                <span>EMAIL</span>
                                <span>RÔLE</span>
                                <span>CLUB</span>
                                <span>STATUT</span>
                                <span>DATE D'INSCRIPTION</span>
                            </div>

                            {filteredUsers.length === 0 ? (
                                <div style={{ textAlign: "center", padding: 60, color: "#444" }}>
                                    <div style={{ fontSize: 26, marginBottom: 8 }}>🔍</div>
                                    Aucun utilisateur trouvé
                                </div>
                            ) : filteredUsers.map((u, i) => {
                                const rs = roleStyle(u.role);
                                return (
                                    <div key={u.id} style={{
                                        display: "grid",
                                        gridTemplateColumns: "2fr 2fr 120px 120px 100px 140px",
                                        padding: "14px 24px", alignItems: "center",
                                        borderTop: "1px solid #161616",
                                        background: i % 2 === 0 ? "#111" : "#0f0f0f"
                                    }}>

                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <Avatar name={u.username || u.email} />
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 13 }}>{u.username || "—"}</div>
                                            </div>
                                        </div>


                                        <span style={{ color: "#555", fontSize: 12 }}>{u.email}</span>


                                        <span>
                                            {updatingId === u.id ? (
                                                <span style={{ color: "#444", fontSize: 12 }}>⏳</span>
                                            ) : (
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleRoleChange(u.email, e.target.value, u.id)}
                                                    style={{
                                                        background: "#1a1a1a", border: "1px solid #2a2a2a",
                                                        color: "white", padding: "5px 8px",
                                                        borderRadius: 6, cursor: "pointer",
                                                        fontSize: 11, outline: "none", width: "100%"
                                                    }}
                                                >
                                                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                                                </select>
                                            )}
                                        </span>

                                        <span style={{ color: "#333", fontSize: 12 }}>
                                            {u.club || "—"}
                                        </span>


                                        <span>
                                            {u.statut ? (
                                                <span style={{
                                                    padding: "3px 10px", borderRadius: 20,
                                                    fontSize: 11, fontWeight: 700,
                                                    background: u.statut === "Actif" ? "rgba(46,204,113,0.15)" : "rgba(100,100,100,0.15)",
                                                    color: u.statut === "Actif" ? "#2ecc71" : "#555",
                                                    border: `1px solid ${u.statut === "Actif" ? "rgba(46,204,113,0.3)" : "#333"}`
                                                }}>
                                                    {u.statut}
                                                </span>
                                            ) : (
                                                <span style={{ color: "#333", fontSize: 12 }}>—</span>
                                            )}
                                        </span>


                                        <span style={{ color: "#333", fontSize: 12 }}>
                                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString("fr-FR") : "—"}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}