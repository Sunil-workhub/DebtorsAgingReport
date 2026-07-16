import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UserPlus,
  ShoppingCart,
  Wrench,
  Zap,
  ChevronDown,
  Users,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const NAV = [
  {
    id: "customer",
    label: "Customer",
    icon: Users,
    children: [
      {
        label: "Dashboard",
        path: "/customer/dashboard",
        icon: LayoutDashboard,
      },
      { label: "Create Customer", path: "/customer/create", icon: UserPlus },
    ],
  },
  {
    id: "orders",
    label: "Order Details",
    icon: ShoppingCart,
    path: "/orders",
  },
  {
    id: "complaints",
    label: "Complaints",
    icon: Wrench,
    children: [
      { label: "Spares", path: "/complaints/spares", icon: Wrench },
      { label: "Mains", path: "/complaints/mains", icon: Zap },
    ],
  },
];

const C = {
  bg: "#1a2e45",
  bgHover: "rgba(255,255,255,0.06)",
  bgActive: "rgba(56,189,248,0.15)",
  accent: "#38bdf8",
  accentDim: "rgba(56,189,248,0.6)",
  text: "rgba(148,184,212,0.85)",
  textActive: "#ffffff",
  border: "rgba(255,255,255,0.06)",
  subLine: "rgba(56,189,248,0.2)",
};

function Tooltip({ label, children, show }) {
  const [visible, setVisible] = useState(false);
  if (!show) return children;
  return (
    <div
      className="relative"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap z-50 pointer-events-none"
          style={{
            background: "#0f1e2e",
            color: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
            border: `1px solid ${C.border}`,
          }}
        >
          {label}
          <span
            className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent"
            style={{ borderRightColor: "#0f1e2e" }}
          />
        </div>
      )}
    </div>
  );
}

function NavItem({ item, collapsed, openGroups, toggleGroup }) {
  const location = useLocation();
  const isGroupActive = item.children?.some(
    (c) => location.pathname === c.path,
  );
  const Icon = item.icon;

  if (item.children) {
    const open = openGroups[item.id];
    return (
      <div>
        <Tooltip label={item.label} show={collapsed}>
          <button
            onClick={() => toggleGroup(item.id)}
            className="w-full flex items-center rounded-xl text-[13px] font-medium transition-all duration-150"
            style={{
              gap: collapsed ? 0 : 10,
              padding: collapsed ? "9px 0" : "9px 12px",
              justifyContent: collapsed ? "center" : "flex-start",
              background: isGroupActive ? C.bgActive : "transparent",
              color: isGroupActive ? C.textActive : C.text,
            }}
            onMouseEnter={(e) => {
              if (!isGroupActive) e.currentTarget.style.background = C.bgHover;
            }}
            onMouseLeave={(e) => {
              if (!isGroupActive)
                e.currentTarget.style.background = "transparent";
            }}
          >
            <Icon
              size={16}
              style={{
                color: isGroupActive ? C.accent : C.text,
                flexShrink: 0,
              }}
            />
            {!collapsed && (
              <>
                <span className="flex-1 text-left truncate">{item.label}</span>
                <ChevronDown
                  size={12}
                  style={{
                    color: C.text,
                    opacity: 0.6,
                    transform: open ? "rotate(0deg)" : "rotate(-90deg)",
                    transition: "transform 0.2s",
                    flexShrink: 0,
                  }}
                />
              </>
            )}
          </button>
        </Tooltip>

        {!collapsed && open && (
          <div
            className="mt-0.5 mb-0.5 ml-5 pl-3 space-y-0.5"
            style={{ borderLeft: `1.5px solid ${C.subLine}` }}
          >
            {item.children.map((child) => {
              const CIcon = child.icon;
              return (
                <NavLink
                  key={child.path}
                  to={child.path}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] font-medium transition-all duration-150"
                  style={({ isActive }) => ({
                    background: isActive ? C.bgActive : "transparent",
                    color: isActive ? C.accent : C.text,
                  })}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = C.bgHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "";
                  }}
                >
                  <CIcon size={13} style={{ flexShrink: 0 }} />
                  <span>{child.label}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Tooltip label={item.label} show={collapsed}>
      <NavLink
        to={item.path}
        className="flex items-center rounded-xl text-[13px] font-medium transition-all duration-150"
        style={({ isActive }) => ({
          gap: collapsed ? 0 : 10,
          padding: collapsed ? "9px 0" : "9px 12px",
          justifyContent: collapsed ? "center" : "flex-start",
          background: isActive ? C.bgActive : "transparent",
          color: isActive ? C.textActive : C.text,
        })}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = C.bgHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "";
        }}
      >
        {({ isActive }) => (
          <Icon
            size={16}
            style={{ color: isActive ? C.accent : C.text, flexShrink: 0 }}
          />
        )}
        {!collapsed && <span className="truncate">{item.label}</span>}
      </NavLink>
    </Tooltip>
  );
}

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState({ customer: true });

  useEffect(() => {
    setMobileOpen?.(false);
  }, [location.pathname]);

  const toggleGroup = (id) => {
    if (collapsed) {
      setCollapsed(false);
      setOpenGroups((p) => ({ ...p, [id]: true }));
      return;
    }
    setOpenGroups((p) => ({ ...p, [id]: !p[id] }));
  };

  const SidebarInner = ({ isMobile = false }) => (
    <div
      className="flex flex-col h-full"
      style={{ background: C.bg, width: "100%" }}
    >
      {/* Brand */}
      <div
        className="flex items-center px-4"
        style={{
          height: 58,
          borderBottom: `1px solid ${C.border}`,
          justifyContent: collapsed && !isMobile ? "center" : "space-between",
        }}
      >
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0"
              style={{ background: "linear-gradient(135deg,#38bdf8,#1e6091)" }}
            >
              A
            </div>
            <span className="text-sm font-bold text-white tracking-wide truncate">
              Armstrong
            </span>
          </div>
        )}
        {!isMobile && (
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: C.text, marginLeft: collapsed ? 0 : "auto" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.bgHover)}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            {collapsed ? (
              <PanelLeftOpen size={16} />
            ) : (
              <PanelLeftClose size={16} />
            )}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-0.5"
        style={{ padding: collapsed ? "12px 8px" : "12px 10px" }}
      >
        {NAV.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            collapsed={collapsed && !isMobile}
            openGroups={openGroups}
            toggleGroup={toggleGroup}
          />
        ))}
      </nav>

      {/* Settings */}
      <div className="px-3 py-3" style={{ borderTop: `1px solid ${C.border}` }}>
        <Tooltip label="Settings" show={collapsed && !isMobile}>
          <button
            className="w-full flex items-center rounded-xl text-[12px] transition-all duration-150"
            style={{
              gap: collapsed && !isMobile ? 0 : 9,
              padding: collapsed && !isMobile ? "8px 0" : "8px 10px",
              justifyContent: collapsed && !isMobile ? "center" : "flex-start",
              color: C.text,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.bgHover)}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <Settings size={15} style={{ flexShrink: 0 }} />
            {(!collapsed || isMobile) && <span>Settings</span>}
          </button>
        </Tooltip>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col h-screen sticky top-0 z-40 shrink-0"
        style={{
          width: collapsed ? 58 : 220,
          background: C.bg,
          transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: "1px 0 0 rgba(255,255,255,0.04)",
        }}
      >
        <SidebarInner />
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(3px)",
            }}
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="relative z-10 h-full"
            style={{
              width: 240,
              background: C.bg,
              animation: "slideIn .2s ease-out",
            }}
          >
            <SidebarInner isMobile />
          </aside>
        </div>
      )}
    </>
  );
}
