const credentials = require('../middleware/credentials');
const allowedOrigins = require('./allowedOrigins');

const corsOptions =  {
    origin: (origin,callback) => {
        if(allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null,true);
        }
        else callback(new Error("Not allowed by CORS"));
    },
    status: 200,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
};

module.exports = corsOptions;