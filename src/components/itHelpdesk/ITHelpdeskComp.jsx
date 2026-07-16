// src/components/itHelpdesk/ITHelpdeskComp.jsx
import React, { useMemo } from "react";
import {
  Plus,
  Loader2,
  Inbox,
  Clock3,
  List,
  UserCheck,
  Timer,
  XCircle,
  Wrench,
  Briefcase,
  LogOut,
  Filter,
  Bell,
  MessageSquareText,
  User,
  CalendarDays,
  Database,
  HardDrive,
  WifiOff,
  Zap,
  FlaskConical,
  PlayCircle,
  TestTube,
} from "lucide-react";
import CreateTicketModal from "./CreateTicketModal";
import TicketModal from "./TicketModal";

// ─── META ─────────────────────────────────────────────────────────────────────

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

const STATUS_META = {
  Open: {
    dot: "bg-slate-400",
    txt: "text-slate-600",
    chip: "bg-slate-100 text-slate-600",
    Icon: Inbox,
  },
  Requirement: {
    dot: "bg-blue-400",
    txt: "text-blue-700",
    chip: "bg-blue-100 text-blue-700",
    Icon: List,
  },
  Discussion: {
    dot: "bg-purple-400",
    txt: "text-purple-700",
    chip: "bg-purple-100 text-purple-700",
    Icon: MessageSquareText,
  },
  Queue: {
    dot: "bg-indigo-400",
    txt: "text-indigo-700",
    chip: "bg-indigo-100 text-indigo-700",
    Icon: List,
  },
  Assigned: {
    dot: "bg-blue-400",
    txt: "text-blue-700",
    chip: "bg-blue-100 text-blue-700",
    Icon: UserCheck,
  },
  "In Progress": {
    dot: "bg-blue-500",
    txt: "text-blue-700",
    chip: "bg-blue-100 text-blue-700",
    Icon: Clock3,
  },
  "On Hold": {
    dot: "bg-amber-500",
    txt: "text-amber-700",
    chip: "bg-amber-100 text-amber-700",
    Icon: Timer,
  },
  "Waiting for User Input": {
    dot: "bg-orange-500",
    txt: "text-orange-700",
    chip: "bg-orange-100 text-orange-700",
    Icon: Timer,
  },
  "IT Testing": {
    dot: "bg-indigo-500",
    txt: "text-indigo-700",
    chip: "bg-indigo-100 text-indigo-700",
    Icon: FlaskConical,
  },
  "Ready for Demo": {
    dot: "bg-teal-500",
    txt: "text-teal-700",
    chip: "bg-teal-100 text-teal-700",
    Icon: PlayCircle,
  },
  "User Testing": {
    dot: "bg-amber-400",
    txt: "text-amber-700",
    chip: "bg-amber-100 text-amber-700",
    Icon: TestTube,
  },
  Closed: {
    dot: "bg-slate-300",
    txt: "text-slate-400",
    chip: "bg-slate-100 text-slate-400",
    Icon: XCircle,
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

const ORGS = ["IML", "CSIL", "Daedalus"];

const STARTED_STATUSES = [
  "Requirement",
  "Discussion",
  "In Progress",
  "IT Testing",
  "Ready for Demo",
  "User Testing",
  "On Hold",
  "Waiting for User Input",
  "Queue",
  "Assigned",
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const todayISO = () => new Date().toISOString().slice(0, 10);

const fmt = (d) =>
  !d
    ? "—"
    : new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

const daysBetween = (a, b) => {
  const d1 = new Date(a);
  d1.setHours(0, 0, 0, 0);
  const d2 = new Date(b);
  d2.setHours(0, 0, 0, 0);
  return Math.ceil((d2 - d1) / 86400000);
};

const etaBadge = (ticket) => {
  // Use etaDate from ticket, fall back to eta_Date (API naming)
  const etaDate = ticket?.etaDate || ticket?.eta_Date;
  if ((ticket?.status || "").toLowerCase() === "closed")
    return {
      label: "Closed",
      cls: "bg-slate-100 text-slate-500 border border-slate-200",
    };
  if (!etaDate)
    return {
      label: "No ETA",
      cls: "bg-slate-100 text-slate-500 border border-slate-200",
    };
  const d = daysBetween(todayISO(), etaDate);
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

const getStrikeGroups = (strikes = []) => {
  if (!strikes.length) return [];
  const groups = [];
  let cur = [];
  for (const s of strikes) {
    cur.push(s);
    if (
      cur.length === 3 &&
      cur.every((x) => x.responseReceived || x.response_Note)
    ) {
      groups.push([...cur]);
      cur = [];
    }
  }
  if (cur.length) groups.push(cur);
  return groups;
};

// Normalize ticket fields from API (snake_case) to camelCase used in prototype
const normalizeTicket = (ticket) => ({
  ...ticket,
  id: ticket.ticket_Id || ticket.id,
  ticketDept: ticket.dept || ticket.ticketDept,
  submittedBy:
    ticket.submitted_By_Name || ticket.submittedBy || ticket.submitted_By,
  submittedDate: ticket.submitted_At || ticket.submittedDate,
  itAssignees: ticket.assigned_Person
    ? ticket.assigned_Person
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : ticket.itAssignees || [],
  etaDate: ticket.eta_Date || ticket.etaDate,
  messages: ticket.messages || [],
  strikes: ticket.strikes || [],
  enrolledByIT: !!(
    ticket.assigned_Person ||
    ticket.itAssignees?.length ||
    ticket.enrolledByIT
  ),
  ticketType: ticket.req_Type || ticket.ticketType,
  requestType: ticket.req_Type || ticket.requestType,
  category: ticket.category || "",
  org: ticket.org || "",
  priority: ticket.priority || "",
  onBehalfOf: ticket.onBehalfOf || "",
});

// ─── HR PILL ──────────────────────────────────────────────────────────────────

function HRPill({ small = false }) {
  if (small)
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200 flex-none">
        <Briefcase className="w-2.5 h-2.5" />
        HR
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200">
      <Briefcase className="w-3 h-3" />
      HR
    </span>
  );
}

// ─── TICKET CARD ──────────────────────────────────────────────────────────────

function TicketCard({ ticket: rawTicket, active, onClick, currentUser }) {
  const ticket = normalizeTicket(rawTicket);
  const isHRTicket = (ticket.ticketDept || "").toUpperCase() === "HR";
  const cat =
    !isHRTicket && ticket.category
      ? CATEGORY_META[ticket.category.toLowerCase()]
      : null;
  const badge = etaBadge(ticket);

  const groups = getStrikeGroups(ticket.strikes || []);
  const activeGroup =
    groups.length > 0 &&
    !groups[groups.length - 1].every(
      (s) => s.responseReceived || s.response_Note,
    )
      ? groups[groups.length - 1]
      : [];

  const currentUserName = currentUser?.full_name || currentUser?.name || "";
  const isAssigned =
    currentUserName && ticket.itAssignees?.includes(currentUserName);

  const ticketTypeVal = ticket.ticketType || ticket.requestType;

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border bg-white p-2.5 text-left shadow-sm transition-all duration-150 ${
        active
          ? "border-slate-800 ring-2 ring-slate-200 shadow-md"
          : "border-slate-200 hover:border-slate-300 hover:shadow"
      }`}
    >
      {/* Row 1: Category/HR pill + Org + Type + Priority */}
      <div className="flex items-center gap-1 mb-1.5 flex-wrap">
        {isHRTicket ? (
          <HRPill small />
        ) : cat ? (
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border flex-none ${cat.pill}`}
          >
            <cat.Icon className="w-2.5 h-2.5" />
            {cat.label}
          </span>
        ) : null}

        {ticket.org && (
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-none ${ORG_PILL[ticket.org] || "bg-slate-100 text-slate-600"}`}
          >
            {ticket.org}
          </span>
        )}

        {ticketTypeVal && (
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-none ${
              (ticketTypeVal || "").toLowerCase() === "incident"
                ? "bg-red-100 text-red-700 border border-red-200"
                : "bg-sky-100 text-sky-700 border border-sky-200"
            }`}
          >
            {ticketTypeVal}
          </span>
        )}

        {ticket.priority && (
          <span
            className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-none ${PRIORITY_PILL[ticket.priority] || PRIORITY_PILL.Normal}`}
          >
            {ticket.priority}
          </span>
        )}
      </div>

      {/* Row 2: Description */}
      <p className="text-[13px] font-semibold text-slate-800 truncate mb-1">
        {ticket.description || "-"}
      </p>

      {/* Row 3: Submitted by + ETA badge */}
      <div className="flex items-center gap-1.5 text-[10px]">
        <User className="w-2.5 h-2.5 text-slate-400 flex-none" />
        <span className="text-slate-500 truncate flex-1 min-w-0">
          {ticket.submittedBy || "-"}
          {ticket.onBehalfOf ? ` (for ${ticket.onBehalfOf})` : ""}
        </span>
        <span
          className={`font-semibold px-1.5 py-0.5 rounded-full flex-none ${badge.cls}`}
        >
          {badge.label}
        </span>
      </div>

      {/* Row 4: Assignees */}
      {ticket.itAssignees?.length > 0 && (
        <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
          <UserCheck className="w-2.5 h-2.5" />
          <span className={isAssigned ? "text-blue-600 font-semibold" : ""}>
            {ticket.itAssignees.join(", ")}
          </span>
        </div>
      )}

      {/* Row 5: Active strike warning */}
      {activeGroup.length > 0 &&
        activeGroup.every((s) => !s.responseReceived && !s.response_Note) && (
          <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-orange-700 bg-orange-50 rounded-lg px-2 py-1 border border-orange-200">
            <Bell className="w-2.5 h-2.5" />
            {activeGroup.length}/3 follow-ups · no response
          </div>
        )}

      {/* Row 6: Message count */}
      {ticket.messages?.length > 0 && (
        <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
          <MessageSquareText className="w-2.5 h-2.5" />
          <span>
            {ticket.messages.length} msg
            {ticket.messages.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </button>
  );
}

// ─── STAT BOX ─────────────────────────────────────────────────────────────────

function StatBox({ label, value, colorClass }) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 min-w-[60px] text-center ${colorClass}`}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
        {label}
      </p>
      <p className="text-xl font-extrabold leading-none mt-0.5">{value}</p>
    </div>
  );
}

