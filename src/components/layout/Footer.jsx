import React from "react";

const Footer = () => (
  <footer
    className="shrink-0 flex items-center justify-end px-6"
    style={{
      height: 30,
      background: "#ffffff",
      borderTop: "1px solid #eaeef3",
    }}
  >
    <p className="text-[10.5px]" style={{ color: "#b0c4d8" }}>
      © {new Date().getFullYear()} Indef Manufacturing Limited. All rights
      reserved.
    </p>
  </footer>
);

export default Footer;
