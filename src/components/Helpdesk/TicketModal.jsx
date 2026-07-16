import { useState, useEffect, useRef } from "react";
import {
  X,
  User,
  Users,
  CalendarDays,
  UserCheck,
  Paperclip,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  AlertCircle,
  Timer,
  Clock3,
  XCircle,
  BellOff,
  Bell,
  Mail,
  MessageSquareText,
  Send,
  EyeOff,
  SquareArrowOutUpRight,
  RefreshCw,
  ArrowLeftRight,
  Tag,
  PlayCircle,
  FlaskConical,
  TestTube,
} from "lucide-react";
import {
  getCatMeta,
  etaBadge,
  getImpactLabel,
  getStrikeGroups,
  daysBetween,
  todayISO,
  fmt,
  fmtTime,
} from "../../utils/helpdeskUtils";
import {
  STATUS_META,
  PRIORITY_PILL,
  ORG_PILL,
  HOLD_REASON_OPTIONS,
  FULL_FLOW_CATEGORIES,
  TESTING_STATUSES,
  HR_STATUSES,
} from "../../constants/helpdeskConstants";
import { Section, InfoBox, Field, HRPill, AssigneeDropdown } from "./SharedUI";
import EnrollSection from "./EnrollSection";

const PRIORITIES = ["Critical", "Medium", "Normal"];
const TICKET_TYPES = ["Service Request", "Incident"];

function getUser(userId, allUsers = []) {
  return allUsers.find((u) => u.id === userId);
}

