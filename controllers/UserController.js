const User = require('../models/UserModal.js')


class UserController {
    static async getUserById (req, res){
        const {UserId} = req.body

        const userData = await User.findById(UserId)

        if(userData){
            res.send({
                "status": true,
                "data": userData
            })
        }else{
            res.send({
                "status": false,
                "data": "User not found"
            })
        }
    }

    static async GetAllUser (req, res)  {
        try {
            const PageNumber = req.query.page || 1;
            const PageLimitData = 20;
    
            const AllUser = await User.paginate({}, { page: PageNumber, limit: PageLimitData })
    
            res.status(200).json({
                success: true,
                data: AllUser
            })
        } catch (error) {
            res.status(200).json({
                success: false,
                message: error.message
            })
        }
    }

    static async GetAllVerifiedCount (req, res){
        try{
            const GetAllVerifiedCount = await User.find({InstallmentVerify: "Approved"})
            res.status(200).json({
                success: true,
                data: GetAllVerifiedCount,
                count: GetAllVerifiedCount.length
            })
        } catch (error){
            res.status(200).json({
                success: false,
                message: error.message,
            })
        }
    }

    static async GetUserVerifyPending (req, res){
        const PageNumber = req.query.page || 1;
        const PageLimitData = 20;

        try {
            const GetUserVerifyPending = await User.paginate({InstallmentVerify: "Pending"}, { page: PageNumber, limit: PageLimitData })

            res.status(200).json({
                success: true,
                data: GetUserVerifyPending
            })
        } catch (error) {
            res.status(200).json({
                success: false,
                data: error.message
            })
        }
    }

    static async UserAcpOrReject (req, res){
        const {ID, status} = req.body

        try {
            await User.findOneAndUpdate({_id: ID}, {
                $set: {
                    InstallmentVerify: status 
                }
            })
    
            res.status(200).json({
                success: true,
                message: `The user verification is ${status}`
            })
        } catch (error) {
            res.status(200).json({
                success: false,
                message: error.message
            })
        }
    }
}


module.exports = UserController;