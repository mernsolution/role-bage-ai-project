import mongoose from 'mongoose';

const AuthSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    shopName: {
      type: [String],
      default: [],
      validate: {
        validator: function (value) {
          return value.length >= 3;
        },
        message: 'At least 3 shop names are required.',
      },
    },
  },
  { strict: true ,
    timestamps: true,
  }
);

const AuthModelData = mongoose.model('AuthSchema', AuthSchema);
export default AuthModelData;

