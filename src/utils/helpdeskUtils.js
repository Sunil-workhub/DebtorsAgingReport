import {
  CATEGORY_META,
  STATUS_META,
  IT_IMPACT_OPTIONS,
  HR_IMPACT_OPTIONS,
  PRIORITY_PILL,
  ORG_PILL,
} from "../constants/helpdeskConstants";

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const fmt = (d) =>
  !d
    ? "—"
    : new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

export const fmtTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) +
    " " +
    d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  );
};

export const daysBetween = (a, b) => {
  const d1 = new Date(a);
  d1.setHours(0, 0, 0, 0);
  const d2 = new Date(b);
  d2.setHours(0, 0, 0, 0);
  return Math.ceil((d2 - d1) / 86400000);
};

export const getCatMeta = (id) => CATEGORY_META[id] || CATEGORY_META.software;

export const getImpactLabel = (impact, isHR) => {
  const opts = isHR ? HR_IMPACT_OPTIONS : IT_IMPACT_OPTIONS;
  return opts.find((i) => i.value === impact)?.label || "—";
};

export const etaBadge = (t) => {
  if (t.status === "Closed")
    return {
      label: "Closed",
      cls: "bg-slate-100 text-slate-500 border border-slate-200",
    };
  const eta = t.eta_Date || t.etaDate;
  if (!eta)
    return {
      label: "No ETA",
      cls: "bg-slate-100 text-slate-500 border border-slate-200",
    };
  const d = daysBetween(todayISO(), eta);
  if (d < 0)
    return {
      label: `Overdue ${Math.abs(d)}d`,
      cls: "bg-red-100 text-red-700 border border-red-200",
    };
  if (d === 0)
    return {
      label: "Due today",
      cls: "bg-orange-100 text-orange-700 border border-orange-200",
    };
  if (d <= 7)
    return {
      label: `${d}d left`,
      cls: "bg-amber-100 text-amber-700 border border-amber-200",
    };
  return {
    label: `${d}d left`,
    cls: "bg-slate-100 text-slate-600 border border-slate-200",
  };
};

export const getStrikeGroups = (strikes = []) => {
  if (!strikes.length) return [];
  const groups = [];
  let cur = [];
  for (const s of strikes) {
    cur.push(s);
    if (
      cur.length === 3 &&
      cur.every((x) => x.response_Received || x.responseReceived)
    ) {
      groups.push([...cur]);
      cur = [];
    }
  }
  if (cur.length) groups.push(cur);
  return groups;
};

export const fmtBytes = (b) => {
  if (!b) return "";
  if (b < 1024) return b + "B";
  if (b < 1048576) return (b / 1024).toFixed(1) + "KB";
  return (b / 1048576).toFixed(1) + "MB";
};

// Normalize API ticket to internal format
export const normalizeTicket = (t) => {
  // Parse assignees — assigned_Person_Name is comma-separated names
  const assigneeNames = t.assigned_Person_Name
    ? t.assigned_Person_Name
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return {
    id: t.ticket_Id,
    ticketNo: t.ticket_No || "",
    ticketDept: t.dept || "IT",
    description: t.description || "",
    // category: from API, lowercase for internal flow matching
    category: (t.category || "").toLowerCase().replace(/\s+/g, "_") || null,
    // catalog fields for display
    catalogParent: t.project_Module || t.category || "",
    catalogCategory: t.category || "",
    catalogSubCategory: t.project_Module || "",
    submittedBy: t.submitted_By_Name || "",
    submittedByEmpId: String(t.submitted_By || ""),
    onBehalfOf: "",
    priority: t.priority || null,
    ticketType: t.req_Type || null,
    requestType: t.req_Type || null,
    impact: t.impact || "",
    softwareProject: t.project_Module || null,
    status: t.status || "Open",
    submittedDate: t.submitted_At
      ? t.submitted_At.slice(0, 10)
      : t.created_At?.slice(0, 10) || todayISO(),
    itStartDate: t.start_Date ? t.start_Date.slice(0, 10) : null,
    etaDate: t.eta_Date ? t.eta_Date.slice(0, 10) : null,
    etaHours: t.eta_Time || null,
    closingDate:
      t.status === "Closed" ? t.updated_At?.slice(0, 10) || null : null,
    closingNote: t.remarks || "",
    holdRemarks: t.remarks || "",
    holdReasonType: "",
    attachment: t.file_Name ? { name: t.file_Name, size: "" } : null,
    type: t.parent_Ticket_Id ? "Linked Ticket" : "Ticket",
    parentId: t.parent_Ticket_Id || null,
    linkedTaskIds: [],
    enrolledByIT: t.status !== "Open" || !!t.assigned_Person,
    // KEY: use assigned_Person_Name for display
    itAssignees: assigneeNames,
    itAssigneeIds: t.assigned_Person || "",
    itRemarks: t.remarks || "",
    org: t.org || "",
    statusHistory: [],
    messages: [],
    strikes: [],
    autoClosedAfterStrikes: false,
    _raw: t,
  };
};

export const getPriorityPill = (p) => PRIORITY_PILL[p] || PRIORITY_PILL.Normal;
export const getOrgPill = (org) =>
  ORG_PILL[org] || "bg-slate-100 text-slate-600 border border-slate-200";
