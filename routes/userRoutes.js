const express = require("express");
const { SignUp, getFolly, SignIn, UpdateUser, protectedRoutes, Logout } = require("../controller/authController");
const router = express.Router();

router.route("/signUp").get(getFolly).post(SignUp)
router.route("/signIn").post(SignIn)
router.route("/logOut").get(Logout)
router.route("/update/:userId").put(protectedRoutes,UpdateUser)

module.exports = router;
