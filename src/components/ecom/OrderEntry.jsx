// src/components/ecom/OrderEntry.jsx
import { useEffect, useState } from "react";
import { Calendar, Truck, Info, Upload, X } from "lucide-react";
import SearchableSelect from "../common/SearchableSelect";
import watermark from "../../assets/images/swift-logo.svg";

// design tokens
const ACCENT = "#4a7a92";
const ACCENT_LIGHT = "rgba(74,122,146,0.08)";
const BORDER = "#e2eaf0";
const TEXT_MAIN = "#1a2e3b";
const TEXT_SUB = "#6b8a9a";
const INPUT_FOCUS = "rgba(74,122,146,0.18)";
const ERROR_COLOR = "#ef4444";

// shared input styles
const inputStyle = (focused = false, disabled = false, error = false) => ({
  height: 36,
  padding: "0 12px",
  borderRadius: 9,
  border: `1.5px solid ${error ? ERROR_COLOR : focused ? ACCENT : BORDER}`,
  background: disabled ? "#f8fafc" : "#fff",
  boxShadow: focused ? `0 0 0 3px ${INPUT_FOCUS}` : "none",
  fontSize: 13,
  color: disabled ? TEXT_SUB : TEXT_MAIN,
  cursor: disabled ? "not-allowed" : "text",
  width: "100%",
  boxSizing: "border-box",
  outline: "none",
  fontFamily: "inherit",
  display: "flex",
  alignItems: "center",
  transition: "border-color 0.15s, box-shadow 0.15s",
  opacity: disabled ? 0.7 : 1,
});

const textareaStyle = (disabled = false) => ({
  padding: "8px 12px",
  borderRadius: 9,
  border: `1.5px solid ${BORDER}`,
  background: disabled ? "#f8fafc" : "#fff",
  fontSize: 13,
  color: disabled ? TEXT_SUB : TEXT_MAIN,
  cursor: disabled ? "not-allowed" : "text",
  width: "100%",
  boxSizing: "border-box",
  outline: "none",
  fontFamily: "inherit",
  resize: "vertical",
  lineHeight: 1.5,
  transition: "border-color 0.15s, box-shadow 0.15s",
});

const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "#4a6070",
  marginBottom: 4,
  display: "flex",
  alignItems: "center",
  gap: 3,
  letterSpacing: "0.01em",
};

const fieldWrapStyle = {
  display: "flex",
  flexDirection: "column",
};

