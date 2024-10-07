const PostAdInSellModal = require('../models/PostSellAdModal.js')
const PostAdInInstallmentModal = require('../models/PostInstallmentAdModal.js')
const PostAdInBookingModal = require('../models/PostBookAdModal.js');
const uploadImageToS3 = require('../aws/S3Bucket.js');
const UploadingToAws = require('../aws/UploadingToAws.js');
const User = require('../models/UserModal.js')

// add node-cache
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 600 });

class AdPostController {

    //sell Product start
    static async PostAdInSell(req, res) {

        const userData = req.user;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const { Post_Description, Post_Like, Catagories, Product_name, Price, Brand, Condition, Mileage, Engine_CC, Phone_Number, Optional_Number, City, location, Home_Type, Age, Gender, Room, BathRoom } = req.body

        if (Product_name == undefined) {
            res.send({
                "Status": false,
                "Message": "Please enter a name"
            })
        } else if (Phone_Number == undefined) {
            res.send({
                "Status": false,
                "Message": "Please enter a Phone Number"
            })
        } else if (Price == undefined) {
            res.send({
                "Status": false,
                "Message": "Please enter a Price"
            })
        } else if (location == undefined) {
            res.send({
                "Status": false,
                "Message": "Please enter a Location"
            })
        } else if (City == undefined) {
            res.send({
                "Status": false,
                "Message": "Please enter a City"
            })
        } else {

            console.log("req", req)
            const AllUploadedImages = await UploadingToAws(req)


            const PostSellAd = new PostAdInSellModal({
                id: userData._id,
                Profile_Picture: userData.Profile_Picture,
                name: userData.name,
                Post_Description: Post_Description,
                Post_Like: Post_Like,
                Catagories: Catagories,
                AdType: "sell",
                Product_name: Product_name,
                Price: Price,
                Brand: Brand,
                Condition: Condition,
                Ad_Image: AllUploadedImages,
                Optional_Number: Optional_Number,
                City: City,
                location: location,
                Phone_Number: Phone_Number,
                Mileage: Mileage,
                Engine_CC: Engine_CC,
                Home_Type: Home_Type,
                Age: Age,
                Gender: Gender,
                Room: Room,
                BathRoom: BathRoom
            })

            PostSellAd.save().then(() => {
                res.send({
                    "Status": true,
                    "Message": "Successfilly added"
                })
            }).catch(err => {
                console.log("first", err)
                res.send({
                    "Status": false,
                    "Message": "Something wennt wrong"
                })
            })
        }
    }

    static async GetSellAdsByCatagories(req, res) {
        const { catagories, page, city } = req.body; // Use req.query instead of req.body

        const perPage = 10; // Number of items per page

        const today = new Date();
        const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

        try {
            const DeleteAllAdsAbove30 = await PostAdInSellModal.find({ createdAt: { $lte: thirtyDaysAgo } })
            if(DeleteAllAdsAbove30.length> 0){
                for(let i=0; i< DeleteAllAdsAbove30.length;i++){
                    await PostAdInSellModal.findByIdAndDelete({ _id: DeleteAllAdsAbove30[i]._id})
                }

            }

            const ads = await PostAdInSellModal.find({ Catagories: catagories,  createdAt: { $gte: thirtyDaysAgo } })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();


            const myCityAds = ads.filter(ad => ad.City == city)
            const otherCityAds = ads.filter(ad => ad.City != city)

            const attachCity = [...myCityAds, ...otherCityAds]


            const totalAdsCount = await PostAdInSellModal.countDocuments({ Categories: catagories });

            if (ads.length > 0) {

                res.send({
                    "success": true,
                    "message": "All Ads",
                    "data": attachCity,
                    "currentPage": page,
                    "totalPages": Math.ceil(totalAdsCount / perPage)

                })
            } else {
                res.send({
                    "success": false,
                    "message": "No ad found",
                    "totalPages": Math.ceil(totalAdsCount / perPage)

                })
            }
        } catch (error) {
            res.send({
                "success": false,
                "message": error.message,

            })
        }

    }

