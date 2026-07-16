import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  CheckCircle2,
  User,
  Filter,
  Briefcase,
} from "lucide-react";
import { ORG_PILL, ORGS } from "../../constants/helpdeskConstants";
import { getOrgPill } from "../../utils/helpdeskUtils";

// ─── Field ────────────────────────────────────────────────────────────────────
export function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-600 font-semibold">{error}</p>
      )}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
const ACCENT_CLS = {
  amber: "border-amber-200 bg-amber-50/70",
  emerald: "border-emerald-200 bg-emerald-50/70",
  red: "border-red-200 bg-red-50/70",
};
export function Section({ title, subtitle, accent, children }) {
  return (
    <div
      className={`rounded-2xl border p-4 ${ACCENT_CLS[accent] || "border-slate-200 bg-slate-50"}`}
    >
      <p className="text-sm font-extrabold text-slate-900">{title}</p>
      {subtitle && (
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}

// ─── InfoBox ──────────────────────────────────────────────────────────────────
export function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-700 mt-0.5 truncate">
        {value}
      </p>
    </div>
  );
}

// ─── HRPill ───────────────────────────────────────────────────────────────────
export function HRPill({ small = false }) {
  if (small)
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200 flex-none">
        <Briefcase className="w-2.5 h-2.5" /> HR
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200">
      <Briefcase className="w-3 h-3" /> HR
    </span>
  );
}

// ─── AssigneeDropdown ─────────────────────────────────────────────────────────
export function AssigneeDropdown({
  value,
  onChange,
  label = "Assign Engineers",
  error,
  employees = [],
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (name) =>
    onChange(
      value.includes(name) ? value.filter((n) => n !== name) : [...value, name],
    );

  const initials = (name) =>
    name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <Field label={label} error={error}>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          className="w-full h-10 flex items-center justify-between rounded-xl border border-slate-300 bg-white px-3 text-sm focus:outline-none hover:border-slate-400 transition-colors"
        >
          <span
            className={
              value.length === 0
                ? "text-slate-400"
                : "text-slate-800 font-semibold"
            }
          >
            {value.length === 0 ? "Select engineers..." : value.join(", ")}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto">
            {employees.length === 0 ? (
              <div className="px-3 py-4 text-xs text-slate-400 text-center">
                No engineers available
              </div>
            ) : (
              employees.map((eng) => {
                const selected = value.includes(eng.emp_Name);
                return (
                  <button
                    key={eng.emp_Id}
                    type="button"
                    onClick={() => toggle(eng.emp_Name)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-slate-50 ${selected ? "bg-blue-50" : ""}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black flex-none ${selected ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"}`}
                    >
                      {initials(eng.emp_Name)}
                    </div>
                    <span className="flex-1 min-w-0">
                      <span
                        className={`font-semibold ${selected ? "text-blue-700" : "text-slate-700"}`}
                      >
                        {eng.emp_Name}
                      </span>
                      <span className="ml-1 text-[10px] font-bold mono text-slate-400">
                        #{eng.emp_No}
                      </span>
                      <span
                        className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${getOrgPill(eng.org_Id)}`}
                      >
                        {eng.org_Id}
                      </span>
                    </span>
                    {selected && (
                      <CheckCircle2 className="w-4 h-4 text-blue-500 flex-none" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </Field>
  );
}

// ─── OrgFilterBar ─────────────────────────────────────────────────────────────
export function OrgFilterBar({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <Filter className="w-3.5 h-3.5 text-slate-400" />
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
        Org:
      </span>
      {ORGS.map((org) => (
        <button
          key={org}
          onClick={() => onChange(org)}
          className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${value === org ? (ORG_PILL[org] || "") + " shadow-sm" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
        >
          {org}
        </button>
      ))}
    </div>
  );
}
