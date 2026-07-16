// src/components/ecom/OrderDetailDash.jsx
import { useState } from "react";
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  FileText,
  Truck,
  Package,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import watermark from "../../assets/images/swift-logo.svg";

const ACCENT = "#4a7a92";
const ACCENT_LIGHT = "rgba(74,122,146,0.08)";
const BORDER = "#e2eaf0";
const TEXT_MAIN = "#1a2e3b";
const TEXT_SUB = "#6b8a9a";
const CARD_SHADOW = "0 1px 4px rgba(30,60,80,0.06)";

const fmt = (val) =>
  val != null && val !== "" ? val : <span style={{ color: "#c0ced8" }}>—</span>;

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const fmtAmount = (n) =>
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const sentFlagLabel = (flag) => {
  if (flag === "Y") return { label: "Sent", bg: "#dcfce7", color: "#15803d" };
  if (flag === "I")
    return { label: "In-Progress", bg: "#fef9c3", color: "#a16207" };
  return { label: "Pending", bg: "#f1f5f9", color: TEXT_SUB };
};

const Badge = ({ label, bg, color }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "2px 9px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700,
      background: bg,
      color,
      letterSpacing: "0.02em",
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </span>
);

const SectionHead = ({ icon: Icon, title }) => (
  <div
    style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}
  >
    <Icon size={14} color={ACCENT} />
    <span
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: ACCENT,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      {title}
    </span>
    <div style={{ flex: 1, height: 1, background: BORDER, marginLeft: 6 }} />
  </div>
);

const DetailField = ({ label, value, wide = false }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 3,
      gridColumn: wide ? "1 / -1" : undefined,
    }}
  >
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: TEXT_SUB,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: 13,
        color: TEXT_MAIN,
        fontWeight: 500,
        lineHeight: 1.4,
      }}
    >
      {fmt(value)}
    </span>
  </div>
);