    static async GetAllSellAds(req, res) {
        const { page, city } = req.body;
        const perPage = 10;

        const today = new Date();
        const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

        try {
            const DeleteAllAdsAbove30 = await PostAdInSellModal.find({ createdAt: { $lte: thirtyDaysAgo } })
            if(DeleteAllAdsAbove30.length> 0){
                for(let i=0; i< DeleteAllAdsAbove30.length;i++){
                    await PostAdInSellModal.findByIdAndDelete({ _id: DeleteAllAdsAbove30[i]._id})
                }

            }

            const getAllAds = await PostAdInSellModal.find({ createdAt: { $gte: thirtyDaysAgo } })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

            console.log("city", city)



            const totalAdsCount = await PostAdInSellModal.countDocuments();

            const myCityads = getAllAds.filter(ad => ad.City == city);

            const otherCityAds = getAllAds.filter(ad => ad.City !== city);

            const newArray = [...myCityads, ...otherCityAds]



            if (getAllAds.length > 0) {
                res.send({
                    "success": true,
                    "ads": newArray,
                    "currentPage": page,
                    "totalPages": Math.ceil(totalAdsCount / perPage)
                });
            } else {
                res.send({
                    "success": false,
                    "message": "No ads found"
                });
            }
        } catch (error) {
            res.status(500).send({
                success: false,
                message: "Error fetching ads",
                error: error.message
            });
        }
    }

