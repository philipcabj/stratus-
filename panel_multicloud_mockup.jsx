import React, { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard, Users, Cloud, Bell, Settings, LogOut,
  TrendingUp, TrendingDown, Eye, ArrowLeft, Wallet, Gauge,
  Server, Database, HardDrive, Network, ShieldCheck,
} from "lucide-react";

/* ============================================================
   TOKENS
   ============================================================ */
const T = {
  bg: "#F3F5F8",
  card: "#FFFFFF",
  ink: "#0E1B2C",
  inkSoft: "#5A6B80",
  line: "#E3E8EF",
  accent: "#0E9BB5",
  accentSoft: "#E3F4F8",
  ok: "#1F9D6B",
  warn: "#D9822B",
  bad: "#C0392B",
  aws: "#F59E0B",
  azure: "#0078D4",
  gcp: "#34A853",
  oci: "#C74634",
};

const PROVIDERS = [
  { key: "aws", name: "AWS", color: T.aws },
  { key: "azure", name: "Azure", color: T.azure },
  { key: "gcp", name: "Google Cloud", color: T.gcp },
  { key: "oci", name: "Oracle Cloud", color: T.oci },
];

/* ============================================================
   DATOS DUMMY
   ============================================================ */
const monthly = [
  { mes: "Ene", aws: 41200, azure: 18300, gcp: 6100, oci: 2100 },
  { mes: "Feb", aws: 43800, azure: 19900, gcp: 6800, oci: 2300 },
  { mes: "Mar", aws: 47100, azure: 21200, gcp: 7400, oci: 2200 },
  { mes: "Abr", aws: 46300, azure: 23800, gcp: 8900, oci: 2600 },
  { mes: "May", aws: 51900, azure: 25100, gcp: 9600, oci: 2800 },
  { mes: "Jun", aws: 55400, azure: 27600, gcp: 11200, oci: 3100 },
];

const tenants = [
  { id: "t1", name: "Metalúrgica Andes", clouds: ["aws", "azure"], mes: 18420, prev: 16900, budget: 20000, estado: "ok" },
  { id: "t2", name: "Finanzas del Sur", clouds: ["aws"], mes: 27310, prev: 24100, budget: 26000, estado: "alerta" },
  { id: "t3", name: "Retail Norte SA", clouds: ["aws", "gcp"], mes: 12840, prev: 13600, budget: 18000, estado: "ok" },
  { id: "t4", name: "Logística Pampa", clouds: ["azure", "oci"], mes: 9270, prev: 8100, budget: 10000, estado: "ok" },
  { id: "t5", name: "AgroTech BA", clouds: ["aws", "azure", "gcp"], mes: 29460, prev: 26400, budget: 30000, estado: "warn" },
];

const clientEvolution = [
  { mes: "Ene", usd: 13900 }, { mes: "Feb", usd: 14800 },
  { mes: "Mar", usd: 15600 }, { mes: "Abr", usd: 16200 },
  { mes: "May", usd: 16900 }, { mes: "Jun", usd: 18420 },
];

const clientByCloud = [
  { name: "AWS", value: 12600, color: T.aws },
  { name: "Azure", value: 5820, color: T.azure },
];

const clientServices = [
  { icon: Server, servicio: "Compute", detalle: "EC2 · Virtual Machines", usd: 8340, share: 45 },
  { icon: Database, servicio: "Database", detalle: "RDS · Azure SQL", usd: 4120, share: 22 },
  { icon: HardDrive, servicio: "Storage", detalle: "S3 · Blob Storage", usd: 3210, share: 17 },
  { icon: Network, servicio: "Networking", detalle: "Data Transfer · VPN GW", usd: 1680, share: 9 },
  { icon: ShieldCheck, servicio: "Seguridad", detalle: "WAF · Defender", usd: 1070, share: 6 },
];

const alerts = [
  { tenant: "Finanzas del Sur", txt: "Superó el presupuesto mensual (105%)", nivel: "bad" },
  { tenant: "AgroTech BA", txt: "Proyección de fin de mes al 98% del presupuesto", nivel: "warn" },
  { tenant: "Metalúrgica Andes", txt: "Nuevo servicio detectado: Amazon SageMaker", nivel: "info" },
];

