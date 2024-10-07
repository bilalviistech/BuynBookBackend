const mongoose = require('mongoose'); // include mongodb package
const mongoosePaginate = require('mongoose-paginate-v2');


const UserModal = mongoose.Schema({

    name:{
        type: String,
        require: true, 
    },
    email:{
        type: String,
        require: true,
        unique: [true, "Email id already exists"],
    },
    isOnline: {
        type : Boolean,
    },
    password:{
        type: String,
        require: true
    },
    Phone:{
        type: String,
        require: true
    },
    Profile_Picture:  {
        type: String,
        require: false

    },
    city: String,
    socketId: String,
    InstallemtProvider: Boolean,
    InstallmentVerify:{
        type: String,
        required: true,
        enum: ["Not Applied","Pending","Approved","Rejected"],
        default: "Not Applied"
    },
    UserVerify: {
        type: Object,
    },
    fcmToken: {
        type: String
    }
    
},{timestamps: true})

UserModal.plugin(mongoosePaginate);
const User = mongoose.model('User', UserModal);

module.exports  =  User;