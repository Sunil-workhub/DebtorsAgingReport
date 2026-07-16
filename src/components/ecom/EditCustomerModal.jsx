import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

// ── Design tokens ─────────────────────────────────────────────
const ACCENT = "#4a7a92";
const ACCENT_LIGHT = "rgba(74,122,146,0.08)";
const ACCENT_BORDER = "rgba(74,122,146,0.35)";
const TEXT_MAIN = "#1a2e3b";
const TEXT_SUB = "#6b8a9a";
const BORDER = "#e2eaf0";
const ERROR = "#ef4444";
const ERROR_BG = "#fef2f2";
const INPUT_FOCUS = "rgba(74,122,146,0.18)";

const inputBase = (error) => ({
  height: 36,
  padding: "0 12px",
  borderRadius: 9,
  border: `1.5px solid ${error ? ERROR : BORDER}`,
  background: error ? ERROR_BG : "#fff",
  fontSize: 13,
  color: TEXT_MAIN,
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.15s, box-shadow 0.15s",
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
});
const focusOn = (e) => {
  e.target.style.borderColor = ACCENT;
  e.target.style.boxShadow = `0 0 0 3px ${INPUT_FOCUS}`;
};
const focusOff = (e, err) => {
  e.target.style.borderColor = err ? ERROR : BORDER;
  e.target.style.boxShadow = "none";
};

// ── Field ─────────────────────────────────────────────────────
const Field = ({ label, required, error, children }) => (
  <div
    style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}
  >
    <label
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: error ? ERROR : TEXT_SUB,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      {label}
      {required && <span style={{ color: ERROR, marginLeft: 3 }}>*</span>}
    </label>
    {children}
    {error && <span style={{ fontSize: 11, color: ERROR }}>{error}</span>}
  </div>
);

// ── TextInput ─────────────────────────────────────────────────
const TextInput = ({ value, onChange, placeholder, error, type = "text" }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    style={inputBase(error)}
    onFocus={focusOn}
    onBlur={(e) => focusOff(e, error)}
  />
);