const fmt = (n) => "US$ " + n.toLocaleString("es-AR");

/* ============================================================
   PIEZAS UI
   ============================================================ */
const Dot = ({ color }) => (
  <span style={{ width: 8, height: 8, borderRadius: 99, background: color, display: "inline-block", marginRight: 6 }} />
);

const CloudChips = ({ clouds }) => (
  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
    {clouds.map((c) => {
      const p = PROVIDERS.find((x) => x.key === c);
      return (
        <span key={c} style={{
          fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
          padding: "2px 8px", borderRadius: 99,
          background: p.color + "18", color: p.color, border: `1px solid ${p.color}40`,
        }}>{p.name}</span>
      );
    })}
  </div>
);

const Kpi = ({ label, value, sub, trend }) => (
  <div style={{
    background: T.card, border: `1px solid ${T.line}`, borderRadius: 12,
    padding: "16px 18px", flex: 1, minWidth: 170,
  }}>
    <div style={{ fontSize: 12, color: T.inkSoft, marginBottom: 6, letterSpacing: 0.3 }}>{label}</div>
    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 600, color: T.ink }}>{value}</div>
    {sub && (
      <div style={{ fontSize: 12, marginTop: 6, display: "flex", alignItems: "center", gap: 4,
        color: trend === "up" ? T.bad : trend === "down" ? T.ok : T.inkSoft }}>
        {trend === "up" && <TrendingUp size={13} />}
        {trend === "down" && <TrendingDown size={13} />}
        {sub}
      </div>
    )}
  </div>
);

const Card = ({ title, right, children, style }) => (
  <div style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 12, padding: 18, ...style }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: 15, color: T.ink }}>{title}</div>
      {right}
    </div>
    {children}
  </div>
);

/* ============================================================
   VISTA ADMIN
   ============================================================ */
