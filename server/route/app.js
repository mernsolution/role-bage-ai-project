import express from "express";
import authController from "../controller/AuthController.js";
import userManagement from "../controller/userManagement.js";
import summaryManagement from "../controller/SummaryGenerate.js";
import upload, { handleUploadError } from "../middleware/uploadMiddleware.js";
const router = express.Router();

// summarize or AI (with credit system)
router.post(
  "/generate-summary",
  upload.single("file"),
  handleUploadError,
  summaryManagement.generateSummary
);
router.post("/save-summaries", summaryManagement.saveSummary);
router.get("/summaries", summaryManagement.getAllSummaries);
router.put("/update-summaries/:id", summaryManagement.updateSummary);
router.delete("/summaries/:id", summaryManagement.deleteSummary);

// admin
router.delete("/deleteUser/:userId", userManagement.deleteUser);
router.put("/updateUser/:userId", userManagement.updateUser);
router.post("/createUser", userManagement.createUser);
router.get("/getUserById", userManagement.getUserById);
router.get("/getAllUsers", userManagement.getAllUsers);

// public
router.post("/signup", authController.userSignup);
router.post("/sign-in", authController.authLogin);
router.post("/logout", authController.logout);
router.get("/check-session", authController.checkSession);

export default router;
