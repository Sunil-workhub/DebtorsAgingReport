// src/services/DebtorsAgingReport/DebtorsReportService.js
import APIHelper from "../../context/APIHelper";
import API from "../../constants/API";

const DebtorsReportService = {
  getDetailedAging: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.DebtorsAgingReport.GetDebtorsDetailedAging,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error fetching detailed aging:", error);
      throw error;
    }
  },

  getCustomerWise: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.DebtorsAgingReport.GetDebtorsCustomerWise,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error fetching customer wise:", error);
      throw error;
    }
  },

  getFormatFace: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.DebtorsAgingReport.GetDebtorsFormatFace,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error fetching format face:", error);
      throw error;
    }
  },
};

export default DebtorsReportService;
