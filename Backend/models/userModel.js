import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'User email is required'],
      trim: true,
      index: true, // creates a normal index
      unique: true, // optional: enforce unique emails
    },
    password: {
      type: String,
      required: [true, 'User Password is required'],
      trim: true,
    },
    cartData: {
      type: Object,
      default: {},
    },
  },
  { minimize: false }
);

const userModel = mongoose.models.users || mongoose.model('user', userSchema);

export default userModel;
