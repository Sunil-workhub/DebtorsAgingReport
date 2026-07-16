// src/components/itHelpdesk/TicketDetailsPanel.jsx
import React, { useMemo, useState } from "react";

const STATUS_OPTIONS = [
  "Open",
  "In Progress",
  "Waiting for User Input",
  "Closed",
];

const fmtDateTime = (iso) =>
  !iso
    ? "—"
    : new Date(iso).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

const fmtDate = (d) =>
  !d
    ? "—"
    : new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

export default function TicketDetailsPanel({
  ticket,
  history,
  discussions,
  strikes,
  employees,
  loading,
  currentUser,
  onEnroll,
  onReassign,
  onStatusChange,
  statusUpdating,
  onAddDiscussion,
  discussionSending,
  onSendStrike,
  strikeSending,
  onRespondStrike,
  respondingStrike,
  onDownloadFile,
}) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [messageText, setMessageText] = useState("");

  const [strikeMail, setStrikeMail] = useState("");
  const [strikeNote, setStrikeNote] = useState("");
  const [strikeError, setStrikeError] = useState("");

  const [responseNote, setResponseNote] = useState("");
  const [responseError, setResponseError] = useState("");

  const canAct = useMemo(() => {
    if (!ticket || !currentUser) return false;
    if (currentUser.role === "IT" && ticket.ticketDept === "IT") return true;
    if (currentUser.role === "HR" && ticket.ticketDept === "HR") return true;
    return false;
  }, [ticket, currentUser]);

  const lastStrike = useMemo(
    () => ((strikes || []).length ? strikes[strikes.length - 1] : null),
    [strikes],
  );

  const lastUnrespondedStrike = useMemo(
    () =>
      (strikes || [])
        .slice()
        .reverse()
        .find((s) => !s.response_Received) || null,
    [strikes],
  );

  const nextStrikeNo = useMemo(() => {
    if (!strikes || !strikes.length) return 1;
    const maxNo = strikes.reduce(
      (max, s) => Math.max(max, s.strike_No || 0),
      0,
    );
    return maxNo + 1;
  }, [strikes]);

  const handleStatusSubmit = () => {
    if (!ticket || !selectedStatus || selectedStatus === ticket.status) return;
    onStatusChange(ticket.id, ticket.status, selectedStatus, statusNote);
    setStatusNote("");
  };

  const handleSendMessage = () => {
    if (!ticket || !messageText.trim()) return;
    onAddDiscussion(ticket.id, messageText.trim());
    setMessageText("");
  };

  const handleSendStrike = () => {
    if (!ticket) return;
    const mail = strikeMail.trim();
    const note = strikeNote.trim();
    const errs = [];
    if (!mail) errs.push("Mail ID is required.");
    if (!note) errs.push("Strike note is required.");
    if (errs.length) {
      setStrikeError(errs.join(" "));
      return;
    }
    setStrikeError("");
    onSendStrike(ticket.id, nextStrikeNo, mail, note);
  };

  const handleRespondStrike = () => {
    if (!lastUnrespondedStrike) return;
    const note = responseNote.trim();
    if (!note) {
      setResponseError("Response note is required.");
      return;
    }
    setResponseError("");
    onRespondStrike(lastUnrespondedStrike.strike_Id, note);
    setResponseNote("");
  };

  if (!ticket) {
    return (
      <div className="h-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-400">
        Select a ticket to view details
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-xs text-slate-600">
        Loading details…
      </div>
    );
  }

  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-white flex flex-col">
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-1">
          Ticket #{ticket.ticketNo}
        </p>
        <p className="text-sm font-semibold text-slate-900 line-clamp-2">
          {ticket.description}
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          {ticket.ticketDept} · {ticket.requestType || "-"} ·{" "}
          {ticket.priority || "-"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-[11px]">
        {/* Basic info */}
        <section>
          <p className="font-bold text-slate-500 uppercase tracking-wide mb-1">
            Basic Info
          </p>
          <div className="space-y-0.5">
            <p>
              <span className="text-slate-400">Submitted by: </span>
              <span className="font-semibold text-slate-800">
                {ticket.submittedBy} ({ticket.submittedByEmpId})
              </span>
            </p>
            <p>
              <span className="text-slate-400">Org: </span>
              <span className="font-semibold text-slate-800">{ticket.org}</span>
            </p>
            <p>
              <span className="text-slate-400">Status: </span>
              <span className="font-semibold text-slate-800">
                {ticket.status}
              </span>
            </p>
            <p>
              <span className="text-slate-400">Submitted: </span>
              <span className="font-semibold text-slate-800">
                {fmtDate(ticket.submittedDate)}
              </span>
            </p>
            <p>
              <span className="text-slate-400">ETA Date: </span>
              <span className="font-semibold text-slate-800">
                {fmtDate(ticket.etaDate)}
              </span>
            </p>
          </div>
        </section>

        {/* Attachment */}
        {ticket.attachment && (
          <section>
            <p className="font-bold text-slate-500 uppercase tracking-wide mb-1">
              Attachment
            </p>
            <button
              type="button"
              onClick={() =>
                onDownloadFile(ticket.attachment.path, ticket.attachment.name)
              }
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
            >
              <span>{ticket.attachment.name}</span>
            </button>
          </section>
        )}

        {/* Actions */}
        <section>
          <p className="font-bold text-slate-500 uppercase tracking-wide mb-1">
            Actions
          </p>
          <div className="flex flex-wrap gap-2">
            {canAct && ticket.status === "Open" && (
              <button
                type="button"
                onClick={onEnroll}
                className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Enroll Ticket
              </button>
            )}
            {canAct && (
              <button
                type="button"
                onClick={onReassign}
                className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Reassign
              </button>
            )}
          </div>
        </section>

        {/* Status update */}
        {canAct && (
          <section>
            <p className="font-bold text-slate-500 uppercase tracking-wide mb-1">
              Update Status
            </p>
            <div className="space-y-1.5">
              <select
                value={selectedStatus || ticket.status}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full h-8 rounded-lg border border-slate-300 bg-white px-2 text-[11px] focus:outline-none focus:border-slate-400"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <textarea
                rows={2}
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Remarks (optional)"
                className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] resize-none focus:outline-none focus:border-slate-400"
              />
              <button
                type="button"
                onClick={handleStatusSubmit}
                disabled={statusUpdating}
                className="w-full h-8 rounded-lg bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800 disabled:opacity-60"
              >
                {statusUpdating ? "Updating…" : "Save Status"}
              </button>
            </div>
          </section>
        )}

        {/* Strikes / Follow-ups */}
        <section>
          <p className="font-bold text-slate-500 uppercase tracking-wide mb-1">
            Follow-ups (Strikes)
          </p>
          <div className="space-y-1 max-h-32 overflow-y-auto border border-slate-100 rounded-lg p-2 bg-slate-50">
            {!strikes || strikes.length === 0 ? (
              <p className="text-[11px] text-slate-400">
                No follow-ups sent yet.
              </p>
            ) : (
              strikes.map((s) => (
                <div
                  key={s.strike_Id}
                  className="border-b border-slate-100 last:border-0 pb-1 mb-1 last:pb-0 last:mb-0 text-[11px]"
                >
                  <p className="font-semibold text-slate-800">
                    Strike {s.strike_No} · to {s.mail_Id}
                  </p>
                  <p className="text-slate-700 mt-0.5">{s.strike_Note}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Sent: {fmtDateTime(s.sent_At)}
                  </p>
                  {s.response_Received ? (
                    <p className="text-[10px] text-emerald-700 mt-0.5">
                      Response received {fmtDateTime(s.response_At)} –{" "}
                      {s.response_Note}
                    </p>
                  ) : (
                    <p className="text-[10px] text-orange-600 mt-0.5">
                      No response yet.
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          {canAct && (
            <div className="mt-2 space-y-1.5">
              <p className="text-[10px] text-slate-500">
                Next strike number:{" "}
                <span className="font-semibold text-slate-800">
                  {nextStrikeNo}
                </span>
              </p>
              <input
                type="email"
                value={strikeMail}
                onChange={(e) => setStrikeMail(e.target.value)}
                placeholder="Recipient mail ID"
                className="w-full h-8 rounded-lg border border-slate-300 bg-white px-2 text-[11px] focus:outline-none focus:border-orange-400"
              />
              <textarea
                rows={2}
                value={strikeNote}
                onChange={(e) => setStrikeNote(e.target.value)}
                placeholder="Follow-up message"
                className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] resize-none focus:outline-none focus:border-orange-400"
              />
              {strikeError && (
                <p className="text-[10px] text-red-600">{strikeError}</p>
              )}
              <button
                type="button"
                onClick={handleSendStrike}
                disabled={strikeSending}
                className="w-full h-8 rounded-lg bg-orange-500 text-white text-[11px] font-bold hover:bg-orange-600 disabled:opacity-60"
              >
                {strikeSending
                  ? "Sending follow-up…"
                  : `Send Strike ${nextStrikeNo}`}
              </button>
            </div>
          )}

          {lastUnrespondedStrike && (
            <div className="mt-3 space-y-1.5">
              <p className="font-bold text-slate-500 uppercase tracking-wide">
                Respond to last strike
              </p>
              <p className="text-[10px] text-slate-500">
                Strike {lastUnrespondedStrike.strike_No} to{" "}
                {lastUnrespondedStrike.mail_Id}
              </p>
              <textarea
                rows={2}
                value={responseNote}
                onChange={(e) => setResponseNote(e.target.value)}
                placeholder="Response note"
                className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] resize-none focus:outline-none focus:border-emerald-400"
              />
              {responseError && (
                <p className="text-[10px] text-red-600">{responseError}</p>
              )}
              <button
                type="button"
                onClick={handleRespondStrike}
                disabled={respondingStrike}
                className="w-full h-8 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 disabled:opacity-60"
              >
                {respondingStrike ? "Saving response…" : "Mark Response"}
              </button>
            </div>
          )}

          {lastStrike && !lastStrike.response_Received && (
            <p className="mt-1 text-[10px] text-orange-600">
              Last strike #{lastStrike.strike_No} has no response yet.
            </p>
          )}
        </section>

        {/* History */}
        <section>
          <p className="font-bold text-slate-500 uppercase tracking-wide mb-1">
            History
          </p>
          <div className="space-y-1 max-h-40 overflow-y-auto border border-slate-100 rounded-lg p-2 bg-slate-50">
            {history.length === 0 ? (
              <p className="text-[11px] text-slate-400">No history records.</p>
            ) : (
              history.map((h) => (
                <div
                  key={h.history_Id}
                  className="text-[11px] text-slate-700 border-b border-slate-100 last:border-0 pb-1 mb-1 last:pb-0 last:mb-0"
                >
                  <p className="font-semibold">
                    {h.action_Type} · {fmtDateTime(h.action_At)}
                  </p>
                  <p className="text-slate-500">
                    {h.old_Value} → {h.new_Value}
                  </p>
                  {h.remarks && (
                    <p className="text-slate-600 mt-0.5">{h.remarks}</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    By {h.action_By_Name} ({h.action_By})
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Discussion */}
        <section>
          <p className="font-bold text-slate-500 uppercase tracking-wide mb-1">
            Discussion
          </p>
          <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-lg bg-slate-50 p-2 space-y-1">
            {discussions.length === 0 ? (
              <p className="text-[11px] text-slate-400">
                No messages yet. Start the conversation.
              </p>
            ) : (
              discussions.map((m) => (
                <div
                  key={m.discussion_Id}
                  className="text-[11px] border-b border-slate-100 last:border-0 pb-1 mb-1 last:pb-0 last:mb-0"
                >
                  <p className="font-semibold text-slate-800">
                    {m.message_By_Name} ({m.message_By})
                  </p>
                  <p className="text-slate-700 mt-0.5">{m.message_Text}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {fmtDateTime(m.message_At)}
                  </p>
                </div>
              ))
            )}
          </div>
          <div className="mt-1 space-y-1.5">
            <textarea
              rows={2}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message…"
              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] resize-none focus:outline-none focus:border-slate-400"
            />
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={discussionSending || !messageText.trim()}
              className="w-full h-8 rounded-lg bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800 disabled:opacity-60"
            >
              {discussionSending ? "Sending…" : "Send Message"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
