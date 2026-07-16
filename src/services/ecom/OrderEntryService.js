import APIHelper from "../../context/ApiHelper";
import API from "../../constants/API";
import { Download } from "lucide-react";

const OrderEntryService = {
  GetOrderPaginated: async (search, page, size) => {
    try {
      const response = await APIHelper("POST", API.Ecom.GetOrderPaginated, {
        searchTerm: search || null,
        pageNumber: page,
        pageSize: size,
      });
      return response;
    } catch (error) {
      console.error("Error fetching paginated orders:", error);
      throw error;
    }
  },

  GetNextOrderNo: async () => {
    try {
      const response = await APIHelper("POST", API.Ecom.GetNextOrderNo);
      return response;
    } catch (error) {
      console.error("Error fetching next order no:", error);
      throw error;
    }
  },

  GetDispatchInstructions: async () => {
    try {
      const response = await APIHelper(
        "POST",
        API.Ecom.GetDispatchInstructions,
      );
      return response;
    } catch (error) {
      console.error("Error fetching dispatch instructions:", error);
      throw error;
    }
  },

  GetFreightTerms: async () => {
    try {
      const response = await APIHelper("POST", API.Ecom.GetFreightTerms);
      return response;
    } catch (error) {
      console.error("Error fetching freight terms:", error);
      throw error;
    }
  },

  GetLineTypes: async () => {
    try {
      const response = await APIHelper("POST", API.Ecom.GetLineTypes);
      return response;
    } catch (error) {
      console.error("Error fetching line types:", error);
      throw error;
    }
  },

  GetInspPeriods: async () => {
    try {
      const response = await APIHelper(
        "POST",
        API.Ecom.GetInspIntimationPeriods,
      );
      return response;
    } catch (error) {
      console.error("Error fetching inspection periods:", error);
      throw error;
    }
  },

  CreateOrder: async (payload) => {
    try {
      const response = await APIHelper("POST", API.Ecom.CreateOrder, payload);
      return response;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  GetCustomersByAmaId: async (amaId) => {
    try {
      const response = await APIHelper("POST", API.Ecom.GetCustomersByAmaId, {
        AmaId: amaId,
      });
      return response;
    } catch (error) {
      console.error("Error fetching customers by AMA ID:", error);
      throw error;
    }
  },

  GetProductList: async () => {
    try {
      const response = await APIHelper("POST", API.Ecom.GetProductList);
      return response;
    } catch (error) {
      console.error("Error fetching product list:", error);
      throw error;
    }
  },

  GetProductRate: async (prodCode) => {
    try {
      const response = await APIHelper("POST", API.Ecom.GetProductRate, {
        ProdCode: prodCode,
      });
      return response;
    } catch (error) {
      console.error("Error fetching product rate:", error);
      throw error;
    }
  },
};

export default OrderEntryService;
