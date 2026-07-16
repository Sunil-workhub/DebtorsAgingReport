// src/components/itHelpdesk/OrgFilterBar.jsx
import React from "react";

const ORGS = ["IML", "CSIL", "Daedalus"];

const ORG_PILL = {
  IML: "bg-blue-100 text-blue-700 border border-blue-200",
  CSIL: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Daedalus: "bg-purple-100 text-purple-700 border border-purple-200",
};

export default function OrgFilterBar({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1">
        Org
      </span>
      {ORGS.map((org) => (
        <button
          key={org}
          type="button"
          onClick={() => onChange(org)}
          className={[
            "text-xs font-bold px-3 py-1.5 rounded-lg border transition-all",
            value === org
              ? `${ORG_PILL[org]} shadow-sm`
              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50",
          ].join(" ")}
        >
          {org}
        </button>
      ))}
    </div>
  );
}
