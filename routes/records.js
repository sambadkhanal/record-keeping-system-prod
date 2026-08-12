import express from "express";
import {
  createRecord,
  deleteRecord,
  getRecords,
  updateRecord,
} from "../controllers/record.controller.js";
import upload from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/", upload.single("profile_pic"), createRecord);
router.get("/", getRecords);
router.delete("/:id", deleteRecord);
router.put("/:id", upload.single("profile_pic"), updateRecord);

export default router;
