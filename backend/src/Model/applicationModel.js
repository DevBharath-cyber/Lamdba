import mongoose from "mongoose";

const {Schema} = mongoose;

const applicationSchema = new Schema({
    jobId:{
        type: mongoose.Schema.Types.ObjectId,
        ref :"Job",
        required : true
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref :"User",
        required: true
    },
    status:{
        type: String,
        enum: ['applied', 'under review', 'interview scheduled', 'offered', 'rejected', 'pending'],
        default: 'pending'
    },
    

},{timestamps : true});

const Application = mongoose.model("Application", applicationSchema);

export default Application;