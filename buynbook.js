const express = require('express')
const ConnectDb = require('./database/ConnectDb.js')
ConnectDb()
const Route = require('./Routes.js')
const cors = require('cors');

const app = express()
app.use(cors())

const http = require('http');
const server = http.createServer(app);

const PORT = process.env.PORT || 3027

app.use(express.json())


app.use('/Profile_Picture', express.static('upload/images/Profile_Picture'));
app.use('/Sell_Pictures', express.static('upload/images/Sell_Pictures'));
app.use('/Installment_Pictures', express.static('upload/images/Installment_Pictures'));
app.use('/Booking_Pictures', express.static('upload/images/Booking_Pictures'));
app.use('/logo', express.static('upload'))

app.use("/buynbook/api", Route)

//listening port runnig server
server.listen(PORT, () => {
    console.log(`listening on port : ${PORT}/`)
})


