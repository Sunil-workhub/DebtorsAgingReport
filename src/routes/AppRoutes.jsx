import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import menuConfig from "../config/menuConfig";
import Layout from "../pages/layout/Layout";

import RedirectHandler from "./RedirectHandler";
import LoginPage from "../pages/auth/LoginPage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔄 Root Redirect: Fallback default path */}
        <Route path="/" element={<Navigate to="/" replace />} />

        {/* 🔒 Protected Routes (mapped directly from menuConfig) */}
        <Route
          element={
            <>
              <Layout />
            </>
          }
        >
          {menuConfig.map(({ path, component: Component }) => (
            <Route
              key={path}
              path={path}
              element={
                <Suspense
                  fallback={
                    <div>
                      <RedirectHandler />
                    </div>
                  }
                >
                  <Component />
                </Suspense>
              }
            />
          ))}
        </Route>

        {/* 🗺️ Catch-all Wildcard: If path doesn't match anything else, route to the report */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
