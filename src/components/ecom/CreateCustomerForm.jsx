import { useEffect, useRef, useState } from "react";
import watermark from "../../assets/images/swift-logo.svg";
import ReactDOM from "react-dom";

// ── Design tokens ──────────────────────────────────────────────
const ACCENT = "#4a7a92";
const ACCENT_LIGHT = "rgba(74,122,146,0.08)";
const ACCENT_BORDER = "rgba(74,122,146,0.35)";
const TEXT_MAIN = "#1a2e3b";
const TEXT_SUB = "#6b8a9a";
const BORDER = "#e2eaf0";
const ERROR = "#ef4444";
const ERROR_BG = "#fef2f2";
const INPUT_FOCUS = "rgba(74,122,146,0.18)";

// ── Input base style factory ───────────────────────────────────
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

const focusOn = (e, error) => {
  e.target.style.borderColor = ACCENT;
  e.target.style.boxShadow = `0 0 0 3px ${INPUT_FOCUS}`;
};
const focusOff = (e, error) => {
  e.target.style.borderColor = error ? ERROR : BORDER;
  e.target.style.boxShadow = "none";
};

// ── Field wrapper ──────────────────────────────────────────────
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

// ── TextInput ──────────────────────────────────────────────────
const TextInput = ({ value, onChange, placeholder, error, type = "text" }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    style={inputBase(error)}
    onFocus={(e) => focusOn(e, error)}
    onBlur={(e) => focusOff(e, error)}
  />
);

