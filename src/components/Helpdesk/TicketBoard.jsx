// src/components/itHelpdesk/TicketBoard.jsx
import React, { useMemo } from "react";

// Status metadata (from your prototype)
const STATUS_META = {
  Open: {
    dot: "bg-slate-400",
    txt: "text-slate-600",
    chip: "bg-slate-100 text-slate-600",
  },
  Requirement: {
    dot: "bg-blue-400",
    txt: "text-blue-700",
    chip: "bg-blue-100 text-blue-700",
  },
  Discussion: {
    dot: "bg-purple-400",
    txt: "text-purple-700",
    chip: "bg-purple-100 text-purple-700",
  },
  Queue: {
    dot: "bg-indigo-400",
    txt: "text-indigo-700",
    chip: "bg-indigo-100 text-indigo-700",
  },
  Assigned: {
    dot: "bg-blue-400",
    txt: "text-blue-700",
    chip: "bg-blue-100 text-blue-700",
  },
  "In Progress": {
    dot: "bg-blue-500",
    txt: "text-blue-700",
    chip: "bg-blue-100 text-blue-700",
  },
  "On Hold": {
    dot: "bg-amber-500",
    txt: "text-amber-700",
    chip: "bg-amber-100 text-amber-700",
  },
  "Waiting for User Input": {
    dot: "bg-orange-500",
    txt: "text-orange-700",
    chip: "bg-orange-100 text-orange-700",
  },
  "IT Testing": {
    dot: "bg-indigo-500",
    txt: "text-indigo-700",
    chip: "bg-indigo-100 text-indigo-700",
  },
  "Ready for Demo": {
    dot: "bg-teal-500",
    txt: "text-teal-700",
    chip: "bg-teal-100 text-teal-700",
  },
  "User Testing": {
    dot: "bg-amber-400",
    txt: "text-amber-700",
    chip: "bg-amber-100 text-amber-700",
  },
  Closed: {
    dot: "bg-slate-300",
    txt: "text-slate-400",
    chip: "bg-slate-100 text-slate-400",
  },
};

const PRIORITY_PILL = {
  Critical: "bg-red-100 text-red-700 border border-red-200",
  High: "bg-orange-100 text-orange-700 border border-orange-200",
  Medium: "bg-amber-100 text-amber-700 border border-amber-200",
  Normal: "bg-blue-100 text-blue-700 border border-blue-200",
  Low: "bg-slate-100 text-slate-600 border border-slate-200",
};

const ORG_PILL = {
  IML: "bg-blue-100 text-blue-700 border border-blue-200",
  CSIL: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Daedalus: "bg-purple-100 text-purple-700 border border-purple-200",
};

const CATEGORY_META = {
  software: {
    label: "Software",
    pill: "bg-violet-50 text-violet-700 border-violet-200",
  },
  erp: {
    label: "ERP",
    pill: "bg-cyan-50 text-cyan-700 border-cyan-200",
  },
  hardware: {
    label: "Hardware",
    pill: "bg-amber-50 text-amber-700 border-amber-200",
  },
  networking: {
    label: "Networking",
    pill: "bg-orange-50 text-orange-700 border-orange-200",
  },
};

const FULL_FLOW_CATEGORIES = ["software", "erp"];
const TESTING_STATUSES = ["IT Testing", "Ready for Demo", "User Testing"];

const todayISO = () => new Date().toISOString().slice(0, 10);

const daysBetween = (a, b) => {
  const d1 = new Date(a);
  d1.setHours(0, 0, 0, 0);
  const d2 = new Date(b);
  d2.setHours(0, 0, 0, 0);
  return Math.ceil((d2 - d1) / 86400000);
};

