import api from "./axios";
 
export const getAnalytics = (userId) => {
  return api.get(`/analytics?userId=${userId}`);
};