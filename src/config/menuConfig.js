import { lazy } from "react";

const menuConfig = [
  {
    path: "/",
    component: lazy(
      () => import("../pages/DebtorsAgingReport/DebtorsAgingReportPage.jsx"),
    ),
  },
];

export default menuConfig;