// ── SearchableSelect ──────────────────────────────────────────
const SearchableSelect = ({
  value,
  onChange,
  options,
  placeholder,
  error,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [panelStyle, setPanelStyle] = useState({});
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  const selectedLabel =
    options.find((o) => String(o.id) === String(value))?.name ?? "";
  const filtered = options.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()),
  );

  const recalcPosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUpward = spaceBelow < 258 && spaceAbove > spaceBelow;
    setPanelStyle({
      position: "fixed",
      left: rect.left,
      width: rect.width,
      zIndex: 100001,
      ...(openUpward
        ? { bottom: window.innerHeight - rect.top + 5 }
        : { top: rect.bottom + 5 }),
    });
  };

  useEffect(() => {
    const outside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        !document.getElementById("edit-ss-portal")?.contains(e.target)
      ) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  useEffect(() => {
    if (!open) return;
    const upd = () => recalcPosition();
    window.addEventListener("scroll", upd, true);
    window.addEventListener("resize", upd);
    return () => {
      window.removeEventListener("scroll", upd, true);
      window.removeEventListener("resize", upd);
    };
  }, [open]);

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  const handleToggle = () => {
    if (disabled) return;
    if (!open) recalcPosition();
    setOpen((p) => !p);
    if (open) setSearch("");
  };
  const handleSelect = (id) => {
    onChange(String(id));
    setOpen(false);
    setSearch("");
  };

  const panel =
    open &&
    !disabled &&
    ReactDOM.createPortal(
      <div
        id="edit-ss-portal"
        style={{
          ...panelStyle,
          background: "#fff",
          border: `1.5px solid ${ACCENT_BORDER}`,
          borderRadius: 10,
          boxShadow: "0 8px 28px rgba(30,60,80,0.13)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "8px 10px",
            borderBottom: `1px solid ${BORDER}`,
            display: "flex",
            alignItems: "center",
            gap: 7,
            background: "#fafcfd",
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke={TEXT_SUB}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: 12,
              color: TEXT_MAIN,
              background: "transparent",
              fontFamily: "inherit",
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                color: TEXT_SUB,
                display: "flex",
                alignItems: "center",
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
        <div style={{ maxHeight: 210, overflowY: "auto", padding: "4px 0" }}>
          {filtered.length === 0 ? (
            <div
              style={{
                padding: "14px",
                fontSize: 12,
                color: TEXT_SUB,
                textAlign: "center",
              }}
            >
              No results for "{search}"
            </div>
          ) : (
            filtered.map((o) => {
              const isSel = String(o.id) === String(value);
              return (
                <div
                  key={o.id}
                  onClick={() => handleSelect(o.id)}
                  style={{
                    padding: "8px 14px",
                    fontSize: 13,
                    cursor: "pointer",
                    color: isSel ? ACCENT : TEXT_MAIN,
                    background: isSel ? ACCENT_LIGHT : "transparent",
                    fontWeight: isSel ? 600 : 400,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSel) e.currentTarget.style.background = "#f4f8fb";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSel)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {o.name}
                  </span>
                  {isSel && (
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={ACCENT}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ flexShrink: 0 }}
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>,
      document.body,
    );

  return (
    <div ref={containerRef} style={{ position: "relative", minWidth: 0 }}>
      <div
        onClick={handleToggle}
        style={{
          height: 36,
          padding: "0 32px 0 12px",
          borderRadius: 9,
          border: `1.5px solid ${error ? ERROR : open ? ACCENT : BORDER}`,
          background: error ? ERROR_BG : "#fff",
          boxShadow: open ? `0 0 0 3px ${INPUT_FOCUS}` : "none",
          fontSize: 13,
          color: value ? TEXT_MAIN : TEXT_SUB,
          display: "flex",
          alignItems: "center",
          cursor: disabled ? "not-allowed" : "pointer",
          userSelect: "none",
          boxSizing: "border-box",
          width: "100%",
          transition: "border-color 0.15s, box-shadow 0.15s",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}
        >
          {disabled ? "Loading..." : selectedLabel || placeholder}
        </span>
      </div>
      <svg
        style={{
          position: "absolute",
          right: 9,
          top: "50%",
          transform: `translateY(-50%) rotate(${open ? "180deg" : "0deg"})`,
          pointerEvents: "none",
          color: open ? ACCENT : TEXT_SUB,
          transition: "transform 0.2s, color 0.15s",
        }}
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
      {panel}
    </div>
  );
};

// ── SectionCard ───────────────────────────────────────────────
const SectionCard = ({ title, icon, children }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: 14,
      border: `1px solid ${BORDER}`,
      boxShadow: "0 1px 4px rgba(30,60,80,0.06)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        background: ACCENT_LIGHT,
        borderBottom: `1px solid ${ACCENT_BORDER}`,
        padding: "10px 18px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 15 }}>{icon}</span>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: ACCENT,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {title}
      </span>
    </div>
    <div
      style={{
        flex: 1,
        padding: "18px 18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {children}
    </div>
  </div>
);

// ── Row ───────────────────────────────────────────────────────
const Row = ({ children }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(${Array.isArray(children) ? children.filter(Boolean).length : 1}, 1fr)`,
      gap: 12,
    }}
    className="form-row"
  >
    {children}
  </div>
);

// ── Map API customer → form state ─────────────────────────────
const toFormState = (c) => ({
  customerName: c?.party_Name ?? "",
  address1: c?.add1 ?? c?.Add1 ?? "",
  address2: c?.add2 ?? c?.Add2 ?? "",
  address3: c?.add3 ?? c?.Add3 ?? "",
  cityId: String(c?.city_Id ?? c?.cityId ?? ""),
  segmentId: String(c?.segment_Id ?? c?.segmentId ?? ""),
  sectorId: String(c?.sector_Id ?? c?.sectorId ?? ""),
  pinCode: c?.zip_Code ?? c?.zipCode ?? "",
  panNo: c?.pan_No ?? c?.panNo ?? "",
  gstNo: c?.gst_No ?? c?.gstNo ?? "",
  tinNo: c?.tin_No ?? c?.tinNo ?? "",
  titleId: String(c?.title ?? c?.title_Id ?? c?.titleId ?? ""),
  firstName: c?.first_Name ?? c?.firstName ?? "",
  lastName: c?.last_Name ?? c?.lastName ?? "",
  telNo: c?.telephone ?? c?.telNo ?? "",
  mobileNo: c?.mobile ?? c?.mobileNo ?? "",
  email: c?.email_Id ?? c?.email ?? "",
});

const EMPTY_FORM = {
  customerName: "",
  address1: "",
  address2: "",
  address3: "",
  cityId: "",
  segmentId: "",
  sectorId: "",
  pinCode: "",
  panNo: "",
  gstNo: "",
  tinNo: "",
  titleId: "",
  firstName: "",
  lastName: "",
  telNo: "",
  mobileNo: "",
  email: "",
};

// ── Main export ───────────────────────────────────────────────
export default function EditCustomerModal({
  isOpen,
  onClose,
  customer,
  dropdowns,
  dropdownLoading,
  onSave,
  saving,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const {
    titles = [],
    cities = [],
    segments = [],
    sectors = [],
  } = dropdowns || {};

  useEffect(() => {
    if (customer) setForm(toFormState(customer));
    setErrors({});
  }, [customer]);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.customerName.trim()) e.customerName = "Customer name is required";
    if (!form.address1.trim()) e.address1 = "Address 1 is required";
    if (!form.cityId) e.cityId = "City is required";
    if (!form.segmentId) e.segmentId = "Segment is required";
    if (!form.sectorId) e.sectorId = "Sector is required";
    if (!form.panNo.trim()) e.panNo = "PAN No is required";
    if (!form.gstNo.trim()) e.gstNo = "GST No is required";
    if (!form.tinNo.trim()) e.tinNo = "TIN No is required";
    if (!form.titleId) e.titleId = "Title is required";
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!form.telNo.trim()) e.telNo = "Tel no is required";
    if (!form.mobileNo.trim()) e.mobileNo = "Mobile no is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onSave(form, customer?.cust_Id);
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15,30,45,0.6)",
          backdropFilter: "blur(3px)",
          zIndex: 99998,
        }}
      />

      {/* ── Centering wrapper ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 16px",
        }}
      >
        {/* ── Modal panel — flex column, no overflow on itself ── */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#f0f4f8",
            borderRadius: 18,
            width: "100%",
            maxWidth: 1080,
            boxShadow: "0 24px 64px rgba(10,30,50,0.28)",
            display: "flex", // ← flex column
            flexDirection: "column",
            overflow: "hidden", // ← clips rounded corners
            maxHeight: "calc(100vh - 60px)", // ← safety cap so panel never goes offscreen
          }}
        >
          {/* ════════════════════════════════════
              STICKY HEADER — never scrolls
          ════════════════════════════════════ */}
          <div
            style={{
              flexShrink: 0,
              padding: "20px 22px 16px",
              borderBottom: `1px solid ${BORDER}`,
              background: "#f0f4f8",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 19,
                    fontWeight: 700,
                    color: TEXT_MAIN,
                    letterSpacing: "-0.3px",
                  }}
                >
                  Edit Customer
                </h2>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: TEXT_SUB }}>
                  Update details for{" "}
                  <strong style={{ color: TEXT_MAIN }}>
                    {customer?.party_Name ?? "—"}
                  </strong>
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Breadcrumb pill */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    background: ACCENT_LIGHT,
                    border: `1px solid ${ACCENT_BORDER}`,
                    borderRadius: 20,
                    padding: "4px 12px",
                    fontSize: 11,
                    color: ACCENT,
                    fontWeight: 600,
                  }}
                >
                  <span style={{ opacity: 0.65 }}>Customer</span>
                  <span style={{ opacity: 0.4 }}>/</span>
                  <span>Edit</span>
                </div>
                {/* Close button */}
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: `1.5px solid ${BORDER}`,
                    background: "#fff",
                    color: TEXT_SUB,
                    cursor: saving ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "border-color 0.15s, color 0.15s",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    if (!saving) {
                      e.currentTarget.style.borderColor = ERROR;
                      e.currentTarget.style.color = ERROR;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = BORDER;
                    e.currentTarget.style.color = TEXT_SUB;
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════
              SCROLLABLE FORM BODY
          ════════════════════════════════════ */}
          <div
            style={{
              overflowY: "auto",
              maxHeight: "calc(100vh - 300px)", // ← controlled scroll area
              padding: "18px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {/* Two-column layout */}
            <div
              className="edit-two-col"
              style={{ display: "flex", gap: 14, alignItems: "stretch" }}
            >
              {/* LEFT — Company Information */}
              <SectionCard title="Company Information" icon="🏢">
                <Field
                  label="Customer Name"
                  required
                  error={errors.customerName}
                >
                  <TextInput
                    value={form.customerName}
                    onChange={(v) => handleChange("customerName", v)}
                    placeholder="Full customer / company name"
                    error={errors.customerName}
                  />
                </Field>
                <Row>
                  <Field
                    label="Address Line 1"
                    required
                    error={errors.address1}
                  >
                    <TextInput
                      value={form.address1}
                      onChange={(v) => handleChange("address1", v)}
                      placeholder="Building / Street"
                      error={errors.address1}
                    />
                  </Field>
                </Row>
                <Row>
                  <Field label="Address Line 2" error={errors.address2}>
                    <TextInput
                      value={form.address2}
                      onChange={(v) => handleChange("address2", v)}
                      placeholder="Area / Locality"
                    />
                  </Field>
                </Row>
                <Row>
                  <Field label="Address Line 3" error={errors.address3}>
                    <TextInput
                      value={form.address3}
                      onChange={(v) => handleChange("address3", v)}
                      placeholder="Landmark (optional)"
                    />
                  </Field>
                </Row>
                <Row>
                  <Field label="Pin Code" error={errors.pinCode}>
                    <TextInput
                      value={form.pinCode}
                      onChange={(v) => handleChange("pinCode", v)}
                      placeholder="e.g. 411001"
                    />
                  </Field>
                  <Field label="City" required error={errors.cityId}>
                    <SearchableSelect
                      value={form.cityId}
                      onChange={(v) => handleChange("cityId", v)}
                      options={cities}
                      placeholder="Select city"
                      error={errors.cityId}
                      disabled={dropdownLoading}
                    />
                  </Field>
                </Row>
                <Row>
                  <Field label="Segment" required error={errors.segmentId}>
                    <SearchableSelect
                      value={form.segmentId}
                      onChange={(v) => handleChange("segmentId", v)}
                      options={segments}
                      placeholder="Select segment"
                      error={errors.segmentId}
                      disabled={dropdownLoading}
                    />
                  </Field>
                  <Field label="Sector" required error={errors.sectorId}>
                    <SearchableSelect
                      value={form.sectorId}
                      onChange={(v) => handleChange("sectorId", v)}
                      options={sectors}
                      placeholder="Select sector"
                      error={errors.sectorId}
                      disabled={dropdownLoading}
                    />
                  </Field>
                </Row>
                <div
                  style={{ height: 1, background: BORDER, margin: "2px 0" }}
                />
                <Row>
                  <Field label="PAN No." required error={errors.panNo}>
                    <TextInput
                      value={form.panNo}
                      onChange={(v) => handleChange("panNo", v.toUpperCase())}
                      placeholder="ABCDE1234F"
                      error={errors.panNo}
                    />
                  </Field>
                  <Field label="GST No." required error={errors.gstNo}>
                    <TextInput
                      value={form.gstNo}
                      onChange={(v) => handleChange("gstNo", v.toUpperCase())}
                      placeholder="27ABCDE1234F1Z5"
                      error={errors.gstNo}
                    />
                  </Field>
                </Row>
                <Row>
                  <Field label="TIN No." required error={errors.tinNo}>
                    <TextInput
                      value={form.tinNo}
                      onChange={(v) => handleChange("tinNo", v)}
                      placeholder="Enter TIN number"
                      error={errors.tinNo}
                    />
                  </Field>
                </Row>
              </SectionCard>

              {/* RIGHT — Contact Person */}
              <SectionCard title="Contact Person" icon="👤">
                <Field
                  label="First Name"
                  required
                  error={errors.titleId || errors.firstName}
                >
                  <div
                    className="edit-title-firstname-row"
                    style={{ display: "flex", gap: 8 }}
                  >
                    <div
                      style={{ position: "relative", flexShrink: 0, width: 96 }}
                    >
                      <select
                        value={form.titleId}
                        onChange={(e) =>
                          handleChange("titleId", e.target.value)
                        }
                        style={{
                          ...inputBase(errors.titleId),
                          width: "100%",
                          paddingRight: 26,
                          appearance: "none",
                          cursor: "pointer",
                          color: form.titleId ? TEXT_MAIN : TEXT_SUB,
                        }}
                        onFocus={focusOn}
                        onBlur={(e) => focusOff(e, errors.titleId)}
                      >
                        <option value="" disabled>
                          Title
                        </option>
                        {titles.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      <svg
                        style={{
                          position: "absolute",
                          right: 8,
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                          color: TEXT_SUB,
                        }}
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) =>
                        handleChange("firstName", e.target.value)
                      }
                      placeholder="First name"
                      style={{
                        ...inputBase(errors.firstName),
                        flex: 1,
                        minWidth: 0,
                      }}
                      onFocus={focusOn}
                      onBlur={(e) => focusOff(e, errors.firstName)}
                    />
                  </div>
                </Field>
                <Field label="Last Name" required error={errors.lastName}>
                  <TextInput
                    value={form.lastName}
                    onChange={(v) => handleChange("lastName", v)}
                    placeholder="Last name"
                    error={errors.lastName}
                  />
                </Field>
                <div
                  style={{ height: 1, background: BORDER, margin: "2px 0" }}
                />
                <Field label="Telephone No." required error={errors.telNo}>
                  <TextInput
                    value={form.telNo}
                    onChange={(v) => handleChange("telNo", v)}
                    placeholder="020-12345678"
                    error={errors.telNo}
                  />
                </Field>
                <Field label="Mobile No." required error={errors.mobileNo}>
                  <TextInput
                    value={form.mobileNo}
                    onChange={(v) => handleChange("mobileNo", v)}
                    placeholder="9876543210"
                    error={errors.mobileNo}
                  />
                </Field>
                <Field label="Email Address" required error={errors.email}>
                  <TextInput
                    type="email"
                    value={form.email}
                    onChange={(v) => handleChange("email", v)}
                    placeholder="example@company.com"
                    error={errors.email}
                  />
                </Field>
              </SectionCard>
            </div>
          </div>

          {/* ════════════════════════════════════
              STICKY FOOTER — never scrolls
          ════════════════════════════════════ */}
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              padding: "14px 22px",
              borderTop: `1px solid ${BORDER}`,
              background: "#f0f4f8",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                height: 38,
                padding: "0 22px",
                borderRadius: 10,
                border: `1.5px solid ${BORDER}`,
                background: "#fff",
                color: TEXT_SUB,
                fontSize: 13,
                fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                transition: "border-color 0.15s, background 0.15s",
                opacity: saving ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.currentTarget.style.borderColor = ACCENT;
                  e.currentTarget.style.background = ACCENT_LIGHT;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = BORDER;
                e.currentTarget.style.background = "#fff";
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              style={{
                height: 38,
                padding: "0 28px",
                borderRadius: 10,
                border: "none",
                background: saving
                  ? "#94b8d4"
                  : "linear-gradient(135deg,#5d8fa8 0%,#3a6478 100%)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                boxShadow: saving ? "none" : "0 4px 14px rgba(58,100,120,0.35)",
                transition: "opacity 0.15s, box-shadow 0.15s",
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
              onMouseEnter={(e) => {
                if (!saving) e.currentTarget.style.opacity = "0.88";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              {saving ? (
                <>
                  <svg
                    style={{ animation: "spin 0.8s linear infinite" }}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .edit-two-col { flex-direction: row; }
        .edit-two-col > * { flex: 1; min-width: 0; }
        @media (max-width: 767px) {
          .edit-two-col { flex-direction: column !important; }
          .form-row { grid-template-columns: 1fr !important; }
          .edit-title-firstname-row { flex-direction: column; }
        }
      `}</style>
    </>,
    document.body,
  );
}
