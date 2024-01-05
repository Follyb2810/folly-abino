const express = require('express')
const { createBlog, UpdateBlog, DeleteBlog } = require('../controller/blogcontroler')
const router = express.Router()


router.route('/create-post').post(createBlog)
router.route('/:id')
.put(UpdateBlog)
.delete(DeleteBlog)
            
            


module.exports = router