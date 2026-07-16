import APIHelper from "../../context/ApiHelper";
import API from "../../constants/API";
import { Download } from "lucide-react";
import { data } from "react-router-dom";

const ComplaintTrackerServices = {
  GetCompDashData: async (
    searchTerm = null,
    offset,
    pagesize,
    status = null,
  ) => {
    try {
      const response = await APIHelper(
        "POST",
        API.ComplaintTracker.DashboardData,
        {
          searchTerm: searchTerm,
          offset: offset,
          pageSize: pagesize,
          active: true,
          status: status,
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching complaint dashboard data:", error);
      throw error;
    }
  },

  //   Complaint dashboard data
  //   "data": [
  //     {
  //       "complaint_Id": 5075,
  //       "complaint_Date": "2025-05-10T00:00:00",
  //       "purchased_From": "2",
  //       "region": "391",
  //       "cust_Name": "PANDURANG ELECTRICALS",
  //       "cust_Address": "Ahmednagar",
  //       "prod_Serial_No": "K2425027285",
  //       "prod_Type": "WITH ELECTRIC TROLLEY",
  //       "capacity": "5 T",
  //       "lift": "5 MTRS",
  //       "date_Commissioned": null,
  //       "who_Commissioned": "1",
  //       "inv_No": "KL24-/6076",
  //       "inv_Date": "2025-03-27T00:00:00",
  //       "dealer_Inv_No": "",
  //       "dealer_Inv_Date": null,
  //       "app_Equipment": "",
  //       "condition_1": "I",
  //       "condition_2": "1",
  //       "condition_Others": "",
  //       "hrs_Used": "",
  //       "weight_Lifted": "",
  //       "type_Of_Load": "1",
  //       "reported_By": "",
  //       "designation": "",
  //       "date_Reported": null,
  //       "breakdown_Date": null,
  //       "contact_Person": ".",
  //       "contact_No": ".",
  //       "date_Deputed": "2025-05-08T00:00:00",
  //       "tp_Sr_No_Make": "",
  //       "prod_Code": "074050405",
  //       "prod_Desc": "CHAIN ELECTRIC HOIST, CH-III, 5 MTRS, 5T,BOGGIE ET, 17MPM, CTLS & EMM ON/OFF WITH MC, STD CT BRAKE, 2 FALL, WITH CHAIN",
  //       "in_Waranty": null,
  //       "complaint_No": "C0025/39052/25-26",
  //       "complaint_Nature": null,
  //       "useful_Info": "while Commissioning found down limit switch not functioning although condition is good. secondly trolley support patti is absent.",
  //       "created_By": 607,
  //       "created_By_Name": null,
  //       "created_On": "2025-05-10T12:40:43.163",
  //       "modified_By": null,
  //       "modified_By_Name": null,
  //       "modified_On": null,
  //       "inv_Filename": "xdo1_2.pdf",
  //       "inv_ContentType": "application/pdf",
  //       "visit_Filename": "xdo1_2.pdf",
  //       "visit_ContentType": "application/pdf",
  //       "complaint_Status": null,
  //       "category": "ELECTRIC CHAIN HOIST",
  //       "prod_Grp": "INDEF - CHIII",
  //       "model": "ELECTRON",
  //       "review_Remarks": null,
  //       "review_Date": null,
  //       "chargeable_Remarks": null,
  //       "chargeable_Status": null,
  //       "chargeable_Date": null,
  //       "claim_Remarks": null,
  //       "claim_Status": null,
  //       "claim_Date": null,
  //       "damage_Remarks": null,
  //       "damage_Status": null,
  //       "damage_Rcpt_Date": null,
  //       "analysis_Remarks": null,
  //       "analysis_Status": null,
  //       "analysis_Rcpt_Date": null,
  //       "analysis_Chargeable": null,
  //       "expl_Desc_1": "",
  //       "expl_Desc_2": "",
  //       "expl_Desc_3": "",
  //       "expl_Desc_4": "",
  //       "expl_Desc_5": "",
  //       "expl_Desc_6": "",
  //       "cl_Status": "Open",
  //       "cl_Close_Date": null,
  //       "cl_Close_Remarks": null,
  //       "ordeR_NUMBER": null,
  //       "ordereD_DATE": null,
  //       "invoicE_NUMBER": null,
  //       "invoicE_DATE": null,
  //       "c_Type": "pre",
  //       "qr_Code": "",
  //       "custome_Name": null,
  //       "c_Contact_Person": null,
  //       "c_Contact_No": null,
  //       "contact_Email": null,
  //       "has_Invoice_Document": true,
  //       "has_Visit_Document": true,
  //       "has_Photos": true,
  //       "totalRows": 2069,
  //       "trail_Items": [
  //         {
  //           "complaint_Trl_Id": 22161,
  //           "complaint_Id": 5075,
  //           "complaint_Desc_Id": 27,
  //           "remarks": "Down limit switch not working",
  //           "created_By": 607,
  //           "trail_Created_by_Name": null,
  //           "created_On": "2025-05-10T12:40:43.173",
  //           "modified_By": null,
  //           "trail_Modified_by_Name": null,
  //           "modified_On": null
  //         },
  //         {
  //           "complaint_Trl_Id": 22160,
  //           "complaint_Id": 5075,
  //           "complaint_Desc_Id": 10,
  //           "remarks": "",
  //           "created_By": 607,
  //           "trail_Created_by_Name": null,
  //           "created_On": "2025-05-10T12:40:43.17",
  //           "modified_By": null,
  //           "trail_Modified_by_Name": null,
  //           "modified_On": null
  //         },
  //         {
  //           "complaint_Trl_Id": 22159,
  //           "complaint_Id": 5075,
  //           "complaint_Desc_Id": 9,
  //           "remarks": "",
  //           "created_By": 607,
  //           "trail_Created_by_Name": null,
  //           "created_On": "2025-05-10T12:40:43.17",
  //           "modified_By": null,
  //           "trail_Modified_by_Name": null,
  //           "modified_On": null
  //         },
  //         {
  //           "complaint_Trl_Id": 22158,
  //           "complaint_Id": 5075,
  //           "complaint_Desc_Id": 8,
  //           "remarks": "",
  //           "created_By": 607,
  //           "trail_Created_by_Name": null,
  //           "created_On": "2025-05-10T12:40:43.17",
  //           "modified_By": null,
  //           "trail_Modified_by_Name": null,
  //           "modified_On": null
  //         },
  //         {
  //           "complaint_Trl_Id": 22157,
  //           "complaint_Id": 5075,
  //           "complaint_Desc_Id": 7,
  //           "remarks": "",
  //           "created_By": 607,
  //           "trail_Created_by_Name": null,
  //           "created_On": "2025-05-10T12:40:43.167",
  //           "modified_By": null,
  //           "trail_Modified_by_Name": null,
  //           "modified_On": null
  //         },
  //         {
  //           "complaint_Trl_Id": 22156,
  //           "complaint_Id": 5075,
  //           "complaint_Desc_Id": 6,
  //           "remarks": "",
  //           "created_By": 607,
  //           "trail_Created_by_Name": null,
  //           "created_On": "2025-05-10T12:40:43.167",
  //           "modified_By": null,
  //           "trail_Modified_by_Name": null,
  //           "modified_On": null
  //         },
  //         {
  //           "complaint_Trl_Id": 22155,
  //           "complaint_Id": 5075,
  //           "complaint_Desc_Id": 5,
  //           "remarks": "",
  //           "created_By": 607,
  //           "trail_Created_by_Name": null,
  //           "created_On": "2025-05-10T12:40:43.167",
  //           "modified_By": null,
  //           "trail_Modified_by_Name": null,
  //           "modified_On": null
  //         },
  //         {
  //           "complaint_Trl_Id": 22154,
  //           "complaint_Id": 5075,
  //           "complaint_Desc_Id": 4,
  //           "remarks": "",
  //           "created_By": 607,
  //           "trail_Created_by_Name": null,
  //           "created_On": "2025-05-10T12:40:43.167",
  //           "modified_By": null,
  //           "trail_Modified_by_Name": null,
  //           "modified_On": null
  //         },
  //         {
  //           "complaint_Trl_Id": 22153,
  //           "complaint_Id": 5075,
  //           "complaint_Desc_Id": 3,
  //           "remarks": "",
  //           "created_By": 607,
  //           "trail_Created_by_Name": null,
  //           "created_On": "2025-05-10T12:40:43.163",
  //           "modified_By": null,
  //           "trail_Modified_by_Name": null,
  //           "modified_On": null
  //         }
  //       ]
  //     },

  getDocById: async (complaint_Id) => {
    try {
      const response = await APIHelper(
        "POST",
        API.ComplaintTracker.GetDocumentById,
        {
          complaint_Id: complaint_Id,
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching document by ID:", error);
      throw error;
    }
  },

  //   sample doc by id data
  //   "data": {
  //     "invoice_Document_Data": "Jo=",
  //     "visit_Document_Data": "JVBERi0xLjQKJcfs...",
  //     "equipment_Photo_1": "/9f/Z",
  //     "equipment_Photo_2": null,
  //     "equipment_Photo_3": null,
  //     "failed_Part_Photo_1": "/9j/4",
  //      "failed_Part_Photo_2": null,
  //     "failed_Part_Photo_3": null,
  //     "number_Plate_Photo": "/9j/4AAQS"
  //   }

  CreateComplaintForum: async (formData) => {
    try {
      const response = await APIHelper(
        "POST",
        API.ComplaintTracker.CreateComplaintForum,
        formData,
      );
      return response;
    } catch (error) {
      console.error("Error creating complaint forum message:", error);
      throw error;
    }
  },

  //   complaint form parameters required

  //   Complaint_Id
  // Emp_Id
  // Dept_Id
  // Message
  // ForumFile

  GetComplaintForumMessages: async (complaintId) => {
    try {
      const response = await APIHelper(
        "POST",
        API.ComplaintTracker.GetComplaintForumMessages,
        {
          complaint_Id: complaintId,
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching complaint forum messages:", error);
      throw error;
    }
  },

  //   sample complaint forum msg
  //   data: [
  //     {Complaint_Id: 5075, Emp_Id: 607, Dept_Id: 3, Message: "Test message", Forum_File_Type:"", Forum_File_Path: "", Forum_File_Name: "", Created_On: "2025-05-10T13:00:00" },
  //   ]

  CreateComplaintImmediateAction: async (jsonData) => {
    try {
      const response = await APIHelper(
        "POST",
        API.ComplaintTracker.CreateComplaintImmediateAction,
        jsonData,
      );
      return response;
    } catch (error) {
      console.error("Error creating immediate action:", error);
      throw error;
    }
  },

  //   json data required
  //   {
  //   "complaint_Id": 0,
  //   "immediate_Correction": "string",
  //   "root_Cause_Analysis": true,
  //   "created_by": 0,
  //   "action_Items": [
  //     {
  //       "dept_Id": 0,
  //       "target_Date": "2025-09-25T08:57:54.113Z",
  //       "created_by": 0
  //     }
  //   ]
  // }

  GetComplaintImmediateAction: async (complaintId) => {
    try {
      const response = await APIHelper(
        "POST",
        API.ComplaintTracker.GetComplaintImmediateAction,
        { complaint_Id: complaintId },
      );
      return response;
    } catch (error) {
      console.error("Error fetching immediate actions:", error);
      throw error;
    }
  },

  GetComplaintDepartments: async () => {
    try {
      const response = await APIHelper(
        "POST",
        API.ComplaintTracker.GetComplaintDepartments,
      );
      return response;
    } catch (error) {
      console.error("Error fetching complaint departments:", error);
      throw error;
    }
  },

  //   sample data
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "Departments fetched successfully.",
  //   "data": [
  //     {
  //       "dept_Id": 62,
  //       "dept_Name": "Design"
  //     },
  //     {
  //       "dept_Id": 7,
  //       "dept_Name": "IT"
  //     },
  //     {
  //       "dept_Id": 73,
  //       "dept_Name": "Planning"
  //     },
  //     {
  //       "dept_Id": 13,
  //       "dept_Name": "SCM"
  //     },
  //     {
  //       "dept_Id": 6,
  //       "dept_Name": "Service"
  //     }
  //   ]
  // }

  UpdateComplaintActualCompletionDate: async (jsonData) => {
    try {
      const response = await APIHelper(
        "POST",
        API.ComplaintTracker.UpdateComplaintActualCompletionDate,
        jsonData,
      );
      return response;
    } catch (error) {
      console.error("Error updating actual completion date:", error);
      throw error;
    }
  },

  //json data required
  //   {
  //   "immediate_Trl_Id": 0,
  //   "actual_Completion_Date": "2025-09-25T09:04:37.016Z",
  //   "modified_by": 0
  // }

  CreateComplaintRootAction: async (jsonData) => {
    try {
      const response = await APIHelper(
        "POST",
        API.ComplaintTracker.CreateComplaintRootAction,
        jsonData,
      );
      return response;
    } catch (error) {
      console.error("Error creating immediate action:", error);
      throw error;
    }
  },
  GetComplaintRootAction: async (complaintId) => {
    try {
      const response = await APIHelper(
        "POST",
        API.ComplaintTracker.GetComplaintRootAction,
        { complaint_Id: complaintId },
      );
      return response;
    } catch (error) {
      console.error("Error fetching immediate actions:", error);
      throw error;
    }
  },
  UpdateComplaintRootCompletionDate: async (jsonData) => {
    try {
      const response = await APIHelper(
        "POST",
        API.ComplaintTracker.UpdateComplaintRootCompletionDate,
        jsonData,
      );
      return response;
    } catch (error) {
      console.error("Error updating actual completion date:", error);
      throw error;
    }
  },

  UpdateComplaintRootCauseBy: async (jsonData) => {
    try {
      const response = await APIHelper(
        "POST",
        API.ComplaintTracker.UpdateComplaintRootCauseBy,
        jsonData,
      );
      return response;
    } catch (error) {
      console.error("Error updating actual completion date:", error);
      throw error;
    }
  },

  UpdateRootCauseAnalysisRequired: async (jsonData) => {
    try {
      const response = await APIHelper(
        "POST",
        API.ComplaintTracker.UpdateRootCauseAnalysisRequired,
        jsonData,
      );
      return response;
    } catch (error) {
      console.error("Error updating actual completion date:", error);
      throw error;
    }
  },

  DownloadFile: async (filePath) => {
    try {
      // Use the updated APIHelper with blob responseType for binary content
      const response = await APIHelper(
        "POST",
        API.FileDownload.DownloadFile,
        {
          filePath: filePath,
        },
        {
          responseType: "blob", // This tells axios to expect binary data
        },
      );

      return response; // This will be a Blob object
    } catch (error) {
      console.error("Error downloading file:", error);
      throw error;
    }
  },
};

export default ComplaintTrackerServices;
