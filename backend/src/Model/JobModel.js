import mongoose from "mongoose";

const { Schema } = mongoose;

const jobSchema = new Schema({
    jobtitle: {
        type: String,
        required: true
    },
    jobdescription: {
        type: String,
        required: true
    },
    location: [{
        type: String,
        required: true
    }],
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },
    experienceLevel: {
        type: String,
        required: true
    },
    salaryRange: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

const job = mongoose.model("Job", jobSchema);

export default job
