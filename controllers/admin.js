const Courses = require("../models/Courses");
const Lecture = require("../models/Lecture");
const User = require("../models/User");
const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);

// Create Course
exports.createCourse = async (req, res) => {
    try {
        const { title, description, category, createdBy, duration, price } = req.body;

        // Check if file is provided
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Image file is required",
            });
        }

        // Create new course
        const course = await Courses.create({
            title,
            description,
            category,
            createdBy,
            image: req.file.path, // Store file path
            duration,
            price,
        });

        res.status(201).json({
            success: true,
            message: "Course created successfully",
            course,
        });
    } 
    catch (error) {
        console.error("Error creating course:", error); // Log error for debugging
        res.status(500).json({
            success: false,
            message: "Error creating the course",
        });
    }
};

exports.addLecture = async (req, res) => {
    try{
        const course = await Courses.findById(req.params.id);
    
        if (!course)
        return res.status(404).json({
            message: "No Course with this id",
        });
    
        const { title, description } = req.body;
    
        const file = req.file;
    
        const lecture = await Lecture.create({
        title,
        description,
        video: file?.path,
        course: course._id,
        });
    
        res.status(201).json({
        message: "Lecture Added",
        lecture,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error in adding lecture"
        });
    }
};

exports.deleteLecture = async (req, res) => {
    try {
        const DeleteLecture = await Lecture.findById(req.params.id);

        if (!DeleteLecture) {
            return res.status(404).json({
                message: "Lecture not found",
            });
        }

        fs.rm(DeleteLecture.video, (err) => {
            console.log("Video Deleted");
        });

        await DeleteLecture.deleteOne();

        res.json({
            message: "Lecture Deleted",
        });
    } 
    catch (error) {
        res.status(500).json({
            message: "Error in deleting Lecture",
        });
    }
};


exports.deleteCourse = async (req, res) => {
    try {
        const course = await Courses.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
    
        // Find and delete lecture videos
        const lectures = await Lecture.find({ course: course._id });
        for (const lecture of lectures) {
            if (lecture.video) {
            await unlinkAsync(lecture.video); // Correctly use unlinkAsync
            console.log("Video deleted:", lecture.video);
            }
        }
    
        // Delete course image
        if (course.image) {
            await unlinkAsync(course.image); // Correctly use unlinkAsync
            console.log("Image deleted:", course.image);
        }
    
        // Delete lectures and course
        await Lecture.deleteMany({ course: course._id });
        await course.deleteOne();
    
        // Remove the course from user subscriptions
        await User.updateMany({}, { $pull: { subscription: req.params.id } });
    
        res.json({ 
            message: "Course Deleted" 
        });
    }
    catch (error) {
        res.status(500).json({ 
            message: "Error in deleting Course" 
        });
    }
};


exports.getAllStats = async(req, res) => {
    try{
        const totalCourses = (await Courses.find()).length;
        const totalLectures = (await Lecture.find()).length;
        const totalUsers = (await User.find()).length;

        const stats = {
            totalCourses,
            totalLectures,
            totalUsers,
        };
        
        res.json({
            stats,
        });
    }
    catch(error){
        res.json({
            message:"Error in getting all Stats"
        })
    }
}


exports.getAllUsers = async(req, res) => {
    try{
        const Allusers = await User.find({_id:{$ne:req.user._id}}).select(
            "-password"   // admin ki id fetch nhii hogi and pass nhii aayegs
        );

        res.json({
            Allusers
        })
    }
    catch(error){
        res.json({
            message:"Error in getting All Users"
        })
    }
}

exports.updateRole = async(req, res) => {
    try{
        const user = await User.findById(req.params.id);

        if (user.role === "user") {
            user.role = "admin";
            await user.save();

            return res.status(200).json({
                message: "Role updated to admin",
            });
        }

        if (user.role === "admin") {
            user.role = "user";
            await user.save();

            return res.status(200).json({
                message: "Role updated",
            });
        }
    }
    catch(error){
        res.json({
            message:"Error in updating Role"
        })
    }
}