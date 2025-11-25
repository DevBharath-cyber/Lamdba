import mongoose from "mongoose";

const { Schema } = mongoose;

const companySchema = new Schema(
  {
    companyName: {
      type: String,
      required: true,
      uniquie: true,
    },
    description: {
      type: String,
      default: null,
    },
    website: {
      type: String,
    },
    location: [
      {
        type: String,
      },
    ],
    logo: {
      type: String,
      default: null,
    },
    experience: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

const company = mongoose.model("company", companySchema);

export default company;
