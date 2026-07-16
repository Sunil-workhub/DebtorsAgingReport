import React from "react";
import { Menu } from "lucide-react";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import LogoutIcon from "@mui/icons-material/Logout";
import IndefLog from "../../assets/images/swift-logo.svg";

const Header = ({ setMobileOpen }) => {
  const REDIRECT_Home_URL = window.APP_CONFIG?.REDIRECT_Home_URL;
  const REDIRECT_Logout_URL = window.APP_CONFIG?.REDIRECT_Logout_URL;

  const user = JSON.parse(sessionStorage.getItem("user")) || {};
  const userName =
    `${user.customer ?? ""} ${user.last_name ?? ""}`.trim() || "User";
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = REDIRECT_Logout_URL;
  };

  const handleLogoClick = () => {
    window.location.href = REDIRECT_Home_URL;
  };

  return (
    <header
      className="shrink-0 flex items-center justify-between px-5"
      style={{
        height: 58,
        background: "#ffffff",
        borderBottom: "1px solid #eaeef3",
        boxShadow: "0 1px 4px rgba(18,38,63,0.05)",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Mobile: hamburger + brand */}
      <button
        className="md:hidden flex items-center gap-2 p-1.5 rounded-lg"
        style={{ color: "#1a2e45" }}
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={20} />
        <span
          className="text-sm font-bold tracking-wide"
          style={{ color: "#1a2e45" }}
        >
          Armstrong
        </span>
      </button>

      {/* Desktop: logo */}
      <div
        className="hidden md:flex items-center cursor-pointer"
        onClick={handleLogoClick}
      >
        <img src={IndefLog} alt="Swift Logo" style={{ height: 40 }} />
      </div>

      {/* Right: user info + logout */}
      <div className="flex items-center gap-3 ml-auto">
        <div className="hidden sm:flex flex-col items-end leading-tight">
          <span
            className="text-[13px] font-semibold"
            style={{ color: "#1a2e45" }}
          >
            {userName}
          </span>
          <span
            className="text-[10px] font-medium"
            style={{ color: "#94b8d4" }}
          >
            {user.role || "User"}
          </span>
        </div>

        <Avatar
          alt={userName}
          sx={{
            width: 34,
            height: 34,
            fontSize: 13,
            fontWeight: 700,
            background: "linear-gradient(135deg, #38bdf8, #1e6091)",
            color: "#fff",
            boxShadow: "0 2px 8px rgba(56,189,248,0.3)",
          }}
        >
          {initials}
        </Avatar>

        <Tooltip title="Sign Out" arrow>
          <IconButton
            onClick={handleLogout}
            size="small"
            sx={{
              color: "#94b8d4",
              "&:hover": {
                background: "rgba(239,68,68,0.08)",
                color: "#ef4444",
              },
              borderRadius: "8px",
              p: "6px",
              transition: "all 0.15s",
            }}
          >
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    </header>
  );
};

export default Header;
