import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,

  email: {
    type: String,
    unique: true
  },

  password: String,

  theme: {
    type: String,
    default: "dark"
  },

  plan: {
    type: String,
    default: "free"
  }
});

export default mongoose.model("User", UserSchema);