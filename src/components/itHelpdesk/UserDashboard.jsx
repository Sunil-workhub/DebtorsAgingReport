import { Briefcase, Filter, LogOut, Plus, Wrench } from "lucide-react";
import TicketCard from "./TicketCard";

const getOrgClass = (org) => {
  if (org === "IML") return "bg-blue-100 text-blue-700 border-blue-200";
  if (org === "CSIL")
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  return "bg-purple-100 text-purple-700 border-purple-200";
};

const ORGS = ["IML", "CSIL", "Daedalus"];

const UserDashboard = ({
  loading,
  tickets,
  currentUser,
  orgFilter,
  setOrgFilter,
  onLogout,
  onOpenCreate,
  onSelectTicket,
}) => {
  const stats = {
    total: tickets.length,
    open: tickets.filter((ticket) => ticket.status === "Open").length,
    inProgress: tickets.filter((ticket) =>
      [
        "In Progress",
        "Requirement",
        "Discussion",
        "IT Testing",
        "Ready for Demo",
        "User Testing",
        "Assigned",
        "Queue",
      ].includes(ticket.status),
    ).length,
    waiting: tickets.filter(
      (ticket) => ticket.status === "Waiting for User Input",
    ).length,
    closed: tickets.filter((ticket) => ticket.status === "Closed").length,
  };

  const isHR = currentUser?.role === "HR";

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto px-5 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                {isHR ? (
                  <Briefcase className="w-5 h-5 text-white" />
                ) : (
                  <Wrench className="w-5 h-5 text-white" />
                )}
              </div>

              <div>
                <h1 className="text-lg font-extrabold text-slate-900">
                  Helpdesk Dashboard
                </h1>
                <p className="text-xs text-slate-500">
                  Welcome, {currentUser?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                    {currentUser?.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {currentUser?.dept}
                    </p>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${getOrgClass(
                        currentUser?.org,
                      )}`}
                    >
                      {currentUser?.org}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  onOpenCreate(currentUser?.role === "HR" ? "HR" : "IT")
                }
                className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800"
              >
                <Plus className="w-4 h-4" />
                New Ticket
              </button>

              <button
                onClick={onLogout}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {(currentUser?.role === "IT" || currentUser?.role === "HR") && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-slate-500" />
              {ORGS.map((org) => (
                <button
                  key={org}
                  onClick={() => setOrgFilter(org)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                    orgFilter === org
                      ? getOrgClass(org)
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {org}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Total", value: stats.total },
            { label: "Open", value: stats.open },
            { label: "In Progress", value: stats.inProgress },
            { label: "Waiting", value: stats.waiting },
            { label: "Closed", value: stats.closed },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {item.label}
              </p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Loading tickets...
          </div>
        ) : tickets.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            No tickets found
          </div>
        ) : (
          <div className="grid gap-3">
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onClick={() => onSelectTicket(ticket)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
