import { useState } from "react";
import {
  X,
  Download,
  Building2,
  FileSpreadsheet,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { ORGS, ORG_PILL } from "../../constants/helpdeskConstants";
import { fmt } from "../../utils/helpdeskUtils";

const STATUS_GROUPS = [
  {
    value: "open_inprogress",
    label: "Open / In Progress",
    desc: "All active tickets",
  },
  { value: "closed", label: "Closed", desc: "Requires date range" },
];

export default function ExcelDownloadModal({ onClose, onDownload, loading }) {
  const [org, setOrg] = useState("IML");
  const [statusGroup, setStatusGroup] = useState("open_inprogress");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [errors, setErrors] = useState({});

  const handleDownload = () => {
    const errs = {};
    if (statusGroup === "closed") {
      if (!fromDate) errs.fromDate = "From date required.";
      if (!toDate) errs.toDate = "To date required.";
      if (fromDate && toDate && fromDate > toDate)
        errs.toDate = "To date must be after From date.";
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onDownload({
      org,
      statusGroup,
      fromDate: fromDate || null,
      toDate: toDate || null,
    });
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="mini-modal p-6"
        style={{ maxWidth: "460px", width: "100%" }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Download Excel Report
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select filters and download ticket data
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              Organisation
            </label>
            <div className="flex gap-2">
              {ORGS.map((o) => (
                <button
                  key={o}
                  onClick={() => setOrg(o)}
                  className={`flex-1 h-10 rounded-xl border text-sm font-bold transition-all ${org === o ? (ORG_PILL[o] || "") + " shadow-sm" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              Ticket Status
            </label>
            <div className="space-y-2">
              {[
                {
                  value: "open_inprogress",
                  label: "Open / In Progress",
                  desc: "All active tickets",
                },
                {
                  value: "closed",
                  label: "Closed",
                  desc: "Requires date range",
                },
              ].map((sg) => (
                <button
                  key={sg.value}
                  onClick={() => {
                    setStatusGroup(sg.value);
                    setFromDate("");
                    setToDate("");
                    setErrors({});
                  }}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${statusGroup === sg.value ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex-none mt-0.5 flex items-center justify-center ${statusGroup === sg.value ? "border-white" : "border-slate-300"}`}
                  >
                    {statusGroup === sg.value && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-bold ${statusGroup === sg.value ? "text-white" : "text-slate-800"}`}
                    >
                      {sg.label}
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${statusGroup === sg.value ? "text-slate-300" : "text-slate-400"}`}
                    >
                      {sg.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          {statusGroup === "closed" && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Closed Date Range
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                    From
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setErrors((p) => ({ ...p, fromDate: "" }));
                    }}
                    className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:border-emerald-400"
                  />
                  {errors.fromDate && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.fromDate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                    To
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    min={fromDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      setErrors((p) => ({ ...p, toDate: "" }));
                    }}
                    className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:border-emerald-400"
                  />
                  {errors.toDate && (
                    <p className="mt-1 text-xs text-red-600">{errors.toDate}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={loading}
            className="flex-1 h-10 rounded-xl bg-emerald-600 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {loading ? "Generating…" : "Download Excel"}
          </button>
        </div>
      </div>
    </div>
  );
}
