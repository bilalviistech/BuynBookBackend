const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken')
const UserModal = require('../models/UserModal.js');
const OTP = require('../models/OtpModal.js');
const nodemailer = require('nodemailer')
const mongoose = require('mongoose')
require('dotenv').config();

class AuthController {
    static Register = async (req, res) => {
        const { name, email, password, tc, City } = req.body;


        let profile_picture = ""
        if (req.file && req.file.filename) {
            profile_picture = req.file.filename
        }

        const user = await UserModal.findOne({ email: email });


        if (user) {
            res.send({ "status": "failed", "message": "Email already exists" })

        } else {
            if (name && email && password && tc) {
                try {
                    const salt = await bcrypt.genSalt(10)
                    const HashPassword = await bcrypt.hash(password, salt)

                    const CreateAccount = new UserModal({
                        name: name,
                        email: email,
                        password: HashPassword,
                        city: City,
                        tc: tc,
                        Profile_Picture: profile_picture
                    })

                    CreateAccount.save().then(async () => {

                        const Saved_user = await UserModal.findOne({ email: email })

                        if (Saved_user) {

                            const token = JWT.sign({ UserID: Saved_user._id }, "FallInVeterahbadubwadbsahd", { expiresIn: "2y" })

                            const userData = { _id: Saved_user._id, name: Saved_user.name, email: Saved_user.email, tc: Saved_user.tc, role: Saved_user.role, Profile_Picture: Saved_user.Profile_Picture, city: Saved_user.city };

                            res.send({
                                "status": "true",
                                "message": "Registered successfully",
                                "token": token,
                                "data": userData
                            })
                        } else {
                            res.send({ "status": "false", "message": "Registration Failed", })

                        }
                    })

                } catch (e) {
                    res.send({ "status": "failed", "message": "Resgistration failed", "error": e.message })

                }
            } else {
                res.send({ "status": "failed", "message": "All fields are required" })

            }
        }
    }

    static SocialAuthRegister = async (req, res) => {
        const { name, email, tc, City, profile_picture } = req.body;

        try {
            const UserExist = await UserModal.findOne({ email: email });
            if (UserExist) {
                bcrypt.compare('123456789', UserExist.password, (err, result) => {
                    if (result) {

                        const token = JWT.sign({ UserID: UserExist._id }, process.env.APP_TOKEN, { expiresIn: "2y" })

                        res.status(200).json({
                            success: true,
                            message: "Login successfully.",
                            Image_Path: "http://localhost:3000/upload/images/profile/",
                            token: token,
                            data: UserExist
                        })

                    }
                    else {
                        res.status(200).json({
                            success: false,
                            message: "Password doesn't match."
                        })
                    }
                })
            }
            else {
                const salt = await bcrypt.genSalt(10)
                const HashPassword = await bcrypt.hash('123456789', salt)

                const CreateAccount = new UserModal({
                    name: name,
                    email: email,
                    password: HashPassword,
                    city: City,
                    tc: tc,
                    Profile_Picture: profile_picture
                })
                await CreateAccount.save()

                if (CreateAccount) {

                    const token = JWT.sign({ UserID: CreateAccount._id }, process.env.APP_TOKEN, { expiresIn: "2y" })

                    const userData = { _id: CreateAccount._id, name: CreateAccount.name, email: CreateAccount.email, tc: CreateAccount.tc, role: CreateAccount.role, Profile_Picture: CreateAccount.Profile_Picture, city: CreateAccount.city, InstallmentVerify: CreateAccount.InstallmentVerify, fcmToken: CreateAccount.fcmToken };

                    res.status(200).json({
                        succes: true,
                        message: "Registered successfully",
                        Image_Path: "http://localhost:3000/upload/images/profile/",
                        token: token,
                        data: userData
                    })
                }
                else {
                    res.status(200).json({
                        success: false,
                        message: "Something went wrong."
                    });
                }
            }
        } catch (error) {
            res.status(200).json({
                success: false,
                message: error.message
            });
        }
    }

    static Login = async (req, res) => {
        const { email, password, fcmToken } = req.body;


        // Check if the user exists with the given email
        const user = await UserModal.findOne({ email: email });

        if (!user) {
            return res.send({ "status": "failed", "message": "User Not Exist" });
        }

        if (email && password) {
            const isHashMatch = await bcrypt.compare(password, user.password);
            if (isHashMatch) {
                user.fcmToken = fcmToken
                await user.save()
                // Generate a JWT token and send the user's data without the password
                const token = JWT.sign({ UserID: user._id }, process.env.APP_TOKEN, { expiresIn: '2y' });
                const userData = { _id: user._id, name: user.name, email: user.email, tc: user.tc, role: user.role, Profile_Picture: user.Profile_Picture, city: user.city, InstallmentVerify: user.InstallmentVerify, fcmToken: user.fcmToken };

                return res.send({
                    "status": "Success",
                    "message": "Successfully logged in",
                    "Image_Path": "http://localhost:3000/upload/images/profile/",
                    "data": userData,
                    "token": token
                });

            } else {
                return res.send({ "status": "failed", "message": "Incorrect password" });
            }
        } else {
            return res.send({ "status": "failed", "message": "All fields are required" });
        }
    }

