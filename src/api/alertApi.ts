import axios from "axios";
import { Alert } from "../types/Alert";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Create axios instance with auth token
const createAuthenticatedRequest = () => {
  const token = localStorage.getItem("token");
  return axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};

export const fetchAlerts = async (): Promise<Alert[]> => {
  try {
    const response = await axios.get(`${API_URL}/alerts`);
    return response.data;
  } catch (error) {
    console.error("Error fetching alerts:", error);
    throw new Error("Failed to fetch alerts");
  }
};

export const fetchNearbyAlerts = async (
  lat: number,
  lng: number,
  radius: number = 5
): Promise<Alert[]> => {
  try {
    const response = await axios.get(
      `${API_URL}/alerts/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching nearby alerts:", error);
    throw new Error("Failed to fetch nearby alerts");
  }
};

export const createAlert = async (alert: Alert): Promise<Alert> => {
  try {
    // Use authenticated axios instance
    const api = createAuthenticatedRequest();
    const response = await api.post(`/alerts`, alert);
    return response.data;
  } catch (error) {
    console.error("Error creating alert:", error);
    throw new Error("Failed to create alert");
  }
};

export const deleteAlert = async (id: string): Promise<void> => {
  try {
    console.log(`Attempting to delete alert with ID: ${id}`);
    const token = localStorage.getItem("token");
    console.log(`Token present: ${!!token}`);

    // Use authenticated axios instance
    const api = createAuthenticatedRequest();
    await api.delete(`/alerts/${id}`);
    console.log(`Alert with ID ${id} successfully deleted`);
  } catch (error: any) {
    console.error("Error deleting alert:", error);
    console.error("Response data:", error.response?.data);
    console.error("Status code:", error.response?.status);
    throw new Error(error.response?.data?.message || "Failed to delete alert");
  }
};

// Fetch alerts created by the current user
export const fetchMyAlerts = async (): Promise<Alert[]> => {
  try {
    // Use authenticated axios instance
    const api = createAuthenticatedRequest();
    const response = await api.get(`/alerts/my-alerts`);
    return response.data;
  } catch (error) {
    console.error("Error fetching my alerts:", error);
    throw new Error("Failed to fetch your alerts");
  }
};
