const express = require("express");
const { createCourse, addLecture, deleteLecture, deleteCourse, getAllStats, updateRole, getAllUsers } = require("../controllers/admin");
const { auth, isAdmin } = require("../middleware/auth");
const storage = require('../middleware/multer');

const router = express.Router();

// Ensure 'file' is the field name in the form
router.post('/new', auth, isAdmin, storage, createCourse);
router.post('/lecture/:id', auth, isAdmin, storage, addLecture);
router.delete('/deletelecture/:id', auth, isAdmin, deleteLecture);
router.delete('/deleteCourse/:id', auth, isAdmin, deleteCourse);
router.get('/getAllStats', auth, isAdmin, getAllStats);
router.put('/updateRole/:id', auth, isAdmin, updateRole)
router.get('/getAllusers', auth, isAdmin, getAllUsers)

module.exports = router;