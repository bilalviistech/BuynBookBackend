const mongoose = require('mongoose');

const categoriesEnum = [
    "Mobiles",
    "Vehicles",
    "Bike",
    "Properties",
    "Electronics & Home Appliance",
    "Business & Agricultural",
    "Animals",
    "Furniture & Home Decor",
    "Fashion & Beauty",
    "Books & Sports & Hobbies",
    "Kids",
];

const PostSellAdModal = new mongoose.Schema({

    id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        require: true,
    },
    Profile_Picture: {
        type: String,
        require: false,
    },
    name: {
        type: String,
        require: false,
    },
    Product_name: {
        type: String,
        require: true,
    },
    Price: {
        type: String,
        require: true,
    },
    Post_Description: {
        type: String,
        require: true,
    },
    Phone_Number: {
        type: String,
        require: true,
    },
    Optional_Number: {
        type: String,
        require: false,
    },
    City: {
        type: String,
        require: true,
    },
    location: {
        type: String,
        require: true,
    },
    Ad_Image: Array,
    Post_Like: [],
    Catagories: {
        type: String,
        enum: categoriesEnum,
        required: true
    },
    AdType: {
        type: String,
        require: false,
    },

    //add Extra fields
    Brand: {
        type: String,
        require: false,
    },
    Condition: {
        type: String,
        require: false,
    },

    //Vehicle
    Mileage: {
        type: String,
        require: false,
    },
    Engine_CC: {
        type: String,
        require: false,
    },

    //HOme
    Home_Type: {
        type: String,
        require: false,
    },

    //animal
    Age: {
        type: String,
        require: false,
    },
    Gender: {
        type: String,
        require: false,
    },

    //Properties
    Room: {
        type: String,
        require: false,
    },
    BathRoom: {
        type: String,
        require: false,
    },


}, { timestamps: true })

const PostSellAd = mongoose.model('Sell', PostSellAdModal);

module.exports = PostSellAd;