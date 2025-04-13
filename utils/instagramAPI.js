const axios = require('axios');

exports.instagramTokenExchange = async (code) => {
  try {
    const response = await axios.post('https://api.instagram.com/oauth/access_token', 
      new URLSearchParams({
        client_id: process.env.INSTAGRAM_APP_ID,
        client_secret: process.env.INSTAGRAM_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
        code
      }), 
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    console.log('Token exchange response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Token exchange error:', error.response?.data || error.message);
    throw error;
  }
};

exports.getLongLivedToken = async (shortLivedToken) => {
  try {
    const response = await axios.get(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_APP_SECRET}&access_token=${shortLivedToken}`
    );
    
    return response.data;
  } catch (error) {
    console.error('Long-lived token error:', error.response?.data || error.message);
    throw error;
  }
};

exports.refreshAccessToken = async (accessToken) => {
  try {
    const response = await axios.get(
      `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`
    );
    
    return response.data;
  } catch (error) {
    console.error('Token refresh error:', error.response?.data || error.message);
    throw error;
  }
};