const mongoose = require('mongoose')
const env = require('dotenv').config()

const dbConnect = async ()=>{
try {
    const connect = await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')
} catch (error) {
    console.log(error)
    process.exit()
}
}

module.exports = dbConnect