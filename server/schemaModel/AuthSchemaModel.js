import mongoose from "mongoose";

const AuthSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
    },
    credits: { type: Number, default: 5 },
    role: {
      type: String,
      enum: ["user", "admin", "editor", "reviewer"],
      default: "user",
    },
    status:{
      type:String,
      default: "Active",
    }
  },
  {
    strict: true,
    timestamps: true,
  }
);



const AuthModelData = mongoose.model("AuthSchemaInfo", AuthSchema);
export default AuthModelData;
