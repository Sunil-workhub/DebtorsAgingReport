// src/components/itHelpdesk/EnrollTicketModal.jsx
import React, { useEffect, useState } from "react";

const PRIORITIES = ["Critical", "Medium", "Normal"];
const REQUEST_TYPES = ["Service Request", "Incident"];

export default function EnrollTicketModal({
  open,
  onClose,
  ticket,
  employees,
  onSubmit,
  submitting,
}) {
  const [form, setForm] = useState({
    priority: "Medium",
    requestType: "Service Request",
    assignedPerson: "",
    etaDate: "",
    etaTime: "",
    remarks: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open && ticket) {
      setForm((f) => ({
        ...f,
        priority: ticket.priority || "Medium",
        requestType: ticket.requestType || "Service Request",
        assignedPerson: ticket.assignedPerson || "",
        etaDate: ticket.etaDate || "",
        etaTime: "",
        remarks: "",
      }));
      setErrors({});
    }
  }, [open, ticket]);

  if (!open || !ticket) return null;

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = () => {
    const errs = {};
    if (!form.assignedPerson) errs.assignedPerson = "Assignee required.";
    if (!form.priority) errs.priority = "Priority required.";
    if (!form.requestType) errs.requestType = "Request type required.";
    if (!form.etaDate) errs.etaDate = "ETA date required.";

    setErrors(errs);
    if (Object.keys(errs).length) return;

    onSubmit(form);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-xl p-4 text-[11px]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold text-slate-900">
            Enroll Ticket
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

        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {/* Priority */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">
              Priority
            </label>
            <select
              value={form.priority}
              onChange={(e) => handleChange("priority", e.target.value)}
              className="w-full h-8 rounded-lg border border-slate-300 bg-white px-2 text-[11px]"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {errors.priority && (
              <p className="text-[10px] text-red-600 mt-0.5">
                {errors.priority}
              </p>
            )}
          </div>

          {/* Request type */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">
              Request Type
            </label>
            <select
              value={form.requestType}
              onChange={(e) => handleChange("requestType", e.target.value)}
              className="w-full h-8 rounded-lg border border-slate-300 bg-white px-2 text-[11px]"
            >
              {REQUEST_TYPES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {errors.requestType && (
              <p className="text-[10px] text-red-600 mt-0.5">
                {errors.requestType}
              </p>
            )}
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">
              Assign To
            </label>
            <select
              value={form.assignedPerson}
              onChange={(e) => handleChange("assignedPerson", e.target.value)}
              className="w-full h-8 rounded-lg border border-slate-300 bg-white px-2 text-[11px]"
            >
              <option value="">Select employee</option>
              {employees.map((e) => (
                <option key={e.emp_Id} value={e.emp_Id}>
                  {e.emp_Name} ({e.emp_No})
                </option>
              ))}
            </select>
            {errors.assignedPerson && (
              <p className="text-[10px] text-red-600 mt-0.5">
                {errors.assignedPerson}
              </p>
            )}
          </div>

          {/* ETA date & time */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">
                ETA Date
              </label>
              <input
                type="date"
                value={form.etaDate}
                onChange={(e) => handleChange("etaDate", e.target.value)}
                className="w-full h-8 rounded-lg border border-slate-300 bg-white px-2 text-[11px]"
              />
              {errors.etaDate && (
                <p className="text-[10px] text-red-600 mt-0.5">
                  {errors.etaDate}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">
                ETA Time
              </label>
              <input
                type="time"
                value={form.etaTime}
                onChange={(e) => handleChange("etaTime", e.target.value)}
                className="w-full h-8 rounded-lg border border-slate-300 bg-white px-2 text-[11px]"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">
              Remarks
            </label>
            <textarea
              rows={3}
              value={form.remarks}
              onChange={(e) => handleChange("remarks", e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] resize-none"
              placeholder="Internal remarks"
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
            className="h-8 px-4 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 disabled:opacity-60"
          >
            {submitting ? "Enrolling…" : "Enroll Ticket"}
          </button>
        </div>
      </div>
    </div>
  );
}
