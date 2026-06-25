import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { protect } from "../middleware/authMiddleware.js";
import {
  requestLiveInterview,
  getMyLiveInterviewRequest
} from "../controllers/interviewController.js";
import {
  predictRole,
  digitalTwin,
  startInterview,
  finalEvaluate,
  atsScore,
} from "../controllers/aiController.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "..", "uploads");
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname || "");
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, safeName);
  },
});
const upload = multer({ storage });

// Resume-based endpoints
router.post("/predict-role", protect, upload.single("resume"), predictRole);
router.post("/digital-twin", protect, upload.single("resume"), digitalTwin);
router.post("/ats-score", protect, upload.single("resume"), atsScore);
// AI Interview flow
router.post("/start", startInterview);
router.post("/final_evaluate",protect,finalEvaluate);

router.post(
  "/request-live-interview",
  protect,
  requestLiveInterview
);
router.get("/request-live-interview", protect, getMyLiveInterviewRequest);


export default router;
