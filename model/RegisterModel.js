const  mongoose = require('mongoose');
const validator = require('validator')



const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        require:[true,'name is requires'],
        trim:true,
    },
    Age:{
        type:String,
        require:[true,'name is requires'],
        trim:true,
    },
    location:{
        type:String,
        
    },
    skin:{
        type:String,
        require:[true,'skin is requires'],
        trim:true,
    },
    image:{
        type:String,
        trim:true,
    },
    email:{
        unique:true,
        type:String,
        required:[true,'please enter an email'],
        lowercase:true,
        validate:[validator.isEmail,'please enter valid email']
    },
    role:{
        type:String,
        enum:["user","admin","editor"],
        default:'user'
    },
    password:{
        require:[true,'please enter the password and must be more than 5 '],
        type:String,
        minLength:5,
        select:false
    },
    refreshToken:String, 
})


const User = mongoose.model('User',UserSchema)

module.exports = User


// username: '',
// Age: '',
// location: '',
// skin: '',
// occupation: '',
// password: '',
// confirmPassword: '',
// image: '',
