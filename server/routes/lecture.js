import express from "express";
import {
    completeReadingLecture,
    createLecture,
    getNextLecture,
    submitQuiz
} from "../controllers/lecture.js";
import { isAdmin, isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

// Admin/Instructor routes
router.post("/lecture/new", isAuth, isAdmin, createLecture);

// Student routes
router.post("/lecture/:lectureId/submit-quiz", isAuth, submitQuiz);
router.post("/lecture/:lectureId/complete-reading", isAuth, completeReadingLecture);
router.get("/course/:courseId/next-lecture", isAuth, getNextLecture);

export default router;
