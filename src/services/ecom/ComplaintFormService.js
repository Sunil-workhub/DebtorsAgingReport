import APIHelper from "../../context/ApiHelper";
import API from "../../constants/API";
import { Download } from "lucide-react";

const ComplaintFormServices = {
  GetComplaintNo: async (party_No) => {
    try {
      const response = await APIHelper(
        "POST",
        API.ComplaintForm.GetComplaintNo,
        {
          party_No: party_No,
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching req number:", error);
      throw error;
    }
  },
  // GetComplaintNo Response Sample
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "Next complaint number generated successfully.",
  //   "data": {
  //     "nextComplaintNo": "C0002/3456/25-26"
  //   }
  // }

  GetComplaintRegion: async () => {
    try {
      const response = await APIHelper(
        "POST",
        API.ComplaintForm.GetComplaintRegion,
      );
      return response;
    } catch (error) {
      console.error("Error fetching complaint regions:", error);
      throw error;
    }
  },

  //   GetComplaintRegion Response Sample
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "Data fetched successfully.",
  //   "data": [
  //     {
  //       "type_Id": 385,
  //       "type_Desc": "EAST"
  //     },
  //     {
  //       "type_Id": 387,
  //       "type_Desc": "NORTH"
  //     },
  //     {
  //       "type_Id": 389,
  //       "type_Desc": "SOUTH"
  //     },
  //     {
  //       "type_Id": 391,
  //       "type_Desc": "WEST"
  //     }
  //   ]
  // }

  GetComplaintSerialDetails: async (serialNo) => {
    try {
      const response = await APIHelper(
        "POST",
        API.ComplaintForm.GetComplaintSerialDetails,
        serialNo,
        "",
        true,
      );
      return response;
    } catch (error) {
      console.error("Error fetching serial details:", error);
      throw error;
    }
  },

  //   GetComplaintSerialDetails Response Sample
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "Data fetched successfully.",
  //   "data": {
  //     "category": "MANNUAL HOIST",
  //     "product": "PUSH PULL TROLLEY RANGE -1",
  //     "model": "INDEF - M",
  //     "capacity": "1 T - RANGE 58-150",
  //     "lift": ".",
  //     "product_Type": ".",
  //     "prod_Desc": "PUSH PULL TROLLEY, INDEF-M, 1T, F.W.58-150,",
  //     "prod_Code": "12500001",
  //     "invoice_Date": "2016-08-31T21:39:25",
  //     "invoice_Num": "PL16-/134",
  //     "party_Name": "RAKESH SERVICES",
  //     "address": "T-10, JAI MATADI COMPOUNDKALHERBHIWANDI,DIST.THANE",
  //     "zone_Id": "391"
  //   }
  // }

  GetComplaintWhoCommissioned: async () => {
    try {
      const response = await APIHelper(
        "POST",
        API.ComplaintForm.GetComplaintWhoCommissioned,
      );
      return response;
    } catch (error) {
      console.error("Error fetching who commissioned data:", error);
      throw error;
    }
  },

  //   GetComplaintWhoCommissioned Response Sample
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "Data fetched successfully.",
  //   "data": [
  //     {
  //       "commission_Id": "IML",
  //       "commission_Type": "1"
  //     },
  //     {
  //       "commission_Id": "ABP",
  //       "commission_Type": "2"
  //     },
  //     {
  //       "commission_Id": "Customer",
  //       "commission_Type": "3"
  //     }
  //   ]
  // }

  GetComplaintSiteConditions: async () => {
    try {
      const response = await APIHelper(
        "POST",
        API.ComplaintForm.GetComplaintSiteConditions,
      );
      return response;
    } catch (error) {
      console.error("Error fetching site conditions:", error);
      throw error;
    }
  },

  //  GetComplaintSiteConditions Response Sample
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "Data fetched successfully.",
  //   "data": [
  //     {
  //       "site_Condition_Name": "Indoor",
  //       "site_Condition_Value": "I"
  //     },
  //     {
  //       "site_Condition_Name": "Outdoor",
  //       "site_Condition_Value": "O"
  //     }
  //   ]
  // }

  GetComplaintSiteConditionSecondary: async () => {
    try {
      const response = await APIHelper(
        "POST",
        API.ComplaintForm.GetComplaintSiteConditionSecondary,
      );
      return response;
    } catch (error) {
      console.error("Error fetching secondary site conditions:", error);
      throw error;
    }
  },

  //  GetComplaintSiteConditionSecondary Response Sample
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "Data fetched successfully.",
  //   "data": [
  //     {
  //       "site_Condition_Name": "Normal",
  //       "site_Condition_Value": "1"
  //     },
  //     {
  //       "site_Condition_Name": "Dust",
  //       "site_Condition_Value": "2"
  //     },
  //     {
  //       "site_Condition_Name": "Dirt",
  //       "site_Condition_Value": "3"
  //     },
  //     {
  //       "site_Condition_Name": "Wet",
  //       "site_Condition_Value": "4"
  //     },
  //     {
  //       "site_Condition_Name": "Corrosive",
  //       "site_Condition_Value": "5"
  //     },
  //     {
  //       "site_Condition_Name": "Others",
  //       "site_Condition_Value": "6"
  //     }
  //   ]
  // }

  GetComplaintTypeOfLoadLifted: async () => {
    try {
      const response = await APIHelper(
        "POST",
        API.ComplaintForm.GetComplaintTypeOfLoadLifted,
      );
      return response;
    } catch (error) {
      console.error("Error fetching type of load lifted data:", error);
      throw error;
    }
  },

  //   GetComplaintTypeOfLoadLifted Response Sample
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "Data fetched successfully.",
  //   "data": [
  //     {
  //       "type_Load_Lift_Name": "Bags",
  //       "type_Load_Lift_Value": "1"
  //     },
  //     {
  //       "type_Load_Lift_Name": "Balanced",
  //       "type_Load_Lift_Value": "2"
  //     },
  //     {
  //       "type_Load_Lift_Name": "Imbalanced",
  //       "type_Load_Lift_Value": "3"
  //     },
  //     {
  //       "type_Load_Lift_Name": "Swinging",
  //       "type_Load_Lift_Value": "4"
  //     },
  //     {
  //       "type_Load_Lift_Name": "Long member",
  //       "type_Load_Lift_Value": "5"
  //     },
  //     {
  //       "type_Load_Lift_Name": "Others",
  //       "type_Load_Lift_Value": "6"
  //     }
  //   ]
  // }

  GetComplaintRelatedToCategories: async () => {
    try {
      const response = await APIHelper(
        "POST",
        API.ComplaintForm.GetComplaintRelatedToCategories,
      );
      return response;
    } catch (error) {
      console.error("Error fetching related to categories:", error);
      throw error;
    }
  },

  //   GetComplaintRelatedToCategories Response Sample
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "Data fetched successfully.",
  //   "data": [
  //     {
  //       "complaint_Category_Name": "Electrical",
  //       "complaint_Category_Id": 758705
  //     },
  //     {
  //       "complaint_Category_Name": "Mechanical",
  //       "complaint_Category_Id": 758706
  //     },
  //     {
  //       "complaint_Category_Name": "Structural",
  //       "complaint_Category_Id": 758707
  //     }
  //   ]
  // }

  GetComplaintSpecificIssuesByCategory: async (categoryId) => {
    try {
      const response = await APIHelper(
        "POST",
        API.ComplaintForm.GetComplaintSpecificIssuesByCategory,
        {
          complaint_Category_Id: categoryId,
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching specific issues by category:", error);
      throw error;
    }
  },

  //   GetComplaintSpecificIssuesByCategory Response Sample
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "Data fetched successfully.",
  //   "data": [
  //     {
  //       "complaint_Desc": "Brake Make & Model",
  //       "complaint_Desc_Id": 6
  //     },
  //     {
  //       "complaint_Desc": "Brake Serial Number",
  //       "complaint_Desc_Id": 7
  //     },
  //     {
  //       "complaint_Desc": "Conductor System",
  //       "complaint_Desc_Id": 9
  //     },
  //     {
  //       "complaint_Desc": "Control Panel",
  //       "complaint_Desc_Id": 5
  //     },
  //     {
  //       "complaint_Desc": "Motor Make & Model",
  //       "complaint_Desc_Id": 3
  //     },
  //     {
  //       "complaint_Desc": "Motor Serial Number",
  //       "complaint_Desc_Id": 4
  //     },
  //     {
  //       "complaint_Desc": "Others",
  //       "complaint_Desc_Id": 27
  //     },
  //     {
  //       "complaint_Desc": "Power fluctuation",
  //       "complaint_Desc_Id": 8
  //     },
  //     {
  //       "complaint_Desc": "Trolley / Travel Drive",
  //       "complaint_Desc_Id": 10
  //     }
  //   ]
  // }

  SubmitComplaintForm: async (jsonData) => {
    try {
      const response = await APIHelper(
        "POST",
        API.ComplaintForm.SubmitCompForm,
        jsonData,
      );
      return response;
    } catch (error) {
      console.error("Error submitting complaint form:", error);
      throw error;
    }
  },

  // SubmitComplaintForm Json required
  //   {
  //   "complaint_Date": "2025-09-22T05:32:21.729Z",
  //   "purchased_From": "string",
  //   "region": 0,
  //   "cust_Name": "string",
  //   "cust_Address": "string",
  //   "prod_Serial_No": "string",
  //   "prod_Type": "string",
  //   "capacity": "string",
  //   "lift": "string",
  //   "date_Commissioned": "2025-09-22T05:32:21.729Z",
  //   "who_Commissioned": "string",
  //   "inv_No": "string",
  //   "inv_Date": "2025-09-22T05:32:21.729Z",
  //   "dealer_Inv_No": "string",
  //   "dealer_Inv_Date": "2025-09-22T05:32:21.729Z",
  //   "app_Equipment": "string",
  //   "condition_1": "string",
  //   "condition_2": "string",
  //   "condition_Others": "string",
  //   "hrs_Used": "string",
  //   "weight_Lifted": "string",
  //   "type_Of_Load": "string",
  //   "reported_By": "string",
  //   "designation": "string",
  //   "date_Reported": "2025-09-22T05:32:21.729Z",
  //   "breakdown_Date": "2025-09-22T05:32:21.729Z",
  //   "contact_Person": "string",
  //   "contact_No": "string",
  //   "date_Deputed": "2025-09-22T05:32:21.729Z",
  //   "tp_Sr_No_Make": "string",
  //   "prod_Code": "string",
  //   "prod_Desc": "string",
  //   "in_Waranty": "string",
  //   "complaint_Nature": "string",
  //   "useful_Info": "string",
  //   "created_By": 0,
  //   "inv_Filename": "string",
  //   "inv_ContentType": "string",
  //   "visit_Filename": "string",
  //   "visit_ContentType": "string",
  //   "category": "string",
  //   "prod_Grp": "string",
  //   "model": "string",
  //   "expl_Desc_1": "string",
  //   "expl_Desc_2": "string",
  //   "expl_Desc_3": "string",
  //   "expl_Desc_4": "string",
  //   "expl_Desc_5": "string",
  //   "expl_Desc_6": "string",
  //   "cType": "string",
  //   "qr_Code": "string",
  //   "complaintTrl": [
  //     {
  //       "complaint_Desc_Id": 0,
  //       "remarks": "string"
  //     }
  //   ],
  //   "invData": "string",
  //   "visitData": "string",
  //   "photos": {
  //     "equip_Data_1": "string",
  //     "equip_Data_2": "string",
  //     "equip_Data_3": "string",
  //     "failed_Data_1": "string",
  //     "failed_Data_2": "string",
  //     "failed_Data_3": "string",
  //     "number_Plate": "string"
  //   }
  // }

  GetComplaintCustomers: async (searchTerm) => {
    try {
      const response = await APIHelper("POST", API.Complaint.GetCustomers, {
        searchTerm: searchTerm,
      });
      return response;
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  },

  SearchSerialOrQRCodes: async (searchTerm) => {
    try {
      const response = await APIHelper(
        "POST",
        API.Complaint.GetComplaintSerialDetails,
        { searchTerm: searchTerm },
      );
      return response;
    } catch (error) {
      console.error("Error fetching serial/QR details:", error);
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

export default ComplaintFormServices;
