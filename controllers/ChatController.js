const ChatListModal = require('../models/ChatListModal.js')
const MessagesModal = require('../models/MessagesModal.js')


class ChatController {

    static getAllChatUsers = async (req, res) => {


        const userData = req.user

        
        const existingChats = await ChatListModal.find({
            $or: [
                { sender_id: userData._id },
                { reciever_id: userData._id },
            ]
        });

        res.send({
            "success": true,
            "data": existingChats
        });
    }

    static getChat = async (req, res) => {
        try {
            const { id, FriendId } = req.body;
    
            console.log("id friend id", id, ".......", FriendId);
    
            const existingChats = await MessagesModal.find({
                $or: [
                    { $and: [{ sender_id: id }, { reciever_id: FriendId }] },
                    { $and: [{ sender_id: FriendId }, { reciever_id: id }] },
                ]
            });
    
            console.log("existingChats", existingChats);
    
            if (existingChats.length === 0) {
                return res.status(404).send({
                    "success": false,
                    "message": "No existing chats found."
                });
            }
    
            res.send({
                "success": true,
                "data": existingChats
            });
        } catch (error) {
            console.error("Error fetching chat:", error);
            res.status(500).send({
                "success": false,
                "message": "Error fetching chat."
            });
        }
    }
    

}


module.exports = ChatController;