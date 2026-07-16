import {
  Zap,
  Database,
  HardDrive,
  WifiOff,
  Inbox,
  ClipboardList,
  MessageSquareText,
  List,
  UserCheck,
  Clock3,
  AlertCircle,
  Timer,
  FlaskConical,
  PlayCircle,
  TestTube,
  XCircle,
  Globe,
  Building2,
  Users2,
  UserCircle,
  ShieldAlert,
  Landmark,
  UserPlus,
  HelpCircle,
  Briefcase,
} from "lucide-react";

export const ORGS = ["IML", "CSIL", "Daedalus"];

export const SOFTWARE_PROJECTS = [
  "ILEAP",
  "CSIL",
  "ERP Portal",
  "HRM Suite",
  "Finance Module",
  "Other",
];

export const CATEGORY_META = {
  software: {
    label: "Software",
    Icon: Zap,
    pill: "bg-violet-50 text-violet-700 border-violet-200",
    statuses: [
      "Open",
      "Requirement",
      "Discussion",
      "In Progress",
      "IT Testing",
      "Ready for Demo",
      "User Testing",
      "Waiting for User Input",
      "Closed",
    ],
    flowType: "full",
  },
  erp: {
    label: "ERP Enhancement",
    Icon: Database,
    pill: "bg-cyan-50 text-cyan-700 border-cyan-200",
    statuses: [
      "Open",
      "Requirement",
      "Discussion",
      "In Progress",
      "IT Testing",
      "Ready for Demo",
      "User Testing",
      "Waiting for User Input",
      "Closed",
    ],
    flowType: "full",
  },
  hardware: {
    label: "Hardware",
    Icon: HardDrive,
    pill: "bg-amber-50 text-amber-700 border-amber-200",
    statuses: ["Open", "In Progress", "Waiting for User Input", "Closed"],
    flowType: "simple",
  },
  networking: {
    label: "Networking",
    Icon: WifiOff,
    pill: "bg-orange-50 text-orange-700 border-orange-200",
    statuses: ["Open", "In Progress", "Waiting for User Input", "Closed"],
    flowType: "simple",
  },
};

export const FULL_FLOW_CATEGORIES = ["software", "erp"];

export const HR_STATUSES = [
  "Open",
  "Queue",
  "Assigned",
  "In Progress",
  "Closed",
];