// ── Searchable Dropdown ────────────────────────────────────────
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
    const panelHeight = Math.min(210 + 48, 260);
    const openUpward = spaceBelow < panelHeight && spaceAbove > spaceBelow;

    setPanelStyle({
      position: "fixed",
      left: rect.left,
      width: rect.width,
      zIndex: 99999,
      ...(openUpward
        ? { bottom: window.innerHeight - rect.top + 5 }
        : { top: rect.bottom + 5 }),
    });
  };

  useEffect(() => {
    const handleOutside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        !document.getElementById("ss-portal")?.contains(e.target)
      ) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    const update = () => recalcPosition();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  const handleToggle = () => {
    if (disabled) return;
    if (!open) recalcPosition();
    setOpen((prev) => !prev);
    if (open) setSearch("");
  };

  const handleSelect = (id) => {
    onChange(String(id));
    setOpen(false);
    setSearch("");
  };

  const dropdownPanel =
    open &&
    !disabled &&
    ReactDOM.createPortal(
      <div
        id="ss-portal"
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
                flexShrink: 0,
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
              const isSelected = String(o.id) === String(value);
              return (
                <div
                  key={o.id}
                  onClick={() => handleSelect(o.id)}
                  style={{
                    padding: "8px 14px",
                    fontSize: 13,
                    cursor: "pointer",
                    color: isSelected ? ACCENT : TEXT_MAIN,
                    background: isSelected ? ACCENT_LIGHT : "transparent",
                    fontWeight: isSelected ? 600 : 400,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.background = "#f4f8fb";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected)
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
                  {isSelected && (
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

      {dropdownPanel}
    </div>
  );
};

// ── Section card shell ─────────────────────────────────────────
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
      height: "100%",
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

// ── Row helper ────────────────────────────────────────────────
const Row = ({ children }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(${
        Array.isArray(children) ? children.filter(Boolean).length : 1
      }, 1fr)`,
      gap: 12,
    }}
    className="form-row"
  >
    {children}
  </div>
);

// ── Main export ────────────────────────────────────────────────
export default function CreateCustomerForm({
  form,
  errors,
  loading,
  dropdownLoading,
  dropdowns,
  onChange,
  onSubmit,
  onReset,
}) {
  const { titles, cities, segments, sectors } = dropdowns;

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100%",
        padding: "20px 20px 32px",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Watermark */}
      <div
        style={{
          pointerEvents: "none",
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 0,
          opacity: 0.045,
        }}
      >
        <img
          src={watermark}
          alt=""
          style={{ width: "min(480px, 65vw)", userSelect: "none" }}
          draggable={false}
        />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        {/* Page title row */}
        <div
          className="page-header-row"
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 19,
                fontWeight: 700,
                color: TEXT_MAIN,
                letterSpacing: "-0.3px",
              }}
            >
              Create Customer
            </h1>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: TEXT_SUB }}>
              Register a new customer with company &amp; contact details
            </p>
          </div>

          <div
            className="breadcrumb-pill"
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
            <span>Create</span>
          </div>
        </div>

        {/* Two-column layout */}
        <div
          className="two-col-layout"
          style={{ display: "flex", gap: 14, alignItems: "stretch" }}
        >
          {/* LEFT — Company Information */}
          <SectionCard title="Company Information" icon="🏢">
            <Field label="Customer Name" required error={errors.customerName}>
              <TextInput
                value={form.customerName}
                onChange={(v) => onChange("customerName", v)}
                placeholder="Full customer / company name"
                error={errors.customerName}
              />
            </Field>

            <Row>
              <Field label="Address Line 1" required error={errors.address1}>
                <TextInput
                  value={form.address1}
                  onChange={(v) => onChange("address1", v)}
                  placeholder="Building / Street"
                  error={errors.address1}
                />
              </Field>
            </Row>

            <Row>
              <Field label="Address Line 2" error={errors.address2}>
                <TextInput
                  value={form.address2}
                  onChange={(v) => onChange("address2", v)}
                  placeholder="Area / Locality"
                />
              </Field>
            </Row>

            <Row>
              <Field label="Address Line 3" error={errors.address3}>
                <TextInput
                  value={form.address3}
                  onChange={(v) => onChange("address3", v)}
                  placeholder="Landmark (optional)"
                />
              </Field>
            </Row>

            <Row>
              <Field label="Pin Code" error={errors.pinCode}>
                <TextInput
                  value={form.pinCode}
                  onChange={(v) => onChange("pinCode", v)}
                  placeholder="e.g. 411001"
                />
              </Field>
              <Field label="City" required error={errors.cityId}>
                <SearchableSelect
                  value={form.cityId}
                  onChange={(v) => onChange("cityId", v)}
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
                  onChange={(v) => onChange("segmentId", v)}
                  options={segments}
                  placeholder="Select segment"
                  error={errors.segmentId}
                  disabled={dropdownLoading}
                />
              </Field>
              <Field label="Sector" required error={errors.sectorId}>
                <SearchableSelect
                  value={form.sectorId}
                  onChange={(v) => onChange("sectorId", v)}
                  options={sectors}
                  placeholder="Select sector"
                  error={errors.sectorId}
                  disabled={dropdownLoading}
                />
              </Field>
            </Row>

            <div
              style={{
                height: 1,
                background: BORDER,
                margin: "2px 0",
              }}
            />

            <Row>
              <Field label="PAN No." required error={errors.panNo}>
                <TextInput
                  value={form.panNo}
                  onChange={(v) => onChange("panNo", v.toUpperCase())}
                  placeholder="ABCDE1234F"
                  error={errors.panNo}
                />
              </Field>
              <Field label="GST No." required error={errors.gstNo}>
                <TextInput
                  value={form.gstNo}
                  onChange={(v) => onChange("gstNo", v.toUpperCase())}
                  placeholder="27ABCDE1234F1Z5"
                  error={errors.gstNo}
                />
              </Field>
            </Row>

            <Row>
              <Field label="TIN No." required error={errors.tinNo}>
                <TextInput
                  value={form.tinNo}
                  onChange={(v) => onChange("tinNo", v)}
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
              <div className="title-firstname-row">
                <div
                  style={{ position: "relative", flexShrink: 0, width: 96 }}
                  className="title-select-wrapper"
                >
                  <select
                    value={form.titleId}
                    onChange={(e) => onChange("titleId", e.target.value)}
                    style={{
                      ...inputBase(errors.titleId),
                      width: "100%",
                      paddingRight: 26,
                      appearance: "none",
                      cursor: "pointer",
                      color: form.titleId ? TEXT_MAIN : TEXT_SUB,
                    }}
                    onFocus={(e) => focusOn(e, errors.titleId)}
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
                  onChange={(e) => onChange("firstName", e.target.value)}
                  placeholder="First name"
                  style={{
                    ...inputBase(errors.firstName),
                    flex: 1,
                    minWidth: 0,
                  }}
                  onFocus={(e) => focusOn(e, errors.firstName)}
                  onBlur={(e) => focusOff(e, errors.firstName)}
                />
              </div>
            </Field>

            <Field label="Last Name" required error={errors.lastName}>
              <TextInput
                value={form.lastName}
                onChange={(v) => onChange("lastName", v)}
                placeholder="Last name"
                error={errors.lastName}
              />
            </Field>

            <div style={{ height: 1, background: BORDER, margin: "2px 0" }} />

            <Field label="Telephone No." required error={errors.telNo}>
              <TextInput
                value={form.telNo}
                onChange={(v) => onChange("telNo", v)}
                placeholder="020-12345678"
                error={errors.telNo}
              />
            </Field>

            <Field label="Mobile No." required error={errors.mobileNo}>
              <TextInput
                value={form.mobileNo}
                onChange={(v) => onChange("mobileNo", v)}
                placeholder="9876543210"
                error={errors.mobileNo}
              />
            </Field>

            <Field label="Email Address" required error={errors.email}>
              <TextInput
                type="email"
                value={form.email}
                onChange={(v) => onChange("email", v)}
                placeholder="example@company.com"
                error={errors.email}
              />
            </Field>
          </SectionCard>
        </div>

        {/* Action bar */}
        <div
          className="action-bar"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 16,
          }}
        >
          <button
            type="button"
            onClick={onReset}
            style={{
              height: 38,
              padding: "0 22px",
              borderRadius: 10,
              border: `1.5px solid ${BORDER}`,
              background: "#fff",
              color: TEXT_SUB,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "border-color 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = ACCENT;
              e.currentTarget.style.background = ACCENT_LIGHT;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = BORDER;
              e.currentTarget.style.background = "#fff";
            }}
          >
            Reset
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            style={{
              height: 38,
              padding: "0 28px",
              borderRadius: 10,
              border: "none",
              background: loading
                ? "#94b8d4"
                : "linear-gradient(135deg,#5d8fa8 0%,#3a6478 100%)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              boxShadow: loading ? "none" : "0 4px 14px rgba(58,100,120,0.35)",
              transition: "opacity 0.15s, box-shadow 0.15s",
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.opacity = "0.88";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            {loading ? (
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Create Customer
              </>
            )}
          </button>
        </div>
      </div>

      {/* Responsive + animation styles */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        .two-col-layout {
          flex-direction: row;
        }
        .two-col-layout > * {
          flex: 1;
          min-width: 0;
        }

        .title-firstname-row {
          display: flex;
          gap: 8px;
        }

        @media (max-width: 767px) {
          /* Outer padding tighter on mobile */
          div[style*="min-height: 100%"] {
            padding: 12px 10px 20px !important;
          }

          .two-col-layout {
            flex-direction: column !important;
          }

          .form-row {
            grid-template-columns: 1fr !important;
          }

          /* Stack Title + First Name vertically on mobile */
          .title-firstname-row {
            flex-direction: column;
          }
          .title-select-wrapper {
            width: 100% !important;
          }

          /* Header/breadcrumb column layout */
          .page-header-row {
            align-items: flex-start;
          }
          .breadcrumb-pill {
            align-self: flex-start;
          }

          .action-bar {
            justify-content: flex-start;
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}
