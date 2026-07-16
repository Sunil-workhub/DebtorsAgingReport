// src/components/itHelpdesk/TicketModal.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  X,
  User,
  CalendarDays,
  UserCheck,
  Paperclip,
  Clock3,
  CheckCircle2,
  Bell,
  RefreshCw,
  Send,
  AlertCircle,
  Timer,
  XCircle,
  ChevronDown,
  History,
  FileText,
  Tag,
  ArrowRight,
  Download,
  MessageSquare,
} from "lucide-react";

const PRIORITIES = ["Critical", "High", "Medium", "Normal", "Low"];

const STATUS_OPTIONS = [
  "Open",
  "Requirement",
  "Discussion",
  "Queue",
  "Assigned",
  "In Progress",
  "IT Testing",
  "Ready for Demo",
  "User Testing",
  "Waiting for User Input",
  "Closed",
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

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-700 mt-1 break-words">
        {value || "-"}
      </p>
    </div>
  );
}

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  })} ${date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })}`;
};

const TicketModal = ({
  ticket,
  currentUser,
  isIT,
  isHR,
  canUpdateTicket,
  enrollForm,
  setEnrollForm,
  enrollErrors,
  strikeForm,
  setStrikeForm,
  strikeErrors,
  responseForm,
  setResponseForm,
  historyData = [],
  discussionsData = [],
  strikesData = [],
  engineerOptions = [],
  onClose,
  onEnrollTicket,
  onReassignTicket,
  onStatusChange,
  onSendStrike,
  onUpdateStrikeResponse,
  onSendMessage,
  onDownloadFile,
  onRefreshDiscussions,
}) => {
  const [tab, setTab] = useState("details");
  const [statusName, setStatusName] = useState(ticket?.status || "");
  const [statusRemarks, setStatusRemarks] = useState("");
  const [reassignUsers, setReassignUsers] = useState([]);
  const [showReassign, setShowReassign] = useState(false);
  const [messageText, setMessageText] = useState("");

  const discussionEndRef = useRef(null);
  const discussionIntervalRef = useRef(null);

  const isClosed = String(ticket?.status || "").toLowerCase() === "closed";
  const isWaiting =
    String(ticket?.status || "").toLowerCase() === "waiting for user input";
  const readOnly = !canUpdateTicket;

  const submittedByLabel = useMemo(() => {
    return (
      ticket?.submitted_By_Name ||
      ticket?.submittedBy ||
      ticket?.submitted_By ||
      "-"
    );
  }, [ticket]);

  const assignedLabel = useMemo(() => {
    return ticket?.assigned_Person || "-";
  }, [ticket]);

  // Auto-scroll discussions to bottom
  useEffect(() => {
    if (tab === "discussion" && discussionEndRef.current) {
      discussionEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [discussionsData, tab]);

  // Auto-refresh discussions every 20 seconds when discussion tab is active
  useEffect(() => {
    if (tab === "discussion" && ticket?.ticket_Id && onRefreshDiscussions) {
      // Initial fetch
      onRefreshDiscussions(ticket.ticket_Id);

      // Set up interval
      discussionIntervalRef.current = setInterval(() => {
        onRefreshDiscussions(ticket.ticket_Id);
      }, 20000); // 20 seconds

      return () => {
        if (discussionIntervalRef.current) {
          clearInterval(discussionIntervalRef.current);
        }
      };
    } else {
      // Clear interval when tab changes or modal closes
      if (discussionIntervalRef.current) {
        clearInterval(discussionIntervalRef.current);
      }
    }
  }, [tab, ticket?.ticket_Id]);

  const handleToggleReassign = (value) => {
    setReassignUsers((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    onSendMessage(messageText);
    setMessageText("");
  };

  const handleDownload = () => {
    if (ticket?.file_Path && ticket?.file_Name) {
      onDownloadFile(ticket.file_Path, ticket.file_Name);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-6xl max-h-[94vh] bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-100">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                {ticket?.ticket_No || `#${ticket?.ticket_Id}`}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                {ticket?.dept || "-"}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                {ticket?.status || "-"}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                {ticket?.req_Type || "-"}
              </span>
              {ticket?.priority ? (
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                  {ticket.priority}
                </span>
              ) : null}
              {ticket?.org ? (
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                  {ticket.org}
                </span>
              ) : null}
            </div>

            <h2 className="text-lg font-extrabold text-slate-900 leading-snug">
              {ticket?.description || "-"}
            </h2>

            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 rounded-full px-2.5 py-1 text-xs font-medium">
                <User className="w-3 h-3" />
                {submittedByLabel}
              </span>

              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 rounded-full px-2.5 py-1 text-xs font-medium">
                <CalendarDays className="w-3 h-3" />
                Submitted {formatDate(ticket?.submitted_At)}
              </span>

              {assignedLabel !== "-" ? (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-1 text-xs font-medium">
                  <UserCheck className="w-3 h-3" />
                  {assignedLabel}
                </span>
              ) : null}

              {ticket?.file_Name ? (
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-1 hover:bg-blue-100 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  {ticket.file_Name}
                </button>
              ) : null}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 flex-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <InfoBox
              label="Ticket ID"
              value={ticket?.ticket_No || ticket?.ticket_Id}
            />
            <InfoBox label="Category" value={ticket?.category || "-"} />
            <InfoBox label="Project" value={ticket?.project_Module || "-"} />
            <InfoBox label="Impact" value={ticket?.impact || "-"} />
            <InfoBox label="ETA Date" value={formatDate(ticket?.eta_Date)} />
            <InfoBox label="ETA Time" value={ticket?.eta_Time || "-"} />
            <InfoBox
              label="Updated By"
              value={ticket?.updated_By_Name || "-"}
            />
            <InfoBox label="Remarks" value={ticket?.remarks || "-"} />
          </div>
        </div>

        <div className="px-6 pt-4">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {["details", "discussion", "history"].map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                  tab === item
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tab === "details" && (
            <div className="space-y-5">
              {readOnly && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-700">
                    View only mode
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Only IT and HR engineer/admin users can update tickets.
                  </p>
                </div>
              )}

              {!ticket?.assigned_Person && canUpdateTicket && !isClosed && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <UserCheck className="w-4 h-4 text-amber-700" />
                    <p className="text-sm font-bold text-amber-800">
                      Enroll Ticket
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Priority" error={enrollErrors?.priority}>
                      <div className="grid grid-cols-3 gap-2">
                        {PRIORITIES.map((priority) => (
                          <button
                            key={priority}
                            type="button"
                            onClick={() =>
                              setEnrollForm((prev) => ({
                                ...prev,
                                priority,
                              }))
                            }
                            className={`h-10 rounded-xl border text-xs font-bold transition-all ${
                              enrollForm?.priority === priority
                                ? "bg-slate-900 text-white border-slate-900"
                                : "border-slate-300 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {priority}
                          </button>
                        ))}
                      </div>
                    </Field>

                    <Field label="Request Type" error={enrollErrors?.req_type}>
                      <div className="grid grid-cols-2 gap-2">
                        {["Service Request", "Incident"].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() =>
                              setEnrollForm((prev) => ({
                                ...prev,
                                req_type: type,
                              }))
                            }
                            className={`h-10 rounded-xl border text-xs font-bold transition-all ${
                              enrollForm?.req_type === type
                                ? "bg-slate-900 text-white border-slate-900"
                                : "border-slate-300 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </Field>
                  </div>

                  <div className="mt-4">
                    <Field
                      label="Assign Engineer(s)"
                      error={enrollErrors?.assigned_person}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {engineerOptions.map((eng) => {
                          const value = String(
                            eng.emp_Id || eng.emp_No || eng.emp_Name,
                          );
                          const selected =
                            enrollForm?.assigned_person?.includes(value);

                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => {
                                setEnrollForm((prev) => {
                                  const list = prev.assigned_person || [];
                                  const exists = list.includes(value);

                                  return {
                                    ...prev,
                                    assigned_person: exists
                                      ? list.filter((item) => item !== value)
                                      : [...list, value],
                                  };
                                });
                              }}
                              className={`h-10 rounded-xl border px-3 text-left text-sm font-semibold transition-all ${
                                selected
                                  ? "bg-blue-50 border-blue-300 text-blue-700"
                                  : "border-slate-300 text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {eng.emp_Name || value}
                            </button>
                          );
                        })}
                      </div>
                    </Field>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {enrollForm?.req_type === "Service Request" ? (
                      <Field label="ETA Date" error={enrollErrors?.eta_date}>
                        <input
                          type="date"
                          value={enrollForm?.eta_date || ""}
                          onChange={(e) =>
                            setEnrollForm((prev) => ({
                              ...prev,
                              eta_date: e.target.value,
                            }))
                          }
                          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:border-slate-400"
                        />
                      </Field>
                    ) : (
                      <Field
                        label="ETA Time (hours)"
                        error={enrollErrors?.eta_time}
                      >
                        <input
                          type="number"
                          min="1"
                          value={enrollForm?.eta_time || ""}
                          onChange={(e) =>
                            setEnrollForm((prev) => ({
                              ...prev,
                              eta_time: e.target.value,
                            }))
                          }
                          placeholder="e.g. 4"
                          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:border-slate-400"
                        />
                      </Field>
                    )}

                    <Field
                      label="Remarks"
                      error={enrollErrors?.remarks}
                      optional
                    >
                      <textarea
                        rows={3}
                        value={enrollForm?.remarks || ""}
                        onChange={(e) =>
                          setEnrollForm((prev) => ({
                            ...prev,
                            remarks: e.target.value,
                          }))
                        }
                        placeholder="Add assignment or processing remarks"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-slate-400 resize-none"
                      />
                    </Field>
                  </div>

                  <button
                    onClick={onEnrollTicket}
                    className="mt-4 h-11 w-full rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    Enroll Ticket
                  </button>
                </div>
              )}

              {canUpdateTicket && !isClosed && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <RefreshCw className="w-4 h-4 text-slate-700" />
                    <p className="text-sm font-bold text-slate-800">
                      Update Ticket
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Status">
                      <div className="relative">
                        <select
                          value={statusName}
                          onChange={(e) => setStatusName(e.target.value)}
                          className="h-11 w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:border-slate-400"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-3.5 w-4 h-4 text-slate-400" />
                      </div>
                    </Field>

                    <Field label="Status Remarks" optional>
                      <textarea
                        rows={3}
                        value={statusRemarks}
                        onChange={(e) => setStatusRemarks(e.target.value)}
                        placeholder="Reason / update note"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-slate-400 resize-none"
                      />
                    </Field>
                  </div>

                  <button
                    onClick={() => onStatusChange(statusName, statusRemarks)}
                    className="mt-4 h-11 w-full rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Update Status
                  </button>
                </div>
              )}

              {canUpdateTicket && !isClosed && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-slate-700" />
                      <p className="text-sm font-bold text-slate-800">
                        Reassign
                      </p>
                    </div>

                    <button
                      onClick={() => setShowReassign((prev) => !prev)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      {showReassign ? "Hide" : "Open"}
                    </button>
                  </div>

                  {showReassign && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {engineerOptions.map((eng) => {
                          const value = String(
                            eng.emp_Id || eng.emp_No || eng.emp_Name,
                          );
                          const selected = reassignUsers.includes(value);

                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => handleToggleReassign(value)}
                              className={`h-10 rounded-xl border px-3 text-left text-sm font-semibold transition-all ${
                                selected
                                  ? "bg-blue-50 border-blue-300 text-blue-700"
                                  : "border-slate-300 text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {eng.emp_Name || value}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => onReassignTicket(reassignUsers)}
                        disabled={!reassignUsers.length}
                        className="mt-4 h-11 w-full rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Reassign Ticket
                      </button>
                    </>
                  )}
                </div>
              )}

              {canUpdateTicket && isWaiting && !isClosed && (
                <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Bell className="w-4 h-4 text-orange-700" />
                    <p className="text-sm font-bold text-orange-800">
                      Send Strike
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Email" error={strikeErrors?.email}>
                      <input
                        type="text"
                        value={strikeForm?.email || ""}
                        onChange={(e) =>
                          setStrikeForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:border-orange-400"
                        placeholder="Enter email"
                      />
                    </Field>

                    <Field label="Note" error={strikeErrors?.note}>
                      <textarea
                        rows={3}
                        value={strikeForm?.note || ""}
                        onChange={(e) =>
                          setStrikeForm((prev) => ({
                            ...prev,
                            note: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 resize-none"
                        placeholder="Enter follow-up note"
                      />
                    </Field>
                  </div>

                  <button
                    onClick={onSendStrike}
                    className="mt-4 h-11 w-full rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 flex items-center justify-center gap-2"
                  >
                    <Bell className="w-4 h-4" />
                    Send Strike
                  </button>
                </div>
              )}

              {strikesData?.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Timer className="w-4 h-4 text-slate-700" />
                    <p className="text-sm font-bold text-slate-800">
                      Strike Responses
                    </p>
                  </div>

                  <div className="space-y-3">
                    {strikesData.map((strike) => {
                      const strikeId = strike?.strike_Id || strike?.id;
                      const responseValue =
                        responseForm?.[strikeId]?.response_note || "";

                      return (
                        <div
                          key={strikeId}
                          className="rounded-xl border border-slate-200 bg-white p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-bold text-slate-800">
                                Strike {strike?.strike_No || "-"}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {strike?.mail_Id || "-"}
                              </p>
                              <p className="text-xs text-slate-700 mt-2">
                                {strike?.strike_Note || "-"}
                              </p>
                            </div>

                            {strike?.response_Note ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
                                <CheckCircle2 className="w-3 h-3" />
                                Responded
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-[11px] font-bold">
                                <AlertCircle className="w-3 h-3" />
                                Pending
                              </span>
                            )}
                          </div>

                          {strike?.response_Note ? (
                            <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-800">
                              {strike.response_Note}
                            </div>
                          ) : canUpdateTicket ? (
                            <div className="mt-3 space-y-2">
                              <input
                                type="text"
                                value={responseValue}
                                onChange={(e) =>
                                  setResponseForm((prev) => ({
                                    ...prev,
                                    [strikeId]: {
                                      ...prev[strikeId],
                                      response_note: e.target.value,
                                      error: "",
                                    },
                                  }))
                                }
                                placeholder="Enter response note"
                                className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:border-emerald-400"
                              />
                              {responseForm?.[strikeId]?.error ? (
                                <p className="text-[11px] text-red-600">
                                  {responseForm[strikeId].error}
                                </p>
                              ) : null}
                              <button
                                onClick={() => onUpdateStrikeResponse(strikeId)}
                                className="h-10 px-4 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700"
                              >
                                Update Response
                              </button>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "discussion" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 max-h-96 overflow-y-auto">
                {!discussionsData?.length ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-600">
                      No discussions yet
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Start the conversation below
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {discussionsData.map((msg) => {
                      const isCurrentUser =
                        Number(msg?.message_By) === Number(currentUser?.emp_id);

                      return (
                        <div
                          key={msg?.discussion_Id || msg?.id}
                          className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                              isCurrentUser
                                ? "bg-blue-600 text-white"
                                : "bg-white border border-slate-200 text-slate-900"
                            }`}
                          >
                            <p
                              className={`text-[10px] font-bold mb-1 ${
                                isCurrentUser
                                  ? "text-blue-100"
                                  : "text-slate-500"
                              }`}
                            >
                              {msg?.message_By_Name || "Unknown"}
                            </p>
                            <p className="text-sm">{msg?.message_Text}</p>
                            <p
                              className={`text-[10px] mt-1 ${
                                isCurrentUser
                                  ? "text-blue-200"
                                  : "text-slate-400"
                              }`}
                            >
                              {formatDateTime(msg?.message_At)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={discussionEndRef} />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm focus:outline-none focus:border-blue-400"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="h-11 px-5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>

              <p className="text-xs text-slate-400 text-center">
                Auto-refreshing every 20 seconds
              </p>
            </div>
          )}

          {tab === "history" && (
            <div className="space-y-3">
              {!historyData?.length ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                  <History className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-600">
                    No history found
                  </p>
                </div>
              ) : (
                historyData.map((item, index) => (
                  <div
                    key={item?.history_Id || index}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-slate-800">
                        {item?.action_Type || "-"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDateTime(item?.created_At || item?.action_At)}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
                      <InfoBox
                        label="Old Value"
                        value={item?.old_Value || "-"}
                      />
                      <InfoBox
                        label="New Value"
                        value={item?.new_Value || "-"}
                      />
                      <InfoBox
                        label="Action By"
                        value={item?.action_By_Name || item?.action_By || "-"}
                      />
                    </div>

                    {item?.remarks ? (
                      <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-700">
                        {item.remarks}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            Logged in as{" "}
            <span className="font-bold">
              {currentUser?.full_name ||
                `${currentUser?.first_name || ""} ${currentUser?.last_name || ""}`.trim() ||
                "-"}
            </span>
          </p>

          <button
            onClick={onClose}
            className="h-10 px-4 rounded-xl border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
