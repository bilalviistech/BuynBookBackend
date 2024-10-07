const mongoose = require("mongoose");

const ChatListSchema = new mongoose.Schema({
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
    lastMessage: {
        message: String,
        senderId: mongoose.Schema.Types.ObjectId,
        TimeStamp: Date
    },
    senderData:
    {
        sender_id: mongoose.Schema.Types.ObjectId,
        sender_Image: String,
        Sender_name: String,
    },
    recieverData: {
        reciever_id: mongoose.Schema.Types.ObjectId,
        reciever_Image: String,
        reciever_name: String,
    },
    Ad_Image: String,
    AdType: String
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

const ChatListModal = mongoose.model('ChatList', ChatListSchema);

module.exports = ChatListModal;
