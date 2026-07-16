// src/pages/ILeap/DebtorsReportPage.jsx
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// NOTE: requires the "xlsx" package for the Excel export feature.
//   npm install xlsx
import * as XLSX from "xlsx";

import DebtorsAgingReportService from "../../services/debtorsAgingReport/DebtorsAgingReportService";

/* =============================================================================
    ICONS (inline, dependency-free)
============================================================================= */
const Icon = ({ path, className = "h-4 w-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {path}
  </svg>
);
const SearchIcon = (p) => (
  <Icon
    {...p}
    path={
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.2-3.2" />
      </>
    }
  />
);
const SlidersIcon = (p) => (
  <Icon
    {...p}
    path={
      <>
        <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h13M21 18h-1" />
        <circle cx="16" cy="6" r="2" />
        <circle cx="8" cy="12" r="2" />
        <circle cx="17" cy="18" r="2" />
      </>
    }
  />
);
const RefreshIcon = (p) => (
  <Icon
    {...p}
    path={
      <>
        <path d="M20 11A8 8 0 0 0 5.7 6.3L4 8" />
        <path d="M4 4v4h4" />
        <path d="M4 13a8 8 0 0 0 14.3 4.7L20 16" />
        <path d="M20 20v-4h-4" />
      </>
    }
  />
);
const EraserIcon = (p) => (
  <Icon
    {...p}
    path={
      <>
        <path d="M20 20H9l-6-6a2 2 0 0 1 0-2.8l8-8a2 2 0 0 1 2.8 0l6.2 6.2a2 2 0 0 1 0 2.8L14.5 18" />
        <path d="m6 12 6.5 6.5" />
      </>
    }
  />
);
const ChevronIcon = ({ open, ...p }) => (
  <Icon
    {...p}
    className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    path={<path d="m6 9 6 6 6-6" />}
  />
);
const SortIcon = ({ dir }) => (
  <span className="ml-1 inline-flex flex-col leading-none text-slate-300">
    <svg
      width="8"
      height="6"
      viewBox="0 0 8 6"
      className={dir === "asc" ? "text-teal-600" : ""}
    >
      <path d="M4 0 8 6H0Z" fill="currentColor" />
    </svg>
    <svg
      width="8"
      height="6"
      viewBox="0 0 8 6"
      className={dir === "desc" ? "text-teal-600" : ""}
    >
      <path d="M4 6 0 0h8Z" fill="currentColor" />
    </svg>
  </span>
);
const TableIcon = (p) => (
  <Icon
    {...p}
    path={
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 10h18M9 4v16" />
      </>
    }
  />
);
const UsersIcon = (p) => (
  <Icon
    {...p}
    path={
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M2.5 19a6.5 6.5 0 0 1 13 0" />
        <path d="M16 8.5a3 3 0 1 1 3.6 2.9" />
        <path d="M21.5 19a5.5 5.5 0 0 0-4.5-5.4" />
      </>
    }
  />
);
const LayoutIcon = (p) => (
  <Icon
    {...p}
    path={
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </>
    }
  />
);
const ArrowLeftIcon = (p) => (
  <Icon {...p} path={<path d="M15 18l-6-6 6-6" />} />
);
const ArrowRightIcon = (p) => <Icon {...p} path={<path d="M9 18l6-6-6-6" />} />;
const MaximizeIcon = (p) => (
  <Icon
    {...p}
    path={
      <>
        <path d="M8 3H5a2 2 0 0 0-2 2v3" />
        <path d="M16 3h3a2 2 0 0 1 2 2v3" />
        <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
        <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
      </>
    }
  />
);
const MinimizeIcon = (p) => (
  <Icon
    {...p}
    path={
      <>
        <path d="M9 3v3a2 2 0 0 1-2 2H4" />
        <path d="M15 3v3a2 2 0 0 0 2 2h3" />
        <path d="M9 21v-3a2 2 0 0 0-2-2H4" />
        <path d="M15 21v-3a2 2 0 0 1 2-2h3" />
      </>
    }
  />
);
const DownloadIcon = (p) => (
  <Icon
    {...p}
    path={
      <>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
      </>
    }
  />
);
const PencilIcon = (p) => (
  <Icon
    {...p}
    path={
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </>
    }
  />
);

/* =============================================================================
    CONSTANTS / CONFIG
============================================================================= */
const TAB_KEYS = {
  DETAILED: "DETAILED",
  CUSTOMER_WISE: "CUSTOMER_WISE",
  FORMAT_FACE: "FORMAT_FACE",
};

// Order: Customer Wise (default), Format Face, then Detailed Aging.
const tabList = [
  { key: TAB_KEYS.CUSTOMER_WISE, label: "Customer Wise", icon: UsersIcon },
  { key: TAB_KEYS.FORMAT_FACE, label: "Format Face", icon: LayoutIcon },
  { key: TAB_KEYS.DETAILED, label: "Detailed Aging", icon: TableIcon },
];

const initialFilters = {
  asOnDate: "",
  accountCode: "",
  accountNumber: "",
  customerName: "",
  customerSite: "",
  customerType: "",
  customerRegion: "",
  trxClass: "",
  trxType: "",
  currencyCode: "",
  minBalanceAmount: "",
  maxBalanceAmount: "",
  dueBucket: "",
  searchText: "",
  pageNumber: 1,
  pageSize: 50,
};

const MAX_EXPORT_PAGE_SIZE = 1000000;

const col = (key, label, type = "text", width = 110, opts = {}) => ({
  key,
  label,
  type,
  width,
  sticky: false,
  ...opts,
});

const detailedColumns = [
  col("ACCOUNT_CODE", "Account Code", "text", 110, { sticky: true }),
  col("ACCOUNT_DESCRIPTION", "Account Description", "text", 240),
  col("ACCOUNT_NUMBER", "Account No.", "text", 110),
  col("CUSTOMER_NAME", "Customer Name", "text", 210, { sticky: true }),
  col("CUSTOMER_SITE", "Site", "text", 110),
  col("CUSTOMER_TYPE", "Customer Type", "text", 110),
  col("CUSTOMER_REGION", "Region", "text", 100),
  col("TRX_CLASS", "TRX Class", "text", 100),
  col("TRX_TYPE", "TRX Type", "text", 100),
  col("TRX_NUMBER", "TRX Number", "text", 140),
  col("REFERENCE_NUMBER", "Reference No.", "text", 140),
  col("TRX_DATE", "TRX Date", "date", 100),
  col("GL_DATE", "GL Date", "date", 100),
  col("DUE_DATE", "Due Date", "date", 100),
  col("DUE_DAYS", "Due Days", "number", 90),
  col("ACCOUNT_CLASS", "Acct. Class", "text", 100),
  col("CURRENCY_CODE", "Ccy", "text", 70),
  col("ORIGINAL_AMOUNT", "Original Amt", "amount", 120),
  col("CUSTOMER_TRX_ID", "Cust. TRX ID", "number", 110),
  col("BALANCE_AMOUNT", "Balance Amt", "amount", 120),
  col("ACCTD_BALANCE_AMOUNT", "Acctd Balance", "amount", 120),
  col("NOT_DUE", "Not Due", "amount", 100, {
    tint: "bg-teal-50",
    tintText: "text-teal-700",
  }),
  col("AG_0_TO_5", "0–5", "amount", 90, {
    tint: "bg-teal-50",
    tintText: "text-teal-700",
  }),
  col("AG_6_TO_30", "6–30", "amount", 90, {
    tint: "bg-cyan-50",
    tintText: "text-cyan-700",
  }),
  col("AG_31_TO_60", "31–60", "amount", 90, {
    tint: "bg-sky-50",
    tintText: "text-sky-700",
  }),
  col("AG_61_TO_90", "61–90", "amount", 90, {
    tint: "bg-amber-50",
    tintText: "text-amber-700",
  }),
  col("AG_91_TO_120", "91–120", "amount", 90, {
    tint: "bg-amber-50",
    tintText: "text-amber-700",
  }),
  col("AG_121_TO_180", "121–180", "amount", 90, {
    tint: "bg-orange-50",
    tintText: "text-orange-700",
  }),
  col("AG_181_TO_365", "181–365", "amount", 90, {
    tint: "bg-orange-50",
    tintText: "text-orange-700",
  }),
  col("AG_366_TO_730", "366–730", "amount", 90, {
    tint: "bg-rose-50",
    tintText: "text-rose-700",
  }),
  col("AG_731_TO_1095", "731–1095", "amount", 100, {
    tint: "bg-rose-50",
    tintText: "text-rose-700",
  }),
  col("AG_MORE_THAN_1095", ">1095", "amount", 100, {
    tint: "bg-rose-100",
    tintText: "text-rose-800",
  }),
  col("INTERFACE_HEADER_ATTRIBUTE1", "Header Attr 1", "text", 130),
  col("TOTAL_AGING_AMOUNT", "Total Aging", "amount", 120),
  col("OVERDUE_AMOUNT", "Overdue", "amount", 120),
];

// NOTE: "Due" under Payment Against Dispatch was removed — bifurcated
// (days-wise) data is already captured via the <30/<45/.../>180 columns.
const custWiseColumns = [
  col("CUSTOMER_NAME", "Customer Name", "text", 220, { sticky: true }),
  col("TOTAL_AMT_NOT_DUE", "Not Due", "amount", 110, {
    group: "Total Amnt",
    tint: "bg-teal-50",
    tintText: "text-teal-700",
  }),
  col("TOTAL_AMT_DUE", "Due", "amount", 110, {
    group: "Total Amnt",
    tint: "bg-rose-50",
    tintText: "text-rose-700",
  }),
  col("PAD_NOT_DUE", "Not Due", "amount", 100, {
    group: "Payment Against Dispatch",
  }),
  col("PAD_DUE_LT_30", "<30 days", "amount", 95, {
    group: "Payment Against Dispatch",
  }),
  col("PAD_DUE_LT_45", "<45 days", "amount", 95, {
    group: "Payment Against Dispatch",
  }),
  col("PAD_DUE_LT_60", "<60 days", "amount", 95, {
    group: "Payment Against Dispatch",
  }),
  col("PAD_DUE_LT_90", "<90 days", "amount", 95, {
    group: "Payment Against Dispatch",
  }),
  col("PAD_DUE_LT_180", "<180 days", "amount", 100, {
    group: "Payment Against Dispatch",
  }),
  col("PAD_DUE_GT_180", ">180 days", "amount", 100, {
    group: "Payment Against Dispatch",
  }),
  col("EC_NOT_DUE", "Not Due", "amount", 100, { group: "Against E&C" }),
  col("EC_DUE", "Due", "amount", 90, { group: "Against E&C" }),
  col("PBG_NOT_DUE", "Not Due", "amount", 100, { group: "Against PBG" }),
  col("PBG_DUE", "Due", "amount", 90, { group: "Against PBG" }),
  col("UNALLOCATED_PAYMENTS", "Unallocated Payments", "amount", 130),
  // `editable: true` enables the local Edit/Add button in the table.
  // No API is wired up yet — edits are kept in local state only.
  col("REMARKS", "Remarks", "text", 320, { editable: true }),
];

const formatFaceColumns = [
  col("DATE", "Date", "date", 100),
  col("CUSTOMER_NAME", "Customer Name", "text", 220, { sticky: true }),
  col("AGEING", "Ageing (days)", "number", 100),
  col("TOTAL_AMT_NOT_DUE", "Not Due", "amount", 110, {
    group: "Total Amnt",
    tint: "bg-teal-50",
    tintText: "text-teal-700",
  }),
  col("TOTAL_AMT_DUE", "Due", "amount", 110, {
    group: "Total Amnt",
    tint: "bg-rose-50",
    tintText: "text-rose-700",
  }),
  col("PAD_NOT_DUE", "Not Due", "amount", 100, {
    group: "Payment Against Dispatch",
  }),
  col("PAD_DUE_LT_30", "<30 days", "amount", 95, {
    group: "Payment Against Dispatch",
  }),
  col("PAD_DUE_LT_45", "<45 days", "amount", 95, {
    group: "Payment Against Dispatch",
  }),
  col("PAD_DUE_LT_60", "<60 days", "amount", 95, {
    group: "Payment Against Dispatch",
  }),
  col("PAD_DUE_LT_90", "<90 days", "amount", 95, {
    group: "Payment Against Dispatch",
  }),
  col("PAD_DUE_LT_180", "<180 days", "amount", 100, {
    group: "Payment Against Dispatch",
  }),
  col("PAD_DUE_GT_180", ">180 days", "amount", 100, {
    group: "Payment Against Dispatch",
  }),
  col("EC_NOT_DUE", "Not Due", "amount", 100, { group: "Against E&C" }),
  col("EC_DUE", "Due", "amount", 90, { group: "Against E&C" }),
  col("PBG_NOT_DUE", "Not Due", "amount", 100, { group: "Against PBG" }),
  col("PBG_DUE", "Due", "amount", 90, { group: "Against PBG" }),
  col("UNALLOCATED_PAYMENTS", "Unallocated Payments", "amount", 130),
];

const TAB_CONFIG = {
  [TAB_KEYS.DETAILED]: {
    columns: detailedColumns,
    rowKey: (r, i) => `${r.ACCOUNT_CODE}-${r.TRX_NUMBER}-${i}`,
    metrics: [
      { label: "Balance", key: "BALANCE_AMOUNT", accent: "teal" },
      { label: "Overdue", key: "OVERDUE_AMOUNT", accent: "rose" },
    ],
  },
  [TAB_KEYS.CUSTOMER_WISE]: {
    columns: custWiseColumns,
    rowKey: (r, i) => `${r.CUSTOMER_NAME}-${i}`,
    metrics: [
      { label: "Not Due", key: "TOTAL_AMT_NOT_DUE", accent: "teal" },
      { label: "Due", key: "TOTAL_AMT_DUE", accent: "rose" },
    ],
  },
  [TAB_KEYS.FORMAT_FACE]: {
    columns: formatFaceColumns,
    rowKey: (r, i) => `${r.CUSTOMER_NAME}-${r.DATE}-${i}`,
    metrics: [
      { label: "Not Due", key: "TOTAL_AMT_NOT_DUE", accent: "teal" },
      { label: "Due", key: "TOTAL_AMT_DUE", accent: "rose" },
    ],
  },
};

const ACCENT_CLASSES = {
  slate: {
    border: "border-l-slate-300",
    bg: "bg-slate-50/80",
    text: "text-slate-900",
  },
  teal: {
    border: "border-l-teal-400",
    bg: "bg-teal-50/60",
    text: "text-teal-700",
  },
  rose: {
    border: "border-l-rose-400",
    bg: "bg-rose-50/60",
    text: "text-rose-700",
  },
};

/* =============================================================================
    FORMATTERS
============================================================================= */
const normalizeKey = (key) => (key ? key.toUpperCase() : key);

const normalizeRow = (row) => {
  const out = {};
  Object.keys(row || {}).forEach((k) => {
    out[normalizeKey(k)] = row[k];
  });
  return out;
};
const normalizeRows = (rows) =>
  Array.isArray(rows) ? rows.map(normalizeRow) : [];

const formatDate = (value) => {
  if (!value) return "–";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatAmountParts = (value, fractionDigits = 2) => {
  if (value === null || value === undefined || value === "")
    return { text: "–", negative: false, zero: true };
  const num = Number(value);
  if (Number.isNaN(num)) return { text: value, negative: false, zero: false };
  const lakh = num / 100000;
  const zero = Math.abs(lakh) < 0.005;
  const abs = Math.abs(lakh).toLocaleString("en-IN", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  return {
    // Shows standard minus sign for negative numbers instead of brackets
    text: zero ? abs : num < 0 ? `-${abs}` : abs,
    negative: false, // Disables red highlight styling for negative values
    zero,
  };
};

const formatRegularNumber = (value) => {
  if (value === null || value === undefined || value === "") return "–";
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString("en-IN", { maximumFractionDigits: 0 });
};

const getCellDisplay = (row, column) => {
  const value = row?.[column.key];
  if (column.type === "date") return { text: formatDate(value) };
  if (column.type === "amount") return formatAmountParts(value);
  if (column.type === "number") return { text: formatRegularNumber(value) };
  return {
    text:
      value === null || value === undefined || value === ""
        ? "–"
        : String(value),
  };
};

/* =============================================================================
    REUSABLE DATA TABLE
============================================================================= */
const DataTable = ({
  columns,
  rows,
  loading,
  fullscreen,
  onEditCell,
  activeTab,
}) => {
  const [sort, setSort] = useState({ key: null, dir: null });
  const [selectedKey, setSelectedKey] = useState(null);
  const stickyRefs = useRef({});
  const [stickyOffsets, setStickyOffsets] = useState({});
  const headerRow1Ref = useRef(null);
  const [row1Height, setRow1Height] = useState(0);

  // Local-only inline editing state (e.g. Remarks). `editingKey` is
  // `${rowKey}::${columnKey}`; no backend call is made yet.
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState("");

  const stickyCols = useMemo(() => columns.filter((c) => c.sticky), [columns]);
  const hasGroups = useMemo(() => columns.some((c) => c.group), [columns]);

  const headerSegments = useMemo(() => {
    const segments = [];
    columns.forEach((c) => {
      const last = segments[segments.length - 1];
      if (c.group) {
        if (last && last.type === "group" && last.label === c.group) {
          last.cols.push(c);
        } else {
          segments.push({ type: "group", label: c.group, cols: [c] });
        }
      } else {
        segments.push({ type: "single", cols: [c] });
      }
    });
    return segments;
  }, [columns]);

  useLayoutEffect(() => {
    let offset = 0;
    const offsets = {};
    stickyCols.forEach((c) => {
      offsets[c.key] = offset;
      const w = stickyRefs.current[c.key]?.offsetWidth ?? c.width;
      offset += w;
    });
    setStickyOffsets(offsets);
  }, [stickyCols, rows]);

  useLayoutEffect(() => {
    if (hasGroups && headerRow1Ref.current) {
      setRow1Height(headerRow1Ref.current.offsetHeight);
    }
  }, [hasGroups, columns]);

  // Reset any in-progress local edit whenever the underlying rows change
  // (e.g. switching tabs or re-fetching), so we don't point at a stale row.
  useEffect(() => {
    setEditingKey(null);
    setEditValue("");
  }, [rows]);

  const sortedRows = useMemo(() => {
    if (!sort.key) return rows;
    const column = columns.find((c) => c.key === sort.key);
    const isNumeric = column?.type === "amount" || column?.type === "number";
    const withIndex = rows.map((r, i) => [r, i]);
    withIndex.sort(([a], [b]) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      let cmp;
      if (isNumeric) cmp = (Number(av) || 0) - (Number(bv) || 0);
      else cmp = String(av ?? "").localeCompare(String(bv ?? ""));
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return withIndex.map(([r]) => r);
  }, [rows, sort, columns]);

  const toggleSort = (key) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return { key: null, dir: null };
    });
  };

  const stickyStyle = (key) => ({ left: stickyOffsets[key] ?? 0 });

  const startEditing = (rowKey, columnKey, currentValue) => {
    setEditingKey(`${rowKey}::${columnKey}`);
    setEditValue(
      currentValue === null || currentValue === undefined
        ? ""
        : String(currentValue),
    );
  };

  const commitEdit = (rowKey, columnKey) => {
    onEditCell?.(rowKey, columnKey, editValue);
    setEditingKey(null);
    setEditValue("");
  };

  if (loading) {
    return (
      <div className="p-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="mb-2 h-9 animate-pulse rounded-lg bg-slate-100"
          />
        ))}
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-4 py-16 text-center">
        <div className="rounded-full bg-slate-100 p-3 text-slate-400">
          <SearchIcon className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium text-slate-600">
          No matching records
        </p>
        <p className="text-xs text-slate-400">
          Try widening your filters or clearing the search.
        </p>
      </div>
    );
  }

  const leafHeaderCellClass = (c) =>
    `sticky z-20 select-none border-b border-r border-slate-200 ${c.tint || "bg-slate-50"} px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide ${c.tintText || "text-slate-500"} cursor-pointer hover:brightness-95 ${c.sticky ? "z-30" : ""}`;

  return (
    <div
      className={`overflow-auto ${fullscreen ? "max-h-[calc(100vh-150px)]" : activeTab === TAB_KEYS.DETAILED ? "max-h-[42vh]" : "max-h-[50vh]"}`}
    >
      <table className="min-w-full border-separate border-spacing-0 text-[12.5px] tabular-nums">
        <thead>
          {hasGroups ? (
            <>
              <tr ref={headerRow1Ref}>
                {headerSegments.map((seg, idx) =>
                  seg.type === "group" ? (
                    <th
                      key={`grp-${idx}`}
                      colSpan={seg.cols.length}
                      style={{ top: 0 }}
                      className="sticky z-20 border-b border-r border-slate-200 bg-slate-100 px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-600"
                    >
                      {seg.label}
                    </th>
                  ) : (
                    (() => {
                      const c = seg.cols[0];
                      return (
                        <th
                          key={c.key}
                          rowSpan={2}
                          ref={
                            c.sticky
                              ? (el) => (stickyRefs.current[c.key] = el)
                              : undefined
                          }
                          onClick={() => toggleSort(c.key)}
                          style={{
                            minWidth: c.width,
                            top: 0,
                            ...(c.sticky ? stickyStyle(c.key) : {}),
                          }}
                          className={leafHeaderCellClass(c)}
                          title={c.label}
                        >
                          <span className="inline-flex items-center whitespace-nowrap">
                            {c.label}
                            <SortIcon
                              dir={sort.key === c.key ? sort.dir : undefined}
                            />
                          </span>
                        </th>
                      );
                    })()
                  ),
                )}
              </tr>
              <tr>
                {columns
                  .filter((c) => c.group)
                  .map((c) => (
                    <th
                      key={c.key}
                      onClick={() => toggleSort(c.key)}
                      style={{
                        minWidth: c.width,
                        top: row1Height,
                        ...(c.sticky ? stickyStyle(c.key) : {}),
                      }}
                      className={leafHeaderCellClass(c)}
                      title={c.label}
                    >
                      <span className="inline-flex items-center whitespace-nowrap">
                        {c.label}
                        <SortIcon
                          dir={sort.key === c.key ? sort.dir : undefined}
                        />
                      </span>
                    </th>
                  ))}
              </tr>
            </>
          ) : (
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  ref={
                    c.sticky
                      ? (el) => (stickyRefs.current[c.key] = el)
                      : undefined
                  }
                  onClick={() => toggleSort(c.key)}
                  style={{
                    minWidth: c.width,
                    top: 0,
                    ...(c.sticky ? stickyStyle(c.key) : {}),
                  }}
                  className={leafHeaderCellClass(c)}
                  title={c.label}
                >
                  <span className="inline-flex items-center whitespace-nowrap">
                    {c.label}
                    <SortIcon dir={sort.key === c.key ? sort.dir : undefined} />
                  </span>
                </th>
              ))}
            </tr>
          )}
        </thead>
        <tbody>
          {sortedRows.map((row, rowIndex) => {
            const rk = row.__rowKey ?? rowIndex;
            const isSelected = selectedKey === rk;
            return (
              <tr
                key={rk}
                onClick={() => setSelectedKey(isSelected ? null : rk)}
                className={`cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-teal-100/80 ring-1 ring-inset ring-teal-300"
                    : rowIndex % 2 === 0
                      ? "bg-white hover:bg-slate-50"
                      : "bg-slate-50/50 hover:bg-slate-100/60"
                }`}
              >
                {columns.map((c) => {
                  const { text, negative } = getCellDisplay(row, c);
                  const isEditingCell = editingKey === `${rk}::${c.key}`;
                  return (
                    <td
                      key={c.key}
                      style={{
                        minWidth: c.width,
                        ...(c.sticky ? stickyStyle(c.key) : {}),
                      }}
                      className={`border-b border-r border-slate-100 px-3 py-2 ${c.sticky ? `sticky z-10 ${isSelected ? "bg-teal-100" : rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50"}` : ""} ${
                        c.type === "amount" || c.type === "number"
                          ? "text-right"
                          : "text-left"
                      } ${negative ? "text-rose-600" : "text-slate-700"} ${c.key === "REMARKS" ? "max-w-[320px]" : ""}`}
                      title={
                        c.key === "REMARKS" && !isEditingCell
                          ? String(row[c.key] ?? "")
                          : undefined
                      }
                      onClick={
                        c.editable ? (e) => e.stopPropagation() : undefined
                      }
                    >
                      {c.editable ? (
                        isEditingCell ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              autoFocus
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") commitEdit(rk, c.key);
                                else if (e.key === "Escape") {
                                  setEditingKey(null);
                                  setEditValue("");
                                }
                              }}
                              className="h-8 w-full min-w-[160px] rounded-lg border border-teal-300 bg-white px-2 text-[12.5px] text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/20"
                            />
                            <button
                              onClick={() => commitEdit(rk, c.key)}
                              className="shrink-0 rounded-lg bg-teal-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-teal-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingKey(null);
                                setEditValue("");
                              }}
                              className="shrink-0 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-50"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate">{text}</span>
                            <button
                              onClick={() =>
                                startEditing(rk, c.key, row[c.key])
                              }
                              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-500 transition hover:border-teal-300 hover:text-teal-700"
                              title={
                                row[c.key] ? "Edit remarks" : "Add remarks"
                              }
                            >
                              <PencilIcon className="h-3 w-3" />
                              {row[c.key] ? "Edit" : "Add"}
                            </button>
                          </div>
                        )
                      ) : (
                        text
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

/* =============================================================================
    FILTER FIELD
============================================================================= */
const FilterField = ({ label, children }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">
      {label}
    </span>
    {children}
  </label>
);

const inputClass =
  "h-10 rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10";

/* =============================================================================
    MAIN PAGE
============================================================================= */
const DebtorsReportPage = () => {
  // Default tab is now Customer Wise.
  const [activeTab, setActiveTab] = useState(TAB_KEYS.CUSTOMER_WISE);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const tableCardRef = useRef(null);

  const [rowsByTab, setRowsByTab] = useState({
    [TAB_KEYS.DETAILED]: [],
    [TAB_KEYS.CUSTOMER_WISE]: [],
    [TAB_KEYS.FORMAT_FACE]: [],
  });
  const [countsByTab, setCountsByTab] = useState({});

  const tabRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  useLayoutEffect(() => {
    const el = tabRefs.current[activeTab];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [activeTab, countsByTab]);

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(
        !!document.fullscreenElement &&
          document.fullscreenElement === tableCardRef.current,
      );
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await tableCardRef.current?.requestFullscreen?.();
      } else {
        await document.exitFullscreen?.();
      }
    } catch (e) {
      // Fullscreen isn't supported / was blocked — fail silently.
    }
  };

  const payload = useMemo(
    () => ({
      asOnDate: filters.asOnDate || null,
      accountCode: filters.accountCode || null,
      accountNumber: filters.accountNumber || null,
      customerName: filters.customerName || null,
      customerSite: filters.customerSite || null,
      customerType: filters.customerType || null,
      customerRegion: filters.customerRegion || null,
      trxClass: filters.trxClass || null,
      trxType: filters.trxType || null,
      currencyCode: filters.currencyCode || null,
      minBalanceAmount:
        filters.minBalanceAmount === ""
          ? null
          : Number(filters.minBalanceAmount),
      maxBalanceAmount:
        filters.maxBalanceAmount === ""
          ? null
          : Number(filters.maxBalanceAmount),
      dueBucket: filters.dueBucket || null,
      searchText: filters.searchText || null,
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
    }),
    [filters],
  );

  const getApiData = (response) => response?.data ?? response?.Data ?? [];

  const fetchForTab = (tab, requestPayload) => {
    if (tab === TAB_KEYS.DETAILED)
      return DebtorsAgingReportService.getDetailedAging(requestPayload);
    if (tab === TAB_KEYS.CUSTOMER_WISE)
      return DebtorsAgingReportService.getCustomerWise(requestPayload);
    return DebtorsAgingReportService.getFormatFace(requestPayload);
  };

  const fetchTabData = async (tab = activeTab) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchForTab(tab, payload);
      const rows = normalizeRows(getApiData(response)).map((r, i) => ({
        ...r,
        __rowKey: TAB_CONFIG[tab].rowKey(r, i),
      }));
      setRowsByTab((prev) => ({ ...prev, [tab]: rows }));
      setCountsByTab((prev) => ({ ...prev, [tab]: rows.length }));
    } catch (err) {
      setError(err?.message || "Failed to fetch report data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load the default (Customer Wise) tab first.
    fetchTabData(TAB_KEYS.CUSTOMER_WISE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeTab = (tab) => {
    setActiveTab(tab);
    if (!countsByTab[tab] && !rowsByTab[tab]?.length) fetchTabData(tab);
  };

  const isFirstPageRun = useRef(true);
  useEffect(() => {
    if (isFirstPageRun.current) {
      isFirstPageRun.current = false;
      return;
    }
    fetchTabData(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.pageNumber]);

  const changePage = (nextPage) => {
    if (nextPage < 1) return;
    setFilters((prev) => ({ ...prev, pageNumber: nextPage }));
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key !== "pageNumber" ? { pageNumber: 1 } : {}),
    }));
  };

  const resetFilters = () => setFilters(initialFilters);

  // Local-only remarks edit (Customer Wise tab). Updates state in memory;
  // wire this up to a save API once the backend endpoint exists.
  const handleEditCell = (rowKey, columnKey, value) => {
    setRowsByTab((prev) => {
      const rows = prev[activeTab] || [];
      const updatedRows = rows.map((r) =>
        r.__rowKey === rowKey ? { ...r, [columnKey]: value } : r,
      );
      return { ...prev, [activeTab]: updatedRows };
    });
    // TODO: call DebtorsAgingReportService.updateRemarks(...) once available.
  };

  const currentRows = rowsByTab[activeTab] || [];
  const currentConfig = TAB_CONFIG[activeTab];

  const metricValues = useMemo(() => {
    return currentConfig.metrics.map((m) => ({
      label: m.label,
      accent: m.accent,
      value: formatAmountParts(
        currentRows.reduce((sum, r) => sum + (Number(r[m.key]) || 0), 0),
      ).text,
    }));
  }, [currentRows, currentConfig]);

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => !["pageNumber", "pageSize"].includes(k) && v !== "",
  ).length;

  const buildExportRows = (rows, columns) =>
    rows.map((row) => {
      const out = {};
      columns.forEach((c) => {
        let value = row[c.key];
        if (c.type === "date" && value) value = formatDate(value);
        out[
          c.label === "Not Due" || c.label === "Due" || c.group
            ? `${c.group ? `${c.group} - ` : ""}${c.label}`
            : c.label
        ] = value ?? "";
      });
      return out;
    });

  const handleDownloadExcel = async () => {
    setExporting(true);
    setError("");
    try {
      const exportPayload = {
        ...payload,
        pageNumber: 1,
        pageSize: MAX_EXPORT_PAGE_SIZE,
      };
      const response = await fetchForTab(activeTab, exportPayload);
      const rows = normalizeRows(getApiData(response));
      const exportRows = buildExportRows(rows, currentConfig.columns);
      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      const sheetName =
        tabList.find((t) => t.key === activeTab)?.label || "Report";
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      const dateStamp = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(
        workbook,
        `Debtors_${sheetName.replace(/\s+/g, "_")}_${dateStamp}.xlsx`,
      );
    } catch (err) {
      setError(err?.message || "Failed to export report data.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-1 md:p-5">
      <div className="mx-auto flex max-w-[1900px] flex-col gap-4">
        {/* ---------- Header ---------- */}
        <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/95 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
          <div className="h-[3px] w-full bg-gradient-to-r from-teal-400 via-amber-400 to-rose-400" />
          <div className="flex flex-col gap-4 p-2 md:p-2">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <h1 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">
                  Debtors Aging Automation
                </h1>
              </div>
              <div className="grid grid-cols-3 gap-2 xl:min-w-[420px]" />
            </div>

            {/* ---------- Filter bar ---------- */}
            <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={filters.searchText}
                    onChange={(e) => updateFilter("searchText", e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && fetchTabData(activeTab)
                    }
                    placeholder="Search customer, TRX number, account, reference…"
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setAdvancedOpen((p) => !p)}
                    className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <SlidersIcon className="h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="rounded-full bg-teal-100 px-1.5 text-[11px] font-semibold text-teal-700">
                        {activeFilterCount}
                      </span>
                    )}
                    <ChevronIcon open={advancedOpen} />
                  </button>
                  <button
                    onClick={resetFilters}
                    className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <EraserIcon className="h-4 w-4" />
                    Reset
                  </button>
                  <button
                    onClick={() => fetchTabData(activeTab)}
                    className="inline-flex h-11 items-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <RefreshIcon className="h-4 w-4" />
                    Apply
                  </button>
                </div>
              </div>

              <div
                className={`overflow-hidden transition-all duration-300 ease-out ${advancedOpen ? "mt-4 max-h-[640px] opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="grid grid-cols-1 gap-3 border-t border-slate-200 pt-4 md:grid-cols-2 xl:grid-cols-5">
                  <FilterField label="As On Date">
                    <input
                      type="date"
                      value={filters.asOnDate}
                      onChange={(e) => updateFilter("asOnDate", e.target.value)}
                      className={inputClass}
                    />
                  </FilterField>
                  <FilterField label="Customer Name">
                    <input
                      value={filters.customerName}
                      onChange={(e) =>
                        updateFilter("customerName", e.target.value)
                      }
                      className={inputClass}
                    />
                  </FilterField>
                  <FilterField label="Account Number">
                    <input
                      value={filters.accountNumber}
                      onChange={(e) =>
                        updateFilter("accountNumber", e.target.value)
                      }
                      className={inputClass}
                    />
                  </FilterField>
                  <FilterField label="Account Code">
                    <input
                      value={filters.accountCode}
                      onChange={(e) =>
                        updateFilter("accountCode", e.target.value)
                      }
                      className={inputClass}
                    />
                  </FilterField>
                  <FilterField label="Customer Site">
                    <input
                      value={filters.customerSite}
                      onChange={(e) =>
                        updateFilter("customerSite", e.target.value)
                      }
                      className={inputClass}
                    />
                  </FilterField>
                  <FilterField label="Customer Type">
                    <input
                      value={filters.customerType}
                      onChange={(e) =>
                        updateFilter("customerType", e.target.value)
                      }
                      className={inputClass}
                    />
                  </FilterField>
                  <FilterField label="Region">
                    <input
                      value={filters.customerRegion}
                      onChange={(e) =>
                        updateFilter("customerRegion", e.target.value)
                      }
                      className={inputClass}
                    />
                  </FilterField>
                  <FilterField label="TRX Class">
                    <input
                      value={filters.trxClass}
                      onChange={(e) => updateFilter("trxClass", e.target.value)}
                      className={inputClass}
                    />
                  </FilterField>
                  <FilterField label="TRX Type">
                    <input
                      value={filters.trxType}
                      onChange={(e) => updateFilter("trxType", e.target.value)}
                      className={inputClass}
                    />
                  </FilterField>
                  <FilterField label="Currency">
                    <input
                      value={filters.currencyCode}
                      onChange={(e) =>
                        updateFilter("currencyCode", e.target.value)
                      }
                      className={inputClass}
                    />
                  </FilterField>
                  <FilterField label="Min Balance">
                    <input
                      type="number"
                      value={filters.minBalanceAmount}
                      onChange={(e) =>
                        updateFilter("minBalanceAmount", e.target.value)
                      }
                      className={inputClass}
                    />
                  </FilterField>
                  <FilterField label="Max Balance">
                    <input
                      type="number"
                      value={filters.maxBalanceAmount}
                      onChange={(e) =>
                        updateFilter("maxBalanceAmount", e.target.value)
                      }
                      className={inputClass}
                    />
                  </FilterField>
                  <FilterField label="Due Bucket">
                    <select
                      value={filters.dueBucket}
                      onChange={(e) =>
                        updateFilter("dueBucket", e.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="">All Buckets</option>
                      <option value="NOT_DUE">Not Due</option>
                      <option value="AG_0_TO_5">0 to 5</option>
                      <option value="AG_6_TO_30">6 to 30</option>
                      <option value="AG_31_TO_60">31 to 60</option>
                      <option value="AG_61_TO_90">61 to 90</option>
                      <option value="AG_91_TO_120">91 to 120</option>
                      <option value="AG_121_TO_180">121 to 180</option>
                      <option value="AG_181_TO_365">181 to 365</option>
                      <option value="AG_366_TO_730">366 to 730</option>
                      <option value="AG_731_TO_1095">731 to 1095</option>
                      <option value="AG_MORE_THAN_1095">More than 1095</option>
                    </select>
                  </FilterField>
                  {/* Pagination is only meaningful for Detailed Aging today,
                      so the page-size control is hidden on the other tabs. */}
                  {activeTab === TAB_KEYS.DETAILED && (
                    <FilterField label="Page Size">
                      <select
                        value={filters.pageSize}
                        onChange={(e) =>
                          updateFilter("pageSize", Number(e.target.value))
                        }
                        className={inputClass}
                      >
                        <option value={25}>25 rows</option>
                        <option value={50}>50 rows</option>
                        <option value={100}>100 rows</option>
                        <option value={200}>200 rows</option>
                      </select>
                    </FilterField>
                  )}
                </div>
              </div>
            </div>

            {/* ---------- Tabs ---------- */}
            <div className="relative inline-flex w-fit gap-1 rounded-2xl border border-slate-200 bg-slate-100 p-1">
              <div
                className="absolute top-1 bottom-1 rounded-xl bg-white shadow-sm transition-all duration-300 ease-out"
                style={{ left: indicator.left, width: indicator.width }}
              />
              {tabList.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.key;
                const count = countsByTab[tab.key];
                return (
                  <button
                    key={tab.key}
                    ref={(el) => (tabRefs.current[tab.key] = el)}
                    onClick={() => changeTab(tab.key)}
                    className={`relative z-10 flex h-[42px] items-center gap-2 whitespace-nowrap rounded-xl px-5 text-sm font-medium transition ${
                      isActive
                        ? "text-slate-900"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <TabIcon
                      className={`h-4 w-4 ${isActive ? "text-teal-600" : "text-slate-400"}`}
                    />
                    {tab.label}
                    {/* {count !== undefined && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${isActive ? "bg-teal-50 text-teal-700" : "bg-slate-200 text-slate-500"}`}
                      >
                        {count}
                      </span>
                    )} */}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {/* ---------- Table card ---------- */}
        <div
          ref={tableCardRef}
          className={`overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)] ${isFullscreen ? "flex h-screen w-screen flex-col" : ""}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 md:px-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                {tabList.find((t) => t.key === activeTab)?.label}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Amounts shown in ₹ Lakh · click a column header to sort · click
                a row to highlight it.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                {formatRegularNumber(currentRows.length)} rows
              </div> */}
              <button
                onClick={handleDownloadExcel}
                disabled={exporting || loading}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                title="Download all rows for this report as an Excel file"
              >
                <DownloadIcon className="h-3.5 w-3.5" />
                {exporting ? "Exporting…" : "Download Excel"}
              </button>
              <button
                onClick={toggleFullscreen}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                title={isFullscreen ? "Exit full screen" : "View full screen"}
              >
                {isFullscreen ? (
                  <MinimizeIcon className="h-3.5 w-3.5" />
                ) : (
                  <MaximizeIcon className="h-3.5 w-3.5" />
                )}
                {isFullscreen ? "Exit Full Screen" : "Full Screen"}
              </button>
            </div>
          </div>

          <DataTable
            columns={currentConfig.columns}
            rows={currentRows}
            loading={loading}
            fullscreen={isFullscreen}
            onEditCell={handleEditCell}
            activeTab={activeTab}
          />

          {/* ---------- Pagination ----------
              Only Detailed Aging paginates today. Customer Wise and Format
              Face still send pageNumber/pageSize in the request payload
              (see `payload` above), but there's no Prev/Next UI for them. */}
          {activeTab === TAB_KEYS.DETAILED && (
            <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-5">
              <p className="text-xs text-slate-500">
                {currentRows.length ? (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-slate-700">
                      {(filters.pageNumber - 1) * filters.pageSize + 1}
                    </span>
                    {"–"}
                    <span className="font-semibold text-slate-700">
                      {(filters.pageNumber - 1) * filters.pageSize +
                        currentRows.length}
                    </span>{" "}
                    · {filters.pageSize} rows/page
                  </>
                ) : (
                  "No rows to show"
                )}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => changePage(filters.pageNumber - 1)}
                  disabled={filters.pageNumber <= 1 || loading}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeftIcon className="h-3.5 w-3.5" />
                  Prev
                </button>
                <span className="rounded-xl bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700">
                  Page {filters.pageNumber}
                </span>
                <button
                  onClick={() => changePage(filters.pageNumber + 1)}
                  disabled={currentRows.length < filters.pageSize || loading}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebtorsReportPage;
