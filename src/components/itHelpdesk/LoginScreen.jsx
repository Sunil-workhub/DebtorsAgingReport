import { useMemo, useState } from "react";
import { Briefcase, CheckCircle2, Lock, Users, Wrench } from "lucide-react";

const getOrgClass = (org) => {
  if (org === "IML") return "bg-blue-100 text-blue-700 border-blue-200";
  if (org === "CSIL")
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  return "bg-purple-100 text-purple-700 border-purple-200";
};

const LoginScreen = ({ users = [], onLogin }) => {
  const [selectedUserId, setSelectedUserId] = useState("");

  const groupedUsers = useMemo(() => {
    return [
      {
        key: "IT",
        label: "IT Department",
        icon: <Lock className="w-3 h-3" />,
        users: users.filter((user) => user.role === "IT"),
      },
      {
        key: "HR",
        label: "HR Department",
        icon: <Briefcase className="w-3 h-3" />,
        users: users.filter((user) => user.role === "HR"),
      },
      {
        key: "User",
        label: "Users",
        icon: <Users className="w-3 h-3" />,
        users: users.filter((user) => user.role === "User"),
      },
    ];
  }, [users]);

  const selectedUser = users.find((user) => user.id === selectedUserId);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            IT / HR Helpdesk
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Select your profile to continue
          </p>
        </div>

        {groupedUsers.map((group) => (
          <div
            key={group.key}
            className="bg-slate-900 rounded-2xl border border-slate-800 p-5 mb-4"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
              {group.icon}
              {group.label}
            </p>

            <div className="space-y-2">
              {group.users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 border text-left transition-all ${
                    selectedUserId === user.id
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-slate-700 hover:border-slate-600 hover:bg-slate-800"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white text-xs font-black flex-none">
                    {user.avatar}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">{user.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <p className="text-xs text-slate-400">{user.dept}</p>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${getOrgClass(
                          user.org,
                        )}`}
                      >
                        {user.org}
                      </span>
                    </div>
                  </div>

                  {selectedUserId === user.id && (
                    <CheckCircle2 className="w-4 h-4 text-blue-400 flex-none" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={() => selectedUser && onLogin(selectedUser)}
          disabled={!selectedUser}
          className={`w-full h-12 rounded-xl text-sm font-bold transition-all ${
            selectedUser
              ? "bg-white text-slate-900 hover:bg-slate-100"
              : "bg-slate-800 text-slate-600 cursor-not-allowed"
          }`}
        >
          {selectedUser
            ? `Continue as ${selectedUser.name}`
            : "Select a profile"}
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;