    static async SearchSellAds(req, res) {

        const { query } = req.query; // Get the search query from the request query parameters
        try {
            // Perform the search in the database
            const searchResults = await PostAdInSellModal.find({
                $or: [
                    { name: { $regex: query, $options: 'i' } }, // Case-insensitive search by name
                    { Catagories: { $regex: query, $options: 'i' } }, // Case-insensitive search by category
                    { location: { $regex: query, $options: 'i' } }, // Case-insensitive search by location
                ]
            });

            res.json({ success: true, data: searchResults }); // Send the search results as JSON response
        } catch (error) {
            console.error('Error performing search:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }


    }
    static async DeleteMyAds(req, res) {
        const ID = req.params.ID
        const Adtype = req.params.type

        try {
            if(Adtype === "sell"){
                await PostAdInSellModal.findOneAndDelete({_id: ID})
            }
            else if(Adtype === "installment"){
                await PostAdInInstallmentModal.findOneAndDelete({_id: ID})
            }
            else if(Adtype === "booking"){
                await PostAdInBookingModal.findOneAndDelete({_id: ID})
            }

            res.send({
                success: true,
                message: "Ad deleted successfuly."
            });
        } catch (error) {
            res.send({
                success: false,
                message: error.message
            });
        }
    }
    //sell Products end

    //so now i am starting the installment apis

    static async InstallmentVerifyAcc(req, res) {

        try {
            const UserId = req.user._id
            const { nic } = req.body
            const { FrontPic, BackPic, ProfilePic } = req.files;
    
            const FrontPicObj = FrontPic[0];
            if(!FrontPicObj){
                res.send({
                    success: false,
                    Message: "Front pic must be attached."
                })
            }

            const BackPicObj = BackPic[0]
            if(!BackPicObj){
                res.send({
                    success: false,
                    Message: "Back pic must be attached."
                })
            }

            const ProfilePicObj = ProfilePic[0]
            if(!ProfilePicObj){
                res.send({
                    success: false,
                    Message: "Profile pic must be attached."
                })
            }
    
            const Obj = {
                nic : nic,
                FrontPic: FrontPicObj.path,
                BackPic: BackPicObj.path,
                ProfilePic: ProfilePicObj.path,
            }
    
            await User.findByIdAndUpdate({_id: UserId}, {
                $set: {
                    UserVerify: Obj,
                    InstallmentVerify: "Pending"
                }
            })
    
            res.send({
                success: true,
                Message: "Verifying your account."
            })
        } catch (error) {
            res.send({
                success: false,
                Message: error.message
            })
        }
    }

    static async PostAdsInInstallment(req, res) {

        const userData = req.user;

        try {
            if(userData.InstallmentVerify === false){
                return res.send({
                    Status: false,
                    Message: "Verify your account"
                })
            }
    
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: 'No files uploaded' });
            }
    
            const { Post_Description, Post_Like, Catagories, Product_name, Advance_Payment, Monthly_Payment, Total_Month_Of_Installment, Brand, Condition, Mileage, Engine_CC, Phone_Number, Optional_Number, City, location, Home_Type, Age, Gender, Room, BathRoom } = req.body
    
            if (Product_name == undefined) {
                res.send({
                    "Status": false,
                    "Message": "Please enter a name"
                })
            } else if (Phone_Number == undefined) {
                res.send({
                    "Status": false,
                    "Message": "Please enter a Phone Number"
                })
            } else if (Advance_Payment == undefined) {
                res.send({
                    "Status": false,
                    "Message": "Please enter a Advancement Payment"
                })
            } else if (Monthly_Payment == undefined) {
                res.send({
                    "Status": false,
                    "Message": "Please enter a Monthly Payment"
                })
            } else if (Total_Month_Of_Installment == undefined) {
                res.send({
                    "Status": false,
                    "Message": "Please enter a Total Monthly Payment"
                })
            } else if (location == undefined) {
                res.send({
                    "Status": false,
                    "Message": "Please enter a Location"
                })
            } else if (City == undefined) {
                res.send({
                    "Status": false,
                    "Message": "Please enter a City"
                })
            } else {
                const AllUploadedImages = await UploadingToAws(req)
    
                const PostSellAd = new PostAdInInstallmentModal({
                    id: userData._id,
                    Profile_Picture: userData.Profile_Picture,
                    name: userData.name,
                    Post_Description: Post_Description,
                    Post_Like: Post_Like,
                    Catagories: Catagories,
                    AdType: "installment",
                    Product_name: Product_name,
                    Advance_Payment: Advance_Payment,
                    Monthly_Payment: Monthly_Payment,
                    Total_Month_Of_Installment: Total_Month_Of_Installment,
                    Brand: Brand,
                    Condition: Condition,
                    Ad_Image: AllUploadedImages,
                    Optional_Number: Optional_Number,
                    City: City,
                    location: location,
                    Phone_Number: Phone_Number,
                    Mileage: Mileage,
                    Engine_CC: Engine_CC,
                    Home_Type: Home_Type,
                    Age: Age,
                    Gender: Gender,
                    Room: Room,
                    BathRoom: BathRoom
                })
    
                PostSellAd.save().then(() => {
                    res.send({
                        "Status": true,
                        "Message": "Successfilly added"
                    })
                }).catch(err => {
                    console.log(err)
                    res.send({
                        "Status": false,
                        "Message": "Something wennt wrong"
                    })
                })
            }
        } catch (error) {
            res.send({
                "Status": false,
                "Message": error.message
            })
        }
    }

    static async GetInstallmentAdsByCatagories(req, res) {
        const { catagories, page, city } = req.body

        const perPage = 10; // Number of items per page
        if (catagories != "") {

            const ads = await PostAdInInstallmentModal.find({ Catagories: catagories })
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();

            const totalAdsCount = await PostAdInInstallmentModal.countDocuments({ Catagories: catagories });

            const myCityAds = ads.filter(ad => ad.City == city)
            const otherCityAds = ads.filter(ad => ad.City != city)

            const attachCity = [...myCityAds, ...otherCityAds]

            if (ads.length > 0) {

                res.send({
                    "success": true,
                    "message": "All Ads",
                    "data": attachCity,
                    "currentPage": page,
                    "totalPages": Math.ceil(totalAdsCount / perPage)

                })
            } else {
                res.send({
                    "success": false,
                    "message": "No ad found",
                    "totalPages": Math.ceil(totalAdsCount / perPage)

                })
            }

        } else {
            res.send({
                "success": false,
                "message": "what is the catagories ",


            })
        }

    }

    static async GetAllInstallmentAds(req, res) {
        const { page, city } = req.body;
        const perPage = 10;

        try {
            const getAllAds = await PostAdInInstallmentModal.find()
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();




            const totalAdsCount = await PostAdInInstallmentModal.countDocuments();

            const myCityads = getAllAds.filter(ad => ad.City == city);

            const otherCityAds = getAllAds.filter(ad => ad.City !== city);

            const newArray = [...myCityads, ...otherCityAds]



            if (getAllAds.length > 0) {
                res.send({
                    "success": true,
                    "ads": newArray,
                    "currentPage": page,
                    "totalPages": Math.ceil(totalAdsCount / perPage)
                });
            } else {
                res.send({
                    "success": false,
                    "message": "No ads found"
                });
            }
        } catch (error) {
            res.status(500).send({
                success: false,
                message: "Error fetching ads",
                error: error.message
            });
        }
    }

    static async SearchInstallmentAds(req, res) {

        const { query } = req.query; // Get the search query from the request query parameters
        try {
            // Perform the search in the database
            const searchResults = await PostAdInInstallmentModal.find({
                $or: [
                    { name: { $regex: query, $options: 'i' } }, // Case-insensitive search by name
                    { Catagories: { $regex: query, $options: 'i' } }, // Case-insensitive search by category
                    { location: { $regex: query, $options: 'i' } }, // Case-insensitive search by location
                ]
            });

            res.json({ success: true, data: searchResults }); // Send the search results as JSON response
        } catch (error) {
            console.error('Error performing search:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }


    }

    static async GetInstallmentStatus(req, res) {
        try {
            const UserId = req.user._id

            const UserStatus = await User.findOne({_id: UserId})
    
            res.status(200).json({
                success: true,
                data: UserStatus
            })
        } catch (error) {
            res.status(200).json({
                success: false,
                message: error.message
            })
        }
    }
    //Installment Products end


    //so now i am starting the Booking apis

    static async PostAdsInBooking(req, res) {

        const userData = req.user;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const { Post_Description, Post_Like, Catagories, Product_name, Price, Availability, Place_type, Loader_type, Total_person, Seats, Brand, Condition, Mileage, Engine_CC, Phone_Number, Optional_Number, City, location, } = req.body

        if (Product_name == undefined) {
            res.send({
                "Status": false,
                "Message": "Please enter a name"
            })
        } else if (Phone_Number == undefined) {
            res.send({
                "Status": false,
                "Message": "Please enter a Phone Number"
            })
        } else if (location == undefined) {
            res.send({
                "Status": false,
                "Message": "Please enter a Location"
            })
        } else if (City == undefined) {
            res.send({
                "Status": false,
                "Message": "Please enter a City"
            })
        } else {
            const AllUploadedImages = await UploadingToAws(req)

            const PostSellAd = new PostAdInBookingModal({
                id: userData._id,
                Profile_Picture: userData.Profile_Picture,
                name: userData.name,
                Post_Description: Post_Description,
                Post_Like: Post_Like,
                Catagories: Catagories,
                AdType: "booking",
                Product_name: Product_name,
                Brand: Brand,
                Condition: Condition,
                Ad_Image: AllUploadedImages,
                Optional_Number: Optional_Number,
                City: City,
                location: location,
                Phone_Number: Phone_Number,
                Mileage: Mileage,
                Engine_CC: Engine_CC,
                Place_type: Place_type,
                Price: Price,
                Availability: Availability,
                Loader_type: Loader_type,
                Total_person: Total_person,
                Seats: Seats

            })

            PostSellAd.save().then(() => {
                res.send({
                    "Status": true,
                    "Message": "Successfilly added"
                })
            }).catch(err => {
                res.send({
                    "Status": false,
                    "Message": "Something wennt wrong"
                })
            })
        }
    }

    static async GetBookingAdsByCatagories(req, res) {

        //bookinfg
        const { catagories, page, city } = req.body


        console.log("first", catagories, page, city)

        const perPage = 10; // Number of items per page
        if (catagories != "") {
            const ads = await PostAdInBookingModal.find({ Catagories: catagories })
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();

            const totalAdsCount = await PostAdInBookingModal.countDocuments({ Catagories: catagories, });

            const myCityAds = ads.filter(ad => ad.City == city)
            const otherCityAds = ads.filter(ad => ad.City != city)

            const combineAds = [...myCityAds, ...otherCityAds]


            res.send({
                "success": true,
                "message": "All Ads",
                "data": combineAds,
                "currentPage": page,
                "totalPages": Math.ceil(totalAdsCount / perPage)

            })
        } else {
            res.send({
                "success": false,
                "message": "No ad found",
                "totalPages": Math.ceil(totalAdsCount / perPage)

            })
        }



    }

    static async GetAllBookingAds(req, res) {
        const { page, city } = req.body;
        const perPage = 10;

        try {
            const getAllAds = await PostAdInBookingModal.find()
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();


            const myCityAds = getAllAds.filter(ad => ad.City == city);
            const otherCityAds = getAllAds.filter(ad => ad.City != city)

            const combineCityAds = [...myCityAds, ...otherCityAds]

            const totalAdsCount = await PostAdInBookingModal.countDocuments();



            if (getAllAds.length > 0) {
                res.send({
                    "success": true,
                    "ads": combineCityAds,
                    "currentPage": page,
                    "totalPages": Math.ceil(totalAdsCount / perPage)
                });
            } else {
                res.send({
                    "success": false,
                    "message": "No ads found"
                });
            }
        } catch (error) {
            res.status(500).send({
                success: false,
                message: "Error fetching ads",
                error: error.message
            });
        }
    }

    static async SearchBookingAds(req, res) {

        const { query } = req.query; // Get the search query from the request query parameters
        try {
            // Perform the search in the database
            const searchResults = await PostAdInBookingModal.find({
                $or: [
                    { name: { $regex: query, $options: 'i' } }, // Case-insensitive search by name
                    { Catagories: { $regex: query, $options: 'i' } }, // Case-insensitive search by category
                    { location: { $regex: query, $options: 'i' } }, // Case-insensitive search by location
                ]
            });

            res.json({ success: true, data: searchResults }); // Send the search results as JSON response
        } catch (error) {
            console.error('Error performing search:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }


    }
    //Booking Products end

    // Get All Ads
    static async GetAllAds(req, res) {
        try {
            const UserId = req.user._id;
    
            // Run queries in parallel
            const [SellAds, InInstallmentAds, BookingAds] = await Promise.all([
                PostAdInSellModal.find({ id: UserId }),
                PostAdInInstallmentModal.find({ id: UserId }),
                PostAdInBookingModal.find({ id: UserId })
            ]);
    
            const AllAds = [...SellAds, ...InInstallmentAds, ...BookingAds];
    
            res.status(200).json({
                success: true,
                data: AllAds
            });
        } catch (error) {
            res.status(200).json({
                success: false,
                message: error.message
            });
        }
    }
    
    static async GetAdsById(req, res){
        const Id = req.params.AdId
        const Type = req.params.type

        try {
            let adObj = {}

            if(Type === "sell"){
                adObj = await PostAdInSellModal.findOne({_id: Id})
            }
            else if(Type === "installment"){
                adObj = await PostAdInInstallmentModal.findOne({_id: Id})
            }
            else if(Type === "booking"){
                adObj = await PostAdInBookingModal.findOne({_id: Id})
            }
    
            res.status(200).json({
                success: true,
                data: adObj
            })
        } catch (error) {
            res.status(200).json({
                success: false,
                message: error.message
            })
        }
    }

}

module.exports = AdPostController