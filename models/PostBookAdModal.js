const mongoose = require('mongoose');

const categoriesEnum = [
    "Shaddi Halls",
    "Farmhouses",
    "Van",
    "Saman loader",
    "Hotels",
    "car",
    "event management",
    "Places for event",
    "Surprise Box"
    
];

const PostBookAdModal = new mongoose.Schema({

    id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User models
        require: true,
    },
    Profile_Picture: {
        type: String,
        require: false,
    },
    name:{
        type: String,
        require: false,
    },
    Product_name: {
        type: String,
        require: true,
    },
    Price:  {
        type: String,
        require: false,
    },
    Post_Description:  {
        type: String,
        require: true,
    },
    Availability: {
        type: String,
        require: true,
    },
    Phone_Number:  {
        type: String,
        require: true,
    },
    Optional_Number:  {
        type: String,
        require: false,
    },
    City:  {
        type: String,
        require: true,
    },
    location:  {
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
    Brand:  {
        type: String,
        require: false,
    },
    Condition: {
        type: String,
        enum: ["New", "Used"],
    },

    //Vehicle
    Mileage:  {
        type: String,
        require: false,
    },
    Engine_CC:  {
        type: String,
        require: false,
    },

    //place
    Place_type: {
        type: String,
        enum: ["Flat", "House", "Plot"],
        require: false,
    },

    //
    Loader_type:{
        type: String,
        require: false,  
    },
    Total_person:{
        type: String,
        require: false, 
    },
    Seats:{
        type: String,
        require: false, 
    }

}, { timestamps: true })

const PostBookingAd = mongoose.model('Booking', PostBookAdModal);

module.exports = PostBookingAd;