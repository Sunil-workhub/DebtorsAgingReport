import { UserCheck } from "lucide-react";
import { PRIORITIES, TICKET_TYPES } from "../../constants/helpdeskConstants";
import { PRIORITY_PILL } from "../../constants/helpdeskConstants";
import { todayISO } from "../../utils/helpdeskUtils";
import { Section, Field, AssigneeDropdown } from "./SharedUI";

export default function EnrollSection({
  isHRTicket,
  enrollForm,
  setEnrollForm,
  enrollErrors,
  onEnroll,
  employees = [],
}) {
  return (
    <Section
      title="Enroll Ticket"
      accent="amber"
      subtitle={`Assign ${isHRTicket ? "HR" : "IT"} engineers, set priority and ETA.`}
    >
      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Priority" error={enrollErrors.priority}>
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  onClick={() => setEnrollForm((f) => ({ ...f, priority: p }))}
                  className={`h-8 px-3 rounded-lg border text-xs font-bold transition-all ${
                    enrollForm.priority === p
                      ? PRIORITY_PILL[p] + " shadow-sm"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Request Type" error={enrollErrors.ticketType}>
            <div className="flex gap-2">
              {TICKET_TYPES.map((tt) => (
                <button
                  key={tt}
                  onClick={() =>
                    setEnrollForm((f) => ({ ...f, ticketType: tt }))
                  }
                  className={`flex-1 h-8 rounded-lg border text-xs font-bold transition-all ${
                    enrollForm.ticketType === tt
                      ? "bg-slate-900 text-white border-slate-900"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {tt}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <AssigneeDropdown
          value={enrollForm.itAssignees}
          onChange={(v) => setEnrollForm((f) => ({ ...f, itAssignees: v }))}
          error={enrollErrors.itAssignees}
          employees={employees}
        />

        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Date" error={enrollErrors.itStartDate}>
            <input
              type="date"
              value={enrollForm.itStartDate}
              onChange={(e) =>
                setEnrollForm((p) => ({ ...p, itStartDate: e.target.value }))
              }
              className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:border-slate-400"
            />
          </Field>
          {enrollForm.ticketType === "Incident" ? (
            <Field label="Expected Hours" error={enrollErrors.etaHours}>
              <input
                type="number"
                min="1"
                value={enrollForm.etaHours}
                onChange={(e) =>
                  setEnrollForm((p) => ({ ...p, etaHours: e.target.value }))
                }
                placeholder="e.g. 4"
                className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:border-red-400"
              />
            </Field>
          ) : (
            <Field label="ETA Date" error={enrollErrors.etaDate}>
              <input
                type="date"
                min={enrollForm.itStartDate}
                value={enrollForm.etaDate}
                onChange={(e) =>
                  setEnrollForm((p) => ({ ...p, etaDate: e.target.value }))
                }
                className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:border-slate-400"
              />
            </Field>
          )}
        </div>

        <Field label="Remarks (optional)">
          <textarea
            rows={2}
            value={enrollForm.itRemarks}
            onChange={(e) =>
              setEnrollForm((p) => ({ ...p, itRemarks: e.target.value }))
            }
            placeholder="Scope, dependencies..."
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-slate-400 resize-none"
          />
        </Field>

        <button
          onClick={onEnroll}
          className={`w-full h-11 rounded-xl text-sm font-bold text-white transition-colors flex items-center justify-center gap-2 ${
            isHRTicket
              ? "bg-indigo-600 hover:bg-indigo-700"
              : "bg-slate-900 hover:bg-slate-800"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Enroll & Begin Work
        </button>
      </div>
    </Section>
  );
}
