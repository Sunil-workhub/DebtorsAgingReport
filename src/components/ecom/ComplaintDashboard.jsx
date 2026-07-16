import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  MessageCircle,
  Calendar,
  Clock,
  User,
  MapPin,
  FileText,
  Image as ImageIcon,
  X,
  Send,
  Paperclip,
  File,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Save,
  Settings,
  Camera,
  FileImage,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import Swal from "sweetalert2";
import ComplaintTrackerServices from "../../services/ecom/ComplaintTrackerService.js";
import DocumentGalleryModal from "./DocumentModal";
import ImmediateActionModal from "./ImmediateActionModal";
import RootCauseModal from "./RootCauseModal";
import { useNavigate } from "react-router-dom";

const user = JSON.parse(sessionStorage.getItem("user")) || {};
const created_By = user?.ama_Id || user?.rc_Id;
const dept_Id = user?.dept_id;

// Skeleton Row Component
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 17 }).map((_, index) => (
      <td key={index} className="px-3 py-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </td>
    ))}
  </tr>
);

const ChatModal = ({
  complaint,
  chatMessages,
  onClose,
  onSendMessage,
  onGetMessages,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [messages, setMessages] = useState(chatMessages || []);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Default departments with forum access
  const DEFAULT_AUTHORIZED_DEPTS = [11, 50];

  // Check if current user's department is authorized to send messages
  const isAuthorizedToSend = useMemo(() => {
    // Check if user's department has default access
    if (DEFAULT_AUTHORIZED_DEPTS.includes(dept_Id)) {
      return true;
    }

    // Check if user's department is in responsible departments
    if (
      !complaint?.responsible_Departments ||
      !Array.isArray(complaint.responsible_Departments)
    ) {
      return false;
    }

    return complaint.responsible_Departments.some(
      (dept) => dept.responsible_Dept_Id === dept_Id,
    );
  }, [complaint?.responsible_Departments, dept_Id]);

  useEffect(() => {
    loadMessages();
  }, [complaint.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const fetchedMessages = await onGetMessages(complaint.id);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey && isAuthorizedToSend) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e) => {
    if (!isAuthorizedToSend) return;

    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async () => {
    if (!isAuthorizedToSend) {
      Swal.fire({
        icon: "warning",
        title: "Unauthorized",
        text: "Your department is not authorized to send messages in this forum.",
        confirmButtonColor: "#EF4444",
      });
      return;
    }

    if (!newMessage.trim() && !selectedFile) return;

    setIsUploading(true);

    try {
      await onSendMessage(complaint.id, {
        message: newMessage.trim() || "",
        file: selectedFile || null,
      });

      setNewMessage("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to Send Message",
        text: "Please try again.",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <File size={16} />;
    const extension = fileName.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(extension)) {
      return <ImageIcon size={16} />;
    } else if (["pdf", "doc", "docx", "txt"].includes(extension)) {
      return <FileText size={16} />;
    } else {
      return <File size={16} />;
    }
  };

  // Get authorized department names for display
  const getAuthorizedDepartments = () => {
    const authorizedDepts = [];

    // Add responsible departments
    if (
      complaint?.responsible_Departments &&
      Array.isArray(complaint.responsible_Departments)
    ) {
      const responsibleDeptNames = complaint.responsible_Departments.map(
        (dept) => dept.responsible_Dept_Name,
      );
      authorizedDepts.push(...responsibleDeptNames);
    }

    // Add default departments (you can replace these names with actual dept names if needed)
    const defaultDeptNames = DEFAULT_AUTHORIZED_DEPTS.map((id) => {
      // You can create a mapping here if you have department names
      switch (id) {
        case 6:
          return "Admin"; // Replace with actual department name
        case 12:
          return "Support"; // Replace with actual department name
        default:
          return `Dept ${id}`;
      }
    });

    authorizedDepts.push(...defaultDeptNames);

    return authorizedDepts.length > 0
      ? [...new Set(authorizedDepts)].join(", ") // Remove duplicates
      : "Default access only";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl h-[75vh] flex flex-col">
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} />
            <div>
              <span className="font-semibold">Complaint Forum</span>
              <p className="text-sm text-blue-100">
                {complaint.complaintNo} - {complaint.customerName}
              </p>
              <p className="text-xs text-blue-200 mt-1">
                Authorized: {getAuthorizedDepartments()}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-blue-700 rounded">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages && messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message?.forum_Id}
                className={`flex ${
                  message.senderType === "internal"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.senderType === "internal"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-900 shadow border"
                  }`}
                >
                  {message?.message && (
                    <p className="text-sm mb-2 whitespace-pre-wrap">
                      {message.message}
                    </p>
                  )}

                  {message?.fileName && (
                    <div
                      className={`mt-2 p-2 rounded border ${
                        message.senderType === "internal"
                          ? "bg-blue-500 border-blue-400"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {getFileIcon(message.fileName)}
                        <span className="text-xs">{message.fileName}</span>
                      </div>
                    </div>
                  )}

                  <p
                    className={`text-xs mt-2 ${
                      message.senderType === "internal"
                        ? "text-blue-100"
                        : "text-gray-500"
                    }`}
                  >
                    {message.emp_Name} • {message.dept_Name} •{" "}
                    {formatTimestamp(message?.created_On)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Show unauthorized message if user cannot send messages */}
        {!isAuthorizedToSend && (
          <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200">
            <div className="flex items-center space-x-2">
              <AlertCircle size={16} className="text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Your department is not authorized to send messages in this
                forum.
              </p>
            </div>
          </div>
        )}

        {/* File preview - only show if authorized */}
        {selectedFile && isAuthorizedToSend && (
          <div className="px-4 py-2 bg-gray-100 border-t border-gray-200">
            <div className="flex items-center justify-between p-2 bg-white rounded border">
              <div className="flex items-center space-x-2">
                {getFileIcon(selectedFile.name)}
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round(selectedFile.size / 1024)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={removeSelectedFile}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Message input - only show if authorized */}
        <div className="p-4 border-t bg-white rounded-b-lg">
          {isAuthorizedToSend ? (
            <div className="flex gap-2">
              <div className="flex flex-col flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  disabled={isUploading}
                />
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                >
                  <Paperclip size={18} />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={
                    (!newMessage.trim() && !selectedFile) || isUploading
                  }
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">
                You are not authorized to send messages in this forum.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Contact your administrator if you believe this is an error.
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
          />
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const ComplaintDashboard = ({
  complaints,
  loading,
  error,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  pagination,
  onPageChange,
  onSearch,
  onUpdateComplaint,
  onUpdateRootComplaint,
  onRootCauseByUpdate,
  onSendForumMessage,
  onGetForumMessages,
  onRefresh,
  onExportData,
}) => {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showImmediateActionModal, setShowImmediateActionModal] =
    useState(false);
  const [showRootCauseModal, setShowRootCauseModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const navigate = useNavigate();

  const [responsibilityOptions, setDepartments] = useState([]);
  const [updatingComplaintId, setUpdatingComplaintId] = useState(null);

  // Memoize pagination calculations to prevent unnecessary re-renders
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(pagination.totalRows / pagination.pageSize);
    const currentPage = Math.floor(pagination.offset / pagination.pageSize) + 1;
    const startRecord = pagination.offset + 1;
    const endRecord = Math.min(
      pagination.offset + pagination.pageSize,
      pagination.totalRows,
    );

    return { totalPages, currentPage, startRecord, endRecord };
  }, [pagination.totalRows, pagination.pageSize, pagination.offset]);

  const handlePageChange = (newPage) => {
    const newOffset = (newPage - 1) * pagination.pageSize;
    onPageChange(newOffset);
  };

  const handlePageSizeChange = (newPageSize) => {
    onPageChange(0, newPageSize);
  };

  const calculateAgingDays = (startDate, endDate = null) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleOpenImmediateAction = (complaint) => {
    setSelectedComplaint(complaint);
    setShowImmediateActionModal(true);
  };

  const handleOpenRootCause = (complaint) => {
    setSelectedComplaint(complaint);
    setShowRootCauseModal(true);
  };

  const handleOpenForum = (complaint) => {
    setSelectedComplaint(complaint);
    setShowChatModal(true);
  };

  const handleOpenDocuments = (complaint) => {
    setSelectedComplaint(complaint);
    setShowDocumentModal(true);
  };

  const handleUpdateComplaint = async (complaintId, updateData) => {
    setIsUpdating(true);
    try {
      const result = await onUpdateComplaint(complaintId, updateData);
      return result;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateRootComplaint = async (updateData) => {
    setIsUpdating(true);
    try {
      const result = await onUpdateRootComplaint(updateData);
      return result;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRootCauseByChange = async (complaint, newRootCauseBy) => {
    const immediateActionCompleted =
      complaint.immediateCorrectiveAction?.immediateCorrection;
    const rootCauseRequired =
      complaint.immediateCorrectiveAction?.rootCauseAnalysisRequired;
    const rootCauseCompleted = complaint.rootCauseAnalysis?.rootCauseAnalysis;
    const alreadyAssigned = complaint.complaintRootCauseBy;

    if (alreadyAssigned) {
      Swal.fire({
        icon: "warning",
        title: "Cannot Change",
        text: "Root cause responsibility has already been assigned and cannot be changed.",
      });
      return;
    }

    if (!immediateActionCompleted) {
      Swal.fire({
        icon: "warning",
        title: "Immediate Action Required",
        text: "Please complete the immediate action before assigning root cause responsibility.",
      });
      return;
    }

    if (rootCauseRequired && !rootCauseCompleted) {
      Swal.fire({
        icon: "warning",
        title: "Root Cause Analysis Required",
        text: "Please complete the root cause analysis before assigning responsibility.",
      });
      return;
    }

    try {
      setUpdatingComplaintId(complaint.id);
      await onRootCauseByUpdate(complaint.id, newRootCauseBy);
    } catch (error) {
      console.error("Error updating root cause by:", error);
    } finally {
      setUpdatingComplaintId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "G":
        return "bg-green-500";
      case "Y":
        return "bg-yellow-500";
      case "R":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getAgingColor = (days) => {
    if (days <= 3) return "text-green-600";
    if (days <= 7) return "text-yellow-600";
    return "text-red-600";
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Complaint Tracker Dashboard
          </h1>
        </div>
        <div className="flex items-center justify-center min-h-64 bg-white rounded-lg border border-gray-200">
          <div className="text-center">
            <XCircle size={48} className="mx-auto text-red-500 mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Complaint Tracker Dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Monitor and track all complaint statuses and corrective actions
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              onClick={() => navigate("/ComplaintRequest")}
              className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              title="Go to Complaint Requests"
            >
              <ClipboardList size={16} className="mr-2" />
              Complaint Requests
            </button>

            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh Data"
            >
              <RefreshCw
                size={16}
                className={`mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 md:justify-between items-start md:items-center">
          <div className="flex gap-2 items-center">
            <div className="relative min-w-[250px]">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/4 text-gray-400 pointer-events-none"
                size={18}
              />
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && onSearch()}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <button
              onClick={onSearch}
              disabled={loading}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search size={16} className="mr-1" />
              Search
            </button>
          </div>

          <div className="flex gap-2 items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              disabled={loading}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">All Status</option>
              <option value="R">Not yet started</option>
              <option value="Y">In Process</option>
              <option value="G">Completed</option>
            </select>

            <select
              value={pagination.pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              disabled={loading}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value={10}>10/page</option>
              <option value={25}>25/page</option>
              <option value={50}>50/page</option>
              <option value={100}>100/page</option>
            </select>

            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setDateFilter("");
              }}
              disabled={loading}
              className="px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center text-sm font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Filter size={16} className="mr-1" />
              Clear
            </button>
          </div>
        </div>
      </div>

      <div
        className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col"
        style={{ height: "calc(100vh - 350px)", minHeight: "500px" }}
      >
        <div className="overflow-auto flex-1">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sr. No
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Complaint No
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Name
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-72 truncate">
                  Location
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Serial No
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice No
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Code
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Description
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nature of Complaint Updated By Service
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Forum
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Immediate Action
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Root Cause Analysis
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Complaint Root Cause By
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Complaint Aging
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                // Show skeleton rows while loading
                Array.from({ length: pagination.pageSize }).map((_, index) => (
                  <SkeletonRow key={`skeleton-${index}`} />
                ))
              ) : complaints.length === 0 ? (
                // Empty state shown within table structure
                <tr>
                  <td colSpan="17" className="px-3 py-12">
                    <div className="text-center">
                      <FileText
                        size={48}
                        className="mx-auto text-gray-300 mb-4"
                      />
                      <p className="text-gray-500 mb-2">No complaints found</p>
                      <p className="text-sm text-gray-400">
                        {searchTerm || statusFilter !== "" || dateFilter
                          ? "Try adjusting your filters"
                          : "Complaints will appear here once they are submitted"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                // Actual data rows
                complaints.map((complaint, index) => {
                  const autoStatus = complaint?.status;

                  return (
                    <tr key={complaint.id} className="hover:bg-gray-50">
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pagination.offset + index + 1}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {complaint.complaintDate}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {complaint.complaintNo}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {complaint.customerName}
                      </td>
                      <td
                        className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 max-w-72 truncate"
                        title={complaint.location}
                      >
                        {complaint.location}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {complaint.Serial_No}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {complaint.invoiceNo}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {complaint.itemCode}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {complaint.itemDescription}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {complaint.natureOfComplaint}
                      </td>
                      <td className="px-3 py-4 text-center">
                        <button
                          onClick={() => handleOpenDocuments(complaint)}
                          className="inline-flex items-center px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                        >
                          <FileImage size={14} className="mr-1" />
                          View
                        </button>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <button
                          onClick={() => handleOpenForum(complaint)}
                          className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          <MessageCircle size={14} className="mr-1" />
                          Forum
                        </button>
                      </td>
                      <td className="px-3 py-4 text-center">
                        {(() => {
                          const immediateCorrection =
                            complaint.immediateCorrectiveAction
                              ?.immediateCorrection;
                          const immediateCorrectionCompleted =
                            complaint.immediateCorrectiveAction
                              ?.immediateCorrectionCompleted;
                          const isInProgress =
                            immediateCorrection &&
                            !immediateCorrectionCompleted;
                          const isCompleted =
                            immediateCorrection && immediateCorrectionCompleted;

                          // Everyone can view, but only authorized departments can add
                          const hasActionAccess =
                            [11].includes(dept_Id) ||
                            complaint?.responsible_Departments?.some(
                              (dept) => dept.responsible_Dept_Id === dept_Id,
                            );

                          const buttonText =
                            isCompleted || isInProgress
                              ? "View"
                              : hasActionAccess
                                ? "Add"
                                : "View";

                          return (
                            <div className="flex flex-col items-center space-y-1">
                              <button
                                onClick={() =>
                                  handleOpenImmediateAction(complaint)
                                }
                                className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium relative ${
                                  isCompleted
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                    : isInProgress
                                      ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                                      : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle size={16} className="mr-2" />
                                ) : isInProgress ? (
                                  <Clock size={16} className="mr-2" />
                                ) : hasActionAccess ? (
                                  <Plus size={16} className="mr-2" />
                                ) : (
                                  <Eye size={16} className="mr-2" />
                                )}
                                <span>{buttonText}</span>
                                {isInProgress && (
                                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500"></div>
                                )}
                              </button>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-3 py-4 text-center">
                        {complaint.immediateCorrectiveAction
                          ?.rootCauseAnalysisRequired ? (
                          (() => {
                            const rootCauseAnalysis =
                              complaint.rootCauseAnalysis?.rootCauseAnalysis;
                            const rootCauseCompleted =
                              complaint.rootCauseAnalysis?.rootCauseCompleted;
                            const isInProgress =
                              rootCauseAnalysis && !rootCauseCompleted;
                            const isCompleted =
                              rootCauseAnalysis && rootCauseCompleted;

                            // Everyone can view, but only authorized departments can add
                            const hasActionAccess =
                              [11].includes(dept_Id) ||
                              complaint?.responsible_Departments?.some(
                                (dept) => dept.responsible_Dept_Id === dept_Id,
                              );

                            const buttonText =
                              isCompleted || isInProgress
                                ? "View"
                                : hasActionAccess
                                  ? "Add"
                                  : "View";

                            return (
                              <div className="flex flex-col items-center space-y-1">
                                <button
                                  onClick={() => handleOpenRootCause(complaint)}
                                  className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium relative ${
                                    isCompleted
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                      : isInProgress
                                        ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                                        : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                                  }`}
                                >
                                  {isCompleted ? (
                                    <CheckCircle size={16} className="mr-2" />
                                  ) : isInProgress ? (
                                    <Clock size={16} className="mr-2" />
                                  ) : hasActionAccess ? (
                                    <Plus size={16} className="mr-2" />
                                  ) : (
                                    <Eye size={16} className="mr-2" />
                                  )}
                                  <span>{buttonText}</span>
                                  {isInProgress && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500"></div>
                                  )}
                                </button>
                                {complaint.rootCauseAnalysis?.targetDate && (
                                  <div className="text-xs text-gray-500 mt-1 flex items-center justify-center">
                                    <Calendar size={10} className="mr-1" />
                                    {Math.ceil(
                                      Math.abs(
                                        new Date() -
                                          new Date(
                                            complaint.rootCauseAnalysis
                                              .targetDate,
                                          ),
                                      ) /
                                        (1000 * 60 * 60 * 24),
                                    )}{" "}
                                    days
                                  </div>
                                )}
                              </div>
                            );
                          })()
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                      <td className="px-3 py-4">
                        {complaint.complaintRootCauseBy ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              {complaint.complaintRootCauseByName ||
                                complaint.complaintRootCauseBy}
                            </span>
                          </div>
                        ) : (
                          complaint?.immediateCorrectiveAction
                            ?.immediateCorrectionCompleted &&
                          complaint?.rootCauseAnalysis?.rootCauseCompleted &&
                          [11].includes(dept_Id) && (
                            <div className="flex items-center gap-2">
                              <select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    const selectedDept =
                                      responsibilityOptions.find(
                                        (opt) =>
                                          opt.dept_Id.toString() ===
                                          e.target.value,
                                      );
                                    if (selectedDept) {
                                      handleRootCauseByChange(
                                        complaint,
                                        selectedDept.dept_Id,
                                      );
                                    }
                                  }
                                }}
                                className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 bg-white min-w-[100px]"
                                disabled={updatingComplaintId === complaint.id}
                              >
                                <option value="">Assign...</option>
                                {responsibilityOptions?.map((option) => (
                                  <option
                                    key={option?.dept_Id}
                                    value={option?.dept_Id}
                                  >
                                    {option?.dept_Name}
                                  </option>
                                ))}
                              </select>
                              {updatingComplaintId === complaint.id && (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                              )}
                            </div>
                          )
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <div className="space-y-1">
                          <div
                            className={`text-sm font-medium ${getAgingColor(
                              complaint.complaintAging,
                            )} flex items-center`}
                          >
                            <Clock size={14} className="mr-1" />
                            {complaint.complaintAging} days
                          </div>

                          {complaint.complaintRootCauseByUpdateDate && (
                            <div className="text-sm font-medium text-green-600 flex items-center">
                              <CheckCircle2 size={14} className="mr-1" />
                              {calculateAgingDays(
                                complaint.rawComplaintDate,
                                complaint.complaintRootCauseByUpdateDate,
                              )}{" "}
                              days
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-center sticky right-0 bg-white">
                        <div className="flex items-center justify-center">
                          <div
                            className={`w-4 h-4 rounded-full ${getStatusColor(
                              autoStatus,
                            )}`}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && complaints.length > 0 && (
          <div className="border-t border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(paginationData.currentPage - 1)}
                disabled={paginationData.currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(paginationData.currentPage + 1)}
                disabled={
                  paginationData.currentPage === paginationData.totalPages
                }
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {paginationData.startRecord}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {paginationData.endRecord}
                  </span>{" "}
                  of <span className="font-medium">{pagination.totalRows}</span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() =>
                      handlePageChange(paginationData.currentPage - 1)
                    }
                    disabled={paginationData.currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {Array.from(
                    { length: Math.min(5, paginationData.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (paginationData.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (paginationData.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (
                        paginationData.currentPage >=
                        paginationData.totalPages - 2
                      ) {
                        pageNum = paginationData.totalPages - 4 + i;
                      } else {
                        pageNum = paginationData.currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            paginationData.currentPage === pageNum
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    },
                  )}

                  <button
                    onClick={() =>
                      handlePageChange(paginationData.currentPage + 1)
                    }
                    disabled={
                      paginationData.currentPage === paginationData.totalPages
                    }
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={20} />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {showImmediateActionModal && selectedComplaint && (
        <ImmediateActionModal
          complaint={selectedComplaint}
          onClose={() => {
            setShowImmediateActionModal(false);
            setSelectedComplaint(null);
          }}
          onUpdate={handleUpdateComplaint}
          onRefresh={onRefresh}
          isUpdating={isUpdating}
        />
      )}

      {showRootCauseModal && selectedComplaint && (
        <RootCauseModal
          complaint={selectedComplaint}
          onClose={() => {
            setShowRootCauseModal(false);
            setSelectedComplaint(null);
          }}
          onUpdate={handleUpdateRootComplaint}
          onRefresh={onRefresh}
          isUpdating={isUpdating}
        />
      )}

      {showChatModal && selectedComplaint && (
        <ChatModal
          complaint={selectedComplaint}
          chatMessages={[]}
          onClose={() => {
            setShowChatModal(false);
            setSelectedComplaint(null);
          }}
          onSendMessage={onSendForumMessage}
          onGetMessages={onGetForumMessages}
        />
      )}

      {showDocumentModal && selectedComplaint && (
        <DocumentGalleryModal
          complaint={selectedComplaint}
          onClose={() => {
            setShowDocumentModal(false);
            setSelectedComplaint(null);
          }}
        />
      )}
    </div>
  );
};

export default ComplaintDashboard;
