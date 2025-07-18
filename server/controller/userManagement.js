import AuthModelData from "../schemaModel/AuthSchemaModel.js";
import bcrypt from "bcryptjs";

// GET - Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
  const users = await AuthModelData.find({ role: { $ne: 'admin' } })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
      count: users.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving users",
      error: error.message,
    });
  }
};

// GET - Get user by ID (Admin only)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await AuthModelData.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving user",
      error: error.message,
    });
  }
};

// POST - Create new user (Admin only)
const createUser = async (req, res) => {
  try {
    const { userName, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await AuthModelData.findOne({
      $or: [{ email }, { userName }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or username already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new AuthModelData({
      userName,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    await newUser.save();

    // Return user without password
    const userResponse = await AuthModelData.findById(newUser._id).select(
      "-password"
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: userResponse,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
};

// PUT - Update user (Admin only)
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { userName, email, password, role, credits } = req.body;

    // Check if user exists
    const existingUser = await AuthModelData.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check for duplicate email or username (excluding current user)
    if (userName || email) {
      const duplicateUser = await AuthModelData.findOne({
        $and: [
          { _id: { $ne: userId } },
          {
            $or: [
              ...(email ? [{ email }] : []),
              ...(userName ? [{ userName }] : []),
            ],
          },
        ],
      });

      if (duplicateUser) {
        return res.status(400).json({
          success: false,
          message: "Email or username already exists",
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (userName) updateData.userName = userName;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (credits !== undefined) updateData.credits = credits;
    // Hash password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Update user
    const updatedUser = await AuthModelData.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
};

// DELETE - Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Deleting user with ID:", userId);

    // Check if user exists
    const user = await AuthModelData.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from deleting themselves
    if (req.user && req.user.id === userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    // Delete user
    await AuthModelData.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};

export default { deleteUser, updateUser, createUser, getUserById, getAllUsers };