export const STATUS_META = {
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
    Icon: ClipboardList,
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
    Icon: AlertCircle,
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

export const PRIORITIES = ["Critical", "Medium", "Normal"];
export const TICKET_TYPES = ["Service Request", "Incident"];
export const REQUEST_TYPES = ["Service Request", "Incident"];

export const IT_IMPACT_OPTIONS = [
  {
    value: "business",
    label: "Business",
    Icon: Globe,
    desc: "Affects entire business operations",
  },
  {
    value: "department",
    label: "Department",
    Icon: Building2,
    desc: "Affects a whole department",
  },
  {
    value: "team",
    label: "Team",
    Icon: Users2,
    desc: "Affects a group / team of users",
  },
  {
    value: "user",
    label: "User",
    Icon: UserCircle,
    desc: "Affects a single user",
  },
];

export const HR_IMPACT_OPTIONS = [
  {
    value: "legal_compliance",
    label: "Legal / Compliance Risk",
    Icon: ShieldAlert,
    desc: "Policy breach, statutory compliance",
  },
  {
    value: "financial_payroll",
    label: "Financial / Payroll",
    Icon: Landmark,
    desc: "Salary, reimbursements, benefits",
  },
  {
    value: "employee_lifecycle",
    label: "Employee Lifecycle",
    Icon: UserPlus,
    desc: "Joining, transfers, exits",
  },
  {
    value: "general_inquiry",
    label: "General Inquiry",
    Icon: HelpCircle,
    desc: "General HR questions",
  },
];

export const HOLD_REASON_OPTIONS = [
  { value: "response_not_received", label: "Response Not Received" },
  { value: "pending_approval", label: "Pending Approval" },
  { value: "vendor_dependency", label: "Vendor Dependency" },
  { value: "other", label: "Other Issue" },
];

export const PRIORITY_PILL = {
  Critical: "bg-red-100 text-red-700 border border-red-200",
  High: "bg-orange-100 text-orange-700 border border-orange-200",
  Medium: "bg-amber-100 text-amber-700 border border-amber-200",
  Normal: "bg-blue-100 text-blue-700 border border-blue-200",
  Low: "bg-slate-100 text-slate-600 border border-slate-200",
};

export const ORG_PILL = {
  IML: "bg-blue-100 text-blue-700 border border-blue-200",
  CSIL: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Daedalus: "bg-purple-100 text-purple-700 border border-purple-200",
};

export const TESTING_STATUSES = [
  "IT Testing",
  "Ready for Demo",
  "User Testing",
];

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const CATALOG_CACHE_KEY = "enlife_hd_catalog_v1";

const ACCENT_COL = {
  emerald: {
    border: "border-emerald-200",
    bg: "bg-emerald-50/20",
    hdr: "border-emerald-100",
    sub: "text-emerald-600",
    inner: "bg-emerald-50/10",
  },
  blue: {
    border: "border-blue-200",
    bg: "bg-blue-50/30",
    hdr: "border-blue-100",
    sub: "text-blue-500",
    inner: "bg-blue-50/20",
  },
  indigo: {
    border: "border-indigo-200",
    bg: "bg-indigo-50/30",
    hdr: "border-indigo-100",
    sub: "text-indigo-500",
    inner: "bg-indigo-50/20",
  },
  purple: {
    border: "border-purple-200",
    bg: "bg-purple-50/30",
    hdr: "border-purple-100",
    sub: "text-purple-500",
    inner: "bg-purple-50/20",
  },
  orange: {
    border: "border-orange-200",
    bg: "bg-orange-50/30",
    hdr: "border-orange-100",
    sub: "text-orange-500",
    inner: "bg-orange-50/20",
  },
  amber: {
    border: "border-amber-200",
    bg: "bg-amber-50/30",
    hdr: "border-amber-100",
    sub: "text-amber-500",
    inner: "bg-amber-50/20",
  },
  slate: {
    border: "border-slate-200",
    bg: "bg-white",
    hdr: "border-slate-100",
    sub: "text-slate-400",
    inner: "bg-slate-50/50",
  },
};

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;}
  body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;margin:0;}
  .mono{font-family:'JetBrains Mono',monospace;}
  .thin-scroll::-webkit-scrollbar{width:4px;}
  .thin-scroll::-webkit-scrollbar-track{background:transparent;}
  .thin-scroll::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:99px;}
  .modal-overlay{position:fixed;inset:0;z-index:50;background:rgba(15,23,42,0.65);display:flex;align-items:center;justify-content:center;padding:1rem;}
  .modal-box{background:#fff;border-radius:1.25rem;border:1px solid #e2e8f0;box-shadow:0 25px 60px rgba(0,0,0,0.2);width:100%;max-width:940px;max-height:92vh;display:flex;flex-direction:column;overflow:hidden;}
  .mini-modal{background:#fff;border-radius:1rem;border:1px solid #e2e8f0;box-shadow:0 20px 50px rgba(0,0,0,0.25);width:100%;max-width:440px;}
  .cb-it{background:#1e293b;color:#f8fafc;border-radius:1rem 1rem 0.25rem 1rem;padding:.5rem .875rem;max-width:78%;font-size:.8125rem;line-height:1.5;}
  .cb-hr{background:#4338ca;color:#fff;border-radius:1rem 1rem 0.25rem 1rem;padding:.5rem .875rem;max-width:78%;font-size:.8125rem;line-height:1.5;}
  .cb-user{background:#f1f5f9;color:#1e293b;border-radius:1rem 1rem 1rem 0.25rem;padding:.5rem .875rem;max-width:78%;font-size:.8125rem;line-height:1.5;}
  .cb-self{background:#3b82f6;color:#fff;border-radius:1rem 1rem 0.25rem 1rem;padding:.5rem .875rem;max-width:78%;font-size:.8125rem;line-height:1.5;}
`;
