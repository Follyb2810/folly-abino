const { default: mongoose } = require("mongoose");
const BlogPost = require("../model/BlogModel");
const User = require("../model/RegisterModel");
const objectId = mongoose.Types.ObjectId
const GetAllBlogPosts = async (req, res, next) => {
    try {
        const allBlogPosts = await BlogPost.find();
        
        res.status(200).json({
            status: 'success',
            message: 'All blog posts retrieved successfully',
            data: { blogPosts: allBlogPosts },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
const GetAllBlogPerUser = async (req, res, next) => {
    try {
        const allBlogPosts = await BlogPost.find().populate('author');
        
        res.status(200).json({
            status: 'success',
            message: 'All blog posts with authors retrieved successfully',
            data: { blogPosts: allBlogPosts },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
const createBlog = async (req, res) => {
  try {
    const { title, content,  tags,  } = req.body;
    
    if (!title || !content  || !tags ) {
      return res.status(401).json({ message: 'All input fields are required' });
    } else {
      const userBlog = await BlogPost.create({
        title,
        content,
        tags
      });

      res.status(201).json({
        status: 'success',
        message: 'Blog Post Successfully Created',
        data: { userBlog,id:userBlog._id },
      });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error while creating post' });
  }
};
const UpdateBlog = async (req, res, next) => {
  try {
      const { id } = req.params;
      console.log(id)

    //   if (!objectId.isValid(id)) {
    //       return res.status(401).json({ message: `${id} is not a valid objectId` });
    //   }

      const findPost = await BlogPost.findOne({ _id: id });

      if (findPost) {
          if (req.body) {
              const updatePost = await BlogPost.findOneAndUpdate(
                  { _id: id },
                  { $set: req.body },
                  { new: true }
              );

              // Note: The save() method is not necessary after using findOneAndUpdate
              res.status(200).json({
                  status: 'success',
                  message: 'Post updated successfully',
                  data: { updatePost },
              });
          } else {
              res.status(400).json({
                  status: 'error',
                  message: 'No valid update fields provided',
              });
          }
      } else {
          res.status(404).json({
              status: 'error',
              message: `Post with ID ${id} not found`,
          });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({
          status: 'error',
          message: 'Internal server error',
      });
  }
};
const DeleteBlog = async (req, res, next) => {
  try {
      const { id } = req.params;

      if (!objectId.isValid(id)) {
          return res.status(401).json({ message: `${id} is not a valid objectId` });
      }

      const findPost = await BlogPost.findOneAndDelete({ _id: id });

      if (findPost) {
          res.status(200).json({ message: 'Post successfully deleted' });
      } else {
          res.status(404).json({
              status: 'error',
              message: `Post with ID ${id} not found`,
          });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({
          status: 'error',
          message: 'Internal server error',
      });
  }
};





module.exports = { createBlog,UpdateBlog,DeleteBlog,GetAllBlogPosts,GetAllBlogPerUser };
