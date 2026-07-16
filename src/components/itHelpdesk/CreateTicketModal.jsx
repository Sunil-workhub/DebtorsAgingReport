// src/components/itHelpdesk/CreateTicketModal.jsx
import React, { useMemo, useRef } from "react";
import {
  X,
  Plus,
  Briefcase,
  Wrench,
  ChevronDown,
  Paperclip,
  Upload,
  Zap,
  Database,
  HardDrive,
  WifiOff,
  Globe,
  Building2,
  Users2,
  UserCircle,
  ShieldAlert,
  Landmark,
  UserPlus,
  HelpCircle,
  Link2,
  FileText,
} from "lucide-react";

const CATEGORY_META = {
  software: {
    label: "Software",
    Icon: Zap,
    pill: "bg-violet-50 text-violet-700 border-violet-200",
  },
  erp: {
    label: "ERP Enhancement",
    Icon: Database,
    pill: "bg-cyan-50 text-cyan-700 border-cyan-200",
  },
  hardware: {
    label: "Hardware",
    Icon: HardDrive,
    pill: "bg-amber-50 text-amber-700 border-amber-200",
  },
  networking: {
    label: "Networking",
    Icon: WifiOff,
    pill: "bg-orange-50 text-orange-700 border-orange-200",
  },
};

const SOFTWARE_PROJECTS = [
  "ILEAP",
  "CSIL",
  "ERP Portal",
  "HRM Suite",
  "Finance Module",
  "Other",
];

const IT_IMPACT_OPTIONS = [
  {
    value: "business",
    label: "Business",
    Icon: Globe,
    desc: "Affects business operations",
  },
  {
    value: "department",
    label: "Department",
    Icon: Building2,
    desc: "Affects a department",
  },
  {
    value: "team",
    label: "Team",
    Icon: Users2,
    desc: "Affects a team of users",
  },
  {
    value: "user",
    label: "User",
    Icon: UserCircle,
    desc: "Affects a single user",
  },
];

const HR_IMPACT_OPTIONS = [
  {
    value: "legalcompliance",
    label: "Legal Compliance Risk",
    Icon: ShieldAlert,
    desc: "Policy, statutory, legal issues",
  },
  {
    value: "financialpayroll",
    label: "Financial / Payroll",
    Icon: Landmark,
    desc: "Salary, benefits, reimbursements",
  },
  {
    value: "employeelifecycle",
    label: "Employee Lifecycle",
    Icon: UserPlus,
    desc: "Joining, transfer, exit",
  },
  {
    value: "generalinquiry",
    label: "General Inquiry",
    Icon: HelpCircle,
    desc: "General HR support",
  },
];

function Field({ label, error, children, optional }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <label className="text-xs font-bold text-slate-700">{label}</label>
        {optional && (
          <span className="text-[10px] text-slate-400">Optional</span>
        )}
      </div>
      {children}
      {error ? (
        <p className="mt-1 text-[11px] font-medium text-red-600">{error}</p>
      ) : null}
    </div>
  );
}