function AdminView({ onImpersonate }) {
  const total = monthly[5].aws + monthly[5].azure + monthly[5].gcp + monthly[5].oci;
  const prev = monthly[4].aws + monthly[4].azure + monthly[4].gcp + monthly[4].oci;
  const growth = (((total - prev) / prev) * 100).toFixed(1);

  return (
    <>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
        <Kpi label="Consumo total · Junio" value={fmt(total)} sub={`+${growth}% vs mayo`} trend="up" />
        <Kpi label="Clientes activos" value="5" sub="1 con alerta de presupuesto" />
        <Kpi label="Nubes conectadas" value="4" sub="AWS · Azure · GCP · OCI" />
        <Kpi label="Alertas abiertas" value="3" sub="1 crítica" trend="up" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 18 }}>
        <Card title="Consumo mensual por nube (USD)">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthly} barSize={26}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.line} vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: T.inkSoft }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: T.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}
                axisLine={false} tickLine={false} tickFormatter={(v) => (v / 1000) + "k"} />
              <Tooltip formatter={(v, n) => [fmt(v), n.toUpperCase()]} />
              <Legend formatter={(v) => v.toUpperCase()} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="aws" stackId="a" fill={T.aws} />
              <Bar dataKey="azure" stackId="a" fill={T.azure} />
              <Bar dataKey="gcp" stackId="a" fill={T.gcp} />
              <Bar dataKey="oci" stackId="a" fill={T.oci} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Alertas">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {alerts.map((a, i) => (
              <div key={i} style={{
                borderLeft: `3px solid ${a.nivel === "bad" ? T.bad : a.nivel === "warn" ? T.warn : T.accent}`,
                background: T.bg, borderRadius: 8, padding: "10px 12px",
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{a.tenant}</div>
                <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 2 }}>{a.txt}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Clientes" right={
        <span style={{ fontSize: 12, color: T.inkSoft }}>Junio 2026 · consumo en USD</span>
      }>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ color: T.inkSoft, textAlign: "left", fontSize: 12 }}>
              <th style={{ padding: "8px 6px", fontWeight: 500 }}>Cliente</th>
              <th style={{ padding: "8px 6px", fontWeight: 500 }}>Nubes</th>
              <th style={{ padding: "8px 6px", fontWeight: 500, textAlign: "right" }}>Consumo mes</th>
              <th style={{ padding: "8px 6px", fontWeight: 500, textAlign: "right" }}>Variación</th>
              <th style={{ padding: "8px 6px", fontWeight: 500 }}>Presupuesto</th>
              <th style={{ padding: "8px 6px" }}></th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => {
              const varPct = (((t.mes - t.prev) / t.prev) * 100).toFixed(1);
              const up = t.mes >= t.prev;
              const budgetPct = Math.min(100, Math.round((t.mes / t.budget) * 100));
              const budgetColor = budgetPct >= 100 ? T.bad : budgetPct >= 90 ? T.warn : T.ok;
              return (
                <tr key={t.id} style={{ borderTop: `1px solid ${T.line}` }}>
                  <td style={{ padding: "12px 6px", fontWeight: 600, color: T.ink }}>{t.name}</td>
                  <td style={{ padding: "12px 6px" }}><CloudChips clouds={t.clouds} /></td>
                  <td style={{ padding: "12px 6px", textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{fmt(t.mes)}</td>
                  <td style={{ padding: "12px 6px", textAlign: "right", fontFamily: "'IBM Plex Mono', monospace",
                    color: up ? T.bad : T.ok }}>
                    {up ? "▲" : "▼"} {Math.abs(varPct)}%
                  </td>
                  <td style={{ padding: "12px 6px", minWidth: 130 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: T.line, borderRadius: 99 }}>
                        <div style={{ width: budgetPct + "%", height: 6, background: budgetColor, borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: budgetColor }}>{budgetPct}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 6px", textAlign: "right" }}>
                    <button onClick={() => onImpersonate(t)} style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      border: `1px solid ${T.accent}`, color: T.accent, background: T.accentSoft,
                      borderRadius: 8, padding: "6px 10px", fontSize: 12, cursor: "pointer", fontWeight: 600,
                    }}>
                      <Eye size={13} /> Ver como cliente
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}

/* ============================================================
   VISTA CLIENTE
   ============================================================ */
function ClientView({ tenant }) {
  const t = tenant || tenants[0];
  const budgetPct = Math.round((t.mes / t.budget) * 100);
  const budgetColor = budgetPct >= 100 ? T.bad : budgetPct >= 90 ? T.warn : T.ok;

  return (
    <>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
        <Kpi label="Consumo del mes" value={fmt(t.mes)} sub="+9,0% vs mayo" trend="up" />
        <Kpi label="Presupuesto mensual" value={fmt(t.budget)} sub={`${budgetPct}% utilizado`} />
        <Kpi label="Proyección fin de mes" value={fmt(Math.round(t.mes * 1.06))} sub="según ritmo actual" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 18 }}>
        <Card title="Evolución del consumo (USD)">
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={clientEvolution}>
              <defs>
                <linearGradient id="gradUsd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.accent} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={T.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.line} vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: T.inkSoft }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: T.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}
                axisLine={false} tickLine={false} tickFormatter={(v) => (v / 1000) + "k"} />
              <Tooltip formatter={(v) => [fmt(v), "Consumo"]} />
              <Area type="monotone" dataKey="usd" stroke={T.accent} strokeWidth={2.5} fill="url(#gradUsd)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Distribución por nube">
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={clientByCloud} dataKey="value" innerRadius={48} outerRadius={72} paddingAngle={3}>
                {clientByCloud.map((c, i) => <Cell key={i} fill={c.color} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [fmt(v), n]} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
            {clientByCloud.map((c) => (
              <div key={c.name} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: T.ink }}><Dot color={c.color} />{c.name}</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: T.inkSoft }}>{fmt(c.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Consumo por categoría de servicio" right={
        <span style={{ fontSize: 12, color: T.inkSoft }}>Normalizado entre nubes · esquema FOCUS</span>
      }>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {clientServices.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "36px 1.4fr 2fr auto", alignItems: "center",
                gap: 14, padding: "12px 4px", borderTop: i ? `1px solid ${T.line}` : "none",
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9, background: T.accentSoft,
                  display: "flex", alignItems: "center", justifyContent: "center", color: T.accent,
                }}><Icon size={17} /></div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{s.servicio}</div>
                  <div style={{ fontSize: 11, color: T.inkSoft }}>{s.detalle}</div>
                </div>
                <div style={{ height: 8, background: T.line, borderRadius: 99 }}>
                  <div style={{ width: s.share + "%", height: 8, background: T.accent, borderRadius: 99 }} />
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: T.ink, minWidth: 90, textAlign: "right" }}>
                  {fmt(s.usd)}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}

