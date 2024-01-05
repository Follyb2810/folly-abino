const jwt = require('jsonwebtoken');

const JsonSignToken = (payload,expires) => {
    const getToken = jwt.sign(payload, process.env.SECRET_STR, { expiresIn: expires });
    return getToken;
};
const JsonVerifyToken = (payload) => {
    const getVerifyToken = jwt.verify(payload, process.env.SECRET_STR);
    return getVerifyToken;
};

module.exports = {
    JsonSignToken,JsonVerifyToken
};
