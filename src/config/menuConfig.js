import { lazy } from "react";

const menuConfig = [
  {
    path: "/iReact/debtors-aging-report",
    component: lazy(
      () => import("../pages/DebtorsAgingReport/DebtorsAgingReportPage.jsx"),
    ),
  },
];

export default menuConfig;
