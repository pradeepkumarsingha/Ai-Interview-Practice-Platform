import axiosInstance from "./axiosInstance";

// Predict role from resume text, profile summary, or a full candidate form payload
export const predictRole = (payload) => {
  const data = typeof payload === "string" ? { resume_text: payload } : payload;
  return axiosInstance.post("/ai/predict-role", data);
};

// Upload resume file (multipart/form-data) – uses the same endpoint which now accepts file uploads
export const uploadResume = (formData, token) =>
  axiosInstance.post("/ai/predict-role", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

// ATS score endpoint (file upload)
export const getAtsScore = (formData, token) =>
  axiosInstance.post("/ai/ats-score", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

// Digital twin endpoint (file upload)
export const getDigitalTwin = (formData, token) =>
  axiosInstance.post("/ai/digital-twin", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

// Start interview (JSON payload)
export const startInterview = (domain, token) =>
  axiosInstance.post(
    "/ai/start",
    { domain },
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

// Final evaluation (JSON payload)
export const finalEvaluateInterview = (questions, answers, state, duration, token) =>
  axiosInstance.post(
    "/ai/final_evaluate",
    { questions, answers, state, duration },
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

// Dashboard stats (protected)
export const dashboardStats = (token) =>
  axiosInstance.get("/dashboard/stats", {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
