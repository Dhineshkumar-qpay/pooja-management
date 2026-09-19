import Users from "../models/Users.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const Login = async (req, res) => {
  try {
    const { email, role } = req.body || {};

    if (!email) {
      return res.status(400).json({
        status: 400,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const adminEmail = "admin@gmail.com";
    const adminOTP = "540148";

    let otp;

    // Admin login
    if (normalizedEmail === adminEmail) {
      otp = adminOTP;
    } else {
      // Normal user login
      otp = generateOTP();
    }

    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const [user, created] = await Users.findOrCreate({
      where: {
        email: normalizedEmail,
      },
      defaults: {
        email: normalizedEmail,
        otp,
        otpExpiresAt,
        role: normalizedEmail === adminEmail ? "admin" : role || "user",
      },
    });

    // Existing user
    if (!created) {
      user.otp = otp;
      user.otpExpiresAt = otpExpiresAt;

      // Don't change an existing admin's role
      if (normalizedEmail !== adminEmail && role) {
        user.role = role;
      }

      await user.save();
    }

    return res.status(200).json({
      status: 200,
      message: "OTP sent successfully",
      // otp, // Remove this in production
      // user: {
      //   id: user.userid,
      //   email: user.email,
      //   role: user.role,
      // },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      status: 500,
      message: "Server error",
      error: error.message,
    });
  }
};

export const VerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        status: 400,
        message: "Email and OTP are required",
      });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const user = await Users.findOne({
      where: {
        email: normalizedEmail,
      },
    });
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }
    if (user.otp !== otp) {
      return res.status(400).json({
        status: 400,
        message: "Invalid OTP",
      });
    }
    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({
        status: 400,
        message: "OTP expired",
      });
    }
    const payload = { userid: user.userid, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "90d",
    });

    return res.status(200).json({
      status: 200,
      message: "OTP verified successfully",
      data: {
        userid: user.userid,
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const GetProfile = async (req, res) => {
  try {
    const user = await Users.findByPk(req.user.id);
    return res.status(200).json({
      status: 200,
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const UpdateProfile = async (req, res) => {
  try {
    const user = await Users.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { name, mobile } = req.body;
    if (name) user.name = name;
    if (mobile) user.mobile = mobile;
    await user.save();
    return res.status(200).json({
      status: 200,
      message: "Profile updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
