import { Bell, MessageSquareText, User, UserCheck } from "lucide-react";
import {
  getCatMeta,
  etaBadge,
  getStrikeGroups,
} from "../../utils/helpdeskUtils";
import {
  STATUS_META,
  PRIORITY_PILL,
  ORG_PILL,
} from "../../constants/helpdeskConstants";
import { HRPill } from "./SharedUI";

export default function TicketCard({
  ticket,
  active,
  onClick,
  currentUserName,
}) {
  const isHRTicket = ticket.ticketDept === "HR";
  const badge = etaBadge(ticket);
  const groups = getStrikeGroups(ticket.strikes || []);
  const ag =
    groups.length > 0 &&
    !groups[groups.length - 1].every(
      (s) => s.response_Received || s.responseReceived,
    )
      ? groups[groups.length - 1]
      : null;
  const isAssigned =
    currentUserName && ticket.itAssignees?.includes(currentUserName);

  // Category display from catalog fields
  const catDisplay =
    ticket.catalogParent || ticket.catalogCategory || ticket.category || null;
  const subDisplay =
    ticket.catalogSubCategory &&
    ticket.catalogSubCategory !== ticket.catalogParent
      ? ticket.catalogSubCategory
      : null;

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border bg-white p-2.5 text-left shadow-sm transition-all duration-150 ${active ? "border-slate-800 ring-2 ring-slate-200 shadow-md" : "border-slate-200 hover:border-slate-300 hover:shadow"}`}
    >
      {/* Row 1: Org FIRST, then dept/category pill, then type, priority right */}
      <div className="flex items-center gap-1 mb-1.5 flex-wrap">
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border flex-none ${ORG_PILL[ticket.org] || "bg-slate-100 text-slate-600 border-slate-200"}`}
        >
          {ticket.org}
        </span>
        {isHRTicket ? (
          <HRPill small />
        ) : catDisplay ? (
          <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full border flex-none bg-slate-100 text-slate-700 border-slate-200 truncate max-w-[90px]">
            {catDisplay}
          </span>
        ) : null}
        {ticket.ticketType && (
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-none ${ticket.ticketType === "Incident" ? "bg-red-100 text-red-700 border border-red-200" : "bg-sky-100 text-sky-700 border border-sky-200"}`}
          >
            {ticket.ticketType}
          </span>
        )}
        {ticket.priority && (
          <span
            className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-none ${PRIORITY_PILL[ticket.priority] || ""}`}
          >
            {ticket.priority}
          </span>
        )}
      </div>
      <p className="text-[13px] font-semibold text-slate-800 truncate mb-1">
        {ticket.description}
      </p>
      {(catDisplay || subDisplay) && (
        <div className="flex items-center gap-1 mb-1 flex-wrap">
          {catDisplay && (
            <span className="text-[9px] font-semibold px-1 py-0.5 rounded bg-slate-100 text-slate-500 truncate max-w-[80px]">
              {catDisplay}
            </span>
          )}
          {subDisplay && (
            <>
              <ChevronRight className="w-2 h-2 text-slate-300" />
              <span className="text-[9px] font-semibold px-1 py-0.5 rounded bg-emerald-50 text-emerald-600 truncate max-w-[80px]">
                {subDisplay}
              </span>
            </>
          )}
        </div>
      )}
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
      {ticket.itAssignees?.length > 0 && (
        <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
          <UserCheck className="w-2.5 h-2.5" />
          <span className={isAssigned ? "text-blue-600 font-semibold" : ""}>
            {ticket.itAssignees.join(", ")}
          </span>
        </div>
      )}
      {ag &&
        ag.length > 0 &&
        ag.every((s) => !(s.response_Received || s.responseReceived)) && (
          <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-orange-700 bg-orange-50 rounded-lg px-2 py-1 border border-orange-200">
            <Bell className="w-2.5 h-2.5" />
            {ag.length}/3 follow-ups · no response
          </div>
        )}
      {ticket.messages?.length > 0 && (
        <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
          <MessageSquareText className="w-2.5 h-2.5" />
          <span>
            {ticket.messages.length} msg
            {ticket.messages.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}
      <div className="mt-1">
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${(STATUS_META[ticket.status] || STATUS_META["Open"]).chip}`}
        >
          {ticket.status}
        </span>
      </div>
    </button>
  );
}
