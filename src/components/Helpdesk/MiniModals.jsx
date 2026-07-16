import {
  X,
  AlertCircle,
  Timer,
  XCircle,
  UserCheck,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import {
  HOLD_REASON_OPTIONS,
  PRIORITIES,
  TICKET_TYPES,
  PRIORITY_PILL,
} from "../../constants/helpdeskConstants";
import { Field, AssigneeDropdown } from "./SharedUI";
import { ChevronDown } from "lucide-react";

// ─── Stage Remarks Modal ──────────────────────────────────────────────────────
export function StageMoveModal({ targetStatus, onConfirm, onClose }) {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="mini-modal p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Move to: {targetStatus}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Add remarks (optional).
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <Field label="Remarks (optional)">
          <textarea
            id="stage-remarks"
            rows={3}
            placeholder="Notes..."
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none"
          />
        </Field>
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const el = document.getElementById("stage-remarks");
              onConfirm(el?.value || "");
            }}
            className="flex-1 h-10 rounded-xl bg-slate-900 text-sm font-bold text-white hover:bg-slate-800 flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-4 h-4" /> Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Hold / Waiting Modal ─────────────────────────────────────────────────────
export function HoldModal({ type, onConfirm, onClose }) {
  const isWaiting = type === "waiting";
  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="mini-modal p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              {isWaiting ? "Set: Waiting for User Input" : "Put On Hold"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isWaiting
                ? "Optionally add a note for context."
                : "Document reason."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isWaiting && (
          <Field label="Reason Type" id="hold-reason">
            <div className="relative">
              <select
                id="hold-reason-select"
                className="h-10 w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:border-amber-400"
              >
                <option value="">Select reason...</option>
                {HOLD_REASON_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
            </div>
          </Field>
        )}

        <div className={!isWaiting ? "mt-3" : ""}>
          <Field label="Remarks (optional)">
            <textarea
              id="hold-note"
              rows={3}
              placeholder={
                isWaiting
                  ? "What are you waiting on? (optional)"
                  : "Optional context..."
              }
              className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm focus:outline-none resize-none ${isWaiting ? "border-orange-300 focus:border-orange-400" : "border-slate-300 focus:border-amber-400"}`}
            />
          </Field>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const note = document.getElementById("hold-note")?.value || "";
              if (!isWaiting) {
                const reasonEl = document.getElementById("hold-reason-select");
                const reason = reasonEl?.value || "";
                if (!reason) {
                  alert("Please select a reason type.");
                  return;
                }
                onConfirm({ note, holdReasonType: reason });
              } else {
                onConfirm({ note, holdReasonType: "" });
              }
            }}
            className={`flex-1 h-10 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 ${isWaiting ? "bg-orange-500 hover:bg-orange-600" : "bg-amber-500 hover:bg-amber-600"}`}
          >
            {isWaiting ? (
              <>
                <Timer className="w-4 h-4" /> Set Waiting
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" /> Put On Hold
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Close Modal ──────────────────────────────────────────────────────────────
export function CloseModal({ onConfirm, onClose }) {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="mini-modal p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Close Ticket
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Add closing remarks.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <Field label="Closing Remarks">
          <textarea
            id="close-note"
            rows={4}
            placeholder="Outcome, what was done..."
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400 resize-none"
          />
        </Field>
        <p
          id="close-error"
          className="mt-1 text-xs text-red-600 font-semibold hidden"
        >
          Closing remarks are required.
        </p>
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const note =
                document.getElementById("close-note")?.value?.trim() || "";
              const errEl = document.getElementById("close-error");
              if (!note) {
                errEl?.classList.remove("hidden");
                return;
              }
              errEl?.classList.add("hidden");
              onConfirm(note);
            }}
            className="flex-1 h-10 rounded-xl bg-slate-800 text-sm font-bold text-white hover:bg-slate-900 flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4" /> Confirm Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Reassign Modal ───────────────────────────────────────────────────────────
export function ReassignModal({ current, employees, onConfirm, onClose }) {
  const [val, setVal] = useState(current || []);
  const [useState_] = [useState];
  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="mini-modal p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Reassign
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Select engineers.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <AssigneeDropdown value={val} onChange={setVal} employees={employees} />
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(val)}
            disabled={!val.length}
            className="flex-1 h-10 rounded-xl bg-blue-600 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4" /> Reassign
          </button>
        </div>
      </div>
    </div>
  );
}

// Need local useState for ReassignModal
import { useState } from "react";

// ─── Edit Type Modal ──────────────────────────────────────────────────────────
export function EditTypeModal({ current, onConfirm, onClose }) {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="mini-modal p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold text-slate-900">
            Change Request Type
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {TICKET_TYPES.map((tt) => (
            <button
              key={tt}
              onClick={() => onConfirm(tt)}
              className={`h-12 rounded-xl border text-sm font-bold transition-all ${current === tt ? "bg-slate-900 text-white border-slate-900" : tt === "Incident" ? "border-red-200 text-red-700 hover:bg-red-50" : "border-sky-200 text-sky-700 hover:bg-sky-50"}`}
            >
              {tt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Edit Priority Modal ──────────────────────────────────────────────────────
export function EditPriorityModal({ current, onConfirm, onClose }) {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="mini-modal p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold text-slate-900">
            Change Priority
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              onClick={() => onConfirm(p)}
              className={`w-full h-10 rounded-xl border text-sm font-bold transition-all ${current === p ? PRIORITY_PILL[p] + " shadow-sm" : PRIORITY_PILL[p] + " opacity-60 hover:opacity-100"}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