// ─── KANBAN COLUMN ────────────────────────────────────────────────────────────

function KanbanColumn({
  col,
  tickets,
  selectedId,
  onSelectTicket,
  currentUser,
}) {
  const { label, meta, subtitle, accentPersonal, accentOpen } = col;
  const Icon = meta.Icon;

  const colCls = accentPersonal
    ? "border-blue-200 bg-blue-50/30"
    : accentOpen
      ? "border-emerald-200 bg-emerald-50/20"
      : "border-slate-200 bg-white";

  const headerBorderCls = accentPersonal
    ? "border-blue-100"
    : accentOpen
      ? "border-emerald-100"
      : "border-slate-100";

  const bodyBgCls = accentPersonal
    ? "bg-blue-50/20"
    : accentOpen
      ? "bg-emerald-50/10"
      : "bg-slate-50/50";

  const subtitleCls = accentPersonal
    ? "text-blue-500"
    : accentOpen
      ? "text-emerald-600"
      : "text-slate-400";

  return (
    <div
      className={`flex flex-col rounded-2xl border shadow-sm min-h-0 ${colCls}`}
      style={{ minWidth: "200px", flex: "1" }}
    >
      {/* Column header */}
      <div
        className={`flex flex-col border-b px-3 py-2.5 flex-none ${headerBorderCls}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
            <Icon className={`w-3.5 h-3.5 ${meta.txt}`} />
            <span className={`text-xs font-bold ${meta.txt}`}>{label}</span>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.chip}`}
          >
            {tickets.length}
          </span>
        </div>
        {subtitle && (
          <p
            className={`text-[10px] mt-0.5 ml-[18px] font-medium ${subtitleCls}`}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Tickets */}
      <div
        className={`flex-1 overflow-y-auto p-2 space-y-2 min-h-0 ${bodyBgCls}`}
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#cbd5e1 transparent",
        }}
      >
        {tickets.length === 0 ? (
          <div className="flex items-center justify-center h-14 rounded-xl border border-dashed border-slate-200 bg-white text-[11px] text-slate-400">
            No tickets
          </div>
        ) : (
          tickets.map((t) => (
            <TicketCard
              key={t.ticket_Id || t.id}
              ticket={t}
              active={(t.ticket_Id || t.id) === selectedId}
              onClick={() => onSelectTicket(t)}
              currentUser={currentUser}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const ITHelpdeskComp = ({
  loading,
  tickets,
  selectedTicket,
  setSelectedTicket,
  createOpen,
  setCreateOpen,
  createForm,
  setCreateForm,
  createErrors,
  enrollForm,
  setEnrollForm,
  enrollErrors,
  strikeForm,
  setStrikeForm,
  strikeErrors,
  responseForm,
  setResponseForm,
  historyData,
  discussionsData,
  strikesData,
  employeeOptions,
  engineerOptions,
  currentUser,
  isIT,
  isHR,
  canUpdateTicket,
  onOpenCreate,
  onCreateTicket,
  onEnrollTicket,
  onReassignTicket,
  onStatusChange,
  onSendStrike,
  onUpdateStrikeResponse,
  onSendMessage,
  onDownloadFile,
  onRefreshTickets,
  onRefreshHistory,
  onRefreshDiscussions,
  // org filter — passed from page or managed here
  orgFilter: orgFilterProp,
  setOrgFilter: setOrgFilterProp,
  onLogout,
}) => {
  // Local org filter if parent doesn't provide one
  const [localOrgFilter, setLocalOrgFilter] = React.useState("IML");
  const orgFilter =
    orgFilterProp !== undefined ? orgFilterProp : localOrgFilter;
  const setOrgFilter = setOrgFilterProp || setLocalOrgFilter;

  const currentUserName = currentUser?.full_name || currentUser?.name || "";

  // ── Stats (all orgs for this dept) ──
  const stats = useMemo(() => {
    const base = tickets;
    const overdue = base.filter((t) => {
      const eta = t.eta_Date || t.etaDate;
      return (
        eta &&
        (t.status || "").toLowerCase() !== "closed" &&
        daysBetween(todayISO(), eta) < 0
      );
    }).length;
    return {
      total: base.length,
      open: base.filter((t) => (t.status || "").toLowerCase() === "open")
        .length,
      inProgress: base.filter(
        (t) => (t.status || "").toLowerCase() === "in progress",
      ).length,
      onHold: base.filter((t) => (t.status || "").toLowerCase() === "on hold")
        .length,
      waiting: base.filter(
        (t) => (t.status || "").toLowerCase() === "waiting for user input",
      ).length,
      closed: base.filter((t) => (t.status || "").toLowerCase() === "closed")
        .length,
      overdue,
    };
  }, [tickets]);

  // ── Filter tickets by org ──
  const visibleTickets = useMemo(() => {
    if (!orgFilter) return tickets;
    return tickets.filter((t) => (t.org || "") === orgFilter);
  }, [tickets, orgFilter]);

  // ── Build Kanban columns ──
  const kanbanCols = useMemo(() => {
    const norm = (t) => normalizeTicket(t);

    if (isHR) {
      return [
        {
          key: "hr_open",
          label: "Open",
          meta: STATUS_META["Open"],
          subtitle: "Awaiting HR",
          accentOpen: true,
          tickets: visibleTickets.filter(
            (t) =>
              !norm(t).enrolledByIT &&
              (t.status || "").toLowerCase() === "open",
          ),
        },
        {
          key: "hr_queue",
          label: "Queue",
          meta: STATUS_META["Queue"],
          subtitle: "In HR queue",
          tickets: visibleTickets.filter(
            (t) => (t.status || "").toLowerCase() === "queue",
          ),
        },
        {
          key: "hr_assigned",
          label: "Assigned",
          meta: STATUS_META["Assigned"],
          subtitle: "HR assigned",
          accentPersonal: true,
          tickets: visibleTickets.filter(
            (t) => (t.status || "").toLowerCase() === "assigned",
          ),
        },
        {
          key: "hr_inprogress",
          label: "In Progress",
          meta: STATUS_META["In Progress"],
          subtitle: "My active work",
          accentPersonal: true,
          tickets: visibleTickets.filter((t) => {
            const n = norm(t);
            return (
              n.itAssignees?.includes(currentUserName) &&
              (t.status || "").toLowerCase() === "in progress"
            );
          }),
        },
        {
          key: "hr_closed",
          label: "Closed",
          meta: STATUS_META["Closed"],
          subtitle: null,
          tickets: visibleTickets.filter(
            (t) => (t.status || "").toLowerCase() === "closed",
          ),
        },
      ];
    }

    // IT columns
    const openUnassigned = visibleTickets.filter((t) => {
      const n = norm(t);
      return !n.enrolledByIT && (t.status || "").toLowerCase() === "open";
    });

    const queueTickets = visibleTickets.filter((t) => {
      const n = norm(t);
      return (
        n.enrolledByIT &&
        n.itAssignees?.length > 0 &&
        (t.status || "").toLowerCase() !== "closed"
      );
    });

    const assignedToMeNotStarted = visibleTickets.filter((t) => {
      const n = norm(t);
      return (
        n.itAssignees?.includes(currentUserName) &&
        n.enrolledByIT &&
        !STARTED_STATUSES.map((s) => s.toLowerCase()).includes(
          (t.status || "").toLowerCase(),
        ) &&
        (t.status || "").toLowerCase() !== "closed"
      );
    });

    const inProgressMine = visibleTickets.filter((t) => {
      const n = norm(t);
      return (
        n.itAssignees?.includes(currentUserName) &&
        STARTED_STATUSES.map((s) => s.toLowerCase()).includes(
          (t.status || "").toLowerCase(),
        )
      );
    });

    // Extra status columns
    const extraStatuses = [
      "IT Testing",
      "Ready for Demo",
      "User Testing",
      "Waiting for User Input",
      "On Hold",
      "Closed",
    ].filter((s) =>
      visibleTickets.some(
        (t) => (t.status || "").toLowerCase() === s.toLowerCase(),
      ),
    );

    const cols = [
      {
        key: "open_unassigned",
        label: "Open",
        meta: STATUS_META["Open"],
        subtitle: "Awaiting assignment",
        accentOpen: true,
        tickets: openUnassigned,
      },
      {
        key: "queue",
        label: "Queue",
        meta: {
          dot: "bg-slate-400",
          txt: "text-slate-600",
          chip: "bg-slate-100 text-slate-600",
          Icon: List,
        },
        subtitle: "All assigned",
        tickets: queueTickets,
      },
      {
        key: "assigned_me",
        label: "Assigned to Me",
        meta: STATUS_META["Assigned"],
        subtitle: "Not yet started",
        accentPersonal: true,
        tickets: assignedToMeNotStarted,
      },
      {
        key: "in_progress_me",
        label: "In Progress",
        meta: STATUS_META["In Progress"],
        subtitle: "My active work",
        accentPersonal: true,
        tickets: inProgressMine,
      },
      ...extraStatuses.map((s) => ({
        key: s,
        label: s,
        meta: STATUS_META[s] || STATUS_META["Open"],
        subtitle: null,
        tickets: visibleTickets.filter(
          (t) => (t.status || "").toLowerCase() === s.toLowerCase(),
        ),
      })),
    ];

    return cols;
  }, [visibleTickets, isHR, currentUserName]);

  const isHRDept = isHR;
  const deptLabel = isHRDept ? "HR Department" : "IT Department";
  const selectedId = selectedTicket
    ? selectedTicket.ticket_Id || selectedTicket.id
    : null;

  return (
    <>
      <style>{`
        .kanban-scroll::-webkit-scrollbar { width: 4px; }
        .kanban-scroll::-webkit-scrollbar-track { background: transparent; }
        .kanban-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
      `}</style>

      <div className="h-screen overflow-hidden bg-slate-100 text-slate-900 flex flex-col">
        {/* ── Header ── */}
        <header className="flex-none border-b border-slate-200 bg-white shadow-sm">
          <div className="mx-auto max-w-[1900px] px-5 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Left: logo + title */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center flex-none">
                  {isHRDept ? (
                    <Briefcase className="w-4 h-4 text-white" />
                  ) : (
                    <Wrench className="w-4 h-4 text-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-extrabold tracking-tight text-slate-900 leading-tight">
                    {isHRDept ? "HR" : "IT"} Helpdesk · Enlife System
                  </h1>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Category-driven ticket management
                  </p>
                </div>
              </div>

              {/* Right: user badge + new ticket + logout */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 border ${isHRDept ? "border-indigo-200 bg-indigo-50" : "border-blue-200 bg-blue-50"}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${isHRDept ? "bg-indigo-500" : "bg-blue-500"} text-white`}
                  >
                    {currentUser?.avatar ||
                      (currentUserName
                        ? currentUserName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                        : "?")}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 leading-none">
                      {currentUserName || "—"}
                    </p>
                    <p
                      className={`text-[10px] font-semibold ${isHRDept ? "text-indigo-600" : "text-blue-600"}`}
                    >
                      {deptLabel}
                    </p>
                  </div>
                  {currentUser?.org && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${ORG_PILL[currentUser.org] || "bg-slate-100 text-slate-600"}`}
                    >
                      {currentUser.org}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onOpenCreate(isHRDept ? "HR" : "IT")}
                  className={`inline-flex h-9 items-center gap-2 rounded-xl px-4 text-sm font-bold text-white ${isHRDept ? "bg-indigo-600 hover:bg-indigo-700" : "bg-slate-900 hover:bg-slate-800"} transition-colors`}
                >
                  <Plus className="h-4 w-4" />
                  New Ticket
                </button>

                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}

                {!onLogout && (
                  <button
                    onClick={onRefreshTickets}
                    disabled={loading}
                    className="h-9 px-4 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Refresh"
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Stats + Org filter row */}
            <div className="mt-3 flex items-center justify-between flex-wrap gap-3">
              {/* Org filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Org:
                </span>
                {ORGS.map((org) => (
                  <button
                    key={org}
                    onClick={() => setOrgFilter(org)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                      orgFilter === org
                        ? (ORG_PILL[org] || "bg-slate-100 text-slate-700") +
                          " shadow-sm"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {org}
                  </button>
                ))}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-2">
                <StatBox
                  label="Total"
                  value={stats.total}
                  colorClass="bg-slate-50 border-slate-200 text-slate-700"
                />
                <StatBox
                  label="Open"
                  value={stats.open}
                  colorClass="bg-slate-50 border-slate-200 text-slate-700"
                />
                <StatBox
                  label="Progress"
                  value={stats.inProgress}
                  colorClass="bg-blue-50 border-blue-200 text-blue-700"
                />
                <StatBox
                  label="On Hold"
                  value={stats.onHold}
                  colorClass="bg-amber-50 border-amber-200 text-amber-700"
                />
                <StatBox
                  label="Waiting"
                  value={stats.waiting}
                  colorClass="bg-orange-50 border-orange-200 text-orange-700"
                />
                <StatBox
                  label="Closed"
                  value={stats.closed}
                  colorClass="bg-slate-50 border-slate-200 text-slate-700"
                />
                <StatBox
                  label="Overdue"
                  value={stats.overdue}
                  colorClass="bg-red-50 border-red-200 text-red-700"
                />
              </div>
            </div>
          </div>
        </header>

        {/* ── Kanban Board ── */}
        <main className="flex-1 overflow-x-auto overflow-y-hidden p-4 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div
              className="flex gap-3 h-full"
              style={{ minWidth: `${kanbanCols.length * 215}px` }}
            >
              {kanbanCols.map((col) => (
                <KanbanColumn
                  key={col.key}
                  col={col}
                  tickets={col.tickets}
                  selectedId={selectedId}
                  onSelectTicket={setSelectedTicket}
                  currentUser={currentUser}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ── Create Modal ── */}
      {createOpen && (
        <CreateTicketModal
          form={createForm}
          errors={createErrors}
          currentUser={currentUser}
          tickets={tickets}
          employeeOptions={employeeOptions}
          onChange={setCreateForm}
          onClose={() => setCreateOpen(false)}
          onSubmit={onCreateTicket}
        />
      )}

      {/* ── Ticket Detail Modal ── */}
      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          currentUser={currentUser}
          isIT={isIT}
          isHR={isHR}
          canUpdateTicket={canUpdateTicket}
          enrollForm={enrollForm}
          setEnrollForm={setEnrollForm}
          enrollErrors={enrollErrors}
          strikeForm={strikeForm}
          setStrikeForm={setStrikeForm}
          strikeErrors={strikeErrors}
          responseForm={responseForm}
          setResponseForm={setResponseForm}
          historyData={historyData}
          discussionsData={discussionsData}
          strikesData={strikesData}
          engineerOptions={engineerOptions}
          onClose={() => setSelectedTicket(null)}
          onEnrollTicket={onEnrollTicket}
          onReassignTicket={onReassignTicket}
          onStatusChange={onStatusChange}
          onSendStrike={onSendStrike}
          onUpdateStrikeResponse={onUpdateStrikeResponse}
          onSendMessage={onSendMessage}
          onDownloadFile={onDownloadFile}
          onRefreshDiscussions={onRefreshDiscussions}
        />
      )}
    </>
  );
};

export default ITHelpdeskComp;
