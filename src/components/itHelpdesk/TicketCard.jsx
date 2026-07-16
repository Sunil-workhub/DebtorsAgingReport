import {
  Bell,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Database,
  FlaskConical,
  HardDrive,
  Inbox,
  List,
  MessageSquareText,
  PlayCircle,
  TestTube,
  Timer,
  User,
  UserCheck,
  WifiOff,
  XCircle,
  Zap,
} from "lucide-react";

// ─── META HELPERS ─────────────────────────────────────────────────────────────

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
  Open: { chip: "bg-slate-100 text-slate-600", Icon: Inbox },
  Requirement: { chip: "bg-blue-100 text-blue-700", Icon: List },
  Discussion: {
    chip: "bg-purple-100 text-purple-700",
    Icon: MessageSquareText,
  },
  Queue: { chip: "bg-indigo-100 text-indigo-700", Icon: List },
  Assigned: { chip: "bg-blue-100 text-blue-700", Icon: UserCheck },
  "In Progress": { chip: "bg-blue-100 text-blue-700", Icon: Clock3 },
  "On Hold": { chip: "bg-amber-100 text-amber-700", Icon: Timer },
  "Waiting for User Input": {
    chip: "bg-orange-100 text-orange-700",
    Icon: Timer,
  },
  "IT Testing": { chip: "bg-indigo-100 text-indigo-700", Icon: FlaskConical },
  "Ready for Demo": { chip: "bg-teal-100 text-teal-700", Icon: PlayCircle },
  "User Testing": { chip: "bg-amber-100 text-amber-700", Icon: TestTube },
  Closed: { chip: "bg-slate-100 text-slate-400", Icon: XCircle },
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
  if (ticket.status === "Closed")
    return {
      label: "Closed",
      cls: "bg-slate-100 text-slate-500 border border-slate-200",
    };
  if (!ticket.etaDate)
    return {
      label: "No ETA",
      cls: "bg-slate-100 text-slate-500 border border-slate-200",
    };
  const d = daysBetween(todayISO(), ticket.etaDate);
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
    if (cur.length === 3 && cur.every((x) => x.responseReceived)) {
      groups.push([...cur]);
      cur = [];
    }
  }
  if (cur.length) groups.push(cur);
  return groups;
};

function HRPill() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200 flex-none">
      <Briefcase className="w-2.5 h-2.5" />
      HR
    </span>
  );
}

// ─── TICKET CARD ──────────────────────────────────────────────────────────────

const TicketCard = ({ ticket, active, onClick, currentUser }) => {
  const isHRTicket = ticket.ticketDept === "HR";
  const cat =
    !isHRTicket && ticket.category ? CATEGORY_META[ticket.category] : null;
  const sm = STATUS_META[ticket.status] || STATUS_META["Open"];
  const badge = etaBadge(ticket);

  const groups = getStrikeGroups(ticket.strikes || []);
  const activeGroup =
    groups.length > 0 &&
    !groups[groups.length - 1].every((s) => s.responseReceived)
      ? groups[groups.length - 1]
      : [];

  const isAssigned =
    currentUser && ticket.itAssignees?.includes(currentUser.name);

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border bg-white p-2.5 text-left shadow-sm transition-all duration-150 ${
        active
          ? "border-slate-800 ring-2 ring-slate-200 shadow-md"
          : "border-slate-200 hover:border-slate-300 hover:shadow"
      }`}
    >
      {/* Row 1: Category / HR pill + Org + Type + Priority */}
      <div className="flex items-center gap-1 mb-1.5 flex-wrap">
        {isHRTicket ? (
          <HRPill />
        ) : cat ? (
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border flex-none ${cat.pill}`}
          >
            <cat.Icon className="w-2.5 h-2.5" />
            {cat.label}
          </span>
        ) : null}

        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-none ${ORG_PILL[ticket.org] || "bg-slate-100 text-slate-600"}`}
        >
          {ticket.org}
        </span>

        {ticket.ticketType && (
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-none ${
              ticket.ticketType === "Incident"
                ? "bg-red-100 text-red-700 border border-red-200"
                : "bg-sky-100 text-sky-700 border border-sky-200"
            }`}
          >
            {ticket.ticketType}
          </span>
        )}

        {ticket.priority && (
          <span
            className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-none ${PRIORITY_PILL[ticket.priority]}`}
          >
            {ticket.priority}
          </span>
        )}
      </div>

      {/* Row 2: Description */}
      <p className="text-[13px] font-semibold text-slate-800 truncate mb-1">
        {ticket.description}
      </p>

      {/* Row 3: Submitted by + ETA badge */}
      <div className="flex items-center gap-1.5 text-[10px]">
        <User className="w-2.5 h-2.5 text-slate-400 flex-none" />
        <span className="text-slate-500 truncate flex-1 min-w-0">
          {ticket.submittedBy}
          {ticket.onBehalfOf ? ` (for ${ticket.onBehalfOf})` : ""}
        </span>
        <span
          className={`font-semibold px-1.5 py-0.5 rounded-full flex-none ${badge.cls}`}
        >
          {badge.label}
        </span>
      </div>

      {/* Row 4: Status chip */}
      <div className="mt-1.5 flex items-center gap-1.5">
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${sm.chip}`}
        >
          {ticket.status}
        </span>

        {/* Submitted date */}
        <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-400 ml-auto">
          <CalendarDays className="w-2.5 h-2.5" />
          {fmt(ticket.submittedDate)}
        </span>
      </div>

      {/* Row 5: Assignees */}
      {ticket.itAssignees?.length > 0 && (
        <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
          <UserCheck className="w-2.5 h-2.5" />
          <span className={isAssigned ? "text-blue-600 font-semibold" : ""}>
            {ticket.itAssignees.join(", ")}
          </span>
        </div>
      )}

      {/* Row 6: Active strike group warning */}
      {activeGroup.length > 0 &&
        activeGroup.every((s) => !s.responseReceived) && (
          <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-orange-700 bg-orange-50 rounded-lg px-2 py-1 border border-orange-200">
            <Bell className="w-2.5 h-2.5" />
            {activeGroup.length}/3 follow-ups · no response
          </div>
        )}

      {/* Row 7: Message count */}
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
};

export default TicketCard;
