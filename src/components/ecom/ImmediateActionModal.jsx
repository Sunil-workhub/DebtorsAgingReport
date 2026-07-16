import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Plus,
  Save,
  AlertCircle,
  CheckCircle,
  Trash2,
  Calendar,
  MessageSquare,
} from "lucide-react";
import Swal from "sweetalert2";
import ComplaintTrackerServices from "../../services/ecom/ComplaintTrackerService";

const user = JSON.parse(sessionStorage.getItem("user")) || {};
const created_By = user?.ama_Id || user?.rc_Id;
const dept_Id = user?.dept_id;

const ImmediateActionModal = ({
  complaint,
  onClose,
  onUpdate,
  isUpdating,
  onRefresh,
}) => {
  // State for immediate correction (single entry)
  const [immediateCorrection, setImmediateCorrection] = useState(
    complaint.immediateCorrectiveAction?.immediateCorrection || "",
  );

  // State for multiple responsibilities with target dates and completion dates
  const [responsibilities, setResponsibilities] = useState(() => {
    if (complaint.immediateCorrectiveAction?.responsibilities) {
      return complaint.immediateCorrectiveAction.responsibilities;
    }
    return [];
  });

  console.log("responsibilities", responsibilities);

  const hasActionAccess = useMemo(() => {
    const defaultAuthorizedDepts = [11];

    if (defaultAuthorizedDepts.includes(dept_Id)) {
      return true;
    }

    return false;
  }, [complaint?.responsible_Departments, dept_Id]);

  // State for departments from API
  const [departments, setDepartments] = useState([]);

  // Form state for adding new responsibility
  const [newResponsibility, setNewResponsibility] = useState({
    deptId: "",
    deptName: "",
    targetDate: "",
    actualCompletionDate: "",
    status: "In Process",
  });

  const [rootCauseAnalysisRequired, setRootCauseAnalysisRequired] = useState(
    complaint.immediateCorrectiveAction?.rootCauseAnalysisRequired || false,
  );

  const [formErrors, setFormErrors] = useState({});
  const [isFormSubmitted, setIsFormSubmitted] = useState(
    !!complaint.immediateCorrectiveAction?.immediateCorrection,
  );

  // Track if root cause has been submitted separately
  const [isRootCauseSubmitted, setIsRootCauseSubmitted] = useState(false);

  // State for remarks input
  const [remarksInput, setRemarksInput] = useState({});

  // Fetch departments and immediate actions on component mount
  useEffect(() => {
    fetchDepartments();
    if (isFormSubmitted) {
      fetchImmediateActions();
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

  // Fetch immediate actions if form is submitted
  const fetchImmediateActions = async () => {
    try {
      const response =
        await ComplaintTrackerServices.GetComplaintImmediateAction(
          complaint.id,
        );
      if (response?.data && response.data.length > 0) {
        // Assuming the API returns the immediate action data
        const immediateActionData = response.data[0];

        // Update state with fetched data
        setImmediateCorrection(immediateActionData.immediate_Correction || "");
        setRootCauseAnalysisRequired(
          immediateActionData.root_Cause_Analysis || false,
        );

        // Check if root cause analysis has been set
        if (
          immediateActionData.root_Cause_Analysis !== null &&
          immediateActionData.root_Cause_Analysis !== undefined
        ) {
          setIsRootCauseSubmitted(true);
        }

        // Update responsibilities with proper formatting
        if (immediateActionData.action_Items) {
          const formattedResponsibilities =
            immediateActionData.action_Items.map((item) => ({
              id: item.immediate_Trl_Id,
              deptId: item.dept_Id?.toString(),
              deptName: item?.dept_Name,
              targetDate: formatDateForInput(item.target_Date),
              actualCompletionDate: formatDateForInput(
                item.actual_Completion_Date,
              ),
              remarks: item.remarks || "",
              status: item.actual_Completion_Date ? "Completed" : "In Process",
              immediate_Trl_Id: item.immediate_Trl_Id,
            }));
          setResponsibilities(formattedResponsibilities);
        }
      }
    } catch (error) {
      console.error("Error fetching immediate actions:", error);
    }
  };

  // Helper function to format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper function to convert date to ISO format
  const formatDateToISO = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString + "T00:00:00.000Z");
    return date.toISOString();
  };

  // Check if at least one responsibility is completed
  const hasCompletedResponsibility = () => {
    return responsibilities.some((resp) => resp.status === "Completed");
  };

  // Get list of already selected department IDs
  const getSelectedDepartmentIds = () => {
    return responsibilities.map((resp) => parseInt(resp.deptId));
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
    setNewResponsibility((prev) => ({
      ...prev,
      deptId: deptId,
      deptName: selectedDept ? selectedDept.dept_Name : "",
    }));
  };

  const validateNewResponsibility = () => {
    const errors = {};

    if (!newResponsibility.deptId) {
      errors.department = "Department is required";
    } else {
      // Check for duplicate department
      const selectedDeptIds = getSelectedDepartmentIds();
      if (selectedDeptIds.includes(parseInt(newResponsibility.deptId))) {
        errors.department = "This department is already selected";
      }
    }

    if (!newResponsibility.targetDate) {
      errors.targetDate = "Target date is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddResponsibility = () => {
    if (!validateNewResponsibility()) {
      return;
    }

    const newResp = {
      id: Date.now(),
      ...newResponsibility,
      status: "In Process",
    };

    setResponsibilities((prev) => [...prev, newResp]);

    // Reset form
    setNewResponsibility({
      deptId: "",
      deptName: "",
      targetDate: "",
      actualCompletionDate: "",
      status: "In Process",
    });
    setFormErrors({});
  };

  const handleRemoveResponsibility = (id) => {
    setResponsibilities((prev) => prev.filter((resp) => resp.id !== id));
  };

  const handleUpdateActualDate = (id, newDate) => {
    setResponsibilities((prev) =>
      prev.map((resp) =>
        resp.id === id ? { ...resp, actualCompletionDate: newDate } : resp,
      ),
    );
  };

  const handleSave = async () => {
    // Validate immediate correction
    if (!immediateCorrection.trim()) {
      setFormErrors({
        immediateCorrection: "Immediate correction is required",
      });
      return;
    }

    // Validate at least one responsibility
    if (responsibilities.length === 0) {
      setFormErrors({ general: "At least one responsibility is required" });
      return;
    }

    try {
      const result = await onUpdate(complaint.id, {
        immediate_Correction: immediateCorrection,
        action_Items: responsibilities?.map((resp) => ({
          dept_Id: parseInt(resp.deptId),
          target_Date: formatDateToISO(resp.targetDate),
          created_by: created_By,
        })),
      });

      // Check if update was successful
      if (result?.success) {
        setIsFormSubmitted(true);
        onClose();
      }
    } catch (error) {
      console.error("Error updating immediate action:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Please try again.",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  const handleMarkComplete = async (id) => {
    const responsibility = responsibilities.find((resp) => resp.id === id);

    if (!responsibility.actualCompletionDate) {
      Swal.fire({
        icon: "warning",
        title: "Missing Completion Date",
        text: "Please enter the actual completion date before marking as complete.",
      });
      return;
    }

    // Show confirmation dialog with remarks input
    const { value: formValues, isConfirmed } = await Swal.fire({
      title: "Mark as Complete",
      html: `
      <div class="text-left">
        <p class="mb-4 text-gray-600">Are you sure you want to mark this responsibility as completed?</p>
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
          <strong>Department:</strong> ${responsibility.deptName}<br>
          <strong>Completion Date:</strong> ${
            responsibility.actualCompletionDate
          }
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
        immediate_Trl_Id: responsibility.immediate_Trl_Id || responsibility.id,
        actual_Completion_Date: formatDateToISO(
          responsibility.actualCompletionDate,
        ),
        remarks: remarks,
        modified_by: created_By,
      };

      // Call API to update actual completion date
      const response =
        await ComplaintTrackerServices.UpdateComplaintActualCompletionDate(
          updateData,
        );

      // Check if API response indicates success
      if (response && response.status === "Success") {
        setResponsibilities((prev) =>
          prev.map((resp) =>
            resp.id === id
              ? { ...resp, status: "Completed", remarks: remarks }
              : resp,
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
          text: "The responsibility has been marked as completed successfully.",
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

  const handleSubmitRootCauseRequired = async () => {
    try {
      // Call separate API for root cause analysis required
      const response =
        await ComplaintTrackerServices.UpdateRootCauseAnalysisRequired({
          Complaint_Id: complaint.id,
          Root_Cause_Analysis: rootCauseAnalysisRequired,
          modified_by: created_By,
        });

      if (response?.status === "Success") {
        setIsRootCauseSubmitted(true);

        Swal.fire({
          icon: "success",
          title: "Updated Successfully",
          text: "Root cause analysis requirement has been updated.",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });

        // Refresh dashboard data after successful update
        await onRefresh();
      } else {
        throw new Error(
          response?.message || "API did not return success status",
        );
      }
    } catch (error) {
      console.error("Error updating root cause required:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text:
          error.message ||
          "Failed to update root cause analysis requirement. Please try again.",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full h-[75vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-blue-50 rounded-t-lg">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Immediate Corrective Action
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
          {/* Immediate Correction Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Immediate Correction
            </h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Immediate Correction Description
              </label>
              <textarea
                value={immediateCorrection}
                onChange={(e) => {
                  setImmediateCorrection(e.target.value);
                  if (formErrors.immediateCorrection) {
                    setFormErrors((prev) => ({
                      ...prev,
                      immediateCorrection: null,
                    }));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  formErrors.immediateCorrection
                    ? "border-red-300"
                    : "border-gray-300"
                } ${isFormSubmitted || !hasActionAccess ? "bg-gray-50" : ""}`}
                rows="3"
                placeholder="Describe the immediate correction..."
                disabled={isFormSubmitted || !hasActionAccess}
                readOnly={!hasActionAccess}
              />
              {formErrors.immediateCorrection && (
                <p className="text-sm text-red-600 mt-1">
                  {formErrors.immediateCorrection}
                </p>
              )}
            </div>
          </div>

          {/* Responsibilities Table */}
          {responsibilities.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Responsibilities Timeline
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Target Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actual Completion Date
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
                    {responsibilities.map((resp) => (
                      <tr key={resp.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {resp.deptName}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="flex items-center">
                            <Calendar
                              size={14}
                              className="mr-1 text-gray-400"
                            />
                            {resp.targetDate}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {isFormSubmitted && hasActionAccess ? (
                            <div className="flex items-center gap-2 min-w-[100px]">
                              <input
                                type="date"
                                value={resp.actualCompletionDate}
                                onChange={(e) =>
                                  handleUpdateActualDate(
                                    resp.id,
                                    e.target.value,
                                  )
                                }
                                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                disabled={resp.status === "Completed"}
                              />
                              {resp.status !== "Completed" && (
                                <button
                                  onClick={() => handleMarkComplete(resp.id)}
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
                              {resp.actualCompletionDate || "-"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                          {resp.remarks ? (
                            <div className="flex items-start gap-1">
                              <MessageSquare
                                size={14}
                                className="text-blue-500 mt-0.5 flex-shrink-0"
                              />
                              <span
                                className="text-sm text-gray-700 truncate"
                                title={resp.remarks}
                              >
                                {resp.remarks}
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
                              resp.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {resp.status}
                          </span>
                        </td>
                        {!isFormSubmitted && hasActionAccess && (
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() =>
                                handleRemoveResponsibility(resp.id)
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

          {/* Add New Responsibility Form - Only show if has action access and not submitted */}
          {!isFormSubmitted && hasActionAccess && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">
                  Add Responsible Department
                </h4>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Responsibility *
                    </label>
                    <select
                      value={newResponsibility.responsibility}
                      onChange={(e) => handleDepartmentChange(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
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
                          All departments have been assigned to responsibilities
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Date *
                    </label>
                    <input
                      type="date"
                      value={newResponsibility.targetDate}
                      onChange={(e) =>
                        setNewResponsibility((prev) => ({
                          ...prev,
                          targetDate: e.target.value,
                        }))
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
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
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={handleAddResponsibility}
                  disabled={getAvailableDepartments().length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                  <Plus size={16} className="mr-2" />
                  Add Responsibility
                </button>
              </div>
            </div>
          )}

          {/* Root Cause Analysis Required - Only show editing capability if has access */}
          {isFormSubmitted && hasCompletedResponsibility && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Root Cause Analysis Required
              </h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="rootCauseRequired"
                      checked={rootCauseAnalysisRequired === true}
                      onChange={() => setRootCauseAnalysisRequired(true)}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                      disabled={isRootCauseSubmitted || !hasActionAccess}
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="rootCauseRequired"
                      checked={rootCauseAnalysisRequired === false}
                      onChange={() => setRootCauseAnalysisRequired(false)}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                      disabled={isRootCauseSubmitted || !hasActionAccess}
                    />
                    No
                  </label>
                </div>
                {!isRootCauseSubmitted && hasActionAccess && (
                  <button
                    onClick={handleSubmitRootCauseRequired}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Save size={16} className="mr-2" />
                    Submit
                  </button>
                )}
              </div>
              {isRootCauseSubmitted && (
                <div className="mt-2 text-sm text-green-600 flex items-center">
                  <CheckCircle size={14} className="mr-1" />
                  Root cause analysis requirement has been submitted
                </div>
              )}
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {isUpdating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save size={16} className="mr-2" />
              )}
              {isUpdating ? "Saving..." : "Save"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImmediateActionModal;
