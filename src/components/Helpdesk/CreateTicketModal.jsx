import { useMemo, useRef } from "react";
import {
  X,
  Plus,
  Paperclip,
  Wrench,
  Briefcase,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import {
  CATEGORY_META,
  IT_IMPACT_OPTIONS,
  HR_IMPACT_OPTIONS,
  REQUEST_TYPES,
  ORG_PILL,
  SOFTWARE_PROJECTS,
} from "../../constants/helpdeskConstants";
import { Field } from "./SharedUI";

/**
 * Catalog API response shape:
 *   { parentName, category, subCategory, reqType }
 *   reqType: "HR" | "IT Incident" | "IT Service"
 *
 * Tree:
 *   parentName → category → subCategory
 *
 * Field mapping (sent to API):
 *   parentCategory (form) → informational grouping
 *   category       (form) → API `category`  field
 *   softwareProject(form) → API `project_Module` / subCategory
 */

export default function CreateTicketModal({
  form,
  errors,
  closedTickets,
  currentUser,
  onChange,
  onClose,
  onSubmit,
  catalogItems = [],
}) {
  const fileRef = useRef(null);
  const isHRTicket = form.dept === "HR";

  const fmtBytes = (b) => {
    if (!b) return "";
    if (b < 1024) return b + "B";
    if (b < 1048576) return (b / 1024).toFixed(1) + "KB";
    return (b / 1048576).toFixed(1) + "MB";
  };

  const handleDeptChange = (dept) => {
    onChange((p) => ({
      ...p,
      dept,
      impact: dept === "HR" ? "general_inquiry" : "user",
      onBehalfOf: "",
      parentCategory: "",
      category: "",
      softwareProject: "",
      requestType: dept === "IT" ? "Service Request" : p.requestType,
    }));
  };

  const handleRequestTypeChange = (rt) => {
    onChange((p) => ({
      ...p,
      requestType: rt,
      parentCategory: "",
      category: "",
      softwareProject: "",
    }));
  };

  const ORG_PILL_SAFE =
    ORG_PILL[currentUser?.org_Id] ||
    ORG_PILL[currentUser?.org] ||
    "bg-slate-100 text-slate-600";

  // ── Determine active reqType filter ──────────────────────────────────────
  const activeReqType = useMemo(() => {
    if (isHRTicket) return "HR";
    if (form.requestType === "Incident") return "IT Incident";
    return "IT Service";
  }, [isHRTicket, form.requestType]);

  const filteredCatalog = useMemo(
    () => catalogItems.filter((item) => item.reqType === activeReqType),
    [catalogItems, activeReqType],
  );

  // ── Top-level parent names (unique, ordered) ──────────────────────────────
  const parentNames = useMemo(() => {
    const seen = new Set();
    return filteredCatalog
      .map((i) => i.parentName)
      .filter((p) => {
        if (seen.has(p)) return false;
        seen.add(p);
        return true;
      });
  }, [filteredCatalog]);

  // ── Categories under selected parent ─────────────────────────────────────
  const categoriesForParent = useMemo(() => {
    if (!form.parentCategory) return [];
    const seen = new Set();
    return filteredCatalog
      .filter((i) => i.parentName === form.parentCategory)
      .map((i) => i.category)
      .filter((c) => {
        if (seen.has(c)) return false;
        seen.add(c);
        return true;
      });
  }, [filteredCatalog, form.parentCategory]);

  // If parent only has itself as its sole category → self-referential, skip middle tier
  const parentIsSelfCategory = useMemo(() => {
    return (
      categoriesForParent.length === 1 &&
      categoriesForParent[0] === form.parentCategory
    );
  }, [categoriesForParent, form.parentCategory]);

  // ── Subcategories under selected category ─────────────────────────────────
  const subCategoriesForCategory = useMemo(() => {
    if (!form.category) return [];
    return filteredCatalog
      .filter(
        (i) =>
          i.parentName === form.parentCategory && i.category === form.category,
      )
      .map((i) => i.subCategory);
  }, [filteredCatalog, form.parentCategory, form.category]);

  // "Text Box" type = free text input instead of button list
  const isTextBoxSub =
    subCategoriesForCategory.length === 1 &&
    subCategoriesForCategory[0] === "Text Box";
  const hasApplicationNameSub =
    subCategoriesForCategory.includes("Application Name");

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleParentSelect = (parent) => {
    const cats = filteredCatalog
      .filter((i) => i.parentName === parent)
      .map((i) => i.category)
      .filter((c, idx, arr) => arr.indexOf(c) === idx);
    const selfRef = cats.length === 1 && cats[0] === parent;
    onChange((p) => ({
      ...p,
      parentCategory: parent,
      category: selfRef ? parent : "",
      softwareProject: "",
    }));
  };

  const handleCategorySelect = (cat) => {
    onChange((p) => ({ ...p, category: cat, softwareProject: "" }));
  };

  const handleSubCategorySelect = (sub) => {
    onChange((p) => ({ ...p, softwareProject: sub }));
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box" style={{ maxWidth: "600px" }}>
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 flex-none">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              {isHRTicket ? (
                <>
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  Raise HR Ticket
                </>
              ) : (
                <>Raise IT Ticket</>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Submitting as{" "}
              <span className="font-bold text-slate-700">
                {currentUser?.first_name} {currentUser?.last_name}
              </span>{" "}
              ·{" "}
              <span className="mono text-slate-500">
                #{currentUser?.emp_no}
              </span>{" "}
              ·{" "}
              <span
                className={`font-bold px-1.5 rounded-full text-[10px] ${ORG_PILL_SAFE}`}
              >
                {currentUser?.org_Id}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto thin-scroll flex-1 p-6 space-y-5">
          {/* ── 1. Department ── */}
          <Field label="Ticket Department">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDeptChange("IT")}
                className={`flex items-center justify-center gap-2 h-11 rounded-xl border text-sm font-bold transition-all ${form.dept === "IT" ? "bg-slate-900 text-white border-slate-900" : "border-slate-300 text-slate-600 hover:bg-slate-50"}`}
              >
                <Wrench className="w-4 h-4" /> IT Ticket
              </button>
              <button
                onClick={() => handleDeptChange("HR")}
                className={`flex items-center justify-center gap-2 h-11 rounded-xl border text-sm font-bold transition-all ${form.dept === "HR" ? "bg-indigo-600 text-white border-indigo-600" : "border-indigo-200 text-indigo-700 hover:bg-indigo-50"}`}
              >
                <Briefcase className="w-4 h-4" /> HR Ticket
              </button>
            </div>
          </Field>

          {/* ── 2. Request Type (IT only) ── */}
          {!isHRTicket && (
            <Field label="Request Type">
              <div className="grid grid-cols-2 gap-2">
                {["Service Request", "Incident"].map((rt) => (
                  <button
                    key={rt}
                    onClick={() => handleRequestTypeChange(rt)}
                    className={`h-10 rounded-xl border text-sm font-bold transition-colors ${
                      form.requestType === rt
                        ? rt === "Incident"
                          ? "bg-red-600 text-white border-red-600"
                          : "bg-sky-600 text-white border-sky-600"
                        : rt === "Incident"
                          ? "border-red-200 text-red-700 hover:bg-red-50"
                          : "border-sky-200 text-sky-700 hover:bg-sky-50"
                    }`}
                  >
                    {rt}
                  </button>
                ))}
              </div>
            </Field>
          )}

          {/* ── 3. Category Tree ── */}
          {filteredCatalog.length > 0 ? (
            <>
              {/* Level 1: Parent Category */}
              <Field label="Category" error={errors.parentCategory}>
                <div className="grid grid-cols-2 gap-2">
                  {parentNames.map((parent) => {
                    const isSelected = form.parentCategory === parent;
                    return (
                      <button
                        key={parent}
                        onClick={() => handleParentSelect(parent)}
                        className={`flex items-center justify-between h-10 px-3 rounded-xl border text-xs font-bold transition-all text-left ${
                          isSelected
                            ? isHRTicket
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-slate-900 text-white border-slate-900"
                            : "border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="truncate">{parent}</span>
                        {isSelected ? (
                          <ChevronDown className="w-3 h-3 flex-none ml-1" />
                        ) : (
                          <ChevronRight className="w-3 h-3 flex-none ml-1 text-slate-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* Level 2: Sub-category (only if parent has multiple distinct categories) */}
              {form.parentCategory &&
                !parentIsSelfCategory &&
                categoriesForParent.length > 0 && (
                  <Field label="Sub-Category" error={errors.category}>
                    <div className="grid grid-cols-2 gap-2">
                      {categoriesForParent.map((cat) => {
                        const isSelected = form.category === cat;
                        return (
                          <button
                            key={cat}
                            onClick={() => handleCategorySelect(cat)}
                            className={`flex items-center justify-between h-10 px-3 rounded-xl border text-xs font-bold transition-all text-left ${
                              isSelected
                                ? isHRTicket
                                  ? "bg-indigo-500 text-white border-indigo-500"
                                  : "bg-blue-600 text-white border-blue-600"
                                : "border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span className="truncate">{cat}</span>
                            {isSelected ? (
                              <ChevronDown className="w-3 h-3 flex-none ml-1" />
                            ) : (
                              <ChevronRight className="w-3 h-3 flex-none ml-1 text-slate-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                )}

              {/* Level 3: Specific item / details (subCategory) */}
              {form.category && subCategoriesForCategory.length > 0 && (
                <Field
                  label="Specific Item / Details"
                  error={errors.softwareProject}
                >
                  {isTextBoxSub ? (
                    <input
                      type="text"
                      value={form.softwareProject}
                      onChange={(e) =>
                        onChange((p) => ({
                          ...p,
                          softwareProject: e.target.value,
                        }))
                      }
                      placeholder="Enter details..."
                      className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:border-blue-400"
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {subCategoriesForCategory.map((sub) => {
                        const isTextInput = sub === "Application Name";
                        if (isTextInput) {
                          // Render inline text field for "Application Name" type
                          return (
                            <div key={sub} className="col-span-2">
                              <input
                                type="text"
                                value={form.softwareProject}
                                onChange={(e) =>
                                  onChange((p) => ({
                                    ...p,
                                    softwareProject: e.target.value,
                                  }))
                                }
                                placeholder="Enter application name..."
                                className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:border-blue-400"
                              />
                            </div>
                          );
                        }
                        return (
                          <button
                            key={sub}
                            onClick={() => handleSubCategorySelect(sub)}
                            className={`flex items-center h-10 px-3 rounded-xl border text-xs font-bold transition-all text-left ${
                              form.softwareProject === sub
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span className="truncate">{sub}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </Field>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-400 text-center">
              Loading categories…
            </div>
          )}

          {/* ── 4. Impact / Type ── */}
          <Field label={isHRTicket ? "Impact / Type" : "Impact"}>
            {isHRTicket ? (
              <div className="grid grid-cols-2 gap-2">
                {HR_IMPACT_OPTIONS.map((imp) => {
                  const ImpIcon = imp.Icon;
                  const selected = form.impact === imp.value;
                  return (
                    <button
                      key={imp.value}
                      onClick={() =>
                        onChange((p) => ({ ...p, impact: imp.value }))
                      }
                      className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                        selected
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "border-slate-200 text-slate-600 hover:bg-indigo-50 hover:border-indigo-200"
                      }`}
                    >
                      <ImpIcon
                        className={`w-4 h-4 flex-none mt-0.5 ${selected ? "text-white" : "text-indigo-500"}`}
                      />
                      <div>
                        <p
                          className={`text-xs font-bold leading-tight ${selected ? "text-white" : "text-slate-800"}`}
                        >
                          {imp.label}
                        </p>
                        <p
                          className={`text-[10px] mt-0.5 leading-tight ${selected ? "text-indigo-200" : "text-slate-400"}`}
                        >
                          {imp.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {IT_IMPACT_OPTIONS.map((imp) => {
                  const ImpIcon = imp.Icon;
                  return (
                    <button
                      key={imp.value}
                      onClick={() =>
                        onChange((p) => ({ ...p, impact: imp.value }))
                      }
                      className={`flex items-center gap-2 h-10 px-3 rounded-xl border text-xs font-bold transition-all text-left ${
                        form.impact === imp.value
                          ? "bg-slate-900 text-white border-slate-900"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <ImpIcon className="w-3.5 h-3.5 flex-none" /> {imp.label}
                    </button>
                  );
                })}
              </div>
            )}
          </Field>

          {/* ── 5. Ticket Type (IT only — new vs linked) ── */}
          {!isHRTicket && (
            <Field label="Ticket Type">
              <div className="grid grid-cols-2 gap-2">
                {["Ticket", "Linked Ticket"].map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      onChange((p) => ({
                        ...p,
                        type,
                        parentId: type === "Linked Ticket" ? p.parentId : "",
                      }))
                    }
                    className={`h-10 rounded-xl border text-sm font-bold transition-colors ${
                      form.type === type
                        ? "bg-slate-900 text-white border-slate-900"
                        : "border-slate-300 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </Field>
          )}

          {!isHRTicket && form.type === "Linked Ticket" && (
            <Field label="Link to Closed Ticket" error={errors.parentId}>
              <div className="relative">
                <select
                  value={form.parentId}
                  onChange={(e) =>
                    onChange((p) => ({ ...p, parentId: e.target.value }))
                  }
                  className="h-10 w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:border-slate-400"
                >
                  <option value="">Select closed ticket</option>
                  {closedTickets
                    .filter((t) => t.ticketDept === "IT")
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        #{t.id} — {t.description}
                      </option>
                    ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
              </div>
            </Field>
          )}

          {/* ── 6. Description ── */}
          <Field
            label="Description / Request Details"
            error={errors.description}
          >
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                onChange((p) => ({ ...p, description: e.target.value }))
              }
              placeholder={
                isHRTicket
                  ? "Describe the HR request, employee name, and relevant details."
                  : "Clearly describe the request, affected system, scope, and urgency."
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-slate-400 resize-none"
            />
          </Field>

          {/* ── 7. Attachment ── */}
          <Field label="Attachment (optional)">
            <div
              onClick={() => fileRef.current?.click()}
              className={`flex items-center gap-3 rounded-xl border-2 border-dashed cursor-pointer px-4 py-3 transition-all ${
                form.attachment
                  ? "border-blue-300 bg-blue-50"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
              }`}
            >
              <Paperclip
                className={`w-4 h-4 flex-none ${form.attachment ? "text-blue-500" : "text-slate-400"}`}
              />
              {form.attachment ? (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-blue-700 truncate">
                    {form.attachment.name}
                  </p>
                  <p className="text-xs text-blue-400 mono">
                    {fmtBytes(form.attachment.size)}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-slate-600">
                    Click to attach
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    PDF, DOCX, XLSX, images
                  </p>
                </div>
              )}
              {form.attachment && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange((p) => ({ ...p, attachment: null }));
                  }}
                  className="p-1 rounded text-blue-400 hover:text-blue-600 flex-none"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onChange((p) => ({ ...p, attachment: f }));
              }}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"
            />
          </Field>
        </div>

        {/* ── Modal Footer ── */}
        <div className="flex-none border-t border-slate-100 px-6 py-4 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            Submitted as{" "}
            <span className="font-semibold text-slate-600">
              {currentUser?.first_name} {currentUser?.last_name}
            </span>{" "}
            · {currentUser?.org_Id}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="h-10 px-4 rounded-xl border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className={`h-10 px-5 rounded-xl text-sm font-bold text-white flex items-center gap-2 ${
                isHRTicket
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-slate-900 hover:bg-slate-800"
              }`}
            >
              <Plus className="w-4 h-4" /> Raise Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