export default function TicketModal({
  ticket,
  parent,
  linkedTickets,
  currentUser,
  isIT,
  isHR,
  canAct,
  onClose,
  onOpenLinked,
  enrollForm,
  setEnrollForm,
  enrollErrors,
  onEnroll,
  onMoveStatus,
  onPutOnHold,
  onWaitingForUserInput,
  onCloseTicket,
  strikeForm,
  setStrikeForm,
  strikeErrors,
  onSendStrike,
  responseForm,
  setResponseForm,
  onMarkResponse,
  onAutoClose,
  newMsg,
  setNewMsg,
  onSendMsg,
  allTickets,
  onReassign,
  onEditType,
  onEditPriority,
  historyItems,
  discussions,
  employees,
  loadingHistory,
  loadingDiscussions,
}) {
  const [tab, setTab] = useState("details");
  const isHRTicket = ticket.ticketDept === "HR";
  const sm = STATUS_META[ticket.status] || STATUS_META["Open"];
  const badge = etaBadge(ticket);
  const isClosed = ticket.status === "Closed";
  const isOnHold = ticket.status === "On Hold";
  const isWaiting = ticket.status === "Waiting for User Input";
  const isAssigned = ticket.status === "Assigned";
  const isIncident =
    ticket.ticketType === "Incident" || ticket.requestType === "Incident";
  const isFullFlowIT =
    !isHRTicket && FULL_FLOW_CATEGORIES.includes(ticket.category);
  const isReadOnly = (isIT || isHR) && !canAct && ticket.enrolledByIT;
  const endRef = useRef(null);

  // Status flow for progress bar
  const getFlow = () => {
    if (isHRTicket) return HR_STATUSES;
    if (FULL_FLOW_CATEGORIES.includes(ticket.category))
      return [
        "Open",
        "Requirement",
        "Discussion",
        "In Progress",
        "IT Testing",
        "Ready for Demo",
        "User Testing",
        "Closed",
      ];
    return ["Open", "In Progress", "Closed"];
  };
  const catFlow = getFlow();
  const curIdx = catFlow.indexOf(ticket.status);

  const nextStatuses =
    canAct && !isClosed && !isOnHold && !isWaiting && !isAssigned
      ? catFlow.filter(
          (s, i) =>
            i > curIdx &&
            s !== "Closed" &&
            s !== "Waiting for User Input" &&
            s !== "On Hold",
        )
      : [];

  const allStrikes = ticket.strikes || [];
  const groups = getStrikeGroups(allStrikes);
  const activeGroup =
    groups.length > 0 &&
    !groups[groups.length - 1].every(
      (s) => s.response_Received || s.responseReceived,
    )
      ? groups[groups.length - 1]
      : [];
  const canSendNext = isWaiting && activeGroup.length < 3;
  const allActiveNoReply =
    activeGroup.length === 3 &&
    activeGroup.every((s) => !(s.response_Received || s.responseReceived));
  const prevGroups = groups.length > 1 ? groups.slice(0, -1) : [];
  const lastGroupAllDone =
    groups.length > 0 &&
    groups[groups.length - 1].every(
      (s) => s.response_Received || s.responseReceived,
    );

  const TICKET_TYPES = ["Service Request", "Incident"];
  const initials = (name) =>
    name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  useEffect(() => {
    setTab("details");
  }, [ticket.id]);
  useEffect(() => {
    if (tab === "discussion")
      endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [discussions, tab]);

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box">
        {/* ── Header ── */}
        <div className="flex-none border-b border-slate-100 px-6 py-4">
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {/* Org always first */}
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${ORG_PILL[ticket.org] || "bg-slate-100 text-slate-600 border-slate-200"}`}
                >
                  {ticket.org}
                </span>
                {isHRTicket ? (
                  <HRPill />
                ) : ticket.catalogParent ? (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border bg-slate-100 text-slate-700 border-slate-200">
                    {ticket.catalogParent}
                  </span>
                ) : null}
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${sm.chip}`}
                >
                  {ticket.status}
                </span>
                {ticket.requestType && (
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${isIncident ? "bg-red-100 text-red-700 border-red-200" : "bg-sky-100 text-sky-700 border-sky-200"}`}
                  >
                    {ticket.requestType}
                  </span>
                )}
                {ticket.priority && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${PRIORITY_PILL[ticket.priority] || ""}`}
                  >
                    {ticket.priority}
                  </span>
                )}
                {ticket.type === "Linked Ticket" && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                    Linked
                  </span>
                )}
                {isReadOnly && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                    <EyeOff className="w-2.5 h-2.5" />
                    View Only
                  </span>
                )}
                {canAct && ticket.enrolledByIT && !isClosed && !isHRTicket && (
                  <>
                    <button
                      onClick={onEditType}
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-1"
                    >
                      <ArrowLeftRight className="w-2.5 h-2.5" />
                      Edit Type
                    </button>
                    <button
                      onClick={onEditPriority}
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 flex items-center gap-1"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      Edit Priority
                    </button>
                  </>
                )}
                {canAct && ticket.enrolledByIT && !isClosed && isHRTicket && (
                  <button
                    onClick={onEditPriority}
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    Edit Priority
                  </button>
                )}
              </div>
              <p className="text-base font-bold text-slate-900 leading-snug">
                {ticket.description}
              </p>
              {ticket.ticketNo && (
                <p className="text-xs text-slate-400 mono mt-0.5">
                  {ticket.ticketNo}
                </p>
              )}
              {/* Catalog breadcrumb */}
              {(ticket.catalogParent || ticket.catalogSubCategory) && (
                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                  {ticket.catalogParent && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                      {ticket.catalogParent}
                    </span>
                  )}
                  {ticket.catalogCategory &&
                    ticket.catalogCategory !== ticket.catalogParent && (
                      <>
                        <ChevronRight className="w-2.5 h-2.5 text-slate-300" />
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">
                          {ticket.catalogCategory}
                        </span>
                      </>
                    )}
                  {ticket.catalogSubCategory && (
                    <>
                      <ChevronRight className="w-2.5 h-2.5 text-slate-300" />
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                        {ticket.catalogSubCategory}
                      </span>
                    </>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 rounded-full px-2.5 py-1 text-xs font-medium">
                  <User className="w-3 h-3" />
                  {ticket.submittedBy}
                </span>
                {ticket.onBehalfOf && (
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-2.5 py-1 text-xs font-medium">
                    <Users className="w-3 h-3" />
                    On behalf of: {ticket.onBehalfOf}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 rounded-full px-2.5 py-1 text-xs font-medium">
                  <CalendarDays className="w-3 h-3" />
                  Submitted {fmt(ticket.submittedDate)}
                </span>
                {ticket.itAssignees?.length > 0 && (
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-1 text-xs font-medium">
                    <UserCheck className="w-3 h-3" />
                    {ticket.itAssignees.join(", ")}
                    {canAct && !isClosed && (
                      <button
                        onClick={onReassign}
                        className="ml-1 text-blue-500 hover:text-blue-700"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                )}
                {ticket.attachment && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-1">
                    <Paperclip className="w-3 h-3" />
                    {ticket.attachment.name}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 flex-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Active
              </p>
              <p className="text-sm font-bold text-slate-700 mt-0.5">
                {daysBetween(ticket.submittedDate, todayISO())}d
              </p>
            </div>
            <div className={`rounded-xl border px-3 py-2 ${badge.cls}`}>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                ETA
              </p>
              <p className="text-sm font-bold mt-0.5">{badge.label}</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Msgs
              </p>
              <p className="text-sm font-bold text-slate-700 mt-0.5">
                {discussions?.length || 0}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Strikes
              </p>
              <p className="text-sm font-bold text-slate-700 mt-0.5">
                {allStrikes.length}
              </p>
            </div>
          </div>
          {/* Status flow */}
          {catFlow.length > 0 && (
            <div className="mt-3 flex items-center gap-1 overflow-x-auto pb-1">
              {catFlow.map((s, i) => {
                const done = curIdx > i;
                const curr = ticket.status === s;
                const m = STATUS_META[s] || STATUS_META["Open"];
                return (
                  <div key={s} className="flex items-center gap-1 flex-none">
                    <div
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap ${curr ? m.chip + " border border-current/20" : done ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}
                    >
                      {done && "✓ "}
                      {s}
                    </div>
                    {i < catFlow.length - 1 && (
                      <ChevronRight className="w-3 h-3 text-slate-300 flex-none" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mt-3">
            {["details", "discussion", "history"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {t}
                {t === "discussion" && (discussions?.length || 0) > 0
                  ? ` (${discussions.length})`
                  : ""}
                {t === "history" && (historyItems?.length || 0) > 0
                  ? ` (${historyItems.length})`
                  : ""}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto thin-scroll min-h-0">
          {/* DETAILS */}
          {tab === "details" && (
            <div className="p-6 space-y-4">
              {isReadOnly && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-start gap-3">
                  <EyeOff className="w-5 h-5 text-slate-400 flex-none mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-slate-700">
                      View only — not assigned to you
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Assigned to{" "}
                      <span className="font-semibold">
                        {ticket.itAssignees?.join(", ")}
                      </span>
                      .
                    </p>
                  </div>
                </div>
              )}
              <Section title="Ticket Information">
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <InfoBox label="Submitted By" value={ticket.submittedBy} />
                  <InfoBox
                    label="Department"
                    value={isHRTicket ? "HR Department" : "IT Department"}
                  />
                  <InfoBox
                    label="Submitted Date"
                    value={fmt(ticket.submittedDate)}
                  />
                  <InfoBox label="Organisation" value={ticket.org} />
                  <InfoBox label="Request Type" value={ticket.requestType} />
                  {ticket.onBehalfOf && (
                    <InfoBox label="On Behalf Of" value={ticket.onBehalfOf} />
                  )}
                  {ticket.attachment && (
                    <InfoBox
                      label="Attachment"
                      value={ticket.attachment.name}
                    />
                  )}
                  <InfoBox
                    label="Ticket Type"
                    value={ticket.type || "Ticket"}
                  />
                  {ticket.parentId && (
                    <InfoBox
                      label="Parent Ticket"
                      value={`#${ticket.parentId}`}
                    />
                  )}
                  {ticket.catalogParent && (
                    <InfoBox label="Category" value={ticket.catalogParent} />
                  )}
                  {ticket.catalogCategory &&
                    ticket.catalogCategory !== ticket.catalogParent && (
                      <InfoBox
                        label="Sub-type"
                        value={ticket.catalogCategory}
                      />
                    )}
                  {ticket.catalogSubCategory && (
                    <InfoBox
                      label="Specific Item"
                      value={ticket.catalogSubCategory}
                    />
                  )}
                </div>
              </Section>

              {/* Linked tickets */}
              {(parent || linkedTickets?.length > 0) && (
                <Section title="Linked Tickets">
                  <div className="mt-3 space-y-2">
                    {parent && (
                      <button
                        onClick={() => onOpenLinked(parent.id)}
                        className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left hover:bg-slate-100"
                      >
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                            Parent
                          </p>
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {parent.description}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {parent.status}
                          </p>
                        </div>
                        <SquareArrowOutUpRight className="w-4 h-4 text-slate-400 flex-none ml-3" />
                      </button>
                    )}
                    {linkedTickets?.map((lt) => (
                      <button
                        key={lt.id}
                        onClick={() => onOpenLinked(lt.id)}
                        className="w-full flex items-center justify-between rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-left hover:bg-violet-100"
                      >
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-0.5">
                            Linked
                          </p>
                          <p className="text-sm font-semibold text-violet-900 truncate">
                            {lt.description}
                          </p>
                          <p className="text-xs text-violet-500 mt-0.5">
                            {lt.status} · ETA {fmt(lt.etaDate)}
                          </p>
                        </div>
                        <SquareArrowOutUpRight className="w-4 h-4 text-violet-400 flex-none ml-3" />
                      </button>
                    ))}
                  </div>
                </Section>
              )}

              {/* Enroll */}
              {(isIT || isHR) &&
                canAct &&
                !ticket.enrolledByIT &&
                ticket.status === "Open" && (
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
                                onClick={() =>
                                  setEnrollForm((f) => ({ ...f, priority: p }))
                                }
                                className={`h-8 px-3 rounded-lg border text-xs font-bold transition-all ${enrollForm.priority === p ? PRIORITY_PILL[p] + " shadow-sm" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </Field>
                        <Field
                          label="Request Type"
                          error={enrollErrors.ticketType}
                        >
                          <div className="flex gap-2">
                            {["Service Request", "Incident"].map((tt) => (
                              <button
                                key={tt}
                                onClick={() =>
                                  setEnrollForm((f) => ({
                                    ...f,
                                    ticketType: tt,
                                  }))
                                }
                                className={`flex-1 h-8 rounded-lg border text-xs font-bold transition-all ${enrollForm.ticketType === tt ? "bg-slate-900 text-white border-slate-900" : "border-slate-300 text-slate-600 hover:bg-slate-50"}`}
                              >
                                {tt}
                              </button>
                            ))}
                          </div>
                        </Field>
                      </div>
                      <AssigneeDropdown
                        value={enrollForm.itAssignees}
                        onChange={(v) =>
                          setEnrollForm((f) => ({ ...f, itAssignees: v }))
                        }
                        error={enrollErrors.itAssignees}
                        employees={employees}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Field
                          label="Start Date"
                          error={enrollErrors.itStartDate}
                        >
                          <input
                            type="date"
                            value={enrollForm.itStartDate}
                            onChange={(e) =>
                              setEnrollForm((p) => ({
                                ...p,
                                itStartDate: e.target.value,
                              }))
                            }
                            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:border-slate-400"
                          />
                        </Field>
                        {enrollForm.ticketType === "Incident" ? (
                          <Field
                            label="Expected Hours"
                            error={enrollErrors.etaHours}
                          >
                            <input
                              type="number"
                              min="1"
                              value={enrollForm.etaHours}
                              onChange={(e) =>
                                setEnrollForm((p) => ({
                                  ...p,
                                  etaHours: e.target.value,
                                }))
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
                                setEnrollForm((p) => ({
                                  ...p,
                                  etaDate: e.target.value,
                                }))
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
                            setEnrollForm((p) => ({
                              ...p,
                              itRemarks: e.target.value,
                            }))
                          }
                          placeholder="Scope, dependencies..."
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-slate-400 resize-none"
                        />
                      </Field>
                      <button
                        onClick={onEnroll}
                        className={`w-full h-11 rounded-xl text-sm font-bold text-white transition-colors flex items-center justify-center gap-2 ${isHRTicket ? "bg-indigo-600 hover:bg-indigo-700" : "bg-slate-900 hover:bg-slate-800"}`}
                      >
                        <UserCheck className="w-4 h-4" />
                        Enroll & Assign
                      </button>
                    </div>
                  </Section>
                )}

              {/* Enrollment details */}
              {ticket.enrolledByIT && (
                <Section title="Enrollment Details">
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <InfoBox label="Priority" value={ticket.priority} />
                    <InfoBox label="Request Type" value={ticket.requestType} />
                    <InfoBox label="Ticket Type" value={ticket.ticketType} />
                    <InfoBox
                      label="Start Date"
                      value={fmt(ticket.itStartDate)}
                    />
                    <InfoBox
                      label={isIncident ? "ETA (Hours)" : "ETA Date"}
                      value={
                        isIncident
                          ? ticket.etaHours
                            ? `${ticket.etaHours} hrs`
                            : "—"
                          : fmt(ticket.etaDate)
                      }
                    />
                    <InfoBox
                      label="Closing Date"
                      value={fmt(ticket.closingDate)}
                    />
                  </div>
                  <div className="mt-2 rounded-xl border border-slate-100 bg-white px-3 py-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Assignees
                    </p>
                    <p className="text-xs font-bold text-slate-700 mt-0.5">
                      {ticket.itAssignees?.join(", ") || "—"}
                    </p>
                  </div>
                  {ticket.itRemarks && (
                    <div className="mt-3 rounded-xl bg-white border border-slate-200 px-4 py-3 text-sm text-slate-700 italic">
                      "{ticket.itRemarks}"
                    </div>
                  )}
                </Section>
              )}

              {/* Hold/Waiting info */}
              {(isOnHold || isWaiting) && (
                <div
                  className={`rounded-2xl border p-4 ${isWaiting ? "border-orange-200 bg-orange-50" : "border-amber-200 bg-amber-50"}`}
                >
                  <p
                    className={`text-xs font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${isWaiting ? "text-orange-600" : "text-amber-600"}`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    {isWaiting
                      ? "Waiting for User Input — Reason"
                      : "Hold Reason"}
                  </p>
                  {ticket.holdReasonType && (
                    <p className="text-sm font-bold text-slate-800 mb-1">
                      {
                        HOLD_REASON_OPTIONS.find(
                          (o) => o.value === ticket.holdReasonType,
                        )?.label
                      }
                    </p>
                  )}
                  {ticket.holdRemarks && (
                    <p className="text-sm text-slate-700">
                      {ticket.holdRemarks}
                    </p>
                  )}
                </div>
              )}

              {/* Start work (Assigned status) */}
              {canAct && ticket.enrolledByIT && isAssigned && !isClosed && (
                <Section
                  title="Start Work"
                  subtitle="Move this ticket to In Progress when you begin working on it."
                  accent="amber"
                >
                  <div className="mt-3">
                    <button
                      onClick={() => onMoveStatus("In Progress")}
                      className="w-full h-11 rounded-xl bg-blue-600 text-sm font-bold text-white hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <Clock3 className="w-4 h-4" />
                      Move to In Progress
                    </button>
                  </div>
                </Section>
              )}

              {/* Three-strike follow-up */}
              {canAct && isWaiting && isFullFlowIT && (
                <Section
                  title="Three-Strike Follow-up"
                  accent="amber"
                  subtitle="Up to 3 follow-ups per round."
                >
                  <div className="mt-4 space-y-3">
                    {prevGroups.length > 0 && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 mb-2">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 mb-2">
                          Completed Rounds
                        </p>
                        {prevGroups.map((g, gi) => (
                          <div
                            key={gi}
                            className="flex items-center justify-between py-1.5 border-b border-emerald-100 last:border-0"
                          >
                            <span className="text-xs font-bold text-emerald-700">
                              Round {gi + 1}
                            </span>
                            <span className="text-[10px] text-emerald-600 mono">
                              {fmt(g[0].sent_At || g[0].sentDate)}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 rounded-full px-2 py-0.5">
                              All Responded
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {[1, 2, 3].map((num) => {
                      const strike = activeGroup.find(
                        (s) => (s.strike_No || s.strikeNumber) === num,
                      );
                      const isNext = !strike && activeGroup.length === num - 1;
                      const locked = !strike && !isNext;
                      const responded =
                        strike?.response_Received || strike?.responseReceived;
                      // Only the LAST sent strike (highest num) shows response option
                      const isLastSent =
                        strike &&
                        !responded &&
                        !activeGroup.some(
                          (s) => (s.strike_No || s.strikeNumber) > num,
                        );
                      return (
                        <div
                          key={num}
                          className={`rounded-xl border p-4 transition-all ${locked ? "bg-slate-50 border-slate-100 opacity-40" : responded ? "bg-emerald-50 border-emerald-200" : strike && !isLastSent ? "bg-slate-50 border-slate-200 opacity-70" : strike ? "bg-orange-50 border-orange-200" : "bg-white border-slate-200"}`}
                        >
                          <div className="flex items-center gap-2.5 mb-3">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-none ${responded ? "bg-emerald-500 text-white" : strike && !isLastSent ? "bg-slate-400 text-white" : strike ? "bg-orange-500 text-white" : isNext ? "bg-slate-200 text-slate-600" : "bg-slate-200 text-slate-400"}`}
                            >
                              {num}
                            </div>
                            <div className="flex-1 flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-slate-800">
                                Strike {num}
                              </span>
                              {strike && (
                                <span className="mono text-[11px] text-slate-500">
                                  Sent {fmt(strike.sent_At || strike.sentDate)}
                                </span>
                              )}
                              {(strike?.mail_Id || strike?.mailId) && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5">
                                  <Mail className="w-2.5 h-2.5" />
                                  {strike.mail_Id || strike.mailId}
                                </span>
                              )}
                              {responded && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                                  ✓ Response
                                </span>
                              )}
                              {strike && !responded && !isLastSent && (
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                                  Window Closed
                                </span>
                              )}
                              {strike && !responded && isLastSent && (
                                <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full border border-orange-200">
                                  No Reply
                                </span>
                              )}
                            </div>
                          </div>
                          {strike && (
                            <div className="bg-white/80 rounded-lg border border-slate-100 px-3 py-2 text-xs text-slate-700 italic mb-2">
                              "{strike.strike_Note || strike.note}"
                            </div>
                          )}
                          {responded && (
                            <div className="bg-emerald-100 border border-emerald-200 rounded-lg px-3 py-2 text-xs text-emerald-800">
                              <span className="font-bold">
                                Response (
                                {fmt(strike.response_At || strike.responseDate)}
                                ):
                              </span>{" "}
                              {strike.response_Note || strike.responseNote}
                            </div>
                          )}
                          {strike && !responded && !isLastSent && (
                            <div className="mt-2 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-xs text-slate-400 italic">
                              Response window closed — Strike {num + 1} was sent
                              without a reply.
                            </div>
                          )}
                          {strike && !responded && isLastSent && (
                            <div className="mt-2 space-y-2">
                              <input
                                type="text"
                                value={
                                  responseForm[strike.strike_Id || strike.id]
                                    ?.note || ""
                                }
                                onChange={(e) =>
                                  setResponseForm((p) => ({
                                    ...p,
                                    [strike.strike_Id || strike.id]: {
                                      ...p[strike.strike_Id || strike.id],
                                      note: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="Enter user's response note..."
                                className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs focus:outline-none focus:border-emerald-400"
                              />
                              {responseForm[strike.strike_Id || strike.id]
                                ?.error && (
                                <p className="text-[11px] text-red-600">
                                  {
                                    responseForm[strike.strike_Id || strike.id]
                                      .error
                                  }
                                </p>
                              )}
                              <button
                                onClick={() =>
                                  onMarkResponse(strike.strike_Id || strike.id)
                                }
                                className="w-full h-9 rounded-lg bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 flex items-center justify-center gap-1.5"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Mark Response Received
                              </button>
                            </div>
                          )}
                          {isNext && canSendNext && (
                            <div className="space-y-2">
                              <Field
                                label="Recipient Mail ID"
                                error={strikeErrors.mailId}
                              >
                                <div className="relative">
                                  <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                                  <input
                                    type="email"
                                    value={strikeForm.mailId}
                                    onChange={(e) =>
                                      setStrikeForm((p) => ({
                                        ...p,
                                        mailId: e.target.value,
                                      }))
                                    }
                                    placeholder="user@company.com"
                                    className="w-full h-9 rounded-lg border border-slate-300 bg-white pl-8 pr-3 text-xs focus:outline-none focus:border-orange-400"
                                  />
                                </div>
                              </Field>
                              <Field
                                label="Follow-up Message"
                                error={strikeErrors.note}
                              >
                                <textarea
                                  rows={2}
                                  value={strikeForm.note}
                                  onChange={(e) =>
                                    setStrikeForm((p) => ({
                                      ...p,
                                      note: e.target.value,
                                    }))
                                  }
                                  placeholder={`Strike ${num} follow-up...`}
                                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:outline-none focus:border-orange-400 resize-none"
                                />
                              </Field>
                              <button
                                onClick={onSendStrike}
                                className="w-full h-9 rounded-lg bg-orange-500 text-xs font-bold text-white hover:bg-orange-600 flex items-center justify-center gap-1.5"
                              >
                                <Bell className="w-3.5 h-3.5" />
                                Send Strike {num}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {allActiveNoReply && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <BellOff className="w-5 h-5 text-red-600 flex-none mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-red-800">
                              All 3 follow-ups unanswered
                            </p>
                            <p className="text-xs text-red-600 mt-0.5">
                              You may now close this ticket.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={onAutoClose}
                          className="w-full h-10 rounded-xl bg-red-600 text-sm font-bold text-white hover:bg-red-700 flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Close — No Response
                        </button>
                      </div>
                    )}
                    {lastGroupAllDone && activeGroup.length === 0 && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-none" />
                        All answered. Start a new round if needed.
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {/* Advance stage */}
              {canAct &&
                ticket.enrolledByIT &&
                !isClosed &&
                !isOnHold &&
                !isWaiting &&
                !isAssigned &&
                nextStatuses.length > 0 && (
                  <Section title="Advance Stage" subtitle="Move forward.">
                    <div className="mt-3 flex flex-wrap gap-2">
                      {nextStatuses.map((s) => {
                        const m = STATUS_META[s] || STATUS_META["Open"];
                        const SI = m.Icon;
                        return (
                          <button
                            key={s}
                            onClick={() => onMoveStatus(s)}
                            className={`flex items-center gap-2 h-9 px-4 rounded-xl border text-sm font-semibold transition-all hover:opacity-80 ${m.chip}`}
                          >
                            <SI className="w-4 h-4" />
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </Section>
                )}

              {/* Quick actions */}
              {canAct && ticket.enrolledByIT && !isClosed && !isAssigned && (
                <Section
                  title={isOnHold || isWaiting ? "Actions" : "Quick Actions"}
                >
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {!isOnHold && !isWaiting && isFullFlowIT && (
                      <>
                        <button
                          onClick={onPutOnHold}
                          className="flex items-center gap-2 h-9 px-4 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 text-sm font-semibold hover:bg-amber-200"
                        >
                          <AlertCircle className="w-4 h-4" />
                          Put On Hold
                        </button>
                        <button
                          onClick={onWaitingForUserInput}
                          className="flex items-center gap-2 h-9 px-4 rounded-xl bg-orange-100 text-orange-800 border border-orange-200 text-sm font-semibold hover:bg-orange-200"
                        >
                          <Timer className="w-4 h-4" />
                          Waiting for User Input
                        </button>
                      </>
                    )}
                    {(isOnHold || isWaiting) && (
                      <button
                        onClick={() => onMoveStatus("In Progress")}
                        className="flex items-center gap-2 h-9 px-4 rounded-xl bg-blue-100 text-blue-800 border border-blue-200 text-sm font-semibold hover:bg-blue-200"
                      >
                        <Clock3 className="w-4 h-4" />
                        Resume to In Progress
                      </button>
                    )}
                    <button
                      onClick={onCloseTicket}
                      className="flex items-center gap-2 h-9 px-4 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-900"
                    >
                      <XCircle className="w-4 h-4" />
                      Close Ticket
                    </button>
                    {ticket.itAssignees?.length > 0 && !isClosed && (
                      <button
                        onClick={onReassign}
                        className="flex items-center gap-2 h-9 px-4 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-sm font-semibold hover:bg-blue-100"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Reassign
                      </button>
                    )}
                  </div>
                </Section>
              )}
              {canAct && ticket.enrolledByIT && !isClosed && isAssigned && (
                <div className="flex gap-2">
                  <button
                    onClick={onCloseTicket}
                    className="flex items-center gap-2 h-9 px-4 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-900"
                  >
                    <XCircle className="w-4 h-4" />
                    Close Ticket
                  </button>
                  {ticket.itAssignees?.length > 0 && (
                    <button
                      onClick={onReassign}
                      className="flex items-center gap-2 h-9 px-4 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-sm font-semibold hover:bg-blue-100"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Reassign
                    </button>
                  )}
                </div>
              )}

              {/* Closed */}
              {isClosed && (
                <div
                  className={`rounded-2xl border p-4 ${ticket.autoClosedAfterStrikes ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"}`}
                >
                  <div className="flex items-start gap-3">
                    {ticket.autoClosedAfterStrikes ? (
                      <BellOff className="w-5 h-5 text-red-600 flex-none mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-none mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p
                        className={`text-sm font-bold ${ticket.autoClosedAfterStrikes ? "text-red-800" : "text-emerald-800"}`}
                      >
                        {ticket.autoClosedAfterStrikes
                          ? "Auto-Closed — 3 unanswered follow-ups"
                          : "Ticket Closed"}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${ticket.autoClosedAfterStrikes ? "text-red-600" : "text-emerald-600"}`}
                      >
                        Closed {fmt(ticket.closingDate)}
                      </p>
                      {ticket.closingNote && (
                        <div className="mt-2 rounded-xl bg-white/70 border border-current/10 px-3 py-2.5">
                          <p className="text-sm text-slate-700">
                            {ticket.closingNote}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DISCUSSION */}
          {tab === "discussion" && (
            <div className="flex flex-col" style={{ minHeight: "400px" }}>
              <div
                className="flex-1 overflow-y-auto thin-scroll p-5 space-y-3"
                style={{ minHeight: "300px" }}
              >
                {loadingDiscussions && (
                  <div className="flex items-center justify-center h-20 text-slate-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Loading…
                  </div>
                )}
                {!loadingDiscussions &&
                  (!discussions || discussions.length === 0) && (
                    <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                      <MessageSquareText className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm font-medium">No messages yet.</p>
                    </div>
                  )}
                {discussions?.map((msg) => {
                  const isSelf = msg.message_By === currentUser?.emp_Id;
                  const senderInitials = initials(msg.message_By_Name || "?");
                  return (
                    <div
                      key={msg.discussion_Id}
                      className={`flex items-end gap-2 ${isSelf ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex-none flex items-center justify-center text-[10px] font-black ${isSelf ? "bg-blue-500 text-white" : "bg-slate-600 text-white"}`}
                      >
                        {senderInitials}
                      </div>
                      <div
                        className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-slate-500">
                            {msg.message_By_Name}
                          </span>
                          <span className="text-[10px] text-slate-400 mono">
                            {fmtTime(msg.message_At)}
                          </span>
                        </div>
                        <div className={isSelf ? "cb-self" : "cb-user"}>
                          {msg.message_Text}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>
              {!isClosed ? (
                <div className="flex-none border-t border-slate-100 p-4">
                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      value={newMsg}
                      onChange={(e) => setNewMsg(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          onSendMsg();
                        }
                      }}
                      placeholder="Type a message… (Enter to send)"
                      className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:border-slate-400 resize-none"
                    />
                    <button
                      onClick={onSendMsg}
                      className="w-10 h-10 self-end rounded-xl bg-slate-900 flex items-center justify-center text-white hover:bg-slate-800 flex-none"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Sending as{" "}
                    <span className="font-bold">
                      {currentUser?.first_Name} {currentUser?.last_Name}
                    </span>
                  </p>
                </div>
              ) : (
                <div className="flex-none border-t border-slate-100 p-4 text-center text-xs text-slate-400 font-medium">
                  Discussion closed — ticket is closed.
                </div>
              )}
            </div>
          )}

          {/* HISTORY */}
          {tab === "history" && (
            <div className="p-5 space-y-2">
              {loadingHistory && (
                <div className="flex items-center justify-center h-20 text-slate-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Loading…
                </div>
              )}
              {!loadingHistory &&
                (!historyItems || historyItems.length === 0) && (
                  <div className="text-center text-sm text-slate-400 py-8">
                    No history yet.
                  </div>
                )}
              {[...(historyItems || [])].reverse().map((e, i) => {
                const statusVal = e.new_Value || e.status || "Open";
                const m = STATUS_META[statusVal] || STATUS_META["Open"];
                const SI = m.Icon;
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-none mt-0.5 ${m.chip}`}
                    >
                      <SI className="w-3 h-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-bold ${m.txt}`}>
                          {e.action_Type || statusVal}
                        </span>
                        <span className="mono text-[11px] text-slate-400 flex-none">
                          {fmt(e.action_At || e.date)}
                        </span>
                      </div>
                      {(e.old_Value || e.new_Value) && (
                        <p className="text-xs text-slate-600 mt-0.5">
                          {e.old_Value && (
                            <span className="text-slate-400">
                              {e.old_Value} →{" "}
                            </span>
                          )}
                          {e.new_Value}
                        </p>
                      )}
                      {(e.remarks || e.note) && (
                        <p className="text-xs text-slate-500 mt-0.5 italic">
                          {e.remarks || e.note}
                          {e.action_By_Name && (
                            <span className="text-slate-400">
                              {" "}
                              — {e.action_By_Name}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