const etaBadge = (t) => {
  if (t.status === "Closed")
    return {
      label: "Closed",
      cls: "bg-slate-100 text-slate-500 border border-slate-200",
    };
  if (!t.etaDate)
    return {
      label: "No ETA",
      cls: "bg-slate-100 text-slate-500 border border-slate-200",
    };
  const d = daysBetween(todayISO(), t.etaDate);
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

const fmt = (d) =>
  !d
    ? "—"
    : new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

// Accent styles for columns (IT/HR board look)
const ACCENT_COL = {
  emerald: {
    border: "border border-emerald-200",
    bg: "bg-emerald-50/40",
    hdr: "border-b border-emerald-100",
    sub: "text-emerald-600",
    inner: "bg-emerald-50/40",
  },
  blue: {
    border: "border border-blue-200",
    bg: "bg-blue-50/40",
    hdr: "border-b border-blue-100",
    sub: "text-blue-500",
    inner: "bg-blue-50/40",
  },
  indigo: {
    border: "border border-indigo-200",
    bg: "bg-indigo-50/40",
    hdr: "border-b border-indigo-100",
    sub: "text-indigo-500",
    inner: "bg-indigo-50/40",
  },
  purple: {
    border: "border border-purple-200",
    bg: "bg-purple-50/40",
    hdr: "border-b border-purple-100",
    sub: "text-purple-500",
    inner: "bg-purple-50/40",
  },
  orange: {
    border: "border border-orange-200",
    bg: "bg-orange-50/40",
    hdr: "border-b border-orange-100",
    sub: "text-orange-500",
    inner: "bg-orange-50/40",
  },
  amber: {
    border: "border border-amber-200",
    bg: "bg-amber-50/40",
    hdr: "border-b border-amber-100",
    sub: "text-amber-500",
    inner: "bg-amber-50/40",
  },
  slate: {
    border: "border border-slate-200",
    bg: "bg-white",
    hdr: "border-b border-slate-100",
    sub: "text-slate-400",
    inner: "bg-slate-50/80",
  },
};

function TicketCard({ ticket, active, onClick }) {
  const meta = STATUS_META[ticket.status] || STATUS_META.Open;
  const badge = etaBadge(ticket);
  const cat =
    ticket.category && CATEGORY_META[ticket.category]
      ? CATEGORY_META[ticket.category]
      : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full rounded-xl border bg-white p-2.5 text-left shadow-sm transition-all duration-150",
        active
          ? "border-slate-800 ring-2 ring-slate-200 shadow-md"
          : "border-slate-200 hover:border-slate-300 hover:shadow",
      ].join(" ")}
    >
      <div className="flex items-center gap-1 mb-1.5 flex-wrap">
        {ticket.ticketDept === "HR" && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200 flex-none">
            HR
          </span>
        )}
        {ticket.ticketDept === "IT" && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border bg-slate-900 text-white border-slate-900 flex-none">
            IT
          </span>
        )}
        {cat && (
          <span
            className={[
              "inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border flex-none",
              cat.pill,
            ].join(" ")}
          >
            {cat.label}
          </span>
        )}
        <span
          className={[
            "inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border flex-none",
            ORG_PILL[ticket.org] ||
              "bg-slate-100 text-slate-600 border-slate-200",
          ].join(" ")}
        >
          {ticket.org}
        </span>
        {ticket.requestType && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-sky-200 bg-sky-50 text-sky-700 flex-none">
            {ticket.requestType}
          </span>
        )}
        {ticket.priority && (
          <span
            className={[
              "ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-none",
              PRIORITY_PILL[ticket.priority],
            ].join(" ")}
          >
            {ticket.priority}
          </span>
        )}
      </div>

      <p className="text-[13px] font-semibold text-slate-800 truncate mb-1">
        {ticket.description}
      </p>

      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 flex-wrap">
        <span className="truncate flex-1 min-w-0">
          {ticket.submittedBy} ({ticket.submittedByEmpId})
        </span>
        <span
          className={[
            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[10px] font-semibold",
            badge.cls,
          ].join(" ")}
        >
          {badge.label}
        </span>
      </div>

      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
        <span>{ticket.ticketNo}</span>
        <span>{fmt(ticket.submittedDate)}</span>
      </div>

      <div className="mt-1 flex items-center justify-between text-[10px]">
        <span
          className={[
            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border",
            meta.chip,
          ].join(" ")}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
          {ticket.status}
        </span>
      </div>
    </button>
  );
}

// Build IT columns (status-driven, using your flows)
function buildITColumns(tickets) {
  const open = tickets.filter((t) => t.status === "Open");
  const requirementOrDiscussion = tickets.filter((t) =>
    ["Requirement", "Discussion"].includes(t.status),
  );
  const inProgress = tickets.filter((t) => t.status === "In Progress");
  const testing = tickets.filter((t) => TESTING_STATUSES.includes(t.status));
  const waiting = tickets.filter(
    (t) =>
      t.status === "Waiting for User Input" &&
      FULL_FLOW_CATEGORIES.includes(t.category),
  );
  const onHold = tickets.filter(
    (t) => t.status === "On Hold" && FULL_FLOW_CATEGORIES.includes(t.category),
  );
  const closed = tickets.filter((t) => t.status === "Closed");

  const cols = [
    {
      key: "open",
      label: "Open",
      meta: STATUS_META.Open,
      items: open,
      subtitle: "New / unprocessed",
      accent: "slate",
    },
    {
      key: "req_disc",
      label: "Requirement / Discussion",
      meta: STATUS_META.Requirement,
      items: requirementOrDiscussion,
      subtitle: "Requirement gathering, discussions",
      accent: "purple",
    },
    {
      key: "inprogress",
      label: "In Progress",
      meta: STATUS_META["In Progress"],
      items: inProgress,
      subtitle: "Active implementation",
      accent: "blue",
    },
    {
      key: "testing",
      label: "Testing",
      meta: STATUS_META["IT Testing"],
      items: testing,
      subtitle: "IT & user testing",
      accent: "indigo",
    },
  ];

  if (waiting.length > 0) {
    cols.push({
      key: "waiting",
      label: "Waiting for User",
      meta: STATUS_META["Waiting for User Input"],
      items: waiting,
      subtitle: "Awaiting user response",
      accent: "orange",
    });
  }

  if (onHold.length > 0) {
    cols.push({
      key: "onhold",
      label: "On Hold",
      meta: STATUS_META["On Hold"],
      items: onHold,
      subtitle: "Blocked / paused",
      accent: "amber",
    });
  }

  cols.push({
    key: "closed",
    label: "Closed",
    meta: STATUS_META.Closed,
    items: closed,
    subtitle: null,
    accent: "slate",
  });

  return cols;
}