    static DelMyAcc = async (req, res) => {
        try {
            const UserId = req.user._id
            const DelMyAcc = await UserModal.findOneAndDelete({ _id: UserId })

            res.status(200).json({ success: true, message: 'Account has been deleted successfuly.' });
        } catch (error) {
            res.status(200).json({ success: false, message: error.message });
        }

    }

    static LogOut = async (req, res) => {
        try {
            const UserId = req.user._id

            await UserModal.findByIdAndUpdate({ _id: UserId }, {
                $set: {
                    fcmToken: ""
                }
            })

            res.status(200).json({
                success: true,
                message: "Logout successfully."
            })
        } catch (error) {
            res.status(200).json({
                success: false,
                message: error.message
            })
        }
    }

    static GetFCM = async (req, res) => {
        try {
            const UserId = req.params.id

            const UserFCM = await UserModal.findOne({ _id: UserId }).select('fcmToken')
            res.status(200).json({
                success: true,
                fcmToken: UserFCM.fcmToken ? UserFCM.fcmToken : null
            })
        } catch (error) {
            res.status(200).json({
                success: false,
                message: error.message
            })
        }
    }

    // User Verification Code Sent To Email
    static ForgetPassword = async (req, res) => {

        const { email } = req.body;
        if (email) {
            const userExist = await UserModal.findOne({ email: email })
            if (userExist) {
                const otp = Math.floor(1000 + Math.random() * 9000);
                // Store the OTP in the database
                const otpData = new OTP({
                    _id: new mongoose.Types.ObjectId(),
                    userId: userExist._id,
                    otpCode: otp,
                });
                await otpData.save();

                // Send the OTP via email
                const transporter = nodemailer.createTransport({
                    service: 'Gmail', // E.g., 'Gmail', 'Yahoo', etc.
                    auth: {
                        user: process.env.USER_EMAIL,
                        pass: process.env.USER_PASSCODE,
                    },
                });
                const mailOptions = {
                    from: process.env.USER_EMAIL,
                    to: email,
                    subject: 'OTP Code Of Password',
                    text: `Your OTP For Password Reset Is: ${otp}`,
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        res.status(200).json({
                            success: false,
                            message: error.message
                        });
                    } else {
                        res.status(200).json({
                            success: true,
                            message: `OTP Sent Successfully ${otp}.`,
                            id: userExist._id,
                            OTP: otp
                        });
                    }
                });

            } else {
                res.status(200).json({
                    success: false,
                    message: "Email doesn't exist."
                })
            }
        }
        else {
            res.status(200).json({
                success: false,
                message: "Email must be required."
            })
        }
    }

    static ForgetPasswordCodeVerify = async (req, res) => {
        try {
            const code = req.params.code

            if (!code) {
                return res.status(200).json({
                    success: false,
                    message: "Code must be filled."
                })
            }
            const codeVerified = await OTP.findOne({ otpCode: code })

            if (!codeVerified) {
                return res.status(200).json({
                    success: false,
                    message: "Code doesn't verified."
                })
            }
            res.status(200).json({
                success: true,
                message: "Code has been verified."
            })

        } catch (error) {
            res.status(200).json({
                success: false,
                message: error.message
            })
        }
    }

    static ChangePassword = async (req, res) => {
        try {
            const {id, password} = req.body

            if (!id || !password) {
                return res.status(200).json({
                    success: false,
                    message: "Filled all fields."
                })
            }

            const salt = await bcrypt.genSalt(10)
            const HashPassword = await bcrypt.hash(password, salt)

            const codeVerified = await UserModal.findOneAndUpdate({_id: id},{
                $set: {
                    password: HashPassword
                }
            }, {new: true})

            res.status(200).json({
                success: true,
                message: "Password has been changed successfuly.",
                data: codeVerified
            })

        } catch (error) {
            res.status(200).json({
                success: false,
                message: error.message
            })
        }
    }

    static ProfileUpdate = async (req, res) => {
        try {
            const { city } = req.body;
            const User = req.user

            if (!city) {
                return res.status(200).json({
                    success: false,
                    message: "City is required.",
                });
            }

            User.city = city
            await User.save();

            // Generate a JWT token and send the user's data without the password
            const token = JWT.sign({ UserID: User._id }, process.env.APP_TOKEN, { expiresIn: '2y' });
            const userData = { _id: User._id, name: User.name, email: User.email, tc: User.tc, role: User.role, Profile_Picture: User.Profile_Picture, city: User.city, InstallmentVerify: User.InstallmentVerify, fcmToken: User.fcmToken };

            res.send({
                status: true,
                message: "Profile has been updated.",
                Image_Path: "http://localhost:3000/upload/images/profile/",
                data: userData,
                token: token
            });
        } catch (error) {
            res.status(200).json({
                success: false,
                message: error.message,
            });
        }
    }

}


module.exports = AuthController;
