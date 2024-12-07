const express = require("express");
const { getallCourses, singleCourse, fetchLectures, fetchSingleLecture, checkout, paymentVerification, getMyCourses } = require("../controllers/courses");
const { auth } = require("../middleware/auth");
const router = express.Router();

router.get("/allCourses", getallCourses);
router.get("/singlecourse/:id", singleCourse);
router.get("/fetchLectures/:id", auth, fetchLectures);
router.get("/fetchSingleLecture/:id", auth, fetchSingleLecture);
router.get('/getMyCourse', auth, getMyCourses);
router.post('/checkout/:id', auth, checkout);
router.post('/verify/:id', auth, paymentVerification);

module.exports = router;