// Focus aware input
const FocusInput = ({ style: extraStyle, disabled, error, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      disabled={disabled}
      style={{ ...inputStyle(focused, disabled, error), ...extraStyle }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
};

const FocusTextarea = ({ style: extraStyle, disabled, rows = 3, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      {...props}
      disabled={disabled}
      rows={rows}
      style={{
        ...textareaStyle(disabled),
        minHeight: rows * 22 + 16,
        ...extraStyle,
      }}
      onFocus={(e) => {
        setFocused(true);
        e.target.style.borderColor = ACCENT;
        e.target.style.boxShadow = `0 0 0 3px ${INPUT_FOCUS}`;
      }}
      onBlur={(e) => {
        setFocused(false);
        e.target.style.borderColor = BORDER;
        e.target.style.boxShadow = "none";
      }}
    />
  );
};

// Read-only rate cell: shows spinner while fetching, then locks the API value
const RateDisplay = ({ line, error }) => {
  if (line.rateLoading) {
    return (
      <div
        style={{
          ...inputStyle(false, true),
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span
          style={{
            width: 12,
            height: 12,
            border: "2px solid #cbd5e1",
            borderTopColor: "transparent",
            borderRadius: "50%",
            display: "inline-block",
            animation: "spin 0.7s linear infinite",
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 11, color: TEXT_SUB }}>Fetching…</span>
      </div>
    );
  }

  return (
    <FocusInput
      value={line.rate !== "" ? line.rate : "—"}
      disabled
      error={error}
      style={{ color: line.rate ? TEXT_MAIN : TEXT_SUB }}
    />
  );
};

const Field = ({ label, required, error, children, style }) => (
  <div style={{ ...fieldWrapStyle, ...style }} className="order-field">
    <label style={labelStyle}>
      {label}
      {required && <span style={{ color: ERROR_COLOR }}>*</span>}
    </label>
    {children}
    {error && (
      <span style={{ fontSize: 11, color: ERROR_COLOR, marginTop: 3 }}>
        {error}
      </span>
    )}
  </div>
);

const Divider = () => (
  <div style={{ borderTop: `1px solid ${BORDER}`, margin: "4px 0" }} />
);

// dropdown constants
const TPI_OPTIONS = [
  { id: "Y", name: "Yes" },
  { id: "N", name: "No" },
];
const TEST_CERT_OPTIONS = [
  { id: "N", name: "No" },
  { id: "Y", name: "Yes (with extra charges)" },
];
const DELIVERY_TYPE_OPTIONS = [
  { id: "FULL", name: "Full" },
  { id: "PARTIAL", name: "Partial" },
];

const INITIAL_HEADER = (orderNo) => ({
  orderNo: orderNo || "",
  amaId: "",
  custId: "",
  customerName: "",
  address: "",
  orderDate: new Date().toISOString().slice(0, 10),
  enquiryRef: "",
  remarks: "",
  freightTermId: "",
  freightTermText: "COLLECT",
  fobId: "",
  shippingInstruction: "",
  packingInstruction: "",
  destination: "",
  transporter: "",
  tpiRequired: "N",
  inspPeriodId: "",
  inspOrg: "",
  tpContactPerson: "",
  tpContactNo: "",
  tpEmail: "",
  testCert: "N",
  deliveryType: "FULL",
  poFile: null,
  poFileName: "",
});

// main component
const OrderEntry = ({
  orderNo,
  dropdowns,
  loadingMeta,
  saving,
  currentUserId,
  onReloadMeta,
  onSaveOrder,
  onGetProductRate,
}) => {
  const [header, setHeader] = useState(INITIAL_HEADER(orderNo));
  const [lines, setLines] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setHeader(INITIAL_HEADER(orderNo));
    setLines([]);
    setErrors({});
  }, [orderNo]);

  const isTpiYes = header.tpiRequired === "Y";
  const totalAmount = lines.reduce((s, l) => s + (Number(l.amount) || 0), 0);

  const updateHeader = (field, value) => {
    setHeader((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handleCustomerChange = (id) => {
    const s = dropdowns.customers.find((c) => String(c.id) === String(id));
    if (!s) return;
    updateHeader("custId", s.id);
    updateHeader("amaId", s.amaId);
    updateHeader("customerName", s.name);
    updateHeader("address", s.address);
    if (errors.custId) setErrors((e) => ({ ...e, custId: undefined }));
  };

  const handleFreightTermChange = (id) => {
    const term = dropdowns.freightTerms.find(
      (t) => String(t.id) === String(id),
    );
    const text = term?.name || "COLLECT";
    updateHeader("freightTermId", id);
    updateHeader("freightTermText", text);
    setLines((p) => p.map((l) => ({ ...l, packingTerm: text })));
  };

  const handleTpiChange = (v) => {
    updateHeader("tpiRequired", v);
    if (v === "Y") {
      updateHeader("testCert", "N");
    } else {
      [
        "inspPeriodId",
        "inspOrg",
        "tpContactPerson",
        "tpContactNo",
        "tpEmail",
      ].forEach((f) => updateHeader(f, ""));
    }
  };

  const handleProductChange = async (lineId, itemId) => {
    const product = (dropdowns.products || []).find(
      (p) => String(p.id) === String(itemId),
    );
    if (!product) return;

    // Reset line fields and show rate spinner
    setLines((prev) =>
      prev.map((l) =>
        l.id === lineId
          ? {
              ...l,
              prodId: product.item_id,
              prodCode: product.item_Code,
              prodName: product.item_Desc,
              uom: product.UOM,
              rate: "",
              amount: 0,
              listHeaderId: "",
              rateLoading: true,
            }
          : l,
      ),
    );

    const rateData = await onGetProductRate?.(product.item_Code);

    // Settle the rate; use latest qty snapshot for amount calculation
    setLines((prev) =>
      prev.map((l) =>
        l.id === lineId
          ? {
              ...l,
              rate: rateData?.rate?.toString() ?? "",
              listHeaderId: rateData?.listHeaderId ?? "",
              amount: Number(l.qty || 0) * Number(rateData?.rate || 0),
              rateLoading: false,
            }
          : l,
      ),
    );
  };

  const handleLineFieldChange = (lineId, field, value) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== lineId) return l;
        const updated = { ...l, [field]: value };
        if (field === "qty") {
          const qty = Number(value) || 0;
          const rate = Number(updated.rate) || 0;
          updated.amount = qty * rate;
        }
        return updated;
      }),
    );
  };

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      {
        id: Date.now(),
        prodId: "",
        prodCode: "",
        prodName: "",
        uom: "",
        qty: "",
        rate: "",
        amount: 0,
        note: "",
        listHeaderId: "",
        lineTypeId: "",
        rateLoading: false,
      },
    ]);
  };

  const removeLine = (lineId) => {
    setLines((prev) => prev.filter((l) => l.id !== lineId));
  };

  const validate = () => {
    const e = {};
    if (!header.custId) e.custId = "Customer is required";
    if (!header.orderDate) e.orderDate = "Order date is required";
    if (!header.freightTermId) e.freightTermId = "Freight term is required";
    if (!header.destination.trim()) e.destination = "Destination is required";

    if (lines.length === 0) e.lines = "At least one line item is required";

    lines.forEach((l, idx) => {
      if (!l.prodId) e[`line_prod_${idx}`] = "Product is required";
      if (!l.qty || Number(l.qty) <= 0)
        e[`line_qty_${idx}`] = "Qty must be > 0";
      if (!l.rate || Number(l.rate) <= 0)
        e[`line_rate_${idx}`] = "Rate unavailable — select a valid product";
    });

    if (isTpiYes) {
      if (!header.inspPeriodId)
        e.inspPeriodId = "Inspection period is required";
      if (!header.inspOrg.trim())
        e.inspOrg = "Inspection organisation is required";
    }
    return e;
  };

  const handleSave = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    const payload = buildOrderPayload(header, lines, currentUserId);
    onSaveOrder?.(payload);
  };

  const handlePoFileChange = (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    updateHeader("poFile", file);
    updateHeader("poFileName", file.name);
  };

  const clearPoFile = () => {
    updateHeader("poFile", null);
    updateHeader("poFileName", "");
  };

  // layout
  return (
    <div className="relative min-h-screen bg-[#f0f4f8] p-3 sm:p-5">
      {/* watermark */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center z-0 opacity-[0.03]">
        <img
          src={watermark}
          alt=""
          className="w-[480px] max-w-[70vw] select-none"
          draggable={false}
        />
      </div>

      <div className="relative z-10 mx-auto flex flex-col gap-3 sm:gap-4">
        {/* header row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
          <div>
            <h1 className="text-[20px] sm:text-[22px] font-bold text-slate-900 tracking-tight">
              Order Entry
            </h1>
            <p className="text-[12px] sm:text-[13px] text-slate-500 mt-1">
              Create a new sales order with customer and line details
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 justify-start sm:justify-end">
            <button
              type="button"
              onClick={onReloadMeta}
              disabled={loadingMeta}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm text-slate-600 hover:border-slate-400 disabled:opacity-50"
            >
              Reload master data
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loadingMeta}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#5d8fa8,#3a6478)" }}
            >
              {saving ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Calendar size={14} />
                  Save Order
                </>
              )}
            </button>
          </div>
        </div>

        {/* top info bar */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-[12px] text-slate-500">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/70 border border-slate-200">
            <Info size={11} className="text-slate-400" />
            Order No:{" "}
            <span className="font-semibold text-slate-800">
              {header.orderNo || "Pending"}
            </span>
          </span>
          {loadingMeta && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Loading master data...
            </span>
          )}
        </div>

        {/* main card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 sm:p-4 flex flex-col gap-4">
          {/* customer + logistics section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {/* left: customer & header */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <Truck size={16} className="text-slate-400" />
                <p className="text-[11px] font-semibold text-slate-500 tracking-[0.14em] uppercase">
                  Customer &amp; Header
                </p>
              </div>

              <Field label="Customer" required error={errors.custId}>
                <SearchableSelect
                  value={header.custId}
                  onChange={handleCustomerChange}
                  options={dropdowns.customers}
                  placeholder="Select customer..."
                  disabled={loadingMeta}
                  error={!!errors.custId}
                />
              </Field>

              <Field label="Customer Address">
                <FocusTextarea
                  value={header.address}
                  onChange={(e) => updateHeader("address", e.target.value)}
                  disabled
                  rows={3}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Order Date" required error={errors.orderDate}>
                  <FocusInput
                    type="date"
                    value={header.orderDate}
                    onChange={(e) => updateHeader("orderDate", e.target.value)}
                    disabled={loadingMeta}
                    error={!!errors.orderDate}
                  />
                </Field>

                <Field label="Customer Enquiry / PO Ref">
                  <FocusInput
                    value={header.enquiryRef}
                    onChange={(e) => updateHeader("enquiryRef", e.target.value)}
                    placeholder="Customer enquiry / PO reference"
                    maxLength={50}
                  />
                </Field>
              </div>

              <Field label="General Remarks">
                <FocusTextarea
                  value={header.remarks}
                  onChange={(e) => updateHeader("remarks", e.target.value)}
                  rows={3}
                  placeholder="Any special notes or order remarks..."
                />
              </Field>
            </div>

            {/* right: freight & logistics */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <Truck size={16} className="text-slate-400" />
                <p className="text-[11px] font-semibold text-slate-500 tracking-[0.14em] uppercase">
                  Freight &amp; Logistics
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field
                  label="Freight Term"
                  required
                  error={errors.freightTermId}
                >
                  <SearchableSelect
                    value={header.freightTermId}
                    onChange={handleFreightTermChange}
                    options={dropdowns.freightTerms}
                    placeholder="Select freight term"
                    disabled={loadingMeta}
                    error={!!errors.freightTermId}
                  />
                </Field>

                <Field label="FOB / Delivery Term">
                  <SearchableSelect
                    value={header.fobId}
                    onChange={(id) => updateHeader("fobId", id)}
                    options={dropdowns.dispatchInstructions}
                    placeholder="Select FOB / delivery term"
                    disabled={loadingMeta}
                  />
                </Field>
              </div>

              <Field label="Destination" required error={errors.destination}>
                <FocusInput
                  value={header.destination}
                  onChange={(e) => updateHeader("destination", e.target.value)}
                  placeholder="Final destination"
                  error={!!errors.destination}
                />
              </Field>

              <Field label="Transporter Name">
                <FocusInput
                  value={header.transporter}
                  onChange={(e) => updateHeader("transporter", e.target.value)}
                  placeholder="Enter transporter name"
                />
              </Field>

              <Field label="Shipping Instruction">
                <FocusTextarea
                  value={header.shippingInstruction}
                  onChange={(e) =>
                    updateHeader("shippingInstruction", e.target.value)
                  }
                  rows={3}
                  placeholder="Any special shipping instructions..."
                />
              </Field>

              <Field label="Packing Instruction">
                <FocusTextarea
                  value={header.packingInstruction}
                  onChange={(e) =>
                    updateHeader("packingInstruction", e.target.value)
                  }
                  rows={3}
                  placeholder="Any special packing instructions..."
                />
              </Field>
            </div>
          </div>

          <Divider />

          {/* TPI & test certificate section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <Info size={16} className="text-slate-400" />
                <p className="text-[11px] font-semibold text-slate-500 tracking-[0.14em] uppercase">
                  Inspection &amp; TPI
                </p>
              </div>

              <Field label="TPI Required">
                <SearchableSelect
                  value={header.tpiRequired}
                  onChange={handleTpiChange}
                  options={TPI_OPTIONS}
                  placeholder="Is TPI required?"
                />
              </Field>

              {isTpiYes && (
                <>
                  <Field
                    label="Inspection Period"
                    required
                    error={errors.inspPeriodId}
                  >
                    <SearchableSelect
                      value={header.inspPeriodId}
                      onChange={(id) => updateHeader("inspPeriodId", id)}
                      options={dropdowns.inspPeriods}
                      placeholder="Select inspection period"
                      disabled={loadingMeta}
                      error={!!errors.inspPeriodId}
                    />
                  </Field>

                  <Field
                    label="Inspection Organisation"
                    required
                    error={errors.inspOrg}
                  >
                    <FocusInput
                      value={header.inspOrg}
                      onChange={(e) => updateHeader("inspOrg", e.target.value)}
                      placeholder="Name of inspection organisation"
                      error={!!errors.inspOrg}
                    />
                  </Field>

                  <Field label="TP Contact Person">
                    <FocusInput
                      value={header.tpContactPerson}
                      onChange={(e) =>
                        updateHeader("tpContactPerson", e.target.value)
                      }
                      placeholder="Third party contact person name"
                    />
                  </Field>

                  <Field label="TP Contact No">
                    <FocusInput
                      value={header.tpContactNo}
                      onChange={(e) =>
                        updateHeader("tpContactNo", e.target.value)
                      }
                      placeholder="Third party contact number"
                    />
                  </Field>

                  <Field label="TP Email">
                    <FocusInput
                      type="email"
                      value={header.tpEmail}
                      onChange={(e) => updateHeader("tpEmail", e.target.value)}
                      placeholder="Third party email address"
                    />
                  </Field>
                </>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <Info size={16} className="text-slate-400" />
                <p className="text-[11px] font-semibold text-slate-500 tracking-[0.14em] uppercase">
                  Test Certificate &amp; Delivery
                </p>
              </div>

              <Field label="Test Certificate">
                <SearchableSelect
                  value={header.testCert}
                  onChange={(id) => updateHeader("testCert", id)}
                  options={TEST_CERT_OPTIONS}
                  placeholder="Is test certificate required?"
                />
              </Field>

              <Field label="Delivery Type">
                <SearchableSelect
                  value={header.deliveryType}
                  onChange={(id) => updateHeader("deliveryType", id)}
                  options={DELIVERY_TYPE_OPTIONS}
                  placeholder="Full or partial deliveries"
                />
              </Field>

              <Field label="Customer PO File">
                <div className="flex flex-col gap-2">
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50/60 text-[12px] text-slate-600 cursor-pointer hover:border-slate-400">
                    <Upload size={14} className="text-slate-400" />
                    <span>Upload PO / Enquiry (PDF, Image, etc.)</span>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      className="hidden"
                      onChange={handlePoFileChange}
                    />
                  </label>
                  {header.poFileName && (
                    <div className="flex items-center justify-between gap-2 text-[12px] bg-slate-50 px-3 py-1.5 rounded-md">
                      <span className="truncate">{header.poFileName}</span>
                      <button
                        type="button"
                        onClick={clearPoFile}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </Field>
            </div>
          </div>

          <Divider />

          {/* line items section */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-slate-400" />
                <p className="text-[11px] font-semibold text-slate-500 tracking-[0.14em] uppercase">
                  Line Items
                </p>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-slate-500">
                <span>
                  Total amount:{" "}
                  <span className="font-semibold text-slate-800">
                    {totalAmount.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={addLine}
                  className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-[12px] font-medium text-slate-700 hover:border-slate-400"
                >
                  + Add Line
                </button>
              </div>
            </div>
            {errors.lines && (
              <p className="text-[11px] text-red-500 mt-1">{errors.lines}</p>
            )}

            {/* desktop table */}
            <div className="hidden md:block overflow-auto max-h-[420px] mt-1">
              <table className="w-full text-xs min-w-[960px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {[
                      "#",
                      "Product",
                      "Line Type",
                      "Qty",
                      "UOM",
                      "Rate",
                      "Amount",
                      "Notes",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-2 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lines.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="text-center py-6 text-slate-400 text-[11px]"
                      >
                        No line items added yet. Use "Add Line" to start.
                      </td>
                    </tr>
                  ) : (
                    lines.map((l, idx) => (
                      <tr
                        key={l.id}
                        className="border-b border-slate-100 hover:bg-slate-50/70"
                      >
                        <td className="px-2 py-2 text-slate-400 align-top">
                          {idx + 1}
                        </td>
                        <td className="px-2 py-2 w-[260px] align-top">
                          <SearchableSelect
                            value={l.prodId}
                            onChange={(val) => handleProductChange(l.id, val)}
                            options={dropdowns.products}
                            placeholder="Select product"
                            error={!!errors[`line_prod_${idx}`]}
                            virtualized
                          />
                          {errors[`line_prod_${idx}`] && (
                            <p className="text-[10px] text-red-500 mt-1">
                              {errors[`line_prod_${idx}`]}
                            </p>
                          )}
                          {l.prodName && (
                            <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                              {l.prodName}
                            </p>
                          )}
                        </td>
                        <td className="px-2 py-2 w-[140px] align-top">
                          <SearchableSelect
                            value={l.lineTypeId}
                            onChange={(val) =>
                              handleLineFieldChange(l.id, "lineTypeId", val)
                            }
                            options={dropdowns.lineTypes}
                            placeholder="Line type"
                          />
                        </td>
                        <td className="px-2 py-2 w-[80px] align-top">
                          <FocusInput
                            value={l.qty}
                            onChange={(e) =>
                              handleLineFieldChange(l.id, "qty", e.target.value)
                            }
                            type="number"
                            min="0"
                            step="1"
                          />
                          {errors[`line_qty_${idx}`] && (
                            <p className="text-[10px] text-red-500 mt-1">
                              {errors[`line_qty_${idx}`]}
                            </p>
                          )}
                        </td>
                        <td className="px-2 py-2 w-[80px] align-top">
                          <FocusInput value={l.uom} disabled />
                        </td>

                        {/* ── Rate: API-only, read-only ── */}
                        <td className="px-2 py-2 w-[120px] align-top">
                          <RateDisplay
                            line={l}
                            error={!!errors[`line_rate_${idx}`]}
                          />
                          {errors[`line_rate_${idx}`] && (
                            <p className="text-[10px] text-red-500 mt-1">
                              {errors[`line_rate_${idx}`]}
                            </p>
                          )}
                        </td>

                        <td className="px-2 py-2 w-[120px] align-top">
                          <FocusInput value={l.amount} disabled />
                        </td>
                        <td className="px-2 py-2 w-[220px] align-top">
                          <FocusTextarea
                            value={l.note}
                            onChange={(e) =>
                              handleLineFieldChange(
                                l.id,
                                "note",
                                e.target.value,
                              )
                            }
                            rows={2}
                          />
                        </td>
                        <td className="px-2 py-2 align-top">
                          <button
                            type="button"
                            onClick={() => removeLine(l.id)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <X size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* mobile line items as cards */}
            <div className="md:hidden flex flex-col gap-2 mt-1 max-h-[420px] overflow-y-auto">
              {lines.length === 0 ? (
                <p className="text-center text-slate-400 text-[11px] py-4">
                  No line items added yet. Use "Add Line" to start.
                </p>
              ) : (
                lines.map((l, idx) => (
                  <div
                    key={l.id}
                    className="rounded-lg border border-slate-200 bg-slate-50/60 p-2 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-semibold text-slate-600">
                        Line {idx + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeLine(l.id)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <Field label="Product">
                      <SearchableSelect
                        value={l.prodId}
                        onChange={(val) => handleProductChange(l.id, val)}
                        options={dropdowns.products}
                        placeholder="Select product"
                        error={!!errors[`line_prod_${idx}`]}
                        virtualized
                      />
                      {l.prodName && (
                        <p className="text-[10px] text-slate-500 mt-1">
                          {l.prodName}
                        </p>
                      )}
                    </Field>

                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Line Type">
                        <SearchableSelect
                          value={l.lineTypeId}
                          onChange={(val) =>
                            handleLineFieldChange(l.id, "lineTypeId", val)
                          }
                          options={dropdowns.lineTypes}
                          placeholder="Type"
                        />
                      </Field>
                      <Field label="UOM">
                        <FocusInput value={l.uom} disabled />
                      </Field>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <Field label="Qty">
                        <FocusInput
                          value={l.qty}
                          onChange={(e) =>
                            handleLineFieldChange(l.id, "qty", e.target.value)
                          }
                          type="number"
                          min="0"
                          step="1"
                        />
                      </Field>

                      {/* ── Rate: API-only, read-only ── */}
                      <Field label="Rate" error={errors[`line_rate_${idx}`]}>
                        <RateDisplay
                          line={l}
                          error={!!errors[`line_rate_${idx}`]}
                        />
                      </Field>

                      <Field label="Amount">
                        <FocusInput value={l.amount} disabled />
                      </Field>
                    </div>

                    <Field label="Notes">
                      <FocusTextarea
                        value={l.note}
                        onChange={(e) =>
                          handleLineFieldChange(l.id, "note", e.target.value)
                        }
                        rows={2}
                      />
                    </Field>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 767px) {
          .order-field { min-width: 0; }
        }
      `}</style>
    </div>
  );
};

export default OrderEntry;

// payload builder stays same
function buildOrderPayload(header, lines, userId) {
  const now = new Date().toISOString();
  return {
    orderHdr: {
      order_date: header.orderDate,
      cust_id: header.custId,
      payment_term: 818944,
      fob: header.fobId,
      order_type: "M",
      freight_term: header.freightTermId || null,
      FREIGHT_TERMS: header.freightTermText || "COLLECT",
      FREIGHT_TERMS_id: header.freightTermId || null,
      ship_instruc: header.shippingInstruction,
      pack_instruc: header.packingInstruction,
      order_note: header.remarks,
      cust_order_ref: header.enquiryRef,
      tp_req: header.tpiRequired,
      insp_period_id: header.inspPeriodId || null,
      tp_org: header.inspOrg,
      tp_contact_per: header.tpContactPerson,
      tp_contact_no: header.tpContactNo,
      tp_email: header.tpEmail,
      test_cert: header.testCert,
      created_by: userId,
      created_on: now,
      doc_no: header.orderNo,
      ama_id: header.amaId,
      destination: header.destination,
      transporter: header.transporter,
      deliv_type: header.deliveryType,
    },
    orderTrl: lines.map((l) => ({
      order_id: 0,
      prod_id: Number(l.prodId),
      qty: Number(l.qty),
      rate: Number(l.rate),
      amount: Number(l.amount),
      note1: l.note,
      created_by: userId,
      created_on: now,
      destination: header.destination,
      transporter: header.transporter,
      pack_instruc: header.freightTermText || "COLLECT",
      list_header_id: Number(l.listHeaderId),
      line_type_id: Number(l.lineTypeId),
      FREIGHT_TERMS: header.freightTermText || "COLLECT",
      FREIGHT_TERMS_id: header.freightTermId || null,
      exchange_rate: 1,
    })),
  };
}