/* ============================================================
   APP
   ============================================================ */
export default function MulticloudPanel() {
  const [view, setView] = useState("admin"); // admin | client
  const [impersonating, setImpersonating] = useState(null);

  const impersonate = (t) => { setImpersonating(t); setView("client"); };
  const backToAdmin = () => { setImpersonating(null); setView("admin"); };

  const nav = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: Users, label: "Clientes" },
    { icon: Cloud, label: "Conectores" },
    { icon: Bell, label: "Alertas" },
    { icon: Settings, label: "Configuración" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg, fontFamily: "'IBM Plex Sans', sans-serif", color: T.ink }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');`}</style>

      {/* SIDEBAR */}
      <aside style={{
        width: 210, background: T.ink, color: "#C4CFDD", padding: "22px 14px",
        display: "flex", flexDirection: "column", gap: 4, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 22px" }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, background: T.accent,
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
          }}><Cloud size={18} /></div>
          <div>
            <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>Stratus</div>
            <div style={{ fontSize: 10, letterSpacing: 1, color: "#7E8DA1" }}>PANEL MULTICLOUD</div>
          </div>
        </div>

        {nav.map((n) => {
          const Icon = n.icon;
          return (
            <div key={n.label} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              borderRadius: 9, fontSize: 13, cursor: "pointer",
              background: n.active ? "rgba(14,155,181,0.18)" : "transparent",
              color: n.active ? "#fff" : "#C4CFDD",
              borderLeft: n.active ? `3px solid ${T.accent}` : "3px solid transparent",
            }}>
              <Icon size={16} /> {n.label}
            </div>
          );
        })}

        <div style={{ marginTop: "auto", padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, fontSize: 13, cursor: "pointer" }}>
          <LogOut size={16} /> Salir
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, padding: "22px 26px", minWidth: 0 }}>
        {/* Banner de impersonación */}
        {impersonating && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "#FFF6E8", border: `1px solid ${T.warn}55`, borderRadius: 10,
            padding: "10px 14px", marginBottom: 16, fontSize: 13,
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#8A5A1B" }}>
              <Eye size={15} /> Estás viendo el panel como <b>{impersonating.name}</b> — modo solo lectura
            </span>
            <button onClick={backToAdmin} style={{
              display: "inline-flex", alignItems: "center", gap: 6, border: "none",
              background: T.ink, color: "#fff", borderRadius: 8, padding: "7px 12px",
              fontSize: 12, cursor: "pointer", fontWeight: 600,
            }}>
              <ArrowLeft size={13} /> Volver a admin
            </button>
          </div>
        )}

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Archivo', sans-serif", fontSize: 21, fontWeight: 700, margin: 0 }}>
              {view === "admin" ? "Consola administrativa" : (impersonating ? impersonating.name : "Metalúrgica Andes")}
            </h1>
            <div style={{ fontSize: 13, color: T.inkSoft, marginTop: 3 }}>
              {view === "admin"
                ? "Consumo consolidado de todos los clientes · actualizado hoy 06:00"
                : "Dashboard de consumo cloud · actualizado hoy 06:00"}
            </div>
          </div>

          {/* Switch de vista (solo demo) */}
          {!impersonating && (
            <div style={{ display: "flex", background: T.card, border: `1px solid ${T.line}`, borderRadius: 10, padding: 3 }}>
              {[
                { id: "admin", label: "Vista Admin", icon: Gauge },
                { id: "client", label: "Vista Cliente", icon: Wallet },
              ].map((b) => {
                const Icon = b.icon;
                const active = view === b.id;
                return (
                  <button key={b.id} onClick={() => setView(b.id)} style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13,
                    fontWeight: 600, cursor: "pointer",
                    background: active ? T.ink : "transparent",
                    color: active ? "#fff" : T.inkSoft,
                  }}>
                    <Icon size={14} /> {b.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {view === "admin"
          ? <AdminView onImpersonate={impersonate} />
          : <ClientView tenant={impersonating} />}
      </main>
    </div>
  );
}
