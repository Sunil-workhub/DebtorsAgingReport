import APIHelper from "../../context/ApiHelper";
import API from "../../constants/API";
import { Download } from "lucide-react";

const CustomerPortalService = {
  GetCustomerList: async (searchTerm, pageNumber, pageSize, ama_id) => {
    try {
      const response = await APIHelper("POST", API.Ecom.GetCustomerList, {
        searchTerm: searchTerm,
        pageNumber: pageNumber,
        pageSize: pageSize,
        Ama_Id: ama_id,
      });
      return response;
    } catch (error) {
      console.error("Error fetching customer paginated details:", error);
      throw error;
    }
  },
  GetTitleDropdown: async () => {
    try {
      const response = await APIHelper("POST", API.Ecom.GetTitleDropdown);
      return response;
    } catch (error) {
      console.error("Error fetching title dropdown:", error);
      throw error;
    }
  },
  GetCityDropdown: async () => {
    try {
      const response = await APIHelper("POST", API.Ecom.GetCityDropdown);
      return response;
    } catch (error) {
      console.error("Error fetching city dropdown:", error);
      throw error;
    }
  },
  GetSegmentDropdown: async () => {
    try {
      const response = await APIHelper("POST", API.Ecom.GetSegmentDropdown);
      return response;
    } catch (error) {
      console.error("Error fetching segment dropdown:", error);
      throw error;
    }
  },
  GetSectorDropdown: async () => {
    try {
      const response = await APIHelper("POST", API.Ecom.GetSectorDropdown);
      return response;
    } catch (error) {
      console.error("Error fetching sector dropdown:", error);
      throw error;
    }
  },
  CreateCustomer: async (customerData) => {
    try {
      const response = await APIHelper(
        "POST",
        API.Ecom.CreateCustomer,
        customerData,
      );
      return response;
    } catch (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
  },
  EditCustomerDetails: async (customerData) => {
    try {
      const response = await APIHelper(
        "POST",
        API.Ecom.UpdateCustomer,
        customerData,
      );
      return response;
    } catch (error) {
      console.error("Error editing customer details:", error);
      throw error;
    }
  },
};

export default CustomerPortalService;
