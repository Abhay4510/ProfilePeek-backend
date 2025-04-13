const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  mediaId: {
    type: String,
    required: true
  },
  instagramCommentId: {
    type: String,
    required: true,
    unique: true
  },
  parentCommentId: {
    type: String,
    default: null
  },
  text: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  replies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ]
});

module.exports = mongoose.model('Comment', CommentSchema);