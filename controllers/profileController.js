const axios = require('axios');
const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const user = req.user;
    
    const profileResponse = await axios.get(
      `https://graph.instagram.com/me?fields=id,username,media_count,account_type,followers_count,follows_count&access_token=${user.accessToken}`
    );
   
    const profilePicResponse = await axios.get(
      `https://graph.instagram.com/me?fields=profile_picture_url,name,biography,website&access_token=${user.accessToken}`
    );
    console.log(profileResponse.data.followers_count)
    user.fullName = profilePicResponse.data.name || '';
    user.profilePicture = profilePicResponse.data.profile_picture_url || '';
    user.bio = profilePicResponse.data.biography || '';
    user.website = profilePicResponse.data.website || '';
    user.followers = profileResponse.data.followers_count || '';
    user.follows = profileResponse.data.follows_count || '';
    await user.save();
    
    res.json({
      success: true,
      data: {
        id: profileResponse.data.id,
        username: profileResponse.data.username,
        fullName: user.fullName,
        profilePicture: user.profilePicture,
        mediaCount: profileResponse.data.media_count,
        accountType: profileResponse.data.account_type,
        bio: user.bio,
        website: user.website,
        followers: profileResponse.data.followers_count,
        follows: profileResponse.data.follows_count
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile',
      details: error.response?.data || error.message
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = req.user;
    
    if (req.body.bio) user.bio = req.body.bio;
    if (req.body.website) user.website = req.body.website;
    
    await user.save();
    
    res.json({
      success: true,
      data: {
        bio: user.bio,
        website: user.website
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};