const mongoose = require("mongoose");

const MessagesModalSchema = new mongoose.Schema({
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        require: true,
    },
    reciever_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        require: true,
    },
    messages: [{
        senderId: mongoose.Schema.Types.ObjectId,
        message: String,
        timestamp: Date
    }]
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

const MessagesModal = mongoose.model('Messages', MessagesModalSchema);

module.exports = MessagesModal;
