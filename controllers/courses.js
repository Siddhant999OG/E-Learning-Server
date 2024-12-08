const { instance } = require("../index");
const Courses = require("../models/Courses");
const Lecture = require("../models/Lecture");
const Payment = require("../models/payment")
const User = require("../models/User");
const crypto = require("crypto")

exports.getallCourses = async(req, res) => {
    try{
        const courses = await Courses.find();

        res.json({
            courses
        })
    }
    catch(error){
        res.json({
            message:"Error in getting All Courses"
        })
    }
}

exports.singleCourse = async(req, res) => {
    try{
        const course = await Courses.findById(req.params.id);

        res.json({
            course
        })
    }
    catch(error){
        res.json({
            message:"error fetching single course"
        })
    }
}


exports.fetchLectures = async(req, res) => {
    try{
        const lectures = await Lecture.find({ course: req.params.id });

        const user = await User.findById(req.user._id);

        if (user.role === "admin") {
            return res.json({ lectures });
        }

        if (!user.subscription.includes(req.params.id))
            return res.status(400).json({
            message: "You have not subscribed to this course",
        });

        res.json({ lectures });
    }

    catch(error){
        res.json({
            message:"Error in fetching Lectures"
        })
    }
}


exports.fetchSingleLecture = async(req, res) => {
    try{
        const lecture = await Lecture.findById(req.params.id);

        const user = await User.findById(req.user._id);

        if (user.role === "admin") {
            return res.json({ lecture });
        }

        if (!user.subscription.includes(lecture.course))
            return res.status(400).json({
            message: "You have not subscribed to this course",
        });

        res.json({ lecture });
    }

    catch(error){
        res.json({
            message:"Error in fetching Lecture"
        })
    }
}

exports.getMyCourses = async(req, res) => {
    try{
        const courses = await Courses.find({_id: req.user.subscription})

        return res.json({
            courses,
        })
    }
    catch(error){
        return res.json({
            message: "error in getting my course"
        })
    }
}

exports.checkout = async(req, res) => {
    try{
        const user = await User.findById(req.user._id);
        const course = await Courses.findById(req.params.id);

        if(user.subscription.includes(course._id)){
            res.json({
                message : "You have this course Already"
            })
        }

        const options = {
            amount: Number(course.price * 100),
            currency : "INR",
        }

        const order = await instance.orders.create(options);

        res.json({
            order,
            course
        })
    }
    catch(error){
        res.json({
            message:"CheckOut failed"
        })
    }
}



exports.paymentVerification = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.Razorpay_Secret)
            .update(body)
            .digest("hex");
    
        const isAuthentic = expectedSignature === razorpay_signature;
    
        console.log("Expected Signature: ", expectedSignature); // Log the expected signature
        console.log("Received Signature: ", razorpay_signature); // Log the received signature
    
        if (isAuthentic) {
            // Proceed to update user subscription
            await Payment.create({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            });
        
            const user = await User.findById(req.user._id);
            const course = await Courses.findById(req.params.id);
        
            // If the user has already subscribed to the course, prevent adding again
            if (user.subscription.includes(course._id)) {
                return res.status(400).json({
                    message: "You have already subscribed to this course",
                });
            }

            user.subscription.push(course._id);
            await user.save();
        
            res.status(200).json({
                message: "Course Purchased Successfully",
            });
        } else {
            return res.status(400).json({
                message: "Payment Verification Failed: Signature Mismatch",
            });
        }
    } catch (error) {
        console.error("Error in payment verification:", error); // Log the error
        res.status(500).json({
            message: "Error in payment verification",
        });
    }
};