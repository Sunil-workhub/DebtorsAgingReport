// src/components/itHelpdesk/ReassignTicketModal.jsx
import React, { useEffect, useState } from "react";

export default function ReassignTicketModal({
  open,
  onClose,
  ticket,
  employees,
  onSubmit,
  submitting,
}) {
  const [employeeId, setEmployeeId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && ticket) {
      setEmployeeId(ticket.assignedPerson || "");
      setRemarks("");
      setError("");
    }
  }, [open, ticket]);

  if (!open || !ticket) return null;

  const handleSubmit = () => {
    if (!employeeId) {
      setError("Assignee required.");
      return;
    }
    onSubmit(employeeId, remarks);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-xl p-4 text-[11px]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold text-slate-900">
            Reassign Ticket
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm"
          >
            ✕
          </button>
        </div>

        <p className="text-[11px] text-slate-500 mb-2 line-clamp-2">
          {ticket.description}
        </p>

        <div className="space-y-2">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">
              Assign To
            </label>
            <select
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
                setError("");
              }}
              className="w-full h-8 rounded-lg border border-slate-300 bg-white px-2 text-[11px]"
            >
              <option value="">Select employee</option>
              {employees.map((e) => (
                <option key={e.emp_Id} value={e.emp_Id}>
                  {e.emp_Name} ({e.emp_No})
                </option>
              ))}
            </select>
            {error && (
              <p className="text-[10px] text-red-600 mt-0.5">{error}</p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">
              Remarks
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] resize-none"
              placeholder="Optional remarks"
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 rounded-lg border border-slate-300 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="h-8 px-4 rounded-lg bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Reassigning…" : "Reassign"}
          </button>
        </div>
      </div>
    </div>
  );
}
