const express = require('express')
const multer = require('multer')
const path = require('path')

//controllers
const AuthController = require('./controllers/AuthController.js')
const AdPostController = require('./controllers/AdPostController.js')

//middleware
const checkUserAuth = require('./middleware/Auth_Middleware.js')
const UserController = require('./controllers/UserController.js')
const ChatController = require('./controllers/ChatController.js')
const pushNotifyController  = require('./controllers/PushNotifyController')

const Route = express.Router()


//multer code upload profile picture
const Profile_Picture_Storage = multer.diskStorage({
    destination: './upload/images/Profile_Picture',
    filename: (req, file, cb) => {
        const splitString = file.mimetype.split('image/')
        cb(null, Date.now() + '.' + splitString[1]);
    }
})
const Profile_Picture_Upload = multer({
    storage: Profile_Picture_Storage
})

//multer code upload profile picture
const Verify_Nic_Storage = multer.diskStorage({
    destination: './upload/images/NIC',
    filename: (req, file, cb) => {
        const splitString = file.mimetype.split('image/')
        cb(null, Date.now() + '.' + splitString[1]);
    }
})
const Verify_Nic_Upload = multer({
    storage: Verify_Nic_Storage
})



//multer code upload Sell picture
const Post_Sell_PictureUpload = multer({ storage: multer.memoryStorage() });

//multer upload in Installmetn Picture
const Post_Installment_PictureUpload = multer({ storage: multer.memoryStorage() });


//multer upload in Booking Picture
const Post_Booking_PictureUpload = multer({ storage: multer.memoryStorage() });

const upload = multer({ storage: multer.memoryStorage() });  // Configure multer to use memory storage



//middle ware route
Route.use('/PostAdInSell', checkUserAuth)
Route.use('/GetAdsByCatagories', checkUserAuth)
Route.use('/GetAllSellAds', checkUserAuth)
Route.use('/DeleteSellAds', checkUserAuth)
Route.use('/GetAllAds', checkUserAuth)
Route.use('/GetInstallmentStatus', checkUserAuth)
//installment route
Route.use('/PostAdsInInstallment', checkUserAuth)
Route.use('/GetInstallmentAdsByCatagories', checkUserAuth)
Route.use('/GetAllInstallmentAds', checkUserAuth)
Route.use('/InstallmentVerifyAcc', checkUserAuth)
//Booking route
Route.use('/PostAdsInBooking', checkUserAuth)
Route.use('/GetBookingAdsByCatagories', checkUserAuth)
Route.use('/GetAllBookingAds', checkUserAuth)
//Chat
Route.use('/getAllChatUsers', checkUserAuth)
Route.use('/getChat', checkUserAuth)

//Authentication Routes
Route.post('/Register', Profile_Picture_Upload.single('profile'), AuthController.Register)
Route.post('/SocialAuthRegister', AuthController.SocialAuthRegister)
Route.post('/ProfileUpdate', checkUserAuth, AuthController.ProfileUpdate)
Route.post('/Login', AuthController.Login)
Route.post('/DelMyAcc', checkUserAuth, AuthController.DelMyAcc)
Route.post('/LogOut', checkUserAuth, AuthController.LogOut)
Route.get('/GetFCM/:id', checkUserAuth, AuthController.GetFCM)
Route.post('/ForgetPassword', AuthController.ForgetPassword)
Route.get('/ForgetPasswordCodeVerify/:code', AuthController.ForgetPasswordCodeVerify)
Route.post('/Change-Password', AuthController.ChangePassword)

// Define the route
Route.post('/send-notification', pushNotifyController.sendNotification.bind(pushNotifyController));


//Protected Route
//get user data by uid
Route.post('/getUserById', UserController.getUserById)
Route.get('/GetAllUser', UserController.GetAllUser)
Route.get('/GetAllVerifiedCount',checkUserAuth, UserController.GetAllVerifiedCount)
Route.get('/GetUserVerifyPending',checkUserAuth, UserController.GetUserVerifyPending)
Route.post('/UserAcpOrReject',checkUserAuth, UserController.UserAcpOrReject)

//get all my ads
Route.get('/GetAllAds', AdPostController.GetAllAds)
Route.get('/GetInstallmentStatus', AdPostController.GetInstallmentStatus)

// get ads by id
Route.get('/GetAdsById/:AdId/:type', AdPostController.GetAdsById)

//sell Route
Route.post('/PostAdInSell', Post_Sell_PictureUpload.array('Ad_Image', 3), AdPostController.PostAdInSell)
Route.post('/GetSellAdsByCatagories', AdPostController.GetSellAdsByCatagories)
Route.post('/GetAllSellAds', AdPostController.GetAllSellAds)
Route.post('/DeleteMyAds/:ID/:type', AdPostController.DeleteMyAds)

//Installment Route
Route.post('/PostAdsInInstallment', Post_Installment_PictureUpload.array('Ad_Image', 3), AdPostController.PostAdsInInstallment)
Route.post('/GetInstallmentAdsByCatagories', AdPostController.GetInstallmentAdsByCatagories)
Route.post('/GetAllInstallmentAds', AdPostController.GetAllInstallmentAds)
Route.post('/InstallmentVerifyAcc', Verify_Nic_Upload.fields([ { name: 'FrontPic', maxCount: 1 }, { name: 'BackPic', maxCount: 1 }, { name: 'ProfilePic', maxCount: 1 } ]),AdPostController.InstallmentVerifyAcc)


//Booking Route
Route.post('/PostAdsInBooking', Post_Booking_PictureUpload.array('Ad_Image', 3), AdPostController.PostAdsInBooking)
Route.post('/GetBookingAdsByCatagories', AdPostController.GetBookingAdsByCatagories)
Route.post('/GetAllBookingAds', AdPostController.GetAllBookingAds)

//search
Route.post('/SearchSellAds', AdPostController.SearchSellAds)
Route.post('/SearchBookingAds', AdPostController.SearchBookingAds)
Route.post('/SearchInstallmentAds', AdPostController.SearchInstallmentAds)


//Chating
Route.get('/getAllChatUsers', ChatController.getAllChatUsers)
Route.post('/getChat', ChatController.getChat)


module.exports = Route