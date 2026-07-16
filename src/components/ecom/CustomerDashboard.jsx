// CustomerDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactDOM from "react-dom";
import {
  Users,
  Search,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MapPin,
  Pencil,
  Eye,
} from "lucide-react";
import watermark from "../../assets/images/swift-logo.svg";

// ── Design tokens (matches EditCustomerModal) ─────────────────
const ACCENT = "#1d6fa4";
const ACCENT_LIGHT = "rgba(29,111,164,0.08)";
const ACCENT_BORDER = "rgba(29,111,164,0.30)";
const TEXT_MAIN = "#1a2e3b";
const TEXT_SUB = "#6b8a9a";
const BORDER = "#e2eaf0";

// ── Segment badge colors ──────────────────────────────────────
const SEGMENT_COLORS = [
  { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
  { bg: "#fdf4ff", text: "#7e22ce", border: "#e9d5ff" },
  { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
  { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca" },
  { bg: "#f0fdfa", text: "#0f766e", border: "#99f6e4" },
];
const segmentColorCache = {};
const getSegmentColor = (name) => {
  if (!segmentColorCache[name]) {
    const idx =
      [...(name || "")].reduce((a, c) => a + c.charCodeAt(0), 0) %
      SEGMENT_COLORS.length;
    segmentColorCache[name] = SEGMENT_COLORS[idx];
  }
  return segmentColorCache[name];
};

// ─────────────────────────────────────────────────────────────
// VIEW CUSTOMER MODAL
// ─────────────────────────────────────────────────────────────
const ViewCustomerModal = ({ isOpen, onClose, customer: c }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !c) return null;

  const fullName =
    [c.title_Name, c.first_Name, c.last_Name].filter(Boolean).join(" ") || "—";
  const fullAddress =
    [c.add1, c.add2, c.add3].filter(Boolean).join(", ") || "—";

  const DetailRow = ({ label, value, mono = false, fullWidth = false }) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        minWidth: 0,
        gridColumn: fullWidth ? "1 / -1" : undefined,
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: TEXT_SUB,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          color: value && value !== "—" ? TEXT_MAIN : "#c0ccd6",
          fontFamily: mono ? "monospace" : "inherit",
          fontWeight: 500,
          wordBreak: "break-word",
        }}
      >
        {value || "—"}
      </span>
    </div>
  );

  const Section = ({ title, icon, children }) => (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        border: `1px solid ${BORDER}`,
        boxShadow: "0 1px 4px rgba(30,60,80,0.06)",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          background: ACCENT_LIGHT,
          borderBottom: `1px solid ${ACCENT_BORDER}`,
          padding: "10px 18px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderRadius: "14px 14px 0 0",
        }}
      >
        <span style={{ fontSize: 15 }}>{icon}</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: ACCENT,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {title}
        </span>
      </div>
      <div
        style={{
          padding: "18px 18px 20px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px 24px",
        }}
      >
        {children}
      </div>
    </div>
  );

  return ReactDOM.createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15,30,45,0.6)",
          backdropFilter: "blur(3px)",
          zIndex: 99998,
        }}
      />

      {/* Centering wrapper */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 16px",
        }}
      >
        {/* ── Modal panel — flex column, height capped to viewport ── */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#f0f4f8",
            borderRadius: 18,
            width: "100%",
            maxWidth: 860,
            boxShadow: "0 24px 64px rgba(10,30,50,0.28)",
            display: "flex",
            flexDirection: "column",
            maxHeight: "calc(100vh - 60px)", // ← caps the total panel height
            overflow: "hidden", // ← clips rounded corners cleanly
          }}
        >
          {/* ════════ STICKY HEADER — never scrolls ════════ */}
          <div
            style={{
              flexShrink: 0,
              padding: "20px 22px 16px",
              borderBottom: `1px solid ${BORDER}`,
              background: "#f0f4f8",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 19,
                    fontWeight: 700,
                    color: TEXT_MAIN,
                    letterSpacing: "-0.3px",
                  }}
                >
                  Customer Details
                </h2>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: TEXT_SUB }}>
                  Viewing —{" "}
                  <strong style={{ color: TEXT_MAIN }}>{c.party_Name}</strong>
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Status badge */}
                {c.active === 1 ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "4px 12px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      background: "#ecfdf5",
                      color: "#059669",
                      border: "1px solid #a7f3d0",
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#10b981",
                        display: "inline-block",
                      }}
                    />
                    Active
                  </span>
                ) : (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "4px 12px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      background: "#f1f5f9",
                      color: "#64748b",
                      border: "1px solid #cbd5e1",
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#94a3b8",
                        display: "inline-block",
                      }}
                    />
                    Inactive
                  </span>
                )}
                {/* Breadcrumb pill */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    background: ACCENT_LIGHT,
                    border: `1px solid ${ACCENT_BORDER}`,
                    borderRadius: 20,
                    padding: "4px 12px",
                    fontSize: 11,
                    color: ACCENT,
                    fontWeight: 600,
                  }}
                >
                  <span style={{ opacity: 0.65 }}>Customer</span>
                  <span style={{ opacity: 0.4 }}>/</span>
                  <span>View</span>
                </div>
                {/* Close button */}
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: `1.5px solid ${BORDER}`,
                    background: "#fff",
                    color: TEXT_SUB,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "border-color 0.15s, color 0.15s",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#ef4444";
                    e.currentTarget.style.color = "#ef4444";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = BORDER;
                    e.currentTarget.style.color = TEXT_SUB;
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* ════════ SCROLLABLE BODY — KEY FIX HERE ════════ */}
          <div
            style={{
              flex: 1, // ← takes all remaining space between header and footer
              minHeight: 0, // ← CRITICAL: allows flex child to shrink below content size
              overflowY: "auto", // ← enables scroll
              padding: "18px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {/* Company Information */}
            <Section title="Company Information" icon="🏢">
              <DetailRow label="Customer Name" value={c.party_Name} fullWidth />
              <DetailRow
                label="ERP Reference"
                value={c.oriG_SYSTEM_REFERENCE}
                mono
              />
              <DetailRow label="City" value={c.city_Name} />
              <DetailRow label="Segment" value={c.segment_Name} />
              <DetailRow label="Sector" value={c.sector_Name} />
              <DetailRow label="Pin Code" value={c.zip_Code} />
              <DetailRow label="Address" value={fullAddress} fullWidth />
              <DetailRow label="PAN No." value={c.pan_No} mono />
              <DetailRow label="GST No." value={c.gst_No} mono />
              <DetailRow label="TIN No." value={c.tin_No} mono />
            </Section>

            {/* Contact Person */}
            <Section title="Contact Person" icon="👤">
              <DetailRow label="Full Name" value={fullName} fullWidth />
              <DetailRow label="Telephone" value={c.telephone} />
              <DetailRow label="Mobile" value={c.mobile} />
              <DetailRow label="Email Address" value={c.email_Id} fullWidth />
            </Section>
          </div>

          {/* ════════ STICKY FOOTER — never scrolls ════════ */}
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              justifyContent: "flex-end",
              padding: "14px 22px",
              borderTop: `1px solid ${BORDER}`,
              background: "#f0f4f8",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                height: 38,
                padding: "0 28px",
                borderRadius: 10,
                border: `1.5px solid ${BORDER}`,
                background: "#fff",
                color: TEXT_SUB,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "border-color 0.15s, background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = ACCENT;
                e.currentTarget.style.background = ACCENT_LIGHT;
                e.currentTarget.style.color = ACCENT;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = BORDER;
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.color = TEXT_SUB;
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN DASHBOARD COMPONENT
// ─────────────────────────────────────────────────────────────
const CustomerDashboard = ({
  customers,
  loading,
  error,
  searchTerm,
  onSearch,
  pageNumber,
  pageSize,
  totalRows,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onEdit,
}) => {
  const navigate = useNavigate();

  // ── View modal state (local — no API needed) ──────────────
  const [viewCustomer, setViewCustomer] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);

  const handleViewOpen = (c) => {
    setViewCustomer(c);
    setViewOpen(true);
  };
  const handleViewClose = () => {
    setViewOpen(false);
    setViewCustomer(null);
  };

  const rowStart = totalRows === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const rowEnd = Math.min(pageNumber * pageSize, totalRows);

  const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

  // ── Sub-components ────────────────────────────────────────
  const StatusBadge = ({ active }) =>
    active === 1 ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
        Inactive
      </span>
    );

  const SegmentBadge = ({ name }) => {
    const col = getSegmentColor(name || "");
    return (
      <span
        className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold border whitespace-nowrap"
        style={{
          backgroundColor: col.bg,
          color: col.text,
          borderColor: col.border,
        }}
      >
        {name || "—"}
      </span>
    );
  };

  const EditButton = ({ customer }) => (
    <button
      type="button"
      onClick={() => onEdit?.(customer)}
      title="Edit Customer"
      className="inline-flex items-center justify-center h-7 w-7 rounded-md border border-slate-200 bg-white text-slate-400 transition-all hover:border-[#1d6fa4] hover:text-[#1d6fa4] hover:bg-blue-50 active:scale-95"
    >
      <Pencil size={13} />
    </button>
  );

  const ViewButton = ({ customer }) => (
    <button
      type="button"
      onClick={() => handleViewOpen(customer)}
      title="View Customer Details"
      className="inline-flex items-center justify-center h-7 w-7 rounded-md border border-slate-200 bg-white text-slate-400 transition-all hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 active:scale-95"
    >
      <Eye size={13} />
    </button>
  );

  const getPageRange = () => {
    const delta = 2;
    const range = [];
    const left = Math.max(1, pageNumber - delta);
    const right = Math.min(totalPages, pageNumber + delta);
    for (let i = left; i <= right; i++) range.push(i);
    return range;
  };

  return (
    <>
      <div className="flex flex-col bg-[#f0f4f8] p-3 sm:p-5 min-h-screen">
        {/* Watermark */}
        <div className="pointer-events-none fixed inset-0 flex items-center justify-center z-0 opacity-[0.03]">
          <img
            src={watermark}
            alt=""
            className="w-[480px] max-w-[70vw] select-none"
            draggable={false}
          />
        </div>

        <div className="relative z-10 w-full flex flex-col mx-auto gap-3 sm:gap-4 flex-1">
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-1 sm:mb-2 flex-shrink-0">
            <div>
              <h1
                className="text-[20px] sm:text-[22px] font-bold text-slate-900 tracking-tight leading-none"
                style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
              >
                Customers
              </h1>
              <p className="text-[12px] sm:text-[13px] text-slate-500 mt-1">
                Manage and monitor your full customer base
              </p>
            </div>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 mb-2 sm:mb-4 flex-shrink-0">
            <div className="bg-white rounded-xl border border-blue-100 shadow-sm px-4 py-3 flex items-center gap-3 relative overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full w-1 rounded-l-xl"
                style={{ backgroundColor: ACCENT }}
              />
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#dbeafe" }}
              >
                <Users size={17} style={{ color: ACCENT }} />
              </div>
              <div className="w-full">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide leading-none">
                  Total Customers
                </p>
                <div className="text-[20px] sm:text-[22px] font-bold text-slate-900 leading-tight mt-0.5 flex flex-wrap gap-x-2 justify-between">
                  <p>{totalRows.toLocaleString()}</p>
                  <p className="text-[11px] text-slate-400">
                    Page {pageNumber} of {totalPages || 1}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3 sm:px-4 py-3 border-b border-slate-100 bg-slate-50 flex-shrink-0">
              <div className="relative w-full sm:max-w-sm">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/4 text-slate-400 pointer-events-none"
                />
                <input
                  value={searchTerm}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder="Search by name, city, segment…"
                  className="h-9 pl-9 pr-3 w-full rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-[12px] text-slate-500">
                  <label className="font-medium whitespace-nowrap">Rows:</label>
                  <select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
                    className="h-8 px-2 pr-7 rounded-lg border border-slate-200 bg-white text-[11px] sm:text-[12px] text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 cursor-pointer transition-all appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 6px center",
                    }}
                  >
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Content area */}
            {loading ? (
              <div className="flex items-center justify-center py-16 sm:py-20 gap-2 text-slate-400 text-sm">
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-20"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-80"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Loading customers…
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <AlertCircle className="text-red-400" size={20} />
                <p className="text-sm font-medium text-red-500">{error}</p>
                <p className="text-xs text-slate-400">
                  Try refreshing or adjusting filters.
                </p>
              </div>
            ) : (
              <>
                {/* ── Desktop table ── */}
                <div
                  className="hidden md:block overflow-auto"
                  style={{ maxHeight: "calc(100vh - 260px)" }}
                >
                  <table className="w-full text-sm min-w-[980px]">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        {[
                          "#",
                          "Customer",
                          "City",
                          "Segment",
                          "GST No.",
                          "Contact",
                          "Mobile",
                          "Status",
                          "Actions",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap bg-slate-100 sticky top-0 z-10"
                            style={{ boxShadow: "inset 0 -2px 0 #e2e8f0" }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {customers.length === 0 ? (
                        <tr>
                          <td
                            colSpan={9}
                            className="text-center py-16 text-slate-400 text-xs"
                          >
                            No customers match your current filters.
                          </td>
                        </tr>
                      ) : (
                        customers.map((c, index) => (
                          <tr
                            key={c.cust_Id}
                            className="border-b border-slate-50 hover:bg-blue-50/50 transition-colors cursor-default"
                          >
                            <td className="px-4 py-3 text-[12px] text-slate-400 tabular-nums w-10">
                              {rowStart + index}
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-slate-800 text-[13px] leading-tight">
                                {c.party_Name}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                                {c.oriG_SYSTEM_REFERENCE || "No ERP ref"}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1 text-[12px] text-slate-600">
                                <MapPin
                                  size={11}
                                  className="text-slate-300 flex-shrink-0"
                                />
                                {c.city_Name || "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <SegmentBadge name={c.segment_Name} />
                            </td>
                            <td className="px-4 py-3 font-mono text-[12px] text-slate-500">
                              {c.gst_No || (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-[12px] text-slate-700 font-medium">
                                {[c.title_Name, c.first_Name, c.last_Name]
                                  .filter(Boolean)
                                  .join(" ") || "—"}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[200px]">
                                {c.email_Id || ""}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-[12px] text-slate-600 font-mono">
                              {c.mobile || "—"}
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge active={c.active} />
                            </td>
                            {/* ── Actions: View + Edit ── */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <ViewButton customer={c} />
                                <EditButton customer={c} />
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ── Mobile list ── */}
                <div
                  className="md:hidden divide-y divide-slate-100 overflow-y-auto"
                  style={{ maxHeight: "calc(100vh - 260px)" }}
                >
                  {customers.length === 0 ? (
                    <p className="text-center text-slate-400 text-xs py-10">
                      No customers found.
                    </p>
                  ) : (
                    customers.map((c, index) => (
                      <div
                        key={c.cust_Id}
                        className="p-3 sm:p-4 hover:bg-slate-50"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 text-sm">
                              {rowStart + index}. {c.party_Name}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                              <MapPin
                                size={11}
                                className="text-slate-300 flex-shrink-0"
                              />
                              <span className="truncate">
                                {c.city_Name || "—"}
                              </span>
                            </p>
                          </div>
                          {/* Status + View + Edit on mobile */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <StatusBadge active={c.active} />
                            <ViewButton customer={c} />
                            <EditButton customer={c} />
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <SegmentBadge name={c.segment_Name} />
                          <span className="text-[11px] font-mono text-slate-400">
                            {c.gst_No || "No GST"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          {[c.title_Name, c.first_Name, c.last_Name]
                            .filter(Boolean)
                            .join(" ") || "—"}{" "}
                          · {c.mobile || "—"}
                        </p>
                        {c.email_Id && (
                          <p className="text-[11px] text-slate-400 mt-1 break-all">
                            {c.email_Id}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* ── Pagination footer ── */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 border-t border-slate-100 px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 flex-shrink-0">
                  <p className="text-[11px] sm:text-[12px] text-slate-500 text-center sm:text-left">
                    Showing{" "}
                    <span className="font-semibold text-slate-700">
                      {rowStart}
                    </span>
                    {" – "}
                    <span className="font-semibold text-slate-700">
                      {rowEnd}
                    </span>
                    {" of "}
                    <span className="font-semibold text-slate-700">
                      {totalRows.toLocaleString()}
                    </span>{" "}
                    customers
                  </p>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-1 flex-wrap justify-center">
                      <button
                        onClick={() => onPageChange(1)}
                        disabled={pageNumber === 1}
                        className="h-7 w-7 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-slate-400 hover:text-slate-700 transition-all text-xs"
                      >
                        <ChevronsLeft size={13} />
                      </button>
                      <button
                        onClick={() => onPageChange(pageNumber - 1)}
                        disabled={pageNumber === 1}
                        className="h-7 w-7 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-slate-400 hover:text-slate-700 transition-all text-xs"
                      >
                        <ChevronLeft size={13} />
                      </button>

                      {getPageRange()[0] > 2 && (
                        <span className="text-slate-400 text-[11px] px-1">
                          …
                        </span>
                      )}

                      {getPageRange().map((p) => (
                        <button
                          key={p}
                          onClick={() => onPageChange(p)}
                          className="h-7 min-w-[28px] px-1 rounded-md border text-[11px] font-medium transition-all"
                          style={
                            p === pageNumber
                              ? {
                                  backgroundColor: ACCENT,
                                  borderColor: ACCENT,
                                  color: "#fff",
                                }
                              : {
                                  backgroundColor: "#fff",
                                  borderColor: "#e2e8f0",
                                  color: "#475569",
                                }
                          }
                        >
                          {p}
                        </button>
                      ))}

                      {getPageRange().at(-1) < totalPages - 1 && (
                        <span className="text-slate-400 text-[11px] px-1">
                          …
                        </span>
                      )}

                      <button
                        onClick={() => onPageChange(pageNumber + 1)}
                        disabled={pageNumber === totalPages}
                        className="h-7 w-7 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-slate-400 hover:text-slate-700 transition-all text-xs"
                      >
                        <ChevronRight size={13} />
                      </button>
                      <button
                        onClick={() => onPageChange(totalPages)}
                        disabled={pageNumber === totalPages}
                        className="h-7 w-7 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-slate-400 hover:text-slate-700 transition-all text-xs"
                      >
                        <ChevronsRight size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── View Customer Modal (portal, rendered outside dashboard div) ── */}
      <ViewCustomerModal
        isOpen={viewOpen}
        onClose={handleViewClose}
        customer={viewCustomer}
      />
    </>
  );
};

export default CustomerDashboard;