// Build HR columns (HR_STATUSES)
function buildHRColumns(tickets) {
  const hrOpen = tickets.filter((t) => t.status === "Open");
  const hrQueue = tickets.filter((t) => t.status === "Queue");
  const hrAssigned = tickets.filter((t) => t.status === "Assigned");
  const hrInProgress = tickets.filter((t) => t.status === "In Progress");
  const hrClosed = tickets.filter((t) => t.status === "Closed");

  return [
    {
      key: "hropen",
      label: "Open",
      meta: STATUS_META.Open,
      items: hrOpen,
      subtitle: "New HR requests",
      accent: "slate",
    },
    {
      key: "hrqueue",
      label: "Queue",
      meta: STATUS_META.Queue,
      items: hrQueue,
      subtitle: "In HR queue",
      accent: "slate",
    },
    {
      key: "hrassigned",
      label: "Assigned",
      meta: STATUS_META.Assigned,
      items: hrAssigned,
      subtitle: "Assigned to HR",
      accent: "indigo",
    },
    {
      key: "hrprogress",
      label: "In Progress",
      meta: STATUS_META["In Progress"],
      items: hrInProgress,
      subtitle: "Active HR work",
      accent: "indigo",
    },
    {
      key: "hrclosed",
      label: "Closed",
      meta: STATUS_META.Closed,
      items: hrClosed,
      subtitle: null,
      accent: "slate",
    },
  ];
}

export default function TicketBoard({
  currentUser,
  tickets,
  selectedId,
  onSelectTicket,
  loading,
}) {
  const isIT = currentUser.role === "IT";
  const isHR = currentUser.role === "HR";

  const cols = useMemo(() => {
    // tickets passed in are already filtered by org and dept in page
    return isHR ? buildHRColumns(tickets) : buildITColumns(tickets);
  }, [tickets, isHR]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-600">
          Loading tickets…
        </div>
      </div>
    );
  }

  if (!tickets.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-slate-400">
          <p className="text-sm font-semibold">No tickets in this view.</p>
          <p className="text-xs mt-1">
            New requests will appear here once created.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex gap-3" style={{ minWidth: cols.length * 220 }}>
      {cols.map((col) => {
        const ac = ACCENT_COL[col.accent] || ACCENT_COL.slate;
        const meta = col.meta || STATUS_META.Open;

        return (
          <div
            key={col.key}
            className={[
              "flex flex-col rounded-2xl shadow-sm min-h-0",
              ac.border,
              ac.bg,
            ].join(" ")}
            style={{ minWidth: 220, flex: 1 }}
          >
            <div
              className={["flex flex-col px-3 py-2.5 flex-none", ac.hdr].join(
                " ",
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={["w-2 h-2 rounded-full", meta.dot].join(" ")}
                  />
                  <span className={["text-xs font-bold", meta.txt].join(" ")}>
                    {col.label}
                  </span>
                </div>
                <span
                  className={[
                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                    meta.chip,
                  ].join(" ")}
                >
                  {col.items.length}
                </span>
              </div>
              {col.subtitle && (
                <p
                  className={[
                    "text-[10px] mt-0.5 ml-[18px] font-medium",
                    ac.sub,
                  ].join(" ")}
                >
                  {col.subtitle}
                </p>
              )}
            </div>

            <div
              className={[
                "flex-1 overflow-y-auto p-2 space-y-2 min-h-0",
                ac.inner,
              ].join(" ")}
            >
              {col.items.length === 0 ? (
                <div className="flex items-center justify-center h-14 rounded-xl border border-dashed border-slate-200 bg-white text-[11px] text-slate-400">
                  No tickets
                </div>
              ) : (
                col.items.map((t) => (
                  <TicketCard
                    key={t.id}
                    ticket={t}
                    active={t.id === selectedId}
                    onClick={() => onSelectTicket(t.id)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