// detail modal (make body/grid responsive)
const OrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;

  const { label, bg, color } = sentFlagLabel(order.sent_Flag);
  const totalOrderValue = (order.trailerLines ?? []).reduce(
    (s, l) => s + (Number(l.amount) || 0),
    0,
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "16px 10px 20px",
        background: "rgba(20,40,55,0.45)",
        backdropFilter: "blur(3px)",
        overflowY: "auto",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          width: "100%",
          maxWidth: 960,
          boxShadow: "0 8px 40px rgba(20,50,80,0.18)",
          overflow: "hidden",
        }}
      >
        {/* header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${ACCENT} 0%, #3a6880 100%)`,
            padding: "14px 16px 16px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.7)",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Order Detail
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#fff",
                  letterSpacing: "-0.01em",
                }}
              >
                #{order.doc_No}
              </span>
              <Badge label={label} bg={bg} color={color} />
            </div>
            <span
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.8)",
                fontWeight: 500,
                marginTop: 2,
              }}
            >
              {order.party_Name}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              marginTop: 4,
            }}
          >
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.7)",
                  marginBottom: 2,
                }}
              >
                Total Value
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#fff",
                  letterSpacing: "-0.01em",
                }}
              >
                ₹ {fmtAmount(totalOrderValue)}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1.5px solid rgba(255,255,255,0.25)",
                borderRadius: 9,
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#fff",
                flexShrink: 0,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.22)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.12)")
              }
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* body */}
        <div
          className="order-detail-body"
          style={{
            padding: "18px 16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
            overflow: "auto",
            maxHeight: "calc(100vh - 150px)",
          }}
        >
          {/* order info */}
          <section>
            <SectionHead icon={FileText} title="Order Information" />
            <div
              className="detail-grid detail-grid-4"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "14px 20px",
              }}
            >
              <DetailField label="Order No." value={order.doc_No} />
              <DetailField
                label="Order Date"
                value={fmtDate(order.order_Date)}
              />
              <DetailField
                label="Order Type"
                value={order.order_Type === "M" ? "Mains" : "Spares"}
              />
              <DetailField label="Delivery Type" value={order.deliv_Type} />
              <DetailField label="Enquiry Ref." value={order.cust_Order_Ref} />
              <DetailField label="Dispatch (FOB)" value={order.fob_Type_Desc} />
              <DetailField label="OA No" value={order.oa_No} />
              <DetailField label="Status" value={order.oa_Status} />
              <DetailField label="Remarks" value={order.order_Note} wide />
            </div>
          </section>

          {/* customer */}
          <section>
            <SectionHead icon={FileText} title="Customer" />
            <div
              className="detail-grid detail-grid-2"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: "14px 20px",
              }}
            >
              <DetailField label="Customer Name" value={order.party_Name} />
              <DetailField
                label="Customer Address"
                value={order.customer_Address}
                wide
              />
            </div>
          </section>

          {/* shipping */}
          <section>
            <SectionHead icon={Truck} title="Shipping & Logistics" />
            <div
              className="detail-grid detail-grid-3"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "14px 20px",
              }}
            >
              <DetailField label="Freight Terms" value={order.freighT_TERMS} />
              <DetailField label="Destination" value={order.destination} />
              <DetailField label="Transporter" value={order.transporter} />
              <DetailField
                label="Shipping Instructions"
                value={order.ship_Instruc}
                wide
              />
              <DetailField
                label="Packing Instructions"
                value={order.pack_Instruc}
                wide
              />
            </div>
          </section>

          {/* inspection */}
          <section>
            <SectionHead icon={CheckCircle} title="Inspection" />
            <div
              className="detail-grid detail-grid-4"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "14px 20px",
              }}
            >
              <DetailField
                label="TPI Required"
                value={order.tp_Req === "Y" ? "Yes" : "No"}
              />
              <DetailField
                label="Test Certificate"
                value={order.test_Cert === "Y" ? "Yes (extra charges)" : "No"}
              />
              <DetailField
                label="Intimation Period"
                value={order.period_Name}
              />
              <DetailField label="Inspecting Org." value={order.tp_Org} />
              <DetailField
                label="Contact Person"
                value={order.tp_Contact_Per}
              />
              <DetailField label="Contact No." value={order.tp_Contact_No} />
              <DetailField label="Email" value={order.tp_Email} />
            </div>
          </section>

          {/* lines */}
          <section>
            <SectionHead icon={Package} title="Order Lines" />
            <div className="hidden md:block">
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 12,
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: ACCENT_LIGHT,
                      borderBottom: `1px solid ${BORDER}`,
                    }}
                  >
                    {[
                      "#",
                      "Product",
                      "Qty",
                      "UOM",
                      "Rate",
                      "Amount",
                      "Notes",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "6px 8px",
                          fontSize: 11,
                          color: TEXT_SUB,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(order.trailerLines ?? []).length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          padding: "12px 8px",
                          textAlign: "center",
                          color: TEXT_SUB,
                          fontSize: 12,
                        }}
                      >
                        No line items available.
                      </td>
                    </tr>
                  ) : (
                    (order.trailerLines ?? []).map((l, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: `1px solid ${BORDER}`,
                          background: idx % 2 === 0 ? "#fff" : "#f9fbfc",
                        }}
                      >
                        <td style={{ padding: "6px 8px", color: TEXT_SUB }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: "6px 8px", color: TEXT_MAIN }}>
                          <div style={{ fontWeight: 600 }}>
                            {l.item_Desc || "—"}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: TEXT_SUB,
                              marginTop: 2,
                            }}
                          >
                            Code: {fmt(l.item_Code)}
                          </div>
                        </td>
                        <td style={{ padding: "6px 8px" }}>{fmt(l.qty)}</td>
                        <td style={{ padding: "6px 8px" }}>{fmt(l.uom)}</td>
                        <td style={{ padding: "6px 8px" }}>
                          ₹ {fmtAmount(l.rate)}
                        </td>
                        <td style={{ padding: "6px 8px" }}>
                          ₹ {fmtAmount(l.amount)}
                        </td>
                        <td style={{ padding: "6px 8px", fontSize: 11 }}>
                          {fmt(l.note)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* mobile cards for lines */}
            <div className="md:hidden flex flex-col gap-2">
              {(order.trailerLines ?? []).length === 0 ? (
                <p
                  style={{
                    fontSize: 11,
                    color: TEXT_SUB,
                    textAlign: "center",
                    padding: "8px 0",
                  }}
                >
                  No line items available.
                </p>
              ) : (
                (order.trailerLines ?? []).map((l, idx) => (
                  <div
                    key={idx}
                    style={{
                      borderRadius: 10,
                      border: `1px solid ${BORDER}`,
                      background: "#f9fbfc",
                      padding: "8px 10px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 11,
                        color: TEXT_SUB,
                      }}
                    >
                      <span>Line {idx + 1}</span>
                      <span>₹ {fmtAmount(l.amount)}</span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>
                      {l.prod_Desc || "—"}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: TEXT_SUB,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 6,
                      }}
                    >
                      <span>Code: {fmt(l.prod_Code)}</span>
                      <span>· Qty: {fmt(l.qty)}</span>
                      <span>· UOM: {fmt(l.uom)}</span>
                      <span>· Rate: ₹ {fmtAmount(l.rate)}</span>
                    </div>
                    {l.note && (
                      <div style={{ fontSize: 11, color: TEXT_SUB }}>
                        Note: {l.note}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* grid responsiveness */}
        <style>{`
          @media (max-width: 767px) {
            .detail-grid-4 {
              grid-template-columns: 1fr !important;
            }
            .detail-grid-3 {
              grid-template-columns: 1fr !important;
            }
            .detail-grid-2 {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

// main dashboard
const OrderDetailDash = ({
  orders,
  totalCount,
  page,
  pageSize,
  loading,
  search,
  onSearchChange,
  onPageChange,
}) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const totalPages = Math.ceil(totalCount / pageSize);

  const card = {
    background: "#fff",
    borderRadius: 16,
    border: `1px solid ${BORDER}`,
    boxShadow: CARD_SHADOW,
    padding: 0,
  };

  const renderPageInfo = () => {
    const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, totalCount);
    return (
      <span style={{ fontSize: 12, color: TEXT_SUB }}>
        Showing{" "}
        <strong style={{ color: TEXT_MAIN }}>
          {from}–{to}
        </strong>{" "}
        of{" "}
        <strong style={{ color: TEXT_MAIN }}>
          {totalCount.toLocaleString("en-IN")}
        </strong>{" "}
        orders
      </span>
    );
  };

  const totalOrderValue = (order) =>
    (order.trailerLines ?? []).reduce((s, l) => s + (Number(l.amount) || 0), 0);

  return (
    <div
      className="order-dash-root"
      style={{
        position: "relative",
        padding: "10px 10px 16px",
        background: "#f4f7f9",
        minHeight: "100vh",
      }}
    >
      {/* watermark */}
      <div
        style={{
          pointerEvents: "none",
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 0,
          opacity: 0.03,
        }}
      >
        <img
          src={watermark}
          alt=""
          style={{ width: 520, maxWidth: "70vw", userSelect: "none" }}
        />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {/* header */}
        <div
          className="order-dash-header"
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: TEXT_MAIN,
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              Order Dashboard
            </h1>
            <p
              style={{
                fontSize: 12,
                color: TEXT_SUB,
                margin: "3px 0 0",
              }}
            >
              View and manage customer orders.
            </p>
          </div>
          <div
            className="order-dash-search"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              width: "100%",
              maxWidth: 260,
            }}
          >
            <Search
              size={14}
              color={TEXT_SUB}
              style={{
                position: "absolute",
                left: 11,
                pointerEvents: "none",
              }}
            />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search orders…"
              style={{
                height: 36,
                paddingLeft: 32,
                paddingRight: 12,
                borderRadius: 9,
                border: `1.5px solid ${BORDER}`,
                background: "#fff",
                fontSize: 13,
                color: TEXT_MAIN,
                outline: "none",
                width: "100%",
                fontFamily: "inherit",
                boxSizing: "border-box",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = ACCENT;
                e.target.style.boxShadow = "0 0 0 3px rgba(74,122,146,0.18)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = BORDER;
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        {/* main card */}
        <div style={card}>
          {/* toolbar */}
          <div
            className="order-dash-toolbar"
            style={{
              padding: "8px 10px",
              borderBottom: `1px solid ${BORDER}`,
              background: "#f8fafc",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
              }}
            >
              <FileText size={14} color={TEXT_SUB} />
              <span style={{ color: TEXT_SUB }}>
                Total{" "}
                <strong style={{ color: TEXT_MAIN }}>
                  {totalCount.toLocaleString("en-IN")}
                </strong>{" "}
                orders
              </span>
            </div>
            <div>{renderPageInfo()}</div>
          </div>

          {/* desktop table */}
          <div className="hidden md:block">
            {loading ? (
              <div
                style={{
                  padding: "40px 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  color: TEXT_SUB,
                  fontSize: 13,
                }}
              >
                <Clock size={16} className="animate-spin" />
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div
                style={{
                  padding: "40px 0",
                  textAlign: "center",
                  color: TEXT_SUB,
                  fontSize: 13,
                }}
              >
                <AlertCircle
                  size={18}
                  style={{ marginBottom: 6, color: "#94a3b8" }}
                />
                No orders found for current filters.
              </div>
            ) : (
              <div
                style={{
                  maxHeight: "calc(100vh - 260px)",
                  overflow: "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 12,
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: ACCENT_LIGHT,
                        borderBottom: `1px solid ${BORDER}`,
                      }}
                    >
                      {[
                        "#",
                        "Order No.",
                        "Customer",
                        "Destination",
                        "Order Date",
                        "Value",
                        "Status",
                        "OA No",
                        "",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            padding: "8px 10px",
                            fontSize: 11,
                            color: TEXT_SUB,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o, idx) => {
                      const { label, bg, color } = sentFlagLabel(o.sent_Flag);
                      const rowIndex = (page - 1) * pageSize + idx + 1;
                      return (
                        <tr
                          key={o.order_Id}
                          style={{
                            borderBottom: `1px solid ${BORDER}`,
                            cursor: "pointer",
                            background:
                              idx % 2 === 0 ? "#fff" : "rgba(248,250,252,0.8)",
                          }}
                          onClick={() => setSelectedOrder(o)}
                        >
                          <td
                            style={{
                              padding: "8px 10px",
                              color: TEXT_SUB,
                              width: 40,
                            }}
                          >
                            {rowIndex}
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <div
                              style={{
                                fontWeight: 600,
                                color: TEXT_MAIN,
                                marginBottom: 2,
                              }}
                            >
                              #{o.doc_No}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: TEXT_SUB,
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <Clock size={11} />
                              {fmtDate(o.order_Date)}
                            </div>
                          </td>
                          <td style={{ padding: "8px 10px" }}>
                            <div
                              style={{
                                fontWeight: 600,
                                color: TEXT_MAIN,
                              }}
                            >
                              {fmt(o.party_Name)}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: TEXT_SUB,
                                marginTop: 2,
                                maxWidth: 260,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {fmt(o.customer_Address)}
                            </div>
                          </td>
                          <td style={{ padding: "8px 10px" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: 12,
                                color: TEXT_MAIN,
                              }}
                            >
                              <Truck size={12} color={TEXT_SUB} />
                              <span>{fmt(o.destination)}</span>
                            </div>
                          </td>
                          <td style={{ padding: "8px 10px" }}>
                            {fmtDate(o.order_Date)}
                          </td>
                          <td style={{ padding: "8px 10px" }}>
                            ₹ {fmtAmount(totalOrderValue(o))}
                          </td>
                          <td style={{ padding: "8px 10px" }}>
                            <Badge label={label} bg={bg} color={color} />
                          </td>
                          <td style={{ padding: "8px 10px" }}>
                            {fmtDate(o.oa_No)}
                          </td>
                          <td
                            style={{ padding: "8px 10px", textAlign: "right" }}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(o);
                              }}
                              style={{
                                border: "none",
                                borderRadius: 999,
                                padding: "4px 10px",
                                fontSize: 11,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                background: "#fff",
                                color: ACCENT,
                                boxShadow:
                                  "0 1px 3px rgba(15,23,42,0.12), 0 0 0 1px rgba(148,163,184,0.3)",
                              }}
                            >
                              <Eye size={13} />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* mobile cards list */}
          <div className="md:hidden">
            {loading ? (
              <div
                style={{
                  padding: "24px 0",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 8,
                  color: TEXT_SUB,
                  fontSize: 12,
                }}
              >
                <Clock size={16} className="animate-spin" />
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div
                style={{
                  padding: "24px 0",
                  textAlign: "center",
                  color: TEXT_SUB,
                  fontSize: 12,
                }}
              >
                <AlertCircle
                  size={18}
                  style={{ marginBottom: 6, color: "#94a3b8" }}
                />
                No orders found for current filters.
              </div>
            ) : (
              <div
                style={{
                  padding: "8px 10px 10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  maxHeight: "calc(100vh - 270px)",
                  overflowY: "auto",
                }}
              >
                {orders.map((o, idx) => {
                  const { label, bg, color } = sentFlagLabel(o.sent_Flag);
                  const rowIndex = (page - 1) * pageSize + idx + 1;
                  return (
                    <div
                      key={o.order_Id}
                      style={{
                        borderRadius: 12,
                        border: `1px solid ${BORDER}`,
                        background: "#ffffff",
                        boxShadow: CARD_SHADOW,
                        padding: "8px 10px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                      onClick={() => setSelectedOrder(o)}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: TEXT_MAIN,
                            }}
                          >
                            #{o.doc_No} · {fmtDate(o.order_Date)}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: TEXT_SUB,
                              marginTop: 2,
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {fmt(o.party_Name)}
                          </div>
                        </div>
                        <Badge label={label} bg={bg} color={color} />
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: TEXT_SUB,
                          marginTop: 2,
                        }}
                      >
                        <Truck size={11} style={{ marginRight: 4 }} />
                        Destination: {fmt(o.destination)}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: TEXT_SUB,
                          marginTop: 2,
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>Value: ₹ {fmtAmount(o.total_Amount)}</span>
                        <span>#{rowIndex}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* footer / pagination */}
          <div
            className="order-dash-footer"
            style={{
              padding: "8px 10px",
              borderTop: `1px solid ${BORDER}`,
              background: "#f8fafc",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div style={{ fontSize: 11, color: TEXT_SUB }}>
              Page{" "}
              <strong style={{ color: TEXT_MAIN }}>
                {page}/{totalPages || 1}
              </strong>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1 || loading}
                style={{
                  width: 30,
                  height: 28,
                  borderRadius: 8,
                  border: `1px solid ${BORDER}`,
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: page === 1 || loading ? "not-allowed" : "pointer",
                  opacity: page === 1 || loading ? 0.5 : 1,
                }}
              >
                <ChevronLeft size={14} color={TEXT_SUB} />
              </button>
              <button
                onClick={() =>
                  onPageChange(Math.min(totalPages || 1, page + 1))
                }
                disabled={page >= totalPages || loading}
                style={{
                  width: 30,
                  height: 28,
                  borderRadius: 8,
                  border: `1px solid ${BORDER}`,
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor:
                    page >= totalPages || loading ? "not-allowed" : "pointer",
                  opacity: page >= totalPages || loading ? 0.5 : 1,
                }}
              >
                <ChevronRight size={14} color={TEXT_SUB} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* responsive helpers */}
      <style>{`
        @media (max-width: 639px) {
          .order-dash-header {
            align-items: flex-start;
          }
          .order-dash-search {
            max-width: 100% !important;
          }
        }
      `}</style>

      {/* modal */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};

export default OrderDetailDash;
