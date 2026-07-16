import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  Info,
  FileText,
  User,
  UserCog,
  ListChecks,
  Paperclip,
  MessageSquare,
  Send,
  CloudUpload,
  FileIcon,
  Image as ImageIcon,
  X,
  ArrowLeft,
} from "lucide-react";

import ComplaintFormServices from "../../services/ecom/ComplaintFormService.js";

const ComplaintForm = ({
  formData,
  requestData,
  loading,
  onSubmit,
  onSaveDraft,
  onFileUpload,
  onPrint,
  onGoBack,
  requestId,
}) => {
  const [localFormData, setLocalFormData] = useState({
    complaintNo: "",
    complaintDate: "",
    customerName: "",
    productSerialNo: "",
    category: "",
    model: "",
    capacity: "",
    hmlTgCodeNo: "",
    hmlInvoiceNo: "",
    dealerInvoiceNo: "",
    productCommissionedOn: "",
    applicationOfEquipment: "",
    normalWeightLifted: "",
    problemReportedByName: "",
    designation: "",
    dateOfProblemReported: "",
    breakDownOccurredOn: "",
    abpEngineerDeputedOnSite: "",
    dateOfServicePersonDeputy: "",
    complaintRelatedTo: "",
    selectedComplaintCategories: [],
    selectedComplaintIssues: [],
    complaintRemarks: "",
    selectRegion: "",
    presetGroup: "",
    productType: "",
    lift: "",
    hmlProductDescription: "",
    address: "",
    hmlInvoiceDate: "",
    dealerInvoiceDate: "",
    whoCommissionedProduct: "",
    siteConditionPrimary: "",
    siteConditionSecondary: "",
    siteConditionOthers: "",
    hoursUsedPerShift: "",
    typeOfLoadLifted: "",
    contactNo: "",
    makeOfFailedPart: "",
    attachments: {
      hmlInvoiceCopy: null,
      momWithCustomer: null,
      photoOfNameplate: null,
      photoOfCompleteEquipment1: null,
      photoOfCompleteEquipment2: null,
      photoOfCompleteEquipment3: null,
      photoShowingFailedPart1: null,
      photoShowingFailedPart2: null,
      photoShowingFailedPart3: null,
    },
    natureOfComplaint: "",
    useful_info: "",
  });

  const [errors, setErrors] = useState({});
  const [apiData, setApiData] = useState({
    regions: [],
    whoCommissioned: [],
    siteConditionsPrimary: [],
    siteConditionsSecondary: [],
    typeOfLoadLifted: [],
    complaintCategories: [],
    complaintIssues: {},
  });
  const [loadingSerial, setLoadingSerial] = useState(false);

  useEffect(() => {
    loadApiData();
  }, []);

  useEffect(() => {
    if (formData) {
      setLocalFormData(formData);
    }
  }, [formData]);

  const loadApiData = async () => {
    try {
      const [
        regionsResponse,
        whoCommissionedResponse,
        siteConditionsPrimaryResponse,
        siteConditionsSecondaryResponse,
        typeOfLoadLiftedResponse,
        complaintCategoriesResponse,
      ] = await Promise.all([
        ComplaintFormServices.GetComplaintRegion(),
        ComplaintFormServices.GetComplaintWhoCommissioned(),
        ComplaintFormServices.GetComplaintSiteConditions(),
        ComplaintFormServices.GetComplaintSiteConditionSecondary(),
        ComplaintFormServices.GetComplaintTypeOfLoadLifted(),
        ComplaintFormServices.GetComplaintRelatedToCategories(),
      ]);

      setApiData({
        regions: regionsResponse?.data || [],
        whoCommissioned: whoCommissionedResponse?.data || [],
        siteConditionsPrimary: siteConditionsPrimaryResponse?.data || [],
        siteConditionsSecondary: siteConditionsSecondaryResponse?.data || [],
        typeOfLoadLifted: typeOfLoadLiftedResponse?.data || [],
        complaintCategories: complaintCategoriesResponse?.data || [],
        complaintIssues: {},
      });
    } catch (error) {
      console.error("Error loading API data:", error);
    }
  };

  const handleComplaintCategoryChange = async (categoryId) => {
    try {
      const response =
        await ComplaintFormServices.GetComplaintSpecificIssuesByCategory(
          categoryId,
        );

      if (response?.status_Code === 200 && response?.data) {
        setApiData((prev) => ({
          ...prev,
          complaintIssues: {
            ...prev.complaintIssues,
            [categoryId]: response.data,
          },
        }));
      }
    } catch (error) {
      console.error(`Error fetching issues for category ${categoryId}:`, error);
      // Optionally show error message to user
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "productSerialNo") {
      return;
    }

    if (name === "siteConditionPrimary") {
      setLocalFormData((prev) => ({
        ...prev,
        siteConditionPrimary: value,
        siteConditionSecondary: "",
      }));
    } else if (name === "selectedComplaintCategories") {
      const categoryName = value;
      setLocalFormData((prev) => {
        const currentCategories = prev.selectedComplaintCategories || [];
        let updatedCategories;

        if (checked) {
          updatedCategories = [...currentCategories, categoryName];
        } else {
          updatedCategories = currentCategories.filter(
            (cat) => cat !== categoryName,
          );
          const categoryObj = apiData.complaintCategories.find(
            (cat) => cat.complaint_Category_Name.toLowerCase() === categoryName,
          );
          if (categoryObj) {
            const categoryIssues =
              apiData.complaintIssues[categoryObj.complaint_Category_Id] || [];
            const issueIdsToRemove = categoryIssues.map(
              (issue) => issue.complaint_Desc_Id,
            );
            return {
              ...prev,
              selectedComplaintCategories: updatedCategories,
              selectedComplaintIssues: prev?.selectedComplaintIssues?.filter(
                (issue) => !issueIdsToRemove.includes(issue.complaint_Desc_Id),
              ),
            };
          }
        }

        return {
          ...prev,
          selectedComplaintCategories: updatedCategories,
        };
      });

      if (checked) {
        const category = apiData.complaintCategories.find(
          (cat) => cat.complaint_Category_Name.toLowerCase() === value,
        );
        if (category) {
          handleComplaintCategoryChange(category.complaint_Category_Id);
        }
      }
    } else if (name.startsWith("complaintIssue_")) {
      const issueId = parseInt(name.split("_")[1]);
      const remarks = name.split("_")[2] === "remarks" ? value : "";

      setLocalFormData((prev) => {
        const existingIssues = prev.selectedComplaintIssues || [];
        if (checked) {
          return {
            ...prev,
            selectedComplaintIssues: [
              ...existingIssues,
              { complaint_Desc_Id: issueId, remarks: remarks },
            ],
          };
        } else {
          return {
            ...prev,
            selectedComplaintIssues: existingIssues.filter(
              (issue) => issue.complaint_Desc_Id !== issueId,
            ),
          };
        }
      });
    } else if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setLocalFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setLocalFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleComplaintIssueRemarksChange = (issueId, remarks) => {
    setLocalFormData((prev) => ({
      ...prev,
      selectedComplaintIssues: prev.selectedComplaintIssues.map((issue) =>
        issue.complaint_Desc_Id === issueId ? { ...issue, remarks } : issue,
      ),
    }));
  };

  const handleFileChange = async (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      if (fieldName === "hmlInvoiceCopy" || fieldName === "momWithCustomer") {
        if (file.type !== "application/pdf") {
          alert("Only PDF files are allowed for this field");
          e.target.value = "";
          return;
        }
      } else if (fieldName.includes("photo")) {
        if (!file.type.startsWith("image/")) {
          alert("Only image files are allowed for this field");
          e.target.value = "";
          return;
        }
      }

      const fileObject = {
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
      };

      setLocalFormData((prev) => ({
        ...prev,
        attachments: {
          ...prev.attachments,
          [fieldName]: fileObject,
        },
      }));
    }
  };

  const removeAttachment = (fieldName) => {
    setLocalFormData((prev) => ({
      ...prev,
      attachments: {
        ...prev.attachments,
        [fieldName]: null,
      },
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Existing validations (keeping all the original required field validations)
    if (!localFormData.complaintNo)
      newErrors.complaintNo = "Complaint number is required";
    if (!localFormData.complaintDate)
      newErrors.complaintDate = "Complaint date is required";
    if (!localFormData.productSerialNo)
      newErrors.productSerialNo = "Product serial number is required";
    if (!localFormData.selectRegion)
      newErrors.selectRegion = "Region selection is required";
    if (!localFormData.category) newErrors.category = "Category is required";
    if (!localFormData.model) newErrors.model = "Model is required";
    if (!localFormData.capacity) newErrors.capacity = "Capacity is required";
    if (!localFormData.hmlTgCodeNo)
      newErrors.hmlTgCodeNo = "IML FG Code No. is required";
    if (!localFormData.customerName)
      newErrors.customerName = "Customer name is required";
    if (!localFormData.presetGroup)
      newErrors.presetGroup = "Product Group is required";
    if (!localFormData.productType)
      newErrors.productType = "Product Type is required";
    if (!localFormData.lift) newErrors.lift = "Lift is required";
    if (!localFormData.hmlProductDescription)
      newErrors.hmlProductDescription = "IML Product Description is required";
    if (!localFormData.address) newErrors.address = "Address is required";
    if (!localFormData.hmlInvoiceNo)
      newErrors.hmlInvoiceNo = "IML Invoice No. is required";
    if (!localFormData.hmlInvoiceDate)
      newErrors.hmlInvoiceDate = "IML Invoice Date is required";
    if (!localFormData.dealerInvoiceNo)
      newErrors.dealerInvoiceNo = "Dealer's Invoice No. is required";
    if (!localFormData.dealerInvoiceDate)
      newErrors.dealerInvoiceDate = "Dealer's Invoice Date is required";
    if (!localFormData.productCommissionedOn)
      newErrors.productCommissionedOn = "Product Commissioned date is required";
    if (!localFormData.applicationOfEquipment)
      newErrors.applicationOfEquipment = "Application of Equipment is required";
    if (!localFormData.normalWeightLifted)
      newErrors.normalWeightLifted = "Normal Weight Lifted is required";
    if (!localFormData.problemReportedByName)
      newErrors.problemReportedByName = "Problem Reported By Name is required";
    if (!localFormData.designation)
      newErrors.designation = "Designation is required";
    if (!localFormData.breakDownOccurredOn)
      newErrors.breakDownOccurredOn = "Break Down Occurred date is required";
    if (!localFormData.dateOfProblemReported)
      newErrors.dateOfProblemReported = "Date of Problem Reported is required";
    if (!localFormData.abpEngineerDeputedOnSite)
      newErrors.abpEngineerDeputedOnSite = "ABP Engineer name is required";
    if (!localFormData.dateOfServicePersonDeputy)
      newErrors.dateOfServicePersonDeputy =
        "Service Person Deputy date is required";
    if (!localFormData.contactNo)
      newErrors.contactNo = "Contact number is required";
    if (!localFormData.hoursUsedPerShift)
      newErrors.hoursUsedPerShift = "Hours used per shift is required";

    if (
      !localFormData.selectedComplaintCategories ||
      localFormData.selectedComplaintCategories.length === 0
    ) {
      newErrors.selectedComplaintCategories =
        "Please select at least one complaint category";
    }

    // NEW DATE VALIDATION LOGIC - Add this section
    const validateDateOrder = (
      earlierDate,
      laterDate,
      earlierFieldName,
      laterFieldName,
      errorMessage,
    ) => {
      if (earlierDate && laterDate) {
        const earlier = new Date(earlierDate);
        const later = new Date(laterDate);

        if (later <= earlier) {
          newErrors[laterFieldName] = errorMessage;
        }
      }
    };

    // Rule 1: Dealer invoice date should be greater than invoice date
    validateDateOrder(
      localFormData.hmlInvoiceDate,
      localFormData.dealerInvoiceDate,
      "hmlInvoiceDate",
      "dealerInvoiceDate",
      "Dealer's Invoice Date must be after IML Invoice Date",
    );

    // Rule 2: Commissioned date should be greater than dealer invoice date
    validateDateOrder(
      localFormData.dealerInvoiceDate,
      localFormData.productCommissionedOn,
      "dealerInvoiceDate",
      "productCommissionedOn",
      "Product Commissioned Date must be after Dealer's Invoice Date",
    );

    // Rule 3: Break Down Occurred on date should be greater than invoice date
    validateDateOrder(
      localFormData.hmlInvoiceDate,
      localFormData.breakDownOccurredOn,
      "hmlInvoiceDate",
      "breakDownOccurredOn",
      "Break Down Date must be after IML Invoice Date",
    );

    // Rule 4: Date of Problem Reported should be greater than Break Down date
    validateDateOrder(
      localFormData.breakDownOccurredOn,
      localFormData.dateOfProblemReported,
      "breakDownOccurredOn",
      "dateOfProblemReported",
      "Problem Reported Date must be after Break Down Date",
    );

    // Rule 5: Date of which service person was deputed should be greater than Date of Problem Reported
    validateDateOrder(
      localFormData.dateOfProblemReported,
      localFormData.dateOfServicePersonDeputy,
      "dateOfProblemReported",
      "dateOfServicePersonDeputy",
      "Service Person Deputy Date must be after Problem Reported Date",
    );

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to format date for input min/max attributes
  const formatDateForInput = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  // Helper function to get minimum date for a field based on validation rules
  const getMinDate = (fieldName) => {
    switch (fieldName) {
      case "dealerInvoiceDate":
        // Rule 1: Dealer invoice date should be greater than invoice date
        return localFormData.hmlInvoiceDate
          ? formatDateForInput(
              new Date(
                new Date(localFormData.hmlInvoiceDate).getTime() +
                  24 * 60 * 60 * 1000,
              ),
            )
          : "";

      case "productCommissionedOn":
        // Rule 2: Commissioned date should be greater than dealer invoice date
        return localFormData.dealerInvoiceDate
          ? formatDateForInput(
              new Date(
                new Date(localFormData.dealerInvoiceDate).getTime() +
                  24 * 60 * 60 * 1000,
              ),
            )
          : "";

      case "breakDownOccurredOn":
        // Rule 3: Break Down Occurred on date should be greater than invoice date
        return localFormData.hmlInvoiceDate
          ? formatDateForInput(
              new Date(
                new Date(localFormData.hmlInvoiceDate).getTime() +
                  24 * 60 * 60 * 1000,
              ),
            )
          : "";

      case "dateOfProblemReported":
        // Rule 4: Date of Problem Reported should be greater than Break Down date
        return localFormData.breakDownOccurredOn
          ? formatDateForInput(
              new Date(
                new Date(localFormData.breakDownOccurredOn).getTime() +
                  24 * 60 * 60 * 1000,
              ),
            )
          : "";

      case "dateOfServicePersonDeputy":
        // Rule 5: Date of service person deputy should be greater than Date of Problem Reported
        return localFormData.dateOfProblemReported
          ? formatDateForInput(
              new Date(
                new Date(localFormData.dateOfProblemReported).getTime() +
                  24 * 60 * 60 * 1000,
              ),
            )
          : "";

      default:
        return "";
    }
  };

  const getInputClassName = (fieldName, additionalClasses = "") => {
    const baseClasses =
      "w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
    const errorClasses = errors[fieldName]
      ? "border-red-500 border-2 bg-red-50"
      : "border-gray-300";
    return `${baseClasses} ${errorClasses} ${additionalClasses}`.trim();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(localFormData);
    }
  };

  const renderSingleAttachmentSection = (
    fieldName,
    label,
    acceptedTypes = ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  ) => {
    const attachment = localFormData?.attachments?.[fieldName];

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        {!attachment ? (
          <div className="flex items-center justify-center w-full mb-2">
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-2 pb-2">
                <CloudUpload className="text-gray-400 w-5 h-5 mb-1" />
                <p className="text-xs text-gray-500 text-center px-2">
                  Click to upload single file
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept={acceptedTypes}
                onChange={(e) => handleFileChange(e, fieldName)}
              />
            </label>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm border">
            <div className="flex items-center flex-1 min-w-0">
              <FileIcon className="text-gray-400 w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{attachment.name}</span>
              {attachment.size && (
                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                  ({Math.round(attachment.size / 1024)} KB)
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeAttachment(fieldName)}
              className="text-red-500 hover:text-red-700 ml-2 p-1 hover:bg-red-50 rounded transition-colors"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderMultipleAttachmentSection = (
    baseFieldName,
    label,
    maxFiles = 3,
  ) => {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <div className="space-y-3">
          {Array.from({ length: maxFiles }, (_, index) => {
            const fieldName = `${baseFieldName}${index + 1}`;
            const attachment = localFormData?.attachments?.[fieldName];

            return (
              <div key={fieldName}>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  File {index + 1}
                </label>
                {!attachment ? (
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-1 pb-1">
                        <CloudUpload className="text-gray-400 w-4 h-4 mb-1" />
                        <p className="text-xs text-gray-500 text-center px-2">
                          Upload image file
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, fieldName)}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm border">
                    <div className="flex items-center flex-1 min-w-0">
                      <ImageIcon className="text-gray-400 w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{attachment.name}</span>
                      {attachment.size && (
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          ({Math.round(attachment.size / 1024)} KB)
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(fieldName)}
                      className="text-red-500 hover:text-red-700 ml-2 p-1 hover:bg-red-50 rounded transition-colors"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-full">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <ClipboardList className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Complaint Form
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Info className="mr-2 text-blue-600 w-5 h-5" />
              Basic Information
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complaint No. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="complaintNo"
                  value={localFormData?.complaintNo}
                  readOnly
                  className={getInputClassName(
                    "complaintNo",
                    "bg-gray-100 cursor-not-allowed",
                  )}
                  placeholder="Auto-generated"
                />
                {errors.complaintNo && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.complaintNo}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complaint Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="complaintDate"
                  value={localFormData.complaintDate}
                  readOnly
                  className={getInputClassName(
                    "complaintDate",
                    "bg-gray-100 cursor-not-allowed",
                  )}
                />
                {errors.complaintDate && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.complaintDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Serial No. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="productSerialNo"
                  value={localFormData.productSerialNo}
                  readOnly
                  className={getInputClassName(
                    "productSerialNo",
                    "bg-gray-100 cursor-not-allowed",
                  )}
                  placeholder="Auto-filled from request"
                />
                {errors.productSerialNo && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.productSerialNo}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Region <span className="text-red-500">*</span>
                </label>
                <select
                  name="selectRegion"
                  value={localFormData.selectRegion}
                  onChange={handleInputChange}
                  className={getInputClassName("selectRegion")}
                >
                  <option value="">Select Region</option>
                  {apiData.regions.map((region) => (
                    <option key={region.type_Id} value={region.type_Id}>
                      {region.type_Desc}
                    </option>
                  ))}
                </select>
                {errors.selectRegion && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.selectRegion}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="category"
                  value={localFormData.category}
                  readOnly
                  className={getInputClassName("category", "bg-gray-100")}
                  placeholder="Auto-filled from serial"
                />
                {errors.category && (
                  <p className="mt-1 text-xs text-red-600">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Group <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="presetGroup"
                  value={localFormData.presetGroup}
                  readOnly
                  className={getInputClassName("presetGroup", "bg-gray-100")}
                  placeholder="Auto-filled from serial"
                />
                {errors.presetGroup && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.presetGroup}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="model"
                  value={localFormData.model}
                  readOnly
                  className={getInputClassName("model", "bg-gray-100")}
                  placeholder="Auto-filled from serial"
                />
                {errors.model && (
                  <p className="mt-1 text-xs text-red-600">{errors.model}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="productType"
                  value={localFormData.productType}
                  readOnly
                  className={getInputClassName("productType", "bg-gray-100")}
                  placeholder="Auto-filled from serial"
                />
                {errors.productType && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.productType}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="capacity"
                  value={localFormData.capacity}
                  readOnly
                  className={getInputClassName("capacity", "bg-gray-100")}
                  placeholder="Auto-filled from serial"
                />
                {errors.capacity && (
                  <p className="mt-1 text-xs text-red-600">{errors.capacity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lift <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lift"
                  value={localFormData.lift}
                  readOnly
                  className={getInputClassName("lift", "bg-gray-100")}
                  placeholder="Auto-filled from serial"
                />
                {errors.lift && (
                  <p className="mt-1 text-xs text-red-600">{errors.lift}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IML FG Code No. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="hmlTgCodeNo"
                  value={localFormData.hmlTgCodeNo}
                  readOnly
                  className={getInputClassName("hmlTgCodeNo", "bg-gray-100")}
                  placeholder="Auto-filled from serial"
                />
                {errors.hmlTgCodeNo && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.hmlTgCodeNo}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HML Product Description{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="hmlProductDescription"
                  value={localFormData.hmlProductDescription}
                  readOnly
                  className={getInputClassName(
                    "hmlProductDescription",
                    "bg-gray-100",
                  )}
                  placeholder="Auto-filled from serial"
                />
                {errors.hmlProductDescription && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.hmlProductDescription}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={localFormData.customerName}
                  readOnly
                  className={getInputClassName("customerName", "bg-gray-100")}
                  placeholder="Auto-filled from serial"
                />
                {errors.customerName && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.customerName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={localFormData.address}
                  readOnly
                  rows={2}
                  className={getInputClassName(
                    "address",
                    "bg-gray-100 resize-none",
                  )}
                  placeholder="Auto-filled from serial"
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-red-600">{errors.address}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Invoice & Service Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="mr-2 text-blue-600 w-5 h-5" />
              Invoice & Service Information
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IML Invoice No. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="hmlInvoiceNo"
                  value={localFormData.hmlInvoiceNo}
                  readOnly
                  className={getInputClassName("hmlInvoiceNo", "bg-gray-100")}
                  placeholder="Auto-filled from serial"
                />
                {errors.hmlInvoiceNo && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.hmlInvoiceNo}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IML Invoice Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="hmlInvoiceDate"
                  value={localFormData.hmlInvoiceDate}
                  readOnly
                  className={getInputClassName("hmlInvoiceDate", "bg-gray-100")}
                />
                {errors.hmlInvoiceDate && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.hmlInvoiceDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dealer's Invoice No. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="dealerInvoiceNo"
                  value={localFormData.dealerInvoiceNo}
                  onChange={handleInputChange}
                  className={getInputClassName("dealerInvoiceNo")}
                  placeholder="Enter dealer's invoice number"
                />
                {errors.dealerInvoiceNo && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.dealerInvoiceNo}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dealer's Invoice Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dealerInvoiceDate"
                  value={localFormData.dealerInvoiceDate}
                  min={getMinDate("dealerInvoiceDate")}
                  onChange={handleInputChange}
                  className={getInputClassName("dealerInvoiceDate")}
                />
                {errors.dealerInvoiceDate && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.dealerInvoiceDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Commissioned on{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="productCommissionedOn"
                  value={localFormData.productCommissionedOn}
                  min={getMinDate("productCommissionedOn")}
                  onChange={handleInputChange}
                  className={getInputClassName("productCommissionedOn")}
                />
                {errors.productCommissionedOn && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.productCommissionedOn}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Who commissioned the product?
                </label>
                <select
                  name="whoCommissionedProduct"
                  value={localFormData.whoCommissionedProduct}
                  onChange={handleInputChange}
                  className={getInputClassName("whoCommissionedProduct")}
                >
                  <option value="">Select</option>
                  {apiData.whoCommissioned.map((item) => (
                    <option
                      key={item.commission_Id}
                      value={item.commission_Type}
                    >
                      {item.commission_Id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site Conditions (Primary)
                </label>
                <select
                  name="siteConditionPrimary"
                  value={localFormData.siteConditionPrimary}
                  onChange={handleInputChange}
                  className={getInputClassName("siteConditionPrimary")}
                >
                  <option value="">Select Primary Condition</option>
                  {apiData.siteConditionsPrimary.map((condition) => (
                    <option
                      key={condition.site_Condition_Value}
                      value={condition.site_Condition_Value}
                    >
                      {condition.site_Condition_Name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site Conditions (Secondary)
                </label>
                <select
                  name="siteConditionSecondary"
                  value={localFormData.siteConditionSecondary}
                  onChange={handleInputChange}
                  disabled={!localFormData.siteConditionPrimary}
                  className={getInputClassName(
                    "siteConditionSecondary",
                    localFormData.siteConditionPrimary
                      ? ""
                      : "bg-gray-100 cursor-not-allowed",
                  )}
                >
                  <option value="">Select Secondary Condition</option>
                  {apiData.siteConditionsSecondary.map((condition) => (
                    <option
                      key={condition.site_Condition_Value}
                      value={condition.site_Condition_Value}
                    >
                      {condition.site_Condition_Name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hours used per shift <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="hoursUsedPerShift"
                  value={localFormData.hoursUsedPerShift}
                  onChange={handleInputChange}
                  className={getInputClassName("hoursUsedPerShift")}
                  placeholder="Enter hours (e.g., 8)"
                  min="0"
                  max="24"
                />
                {errors.hoursUsedPerShift && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.hoursUsedPerShift}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type of load lifted
                </label>
                <select
                  name="typeOfLoadLifted"
                  value={localFormData.typeOfLoadLifted}
                  onChange={handleInputChange}
                  className={getInputClassName("typeOfLoadLifted")}
                >
                  <option value="">Select Type</option>
                  {apiData.typeOfLoadLifted.map((type) => (
                    <option
                      key={type.type_Load_Lift_Value}
                      value={type.type_Load_Lift_Value}
                    >
                      {type.type_Load_Lift_Name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application of Equipment{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="applicationOfEquipment"
                  value={localFormData.applicationOfEquipment}
                  onChange={handleInputChange}
                  rows={3}
                  className={getInputClassName(
                    "applicationOfEquipment",
                    "resize-none",
                  )}
                  placeholder="Describe how the equipment is being used..."
                />
                {errors.applicationOfEquipment && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.applicationOfEquipment}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Normal Weight Lifted <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="normalWeightLifted"
                  value={localFormData.normalWeightLifted}
                  onChange={handleInputChange}
                  className={getInputClassName("normalWeightLifted")}
                  placeholder="Enter typical weight capacity used"
                />
                {errors.normalWeightLifted && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.normalWeightLifted}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Details Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="mr-2 text-green-600 w-5 h-5" />
              Customer Details
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Problem Reported By Name{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="problemReportedByName"
                  value={localFormData.problemReportedByName}
                  onChange={handleInputChange}
                  className={getInputClassName("problemReportedByName")}
                  placeholder="Enter reporter name"
                />
                {errors.problemReportedByName && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.problemReportedByName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Break Down Occurred on <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="breakDownOccurredOn"
                  value={localFormData.breakDownOccurredOn}
                  min={getMinDate("breakDownOccurredOn")}
                  onChange={handleInputChange}
                  className={getInputClassName("breakDownOccurredOn")}
                />
                {errors.breakDownOccurredOn && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.breakDownOccurredOn}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Problem Reported{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfProblemReported"
                  value={localFormData.dateOfProblemReported}
                  min={getMinDate("dateOfProblemReported")}
                  onChange={handleInputChange}
                  className={getInputClassName("dateOfProblemReported")}
                />
                {errors.dateOfProblemReported && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.dateOfProblemReported}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="designation"
                  value={localFormData.designation}
                  onChange={handleInputChange}
                  className={getInputClassName("designation")}
                  placeholder="Enter designation"
                />
                {errors.designation && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.designation}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ABP Service Person Details Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <UserCog className="mr-2 text-purple-600 w-5 h-5" />
              ABP Service Person Details
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ABP Engineer deputed on site{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="abpEngineerDeputedOnSite"
                  value={localFormData.abpEngineerDeputedOnSite}
                  onChange={handleInputChange}
                  className={getInputClassName("abpEngineerDeputedOnSite")}
                  placeholder="Enter ABP engineer name"
                />
                {errors.abpEngineerDeputedOnSite && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.abpEngineerDeputedOnSite}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of which service person was deputed{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfServicePersonDeputy"
                  value={localFormData.dateOfServicePersonDeputy}
                  min={getMinDate("dateOfServicePersonDeputy")}
                  onChange={handleInputChange}
                  className={getInputClassName("dateOfServicePersonDeputy")}
                />
                {errors.dateOfServicePersonDeputy && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.dateOfServicePersonDeputy}
                  </p>
                )}
              </div>

              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Make of failed Part & Sr.no. on name plate of Part
                </label>
                <textarea
                  name="makeOfFailedPart"
                  value={localFormData.makeOfFailedPart}
                  onChange={handleInputChange}
                  rows={2}
                  className={getInputClassName(
                    "makeOfFailedPart",
                    "resize-none",
                  )}
                  placeholder="Enter part details with serial number (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact no. <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contactNo"
                  value={localFormData.contactNo}
                  onChange={handleInputChange}
                  className={getInputClassName("contactNo")}
                  placeholder="Enter contact number"
                />
                {errors.contactNo && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.contactNo}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Complaint Related To Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <ListChecks className="mr-2 text-orange-600 w-5 h-5" />
              Complaint Related to
            </h2>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Complaint Categories (At least one is required){" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-6">
                {apiData.complaintCategories.map((category) => (
                  <label
                    key={category.complaint_Category_Id}
                    className="flex items-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      name="selectedComplaintCategories"
                      value={category.complaint_Category_Name.toLowerCase()}
                      checked={
                        localFormData.selectedComplaintCategories?.includes(
                          category.complaint_Category_Name.toLowerCase(),
                        ) || false
                      }
                      onChange={handleInputChange}
                      className="mr-3 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 rounded"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {category.complaint_Category_Name}
                    </span>
                  </label>
                ))}
              </div>
              {errors.selectedComplaintCategories && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.selectedComplaintCategories}
                </p>
              )}
            </div>

            {localFormData.selectedComplaintCategories &&
              localFormData.selectedComplaintCategories.length > 0 && (
                <div className="mt-6">
                  <div className="mb-4">
                    <h3 className="text-md font-medium text-gray-900 flex items-center">
                      <ListChecks className="mr-2 text-blue-600 w-4 h-4" />
                      Complaint Issues Selection
                      <span className="ml-2 text-sm text-gray-600">
                        ({localFormData?.selectedComplaintIssues?.length || 0}{" "}
                        total selected)
                      </span>
                    </h3>
                  </div>

                  <div
                    className={`grid gap-6 ${
                      localFormData.selectedComplaintCategories.length === 1
                        ? "grid-cols-1"
                        : localFormData.selectedComplaintCategories.length === 2
                          ? "grid-cols-1 lg:grid-cols-2"
                          : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                    }`}
                  >
                    {localFormData.selectedComplaintCategories.map(
                      (selectedCategory) => {
                        const category = apiData.complaintCategories.find(
                          (cat) =>
                            cat.complaint_Category_Name.toLowerCase() ===
                            selectedCategory,
                        );
                        const issues = category
                          ? apiData.complaintIssues[
                              category.complaint_Category_Id
                            ]
                          : [];
                        const categoryDisplayName =
                          selectedCategory.charAt(0).toUpperCase() +
                          selectedCategory.slice(1);

                        return (
                          <div
                            key={selectedCategory}
                            className="border border-gray-200 rounded-lg overflow-hidden"
                          >
                            <div className="bg-blue-600 px-4 py-3">
                              <h4 className="text-sm font-semibold text-white flex items-center">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                                  {categoryDisplayName}
                                </span>
                                {category?.complaint_Category_Name ||
                                  categoryDisplayName}{" "}
                                Issues
                                {issues && (
                                  <span className="ml-2 text-xs text-blue-200">
                                    ({issues.length} items)
                                  </span>
                                )}
                              </h4>
                            </div>

                            <div className="overflow-x-auto bg-white">
                              {!issues || issues.length === 0 ? (
                                <div className="px-4 py-8 text-center text-gray-500">
                                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500 mr-2"></div>
                                  Loading {categoryDisplayName} issues...
                                </div>
                              ) : (
                                <table className="min-w-full">
                                  <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">
                                        Select
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Complaint Description
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {issues.map((issue) => {
                                      const isSelected =
                                        localFormData?.selectedComplaintIssues?.some(
                                          (selected) =>
                                            selected.complaint_Desc_Id ===
                                            issue.complaint_Desc_Id,
                                        );
                                      const selectedIssue =
                                        localFormData?.selectedComplaintIssues?.find(
                                          (selected) =>
                                            selected.complaint_Desc_Id ===
                                            issue.complaint_Desc_Id,
                                        );

                                      return (
                                        <tr
                                          key={issue.complaint_Desc_Id}
                                          className={`transition-colors hover:bg-blue-50 ${
                                            isSelected
                                              ? "bg-yellow-50 border-l-4 border-l-yellow-500"
                                              : "hover:bg-gray-50"
                                          }`}
                                        >
                                          <td className="px-3 py-3 text-center">
                                            <input
                                              type="checkbox"
                                              name={`complaintIssue_${issue.complaint_Desc_Id}`}
                                              checked={isSelected}
                                              onChange={handleInputChange}
                                              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 rounded"
                                            />
                                          </td>
                                          <td className="px-3 py-3">
                                            <div className="space-y-2">
                                              <span className="text-sm text-gray-900 font-medium block">
                                                {issue.complaint_Desc}
                                              </span>
                                              {isSelected && (
                                                <input
                                                  type="text"
                                                  placeholder="Enter remarks..."
                                                  value={
                                                    selectedIssue?.remarks || ""
                                                  }
                                                  onChange={(e) =>
                                                    handleComplaintIssueRemarksChange(
                                                      issue.complaint_Desc_Id,
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                                />
                                              )}
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              )}

            {localFormData?.selectedComplaintIssues?.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Selected Issues Summary (
                  {localFormData?.selectedComplaintIssues?.length} items):
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {localFormData?.selectedComplaintIssues.map(
                    (selectedIssue) => {
                      let categoryName = "";
                      let issueDesc = "";

                      for (const category of apiData.complaintCategories) {
                        const issues =
                          apiData.complaintIssues[
                            category.complaint_Category_Id
                          ] || [];
                        const issue = issues.find(
                          (i) =>
                            i.complaint_Desc_Id ===
                            selectedIssue.complaint_Desc_Id,
                        );
                        if (issue) {
                          categoryName = category.complaint_Category_Name;
                          issueDesc = issue.complaint_Desc;
                          break;
                        }
                      }

                      return (
                        <div
                          key={selectedIssue.complaint_Desc_Id}
                          className="text-sm p-2 bg-white rounded border"
                        >
                          <div className="font-medium text-blue-800">
                            <span className="text-xs bg-blue-100 px-2 py-1 rounded mr-2">
                              {categoryName}
                            </span>
                            {issueDesc}
                          </div>
                          {selectedIssue.remarks && (
                            <div className="text-blue-700 mt-1 text-xs">
                              Remarks: {selectedIssue.remarks}
                            </div>
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Attachments Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Paperclip className="mr-2 text-green-600 w-5 h-5" />
              Attachments
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Upload files as specified. PDF files for invoices/documents, image
              files for photographs.
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderSingleAttachmentSection(
                "hmlInvoiceCopy",
                "Attach IML Invoice copy (Only PDF files)",
                ".pdf",
              )}
              {renderSingleAttachmentSection(
                "momWithCustomer",
                "Attach MOM with customer / Service Investigation report after your site visit (Only PDF files)",
                ".pdf",
              )}
              {renderSingleAttachmentSection(
                "photoOfNameplate",
                "Photograph of Number plate for identification on equipment (Only IMAGE files)",
                "image/*",
              )}

              <div className="md:col-span-2 lg:col-span-1">
                {renderMultipleAttachmentSection(
                  "photoOfCompleteEquipment",
                  "Photograph of complete equipment (Only IMAGE files)",
                  3,
                )}
              </div>

              <div className="md:col-span-2 lg:col-span-1">
                {renderMultipleAttachmentSection(
                  "photoShowingFailedPart",
                  "Photograph showing failed part or where the problem is (Only IMAGE files)",
                  3,
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description of Complaint Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <MessageSquare className="mr-2 text-red-600 w-5 h-5" />
              Description of Complaint
            </h2>
          </div>
          <div className="p-6">
            <textarea
              name="useful_info"
              value={localFormData?.useful_info}
              onChange={handleInputChange}
              rows={5}
              className={getInputClassName("useful_info", "resize-none")}
              placeholder="Provide a detailed description of the complaint"
            />
            <div className="mt-2 text-xs text-gray-500">
              Character count: {localFormData?.useful_info?.length || 0}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="text-sm text-gray-600">
                <Info className="inline w-4 h-4 mr-1" />
                All fields marked with <span className="text-red-500">
                  *
                </span>{" "}
                are mandatory
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting Form...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 w-4 h-4" />
                      Submit Complaint Form
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ComplaintForm;
