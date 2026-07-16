// src/services/itHelpdesk/ITHelpdeskService.js
import APIHelper from "../../context/ApiHelper";
import API from "../../constants/API";

const ITHelpdeskService = {
  getTickets: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.ITHelpdesk.getTickets,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error fetching tickets:", error);
      throw error;
    }
  },

  //   response
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "Found 1 ticket(s).",
  //   "data": [
  //     {
  //       "ticket_Id": 1,
  //       "ticket_No": "HD-20260429-000001",
  //       "dept": "IT",
  //       "ticket_Type": "new",
  //       "req_Type": "Service Request",
  //       "category": "software",
  //       "project_Module": "",
  //       "impact": "user",
  //       "description": "testing",
  //       "org": "IML",
  //       "submitted_By": 1403,
  //       "submitted_By_Name": "Pranay Mahadik",
  //       "submitted_At": "2026-04-29T11:10:39.35",
  //       "priority": "Medium",
  //       "status": "Waiting for User Input",
  //       "assigned_Person": "5",
  //       "assigned_Person_Name": "Madhav Shettigar",
  //       "start_Date": "2026-04-30T00:00:00",
  //       "eta_Date": "2026-05-01T00:00:00",
  //       "eta_Time": "",
  //       "remarks": "",
  //       "parent_Ticket_Id": null,
  //       "file_Name": "",
  //       "file_Path": "",
  //       "file_Type": "",
  //       "created_By": 1403,
  //       "created_By_Name": "Pranay Mahadik",
  //       "created_At": "2026-04-29T11:10:39.35",
  //       "updated_By": 1403,
  //       "updated_By_Name": "Pranay Mahadik",
  //       "updated_At": "2026-04-30T15:44:32.68"
  //     }
  //   ]
  // }

  createITHelpdeskTicket: async (payload) => {
    try {
      const formData = new FormData();

      formData.append("Dept", payload.dept || "");
      formData.append("Ticket_type", payload.ticket_type || "");
      formData.append("Req_type", payload.req_type || "");
      formData.append("Category", payload.category || "");
      formData.append("Project_Module", payload.project || "");
      formData.append("Impact", payload.impact || "");
      formData.append("Description", payload.description || "");
      formData.append("Org", payload.org || "");
      formData.append("Submitted_by", payload.submitted_by || "");
      formData.append("Created_By", payload.submitted_by || "");
      formData.append("Priority", payload.priority || "");
      formData.append("Parent_Ticket_Id", payload.parent_ticket_id || "");

      if (payload.file) {
        formData.append("AttachmentFile", payload.file);
      }

      const response = await APIHelper(
        "POST",
        API.ITHelpdesk.createITHelpdeskTicket,
        formData,
        {
          "Content-Type": "multipart/form-data",
        },
      );
      return response;
    } catch (error) {
      console.error("Error creating ticket:", error);
      throw error;
    }
  },

  enrollTicket: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.ITHelpdesk.enrollTicket,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error enrolling ticket:", error);
      throw error;
    }
  },

  //   payload req
  //   {
  //   "ticket_Id": 0,
  //   "priority": "string",
  //   "req_Type": "string",
  //   "assigned_Person": "string",
  //   "eta_Date": "2026-05-04",
  //   "eta_Time": "string",
  //   "remarks": "string",
  //   "updated_By": 0
  // }

  reassignTicket: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.ITHelpdesk.reassignTicket,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error reassigning ticket:", error);
      throw error;
    }
  },

  //   payload req
  //   {
  //   "ticket_Id": 0,
  //   "assigned_Person": "string",
  //   "updated_By": 0,
  //   "remarks": "string"
  // }

  updateTicketStatus: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.ITHelpdesk.updateTicketStatus,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error updating ticket status:", error);
      throw error;
    }
  },
  //   payload req
  //   {
  //   "ticket_Id": 0,
  //   "status": "string",
  //   "remarks": "string",
  //   "updated_By": 0
  // }

  updateHistory: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.ITHelpdesk.updateHistory,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error updating history:", error);
      throw error;
    }
  },

  //   payload req
  //   {
  //   "ticket_Id": 0,
  //   "action_Type": "string",
  //   "old_Value": "string",
  //   "new_Value": "string",
  //   "remarks": "string",
  //   "action_By": 0
  // }

  getHistoryById: async (ticket_Id) => {
    try {
      const response = await APIHelper("POST", API.ITHelpdesk.getHistoryById, {
        ticket_Id: ticket_Id,
      });
      return response;
    } catch (error) {
      console.error("Error fetching history:", error);
      throw error;
    }
  },

  //   response
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "Found 4 history record(s).",
  //   "data": [
  //     {
  //       "history_Id": 1,
  //       "ticket_Id": 1,
  //       "action_Type": "ENROLLED",
  //       "old_Value": "Open",
  //       "new_Value": "Enrolled",
  //       "remarks": "Ticket enrolled",
  //       "action_By": 1403,
  //       "action_By_Name": "Pranay Mahadik",
  //       "action_At": "2026-04-30T15:43:41.767"
  //     },
  //     {
  //       "history_Id": 2,
  //       "ticket_Id": 1,
  //       "action_Type": "STATUS_CHANGED",
  //       "old_Value": "In Progress",
  //       "new_Value": "In Progress",
  //       "remarks": "",
  //       "action_By": 1403,
  //       "action_By_Name": "Pranay Mahadik",
  //       "action_At": "2026-04-30T15:44:10.233"
  //     },

  //   ]
  // }

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

  sendStrike: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.ITHelpdesk.sendStrike,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error sending strike:", error);
      throw error;
    }
  },

  //   payload req
  //   {
  //   "ticket_Id": 0,
  //   "strike_No": 0,
  //   "mail_Id": "string",
  //   "strike_Note": "string",
  //   "sent_By": 0
  // }

  getStrikes: async (ticket_Id) => {
    try {
      const response = await APIHelper("POST", API.ITHelpdesk.getStrikes, {
        ticket_Id: ticket_Id,
      });
      return response;
    } catch (error) {
      console.error("Error fetching strikes:", error);
      throw error;
    }
  },

  //   response
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "Found 1 strike(s).",
  //   "data": [
  //     {
  //       "strike_Id": 1,
  //       "ticket_Id": 1,
  //       "strike_No": 1,
  //       "mail_Id": "mail@mail.com",
  //       "strike_Note": "response asap",
  //       "sent_At": "2026-05-05T03:03:57.8",
  //       "response_Received": false,
  //       "response_Note": "",
  //       "response_At": null,
  //       "sent_By": 1403,
  //       "sent_By_Name": "Pranay Mahadik"
  //     }
  //   ]
  // }

  respondStrike: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.ITHelpdesk.respondStrike,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error responding to strike:", error);
      throw error;
    }
  },

  //   payload req
  //   {
  //   "strike_Id": 0,
  //   "response_Note": "string"
  // }

  addDiscussion: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.ITHelpdesk.addDiscussion,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error adding discussion:", error);
      throw error;
    }
  },

  //   payload req
  //   {
  //   "ticket_Id": 0,
  //   "message_Text": "string",
  //   "message_By": 0
  // }

  getDiscussions: async (ticket_Id) => {
    try {
      const response = await APIHelper("POST", API.ITHelpdesk.getDiscussions, {
        ticket_Id: ticket_Id,
      });
      return response;
    } catch (error) {
      console.error("Error fetching discussions:", error);
      throw error;
    }
  },

  //   response
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "Found 1 message(s).",
  //   "data": [
  //     {
  //       "discussion_Id": 1,
  //       "ticket_Id": 1,
  //       "message_Text": "string",
  //       "message_By": 1403,
  //       "message_By_Name": "Pranay Mahadik",
  //       "message_At": "2026-04-30T11:45:51.503"
  //     }
  //   ]
  // }

  getTicketEmployees: async (dept_Name) => {
    try {
      const response = await APIHelper(
        "POST",
        API.ITHelpdesk.getTicketEmployees,
        {
          dept_Name: dept_Name,
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching employees:", error);
      throw error;
    }
  },

  // dept name can be IT or HR

  // response
  // {
  // "status_Code": 200,
  // "status": "Success",
  // "message": "Found 25 employee(s).",
  // "data": [
  //   {
  //     "emp_Id": 8,
  //     "emp_Name": "Pankaj Joshi",
  //     "emp_No": "9145",
  //     "emp_Email": "pvj@indef.com",
  //     "dept_Id": 5,
  //     "org_Id": "IML"
  //   },
  //   {
  //     "emp_Id": 40,
  //     "emp_Name": "Satish Dukare",
  //     "emp_No": "9152",
  //     "emp_Email": "sbd@indef.com",
  //     "dept_Id": 5,
  //     "org_Id": "IML"
  //   }
  // ]}

  getCatalogItems: async () => {
    // fetch commercial invoice data based on invoice number
    try {
      const response = await APIHelper("POST", API.ITHelpdesk.GetHDCatalog);
      return response;
    } catch (error) {
      console.error("Error fetching HD Catalog data:", error);
      throw error;
    }
  },
};

export default ITHelpdeskService;