const CreateTicketModal = ({
  form,
  errors,
  currentUser,
  tickets = [],
  employeeOptions = [],
  onChange,
  onClose,
  onSubmit,
}) => {
  const fileRef = useRef(null);

  const isHRTicket = form?.dept === "HR";
  const impactOptions = isHRTicket ? HR_IMPACT_OPTIONS : IT_IMPACT_OPTIONS;

  const closedOrEligibleTickets = useMemo(() => {
    return (tickets || []).filter((t) => {
      const deptMatch =
        (t?.dept || "").toString().toUpperCase() ===
        (form?.dept || "").toString().toUpperCase();

      return deptMatch;
    });
  }, [tickets, form?.dept]);

  const selectedOnBehalfUser = useMemo(() => {
    return employeeOptions.find(
      (emp) => String(emp.emp_Id) === String(form?.onBehalfOf?.emp_Id || ""),
    );
  }, [employeeOptions, form?.onBehalfOf]);

  const submittedByName = selectedOnBehalfUser
    ? (selectedOnBehalfUser.emp_Name || "").trim()
    : `${currentUser?.first_name || ""} ${currentUser?.last_name || ""}`.trim();

  const handleDeptChange = (dept) => {
    onChange((prev) => ({
      ...prev,
      dept,
      category: dept === "IT" ? "software" : "",
      project: "",
      impact: dept === "HR" ? "generalinquiry" : "user",
      ticket_type: "new",
      parent_ticket_id: "",
    }));
  };

  const handleOnBehalfChange = (e) => {
    const empId = e.target.value;
    const selected = employeeOptions.find(
      (emp) => String(emp.emp_Id) === String(empId),
    );

    onChange((prev) => ({
      ...prev,
      onBehalfOf: selected
        ? {
            emp_Id: selected.emp_Id,
            emp_No: selected.emp_No,
            emp_Name: selected.emp_Name,
            emp_Email: selected.emp_Email,
            dept_Id: selected.dept_Id,
            org_Id: selected.org_Id,
          }
        : null,
    }));
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-3xl max-h-[92vh] bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              {isHRTicket ? (
                <Briefcase className="w-4 h-4 text-indigo-600" />
              ) : (
                <Wrench className="w-4 h-4 text-slate-800" />
              )}
              Raise Ticket
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Submit a new helpdesk request. Engineers will enroll and process
              it.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <Field label="Ticket Department" error={errors?.dept}>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDeptChange("IT")}
                className={`h-11 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  form?.dept === "IT"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Wrench className="w-4 h-4" />
                IT
              </button>

              <button
                type="button"
                onClick={() => handleDeptChange("HR")}
                className={`h-11 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  form?.dept === "HR"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                }`}
              >
                <Briefcase className="w-4 h-4" />
                HR
              </button>
            </div>
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Ticket Type" error={errors?.ticket_type}>
              <div className="grid grid-cols-2 gap-2">
                {["new", "linked"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        ticket_type: type,
                        parent_ticket_id:
                          type === "linked" ? prev.parent_ticket_id : "",
                      }))
                    }
                    className={`h-10 rounded-xl border text-sm font-bold capitalize transition-all ${
                      form?.ticket_type === type
                        ? "bg-slate-900 text-white border-slate-900"
                        : "border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Request Type" error={errors?.req_type}>
              <div className="grid grid-cols-2 gap-2">
                {["Service Request", "Incident"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        req_type: type,
                      }))
                    }
                    className={`h-10 rounded-xl border text-sm font-bold transition-all ${
                      form?.req_type === type
                        ? type === "Incident"
                          ? "bg-red-600 text-white border-red-600"
                          : "bg-sky-600 text-white border-sky-600"
                        : type === "Incident"
                          ? "border-red-200 text-red-700 hover:bg-red-50"
                          : "border-sky-200 text-sky-700 hover:bg-sky-50"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          {form?.ticket_type === "linked" && (
            <Field label="Parent Ticket" error={errors?.parent_ticket_id}>
              <div className="relative">
                <select
                  value={form?.parent_ticket_id || ""}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      parent_ticket_id: e.target.value,
                    }))
                  }
                  className="h-11 w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:border-slate-400"
                >
                  <option value="">Select parent ticket</option>
                  {closedOrEligibleTickets.map((ticket) => {
                    const ticketId = ticket?.ticket_Id || ticket?.id;
                    const ticketNo = ticket?.ticket_No || `#${ticketId}`;
                    return (
                      <option key={ticketId} value={ticketId}>
                        {ticketNo} - {ticket?.description}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-3.5 w-4 h-4 text-slate-400" />
              </div>
            </Field>
          )}

          {!isHRTicket && (
            <>
              <Field label="Category" error={errors?.category}>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(CATEGORY_META).map(([key, meta]) => {
                    const Icon = meta.Icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() =>
                          onChange((prev) => ({
                            ...prev,
                            category: key,
                            project: key === "software" ? prev.project : "",
                          }))
                        }
                        className={`h-11 rounded-xl border px-3 flex items-center gap-2 text-xs font-bold transition-all ${
                          form?.category === key
                            ? `${meta.pill} shadow-sm`
                            : "border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {form?.category === "software" && (
                <Field label="Project" error={errors?.project}>
                  <div className="relative">
                    <select
                      value={form?.project || ""}
                      onChange={(e) =>
                        onChange((prev) => ({
                          ...prev,
                          project: e.target.value,
                        }))
                      }
                      className="h-11 w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:border-violet-400"
                    >
                      <option value="">Select project</option>
                      {SOFTWARE_PROJECTS.map((project) => (
                        <option key={project} value={project}>
                          {project}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-3.5 w-4 h-4 text-slate-400" />
                  </div>
                </Field>
              )}
            </>
          )}

          <Field
            label={isHRTicket ? "Impact Type" : "Impact"}
            error={errors?.impact}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {impactOptions.map((item) => {
                const Icon = item.Icon;
                const selected = form?.impact === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        impact: item.value,
                      }))
                    }
                    className={`rounded-xl border p-3 text-left transition-all ${
                      selected
                        ? isHRTicket
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-slate-900 text-white border-slate-900"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <Icon
                        className={`w-4 h-4 mt-0.5 flex-none ${
                          selected
                            ? "text-white"
                            : isHRTicket
                              ? "text-indigo-500"
                              : "text-slate-500"
                        }`}
                      />
                      <div>
                        <p className="text-xs font-bold">{item.label}</p>
                        <p
                          className={`text-[10px] mt-0.5 leading-relaxed ${
                            selected ? "text-white/80" : "text-slate-400"
                          }`}
                        >
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Description" error={errors?.description}>
            <textarea
              rows={4}
              value={form?.description || ""}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder={
                isHRTicket
                  ? "Describe the HR issue/request with all useful details."
                  : "Describe the issue, affected system, scope, urgency, and expected result."
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm focus:outline-none focus:border-slate-400 resize-none"
            />
          </Field>

          {(currentUser?.dept_Id === 4 || currentUser?.dept_Id === 7) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="On Behalf Of" optional>
                <div className="relative">
                  <select
                    value={form?.onBehalfOf?.emp_Id || ""}
                    onChange={handleOnBehalfChange}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:border-slate-400"
                  >
                    <option value="">Self</option>
                    {employeeOptions.map((emp) => (
                      <option key={emp.emp_Id} value={emp.emp_Id}>
                        {emp.emp_Name} ({emp.emp_No})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3.5 w-4 h-4 text-slate-400" />
                </div>
              </Field>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Attachment" optional>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    file: e.target.files?.[0] || null,
                  }))
                }
              />

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="h-11 w-full rounded-xl border border-slate-300 px-3 flex items-center justify-center gap-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Upload className="w-4 h-4" />
                {form?.file ? "Change File" : "Upload File"}
              </button>

              {form?.file ? (
                <div className="mt-2 inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                  <Paperclip className="w-3.5 h-3.5" />
                  {form.file.name}
                </div>
              ) : null}
            </Field>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            Ticket is created in open state and processed later.
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="h-10 px-4 rounded-xl border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              onClick={onSubmit}
              className={`h-10 px-5 rounded-xl text-sm font-bold text-white flex items-center gap-2 ${
                isHRTicket
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-slate-900 hover:bg-slate-800"
              }`}
            >
              {form?.ticket_type === "linked" ? (
                <Link2 className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Raise Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTicketModal;
