import AuthModelData from '../schemaModel/AuthSchemaModel.js';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

const userSignup = async (req, res) => {
  try {
    const { username, password, shopNames } = req.body;

    if (!username || !password || !Array.isArray(shopNames) || shopNames.length < 3) {
      return res.status(400).json({
        message: 'Username, password, and at least 3 shop names are required.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new AuthModelData({
      userName: username,
      password: hashedPassword,
      shopName: shopNames
    });

    await newUser.save();
    const safeUser = {
      id: newUser._id,
      userName: newUser.userName,
      shopName: newUser.shopName
    };

    res.status(201).json({
      message: 'User registered successfully',
      user: safeUser
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const checkShopNameAvailability = async (req, res) => {
  try {
    const { shopName } = req.query;
    if (!shopName) {
      return res.status(400).json({ message: 'Shop name is required' });
    }
    const existingShop = await AuthModelData.findOne({ shopName: shopName });
    if (existingShop) {
      return res.status(200).json({ available: false, message: 'Shop name is already taken' });
    } else {
      return res.status(200).json({ available: true, message: 'Shop name is available' });
    }
  } catch (error) {
    console.error('Error in checkShopNameAvailability:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


const checkUserNameAvailability = async (req, res) => {
  try {
    const { userName } = req.query;
    if (!userName) {
      return res.status(400).json({ message: 'Shop name is required' });
    }
    const existingShop = await AuthModelData.findOne({ userName: userName });
    if (existingShop) {
      return res.status(200).json({ available: false, message: 'Shop name is already taken' });
    } else {
      return res.status(200).json({ available: true, message: 'Shop name is available' });
    }
  } catch (error) {
    console.error('Error in checkShopNameAvailability:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


// const authLogin = async (req, res) => {
//   const { username, password, rememberMe } = req.body;

//   try {
//     const user = await AuthModelData.findOne({ userName: username });

//     if (!user) {
//       return res.status(401).json({
//         status: "failed",
//         message: "User name not found. Please register or check your username.",
//       });
//     }

//     const passwordMatch = await bcrypt.compare(password, user.password);

//     if (!passwordMatch) {
//       return res.status(401).json({
//         status: "failed",
//         message: "Incorrect password. Please try again.",
//       });
//     }

//     const payload = {
//       id: user._id,
//       userName: user.userName,
//     };

//     const token = jwt.sign(
//       payload,
//       process.env.JWT_SECRET || "dfhdiru238437@#",
//       {
//         expiresIn: rememberMe ? "7d" : "30m",
//       }
//     );

//     res.cookie("authToken", token, {
//       httpOnly: true,
//       secure: false,
//       sameSite: "lax",
//       maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000,
//       domain: ".localhost",
//     });

//     const { password: _, ...userData } = user._doc;

//     return res.status(200).json({
//       status: "success",
//       message: "Login successful",
//       token: token,
//       data: userData,
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     return res.status(500).json({
//       status: "error",
//       message: "Server error, please try again later.",
//     });
//   }
// };

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
  domain: ".localhost", // ✅ allows all *.localhost subdomains
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

const getShopNames = async (req, res) => {
  try {
    const token = req.cookies.authToken;

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await AuthModelData.findById(decoded.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ data: user });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ message: "Unauthorized" });
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

const checkSession = (req, res) => {
  debugger
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({
      authenticated: false,
      message: "No token found"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dfhdiru238437@#");
    res.status(200).json({ authenticated: true, user: decoded });
  } catch (err) {
    console.log("JWT Verification Error:", err.message);
    res.status(401).json({
      authenticated: false,
      message: "Invalid token"
    });
  }
};

export default {
  userSignup,
  authLogin,
  logout,
  checkSession,
  getShopNames,
  checkShopNameAvailability,
  checkUserNameAvailability,
};
