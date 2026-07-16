import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Plus,
  Save,
  Edit,
  AlertCircle,
  CheckCircle,
  Trash2,
  Calendar,
  Clock,
  MessageSquare,
} from "lucide-react";
import Swal from "sweetalert2";
import ComplaintTrackerServices from "../../services/ecom/ComplaintTrackerService";

const user = JSON.parse(sessionStorage.getItem("user")) || {};
const created_By = user?.ama_Id || user?.rc_Id;
const dept_Id = user?.dept_id;

const RootCauseModal = ({
  complaint,
  onClose,
  onUpdate,
  isUpdating,
  onRefresh,
}) => {
  // State for root cause analysis (single entry)
  const [rootCauseAnalysis, setRootCauseAnalysis] = useState(
    complaint?.rootCauseAnalysis?.rootCauseAnalysis || "",
  );

  // State for multiple corrective actions
  const [correctiveActions, setCorrectiveActions] = useState(() => {
    if (complaint?.rootCauseAnalysis?.correctiveActions) {
      return complaint?.rootCauseAnalysis.correctiveActions;
    }
    return [];
  });

  // State for departments from API
  const [departments, setDepartments] = useState([]);

  // Form state for adding new corrective action
  const [newCorrectiveAction, setNewCorrectiveAction] = useState({
    correctiveAction: "",
    responsibility: "",
    responsibilityName: "",
    targetDate: "",
    completionDate: "",
    status: "In Process",
  });

  const [formErrors, setFormErrors] = useState({});
  const [isFormSubmitted, setIsFormSubmitted] = useState(
    !!complaint?.rootCauseAnalysis?.rootCauseAnalysis,
  );

  // State for remarks input
  const [remarksInput, setRemarksInput] = useState({});

  // Check if user has action access (add, edit, submit)
  const hasActionAccess = useMemo(() => {
    const defaultAuthorizedDepts = [11];

    if (defaultAuthorizedDepts.includes(dept_Id)) {
      return true;
    }

    return false;
  }, [complaint?.responsible_Departments, dept_Id]);

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
    if (isFormSubmitted) {
      fetchRootCauseActions();
    }
  }, [isFormSubmitted]);

  const fetchDepartments = async () => {
    try {
      const response = await ComplaintTrackerServices.GetComplaintDepartments();
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
      setDepartments([]);
    }
  };

  // Fetch root cause actions if form is submitted
  const fetchRootCauseActions = async () => {
    try {
      const response = await ComplaintTrackerServices.GetComplaintRootAction(
        complaint.id,
      );

      if (
        response?.data &&
        response.data.records &&
        response.data.records.length > 0
      ) {
        // Get the first record to extract root cause analysis
        const firstRecord = response.data.records[0];
        setRootCauseAnalysis(firstRecord.root_Cause || "");

        // Map all records to corrective actions
        const formattedCorrectiveActions = response.data.records.map(
          (record) => ({
            id: record.rcA_Id,
            rcA_Id: record.rcA_Id,
            correctiveAction: record.corrective_Action,
            responsibility: record.dept_Id?.toString(),
            responsibilityName: record.dept_Name,
            targetDate: formatDateForInput(record.target_Date),
            completionDate: formatDateForInput(record.completion_Date),
            remarks: record.remarks || "",
            status: record.completion_Date ? "Completed" : "In Process",
          }),
        );

        setCorrectiveActions(formattedCorrectiveActions);
      }
    } catch (error) {
      console.error("Error fetching root cause actions:", error);
    }
  };

  // Helper function to format date for input field (YYYY-MM-DD) with timezone correction
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    // Create date from the API string and add timezone offset to get correct local date
    const date = new Date(dateString);

    // Extract the year, month, and day
    const year = date.getFullYear();
    // getMonth() is zero-based (0-11), so we add 1
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // Helper function to convert date to ISO format
  const formatDateToISO = (dateString) => {
    if (!dateString) return "";

    // Create date object from input value (YYYY-MM-DD)
    const date = new Date(dateString + "T00:00:00.000Z");
    return date.toISOString();
  };

  // Get list of already selected department IDs
  const getSelectedDepartmentIds = () => {
    return correctiveActions.map((action) => parseInt(action.responsibility));
  };

  // Filter departments to exclude already selected ones
  const getAvailableDepartments = () => {
    const selectedDeptIds = getSelectedDepartmentIds();
    return departments?.filter(
      (dept) => !selectedDeptIds.includes(dept?.dept_Id),
    );
  };

  const handleDepartmentChange = (deptId) => {
    const selectedDept = departments.find(
      (dept) => dept.dept_Id === parseInt(deptId),
    );
    setNewCorrectiveAction((prev) => ({
      ...prev,
      responsibility: deptId,
      responsibilityName: selectedDept ? selectedDept.dept_Name : "",
    }));
  };

  const validateNewCorrectiveAction = () => {
    const errors = {};

    if (!newCorrectiveAction.correctiveAction.trim()) {
      errors.correctiveAction = "Corrective action is required";
    }

    if (!newCorrectiveAction.responsibility) {
      errors.responsibility = "Responsibility is required";
    } else {
      // Check for duplicate department
      const selectedDeptIds = getSelectedDepartmentIds();
      if (
        selectedDeptIds.includes(parseInt(newCorrectiveAction.responsibility))
      ) {
        errors.responsibility =
          "This department is already assigned to another corrective action";
      }
    }

    if (!newCorrectiveAction.targetDate) {
      errors.targetDate = "Target date is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddCorrectiveAction = () => {
    if (!validateNewCorrectiveAction()) {
      return;
    }

    const newAction = {
      id: Date.now(),
      ...newCorrectiveAction,
      status: "In Process",
    };

    setCorrectiveActions((prev) => [...prev, newAction]);

    // Reset form
    setNewCorrectiveAction({
      correctiveAction: "",
      responsibility: "",
      responsibilityName: "",
      targetDate: "",
      completionDate: "",
      status: "In Process",
    });
    setFormErrors({});
  };

  const handleRemoveCorrectiveAction = (id) => {
    setCorrectiveActions((prev) => prev.filter((action) => action.id !== id));
  };

  const handleUpdateCompletionDate = (id, newDate) => {
    setCorrectiveActions((prev) =>
      prev.map((action) =>
        action.id === id ? { ...action, completionDate: newDate } : action,
      ),
    );
  };

  const handleRemarksChange = (id, remarks) => {
    setRemarksInput((prev) => ({
      ...prev,
      [id]: remarks,
    }));
  };

  const handleSave = async () => {
    // Validate root cause analysis
    if (!rootCauseAnalysis.trim()) {
      setFormErrors({
        rootCauseAnalysis: "Root cause analysis is required",
      });
      return;
    }

    // Validate at least one corrective action
    if (correctiveActions.length === 0) {
      setFormErrors({ general: "At least one corrective action is required" });
      return;
    }

    try {
      const result = await onUpdate(
        correctiveActions?.map((action) => ({
          complaint_Id: complaint?.id,
          root_Cause: rootCauseAnalysis,
          corrective_Action: action.correctiveAction,
          dept_Id: parseInt(action.responsibility),
          target_Date: formatDateToISO(action.targetDate),
          created_by: created_By,
        })),
      );

      // Check if update was successful
      if (result?.success) {
        setIsFormSubmitted(true);
        onClose();
      }
    } catch (error) {
      console.error("Error updating root cause analysis:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Please try again.",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  const handleMarkComplete = async (id) => {
    const correctiveAction = correctiveActions.find(
      (action) => action.id === id,
    );

    if (!correctiveAction.completionDate) {
      Swal.fire({
        icon: "warning",
        title: "Missing Completion Date",
        text: "Please enter the completion date before marking as complete.",
      });
      return;
    }

    // Show confirmation dialog with remarks input
    const { value: formValues, isConfirmed } = await Swal.fire({
      title: "Mark as Complete",
      html: `
      <div class="text-left">
        <p class="mb-4 text-gray-600">Are you sure you want to mark this corrective action as completed?</p>
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-2">Remarks (Optional)</label>
          <textarea 
            id="swal-remarks" 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            rows="3" 
            placeholder="Add any remarks or comments..."
            value="${remarksInput[id] || ""}"
          ></textarea>
        </div>
        <div class="text-sm text-gray-500">
          <strong>Action:</strong> ${correctiveAction.correctiveAction}<br>
          <strong>Completion Date:</strong> ${correctiveAction.completionDate}
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Mark as Complete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#6B7280",
      preConfirm: () => {
        const remarks = document.getElementById("swal-remarks").value;
        return { remarks };
      },
      focusConfirm: false,
      customClass: {
        popup: "swal2-popup-large",
      },
    });

    if (!isConfirmed) return;

    const remarks = formValues?.remarks || "";

    try {
      // Prepare data for API call
      const updateData = {
        rcA_Id: correctiveAction.rcA_Id,
        completion_Date: formatDateToISO(correctiveAction.completionDate),
        Remarks: remarks,
        modified_by: created_By,
      };

      // Call API to update completion date
      const response =
        await ComplaintTrackerServices.UpdateComplaintRootCompletionDate(
          updateData,
        );

      // Check if the API response indicates success
      if (response && response.status === "Success") {
        setCorrectiveActions((prev) =>
          prev.map((action) =>
            action.id === id
              ? { ...action, status: "Completed", remarks: remarks }
              : action,
          ),
        );

        // Clear remarks input for this action
        setRemarksInput((prev) => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });

        Swal.fire({
          icon: "success",
          title: "Marked as Complete",
          text: "The corrective action has been marked as completed successfully.",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });

        // Refresh dashboard data after successful completion
        await onRefresh();
      } else {
        throw new Error(
          response?.message || "API did not return success status",
        );
      }
    } catch (error) {
      console.error("Error updating completion status:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text:
          error.message ||
          "Failed to update completion status. Please try again.",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full h-[75vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-red-50 rounded-t-lg">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Root Cause Analysis
              {!hasActionAccess && (
                <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                  View Only
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-600">
              {complaint?.complaintNo} - {complaint?.customerName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Root Cause Analysis Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Root Cause Analysis
            </h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Root Cause Analysis Description *
              </label>
              <textarea
                value={rootCauseAnalysis}
                onChange={(e) => {
                  setRootCauseAnalysis(e.target.value);
                  if (formErrors.rootCauseAnalysis) {
                    setFormErrors((prev) => ({
                      ...prev,
                      rootCauseAnalysis: null,
                    }));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 ${
                  formErrors.rootCauseAnalysis
                    ? "border-red-300"
                    : "border-gray-300"
                } ${isFormSubmitted || !hasActionAccess ? "bg-gray-50" : ""}`}
                rows="4"
                placeholder="Describe the root cause analysis..."
                disabled={isFormSubmitted || !hasActionAccess}
                readOnly={!hasActionAccess}
              />
              {formErrors.rootCauseAnalysis && (
                <p className="text-sm text-red-600 mt-1">
                  {formErrors.rootCauseAnalysis}
                </p>
              )}
            </div>
          </div>

          {/* Corrective Actions Table */}
          {correctiveActions.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Corrective Actions & Timeline
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Corrective Action
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Responsibility
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Target Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completion Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remarks
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      {!isFormSubmitted && hasActionAccess && (
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {correctiveActions.map((action) => (
                      <tr key={action.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                          <div
                            className="truncate"
                            title={action.correctiveAction}
                          >
                            {action.correctiveAction}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <span className="inline-flex px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                            {action.responsibilityName}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="flex items-center">
                            <Calendar
                              size={14}
                              className="mr-1 text-gray-400"
                            />
                            {action.targetDate}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {isFormSubmitted && hasActionAccess ? (
                            <div className="flex items-center gap-2 min-w-[100px]">
                              <input
                                type="date"
                                value={action.completionDate}
                                onChange={(e) =>
                                  handleUpdateCompletionDate(
                                    action.id,
                                    e.target.value,
                                  )
                                }
                                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                                disabled={action.status === "Completed"}
                              />
                              {action.status !== "Completed" && (
                                <button
                                  onClick={() => handleMarkComplete(action.id)}
                                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-1 flex items-center whitespace-nowrap transition-colors"
                                  title="Mark as Complete"
                                >
                                  <CheckCircle size={14} className="mr-1.5" />
                                  Submit
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500 italic">
                              {action.completionDate || "-"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                          {action.remarks ? (
                            <div className="flex items-start gap-1">
                              <MessageSquare
                                size={14}
                                className="text-blue-500 mt-0.5 flex-shrink-0"
                              />
                              <span
                                className="text-sm text-gray-700 truncate"
                                title={action.remarks}
                              >
                                {action.remarks}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-xs">
                              No remarks
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-flex px-2 py-1 text-xs rounded-full ${
                              action.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {action.status}
                          </span>
                        </td>
                        {!isFormSubmitted && hasActionAccess && (
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() =>
                                handleRemoveCorrectiveAction(action.id)
                              }
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Remove"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Add New Corrective Action Form - Only show if has action access and not submitted */}
          {!isFormSubmitted && hasActionAccess && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">
                  Add New Corrective Action
                </h4>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Responsibility *
                    </label>
                    <select
                      value={newCorrectiveAction.responsibility}
                      onChange={(e) => handleDepartmentChange(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 ${
                        formErrors.responsibility
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Responsibility...</option>
                      {getAvailableDepartments().map((dept) => (
                        <option key={dept.dept_Id} value={dept.dept_Id}>
                          {dept.dept_Name}
                        </option>
                      ))}
                    </select>
                    {formErrors.responsibility && (
                      <p className="text-sm text-red-600 mt-1">
                        {formErrors.responsibility}
                      </p>
                    )}
                    {getAvailableDepartments().length === 0 &&
                      departments.length > 0 && (
                        <p className="text-sm text-amber-600 mt-1">
                          All departments have been assigned to corrective
                          actions
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Date *
                    </label>
                    <input
                      type="date"
                      value={newCorrectiveAction.targetDate}
                      onChange={(e) =>
                        setNewCorrectiveAction((prev) => ({
                          ...prev,
                          targetDate: e.target.value,
                        }))
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 ${
                        formErrors.targetDate
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                    />
                    {formErrors.targetDate && (
                      <p className="text-sm text-red-600 mt-1">
                        {formErrors.targetDate}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Corrective Action *
                  </label>
                  <textarea
                    value={newCorrectiveAction.correctiveAction}
                    onChange={(e) =>
                      setNewCorrectiveAction((prev) => ({
                        ...prev,
                        correctiveAction: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 ${
                      formErrors.correctiveAction
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    rows="3"
                    placeholder="Describe the corrective action..."
                  />
                  {formErrors.correctiveAction && (
                    <p className="text-sm text-red-600 mt-1">
                      {formErrors.correctiveAction}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={handleAddCorrectiveAction}
                  disabled={getAvailableDepartments().length === 0}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                  <Plus size={16} className="mr-2" />
                  Add New Corrective Action
                </button>
              </div>
            </div>
          )}

          {/* General Error */}
          {formErrors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{formErrors.general}</p>
            </div>
          )}

          {/* Access Notice for View-Only Users */}
          {!hasActionAccess && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle size={16} className="text-yellow-600 mr-2" />
                <p className="text-sm text-yellow-700">
                  You are viewing this in read-only mode. Only authorized
                  departments can make changes.
                </p>
              </div>
            </div>
          )}

          {/* Read-only Notice for Submitted Forms */}
          {isFormSubmitted && hasActionAccess && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle size={16} className="text-yellow-600 mr-2" />
                <p className="text-sm text-yellow-700">
                  Form has been submitted. Only completion dates can be updated
                  and marked as complete.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          {!isFormSubmitted && hasActionAccess && (
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RootCauseModal;
