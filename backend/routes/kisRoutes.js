import express from "express";
import {
    testKisController,
    getCurrentPrice,
} from "../controllers/kisController.js";

const router = express.Router();

router.get("/test", testKisController);
router.get("/price/:code", getCurrentPrice);

export default router;