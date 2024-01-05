const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import uuid library

const blogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    tags: {
      type: [String],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
);



const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = BlogPost;
