const axios = require('axios');
const User = require('../models/User');
const { instagramTokenExchange, getLongLivedToken } = require('../utils/instagramAPI');
const { generateToken } = require('../middleware/auth');

exports.getAuthUrl = (req, res) => {
  const instagramAuthUrl = `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=${process.env.INSTAGRAM_APP_ID}&redirect_uri=${encodeURIComponent(process.env.INSTAGRAM_REDIRECT_URI)}&response_type=code&scope=instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights`;
  console.log(instagramAuthUrl)
  res.json({ success: true, authUrl: instagramAuthUrl });
};

exports.handleCallbackGet = async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ 
      success: false, 
      error: 'Authorization code is required' 
    });
  }

  try {
    const tokenData = await instagramTokenExchange(code);
    
    if (!tokenData.access_token || !tokenData.user_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Failed to obtain access token' 
      });
    }

    const longLivedTokenData = await getLongLivedToken(tokenData.access_token);
    const accessToken = longLivedTokenData.access_token;
    const expiresIn = longLivedTokenData.expires_in || 5184000; 
// console.log(accessToken)
    const profileResponse = await axios.get(
      `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${accessToken}`
    );

    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + expiresIn);

    let user = await User.findOne({ instagramId: profileResponse.data.id });
    
    if (user) {
      user.accessToken = accessToken;
      user.tokenExpiry = expiryDate;
      user.username = profileResponse.data.username;
      await user.save();
    } else {
      user = await User.create({
        instagramId: profileResponse.data.id,
        username: profileResponse.data.username,
        accessToken: accessToken,
        tokenExpiry: expiryDate
      });
    }

    const jwtToken = generateToken(user);
// console.log("jwtToken",jwtToken)
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth-success?token=${jwtToken}&userId=${user._id}`);
  } catch (error) {
    console.error('Instagram auth error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      details: error.response?.data || error.message
    });
  }
};

exports.handleCallbackPost = async (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ 
      success: false, 
      error: 'Authorization code is required' 
    });
  }

  try {
    const tokenData = await instagramTokenExchange(code);
    
    if (!tokenData.access_token || !tokenData.user_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Failed to obtain access token' 
      });
    }

    const longLivedTokenData = await getLongLivedToken(tokenData.access_token);
    const accessToken = longLivedTokenData.access_token;
    const expiresIn = longLivedTokenData.expires_in || 5184000;

    const profileResponse = await axios.get(
      `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${accessToken}`
    );

    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + expiresIn);

    let user = await User.findOne({ instagramId: profileResponse.data.id });
    
    if (user) {
      user.accessToken = accessToken;
      user.tokenExpiry = expiryDate;
      user.username = profileResponse.data.username;
      await user.save();
    } else {
      user = await User.create({
        instagramId: profileResponse.data.id,
        username: profileResponse.data.username,
        accessToken: accessToken,
        tokenExpiry: expiryDate
      });
    }

    const jwtToken = generateToken(user);

    res.json({
      success: true,
      data: {
        userId: user._id,
        instagramId: user.instagramId,
        username: user.username,
        token: jwtToken
      }
    });
  } catch (error) {
    console.error('Instagram auth error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      details: error.response?.data || error.message
    });
  }
};

exports.checkAuthStatus = async (req, res) => {
  try {
    const user = req.user;
    
    const now = new Date();
    if (user.tokenExpiry && user.tokenExpiry < now) {
      return res.json({ 
        success: false,
        isLoggedIn: false, 
        reason: 'token_expired' 
      });
    }
    
    res.json({ 
      success: true,
      isLoggedIn: true,
      userId: user._id,
      username: user.username,
      profilePicture: user.profilePicture
    });
  } catch (error) {
    console.error('Auth status check error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.logout = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};