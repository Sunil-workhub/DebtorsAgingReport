// src/components/common/SearchableSelect.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import ReactDOM from "react-dom";

const ACCENT = "#4a7a92";
const ACCENT_LIGHT = "rgba(74,122,146,0.08)";
const ACCENT_BORDER = "rgba(74,122,146,0.35)";
const TEXT_MAIN = "#1a2e3b";
const TEXT_SUB = "#6b8a9a";
const BORDER = "#e2eaf0";
const ERROR = "#ef4444";
const ERROR_BG = "#fef2f2";
const INPUT_FOCUS = "rgba(74,122,146,0.18)";
const MIN_PANEL_WIDTH = 240;
const CHUNK = 40; // items rendered per batch

const SearchableSelect = ({
  value,
  onChange,
  options = [],
  placeholder,
  error,
  disabled,
  virtualized = false, // ← NEW: pass true for large lists (e.g. products)
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [panelStyle, setPanelStyle] = useState({});
  const [renderCount, setRenderCount] = useState(CHUNK); // for virtualized mode

  const containerRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);

  const selectedOption = options.find((o) => String(o.id) === String(value));
  const selectedLabel = selectedOption?.name ?? "";

  // full filtered list
  const filtered = options.filter(
    (o) =>
      o?.name?.toLowerCase()?.includes(search?.toLowerCase() ?? "") ||
      o?.subtitle?.toLowerCase()?.includes(search?.toLowerCase() ?? ""),
  );

  // what actually gets rendered — limited when virtualized
  const visibleOptions = virtualized
    ? filtered.slice(0, renderCount)
    : filtered;

  // reset render count on every search change
  useEffect(() => {
    setRenderCount(CHUNK);
  }, [search]);

  // reset render count when dropdown closes
  useEffect(() => {
    if (!open) setRenderCount(CHUNK);
  }, [open]);

  // ── Infinite scroll inside the list ─────────────────────────
  const handleListScroll = useCallback(
    (e) => {
      if (!virtualized) return;
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      // load next chunk when within 60px of bottom
      if (scrollHeight - scrollTop - clientHeight < 60) {
        setRenderCount((c) => Math.min(c + CHUNK, filtered.length));
      }
    },
    [virtualized, filtered.length],
  );

  // ── Panel position ───────────────────────────────────────────
  const recalcPosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const panelHeight = Math.min(visibleOptions.length * 42 + 52, 280);
    const openUpward = spaceBelow < panelHeight && spaceAbove > spaceBelow;
    const panelWidth = Math.max(rect.width, MIN_PANEL_WIDTH);

    setPanelStyle({
      position: "fixed",
      left: rect.left,
      width: panelWidth,
      zIndex: 99999,
      ...(openUpward
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    });
  };

  // ── Outside click ────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        !document.getElementById("ss-portal")?.contains(e.target)
      ) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Reposition on scroll / resize ───────────────────────────
  useEffect(() => {
    if (!open) return;
    const update = () => recalcPosition();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, visibleOptions.length]);

  // ── Focus search on open ─────────────────────────────────────
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

  // ── Portal panel ─────────────────────────────────────────────
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
        {/* search bar */}
        <div
          style={{
            padding: "7px 10px",
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
              fontSize: 13,
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
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* ── result count hint (only for virtualized) ────────── */}
        {virtualized && filtered.length > 0 && (
          <div
            style={{
              padding: "3px 12px",
              fontSize: 10,
              color: TEXT_SUB,
              background: "#f8fafc",
              borderBottom: `1px solid ${BORDER}`,
              letterSpacing: "0.02em",
            }}
          >
            {search
              ? `${filtered.length} match${filtered.length !== 1 ? "es" : ""} — showing ${Math.min(renderCount, filtered.length)}`
              : `${filtered.length} items — type to filter`}
          </div>
        )}

        {/* options list */}
        <div
          ref={listRef}
          onScroll={handleListScroll}
          style={{ maxHeight: 228, overflowY: "auto", padding: "3px 0" }}
        >
          {filtered.length === 0 ? (
            <div
              style={{
                padding: "12px 14px",
                fontSize: 13,
                color: TEXT_SUB,
                textAlign: "center",
              }}
            >
              No results{search ? ` for "${search}"` : ""}
            </div>
          ) : (
            <>
              {visibleOptions.map((o) => {
                const isSelected = String(o.id) === String(value);
                const hasSubtitle = !!o.subtitle;
                return (
                  <div
                    key={o.id}
                    onClick={() => handleSelect(o.id)}
                    style={{
                      padding: hasSubtitle ? "5px 12px" : "7px 12px",
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
                    <div style={{ minWidth: 0, flex: 1 }}>
                      {/* primary label */}
                      <div
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {o.name}
                      </div>
                      {/* subtitle (address for customers, desc for products) */}
                      {hasSubtitle && (
                        <div
                          style={{
                            fontSize: 11,
                            color: isSelected ? ACCENT : TEXT_SUB,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            marginTop: 1,
                            opacity: 0.85,
                          }}
                        >
                          {o.subtitle}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={ACCENT}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        style={{ flexShrink: 0 }}
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                );
              })}

              {/* load more hint at bottom */}
              {virtualized && renderCount < filtered.length && (
                <div
                  style={{
                    padding: "8px 12px",
                    fontSize: 11,
                    color: TEXT_SUB,
                    textAlign: "center",
                    borderTop: `1px solid ${BORDER}`,
                  }}
                >
                  Scroll for more ({filtered.length - renderCount} remaining)
                </div>
              )}
            </>
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
          background: error ? ERROR_BG : disabled ? "#f8fafc" : "#fff",
          boxShadow: open ? `0 0 0 3px ${INPUT_FOCUS}` : "none",
          fontSize: 13,
          color: value ? TEXT_MAIN : TEXT_SUB,
          display: "flex",
          alignItems: "center",
          cursor: disabled ? "not-allowed" : "pointer",
          userSelect: "none",
          boxSizing: "border-box",
          width: "100%",
          opacity: disabled ? 0.7 : 1,
          transition: "border-color 0.15s, box-shadow 0.15s",
          fontFamily: "inherit",
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

      {/* chevron */}
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

export default SearchableSelect;
