import UserModel from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmailFun from "../Config/sendEmail.js";
import VerificationEmail from "../utils/verifyEmailTemplate.js";
import generatedAccessToken from "../utils/genrateAccessToken.js";
import generatedRefreshToken from "../utils/genrateRefreshToken.js";

export async function registerUserController(request, response) {
  try {
    let user;

    const { name, email, password } = request.body;
    if (!name || !email || !password) {
      return response.status(400).json({
        message: "provide email, name, password",
        error: true,
        success: false,
      });
    }

    user = await UserModel.findOne({ email: email });

    if (user) {
      return response.json({
        message: "User already registered with this email",
        error: true,
        success: false,
      });
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    // const salt = await bcryptjs.genSalt(10);
    // const hashPassword = await bcryptjs.hash(password, salt);
    const hashPassword = await bcryptjs.hash(password, 10);

    user = new UserModel({
      email: email,
      password: hashPassword,
      name: name,
      otp: verifyCode,
      otpExpires: Date.now() + 600000,
    });

    await user.save();

    //send verification email

    await sendEmailFun({
      sendTo: email,
      subject: "Verify email from Ecommerce App",
      text: "",
      html: VerificationEmail(name, verifyCode),
    });

    //create a JWT token foe verification purposes

    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JSON_WEB_TOKEN_SECRET_KEY
    );

    return response.status(200).json({
      success: true,
      error: false,
      message: "User registered successfully! Please verify your email.",
      token: token, //optional: include this if needed for verification
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function verifyEmailController(request, response) {
  try {
    // getting email and otp from frontend
    const { email, otp } = request.body;

    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return response.status(400).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    // checking otp validity is true or false
    const isCodeValid = user.otp === otp;
    const otpExpires = user.otpExpires > Date.now();

    if (isCodeValid && otpExpires) {
      user.verify_email = true;
      user.otp = null;
      user.otpExpires = null;

      await user.save();
      return response.status(200).json({
        message: "Email verified",
        error: false,
        success: true,
      });
    } else if (!isCodeValid) {
      return response.status(400).json({
        message: "Invalid OTP",
        error: true,
        success: false,
      });
    } else {
      return response.status(400).json({
        message: "OTP expxpired",
        error: true,
        success: false,
      });
    }
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//User logIn functional
export async function loginUserController(request, response) {
  try {
    const { email, password } = request.body;

    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return response.status(400).json({
        message: "User not register.",
        error: true,
        success: false,
      });
    }

    if (user.status !== "Active") {
      return response.status(400).json({
        message: "Contact to admin.",
        error: true,
        success: false,
      });
    }
    if (user.verify_email !== true) {
      return response.status(400).json({
        message: "Your Email is not verify yet please verify your email first.",
        error: true,
        success: false,
      });
    }

    //validating user password.
    const checkPassword = await bcryptjs.compare(password, user.password);

    if (!checkPassword) {
      return response.status(400).json({
        message: "Password is incorrect!, Please check the password.",
        error: true,
        success: false,
      });
    }

    //gereneting user login token
    const accessToken = await generatedAccessToken(user._id);
    const refreshToken = await generatedRefreshToken(user._id);

    const updateUser = await UserModel.findByIdAndUpdate(user?._id, {
      last_login_date: new Date(),
    });

    //creating cookie for maintaing user login.
    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    response.cookie("accessToken", accessToken, cookiesOption);
    response.cookie("refreshToken", refreshToken, cookiesOption);

    return response.json({
      message: "Login successfully",
      error: false,
      success: true,
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//User logout functional
export async function logoutController(request, response) {
  try {
    const userid = request.userid; // auth middleware

    const cookiesOption = {
      httpOnly: true,
      sucure: true,
      sameSite: "None",
    };

    //clearing cookie for user logout.
    response.clearCookie("accessToken", cookiesOption);
    response.clearCookie("refreshToken", cookiesOption);

    const removeRefreshToken = await UserModel.findByIdAndUpdate(userid, {
      refresh_token: "",
      access_token: "",
    });

    return response.json({
      message: "Logout successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}
