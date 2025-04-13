const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  instagramId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  fullName: {
    type: String
  },
  profilePicture: {
    type: String
  },
  accessToken: {
    type: String,
    required: true
  },
  tokenExpiry: {
    type: Date
  },
  bio: {
    type: String
  },
  website: {
    type: String
  },
  followers: {
    type: String
  },
  follows: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);