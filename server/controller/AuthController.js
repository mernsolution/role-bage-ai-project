import AuthModelData from "../schemaModel/AuthSchemaModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSignup = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email, and password are required.",
      });
    }

    // Check if user already exists
    const existingUser = await AuthModelData.findOne({
      $or: [{ userName: username }, { email: email }],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Username or email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new AuthModelData({
      userName: username,
      email: email,
      password: hashedPassword,
      role: role || "user",
    });

    await newUser.save();

    // Create safe user object (without password)
    const safeUser = {
      id: newUser._id,
      userName: newUser.userName,
      email: newUser.email,
      role: newUser.role,
    };

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      user: safeUser,
      token: token,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const authLogin = async (req, res) => {
  const { username, password, rememberMe } = req.body;

  try {
    const user = await AuthModelData.findOne({ userName: username });

    if (!user) {
      return res.status(401).json({
        status: "failed",
        message: "User name not found. Please register or check your username.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        status: "failed",
        message: "Incorrect password. Please try again.",
      });
    }

    const payload = {
      id: user._id,
      userName: user.userName,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "fallbacksecret",
      {
        expiresIn: rememberMe ? "7d" : "30m",
      }
    );

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000,
    });

    const { password: _, ...userData } = user._doc;

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      token: token,
      data: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error, please try again later.",
    });
  }
};
const logout = (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    domain: ".localhost",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

const checkSession = async (req, res) => {
  try {
    // Get token from cookies
    const token = req.cookies.authToken;

    if (!token) {
      return res.status(200).json({
        authenticated: false,
        user: null,
        message: "No token provided",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallbacksecret"
    );

    // Find user by ID from token
    const user = await AuthModelData.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(200).json({
        authenticated: false,
        user: null,
        message: "User not found",
      });
    }

    return res.status(200).json({
      authenticated: true,
      user: {
        id: user._id,
        name: user.userName,
        email: user.email,
        role: user.role,
        credits: user.credits || 100,
        createdAt: user.createdAt,
      },
      message: "Session valid",
    });
  } catch (error) {
    console.error("Session check error:", error);

    // Token expired or invalid
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(200).json({
        authenticated: false,
        user: null,
        message: "Invalid or expired token",
      });
    }

    return res.status(500).json({
      authenticated: false,
      user: null,
      message: "Server error during session check",
    });
  }
};

export default {
  userSignup,
  authLogin,
  logout,
  checkSession,
};
