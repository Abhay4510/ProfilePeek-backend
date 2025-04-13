const axios = require('axios');
const User = require('../models/User');
const Comment = require('../models/Comment');

exports.getMediaFeed = async (req, res) => {
  try {
    const user = req.user;
    
    const mediaResponse = await axios.get(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,like_count,comments_count&access_token=${user.accessToken}`
    );
    
    console.log(mediaResponse)
    res.json({
      success: true,
      data: mediaResponse.data
    });
  } catch (error) {
    console.error('Media feed fetch error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch media feed',
      details: error.response?.data || error.message
    });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const user = req.user;
    
    const commentsResponse = await axios.get(
      `https://graph.instagram.com/${mediaId}/comments?fields=id,text,username,timestamp,like_count,replies{id,text,username,timestamp,like_count}&access_token=${user.accessToken}`
    );
    
    console.log("Instagram comments response:", JSON.stringify(commentsResponse.data, null, 2));
    
    if (!commentsResponse.data || !commentsResponse.data.data) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    res.json({
      success: true,
      data: commentsResponse.data.data
    });
  } catch (error) {
    console.error('Comments fetch error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch comments',
      details: error.response?.data || error.message
    });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { text } = req.body;
    const user = req.user;
    
    const response = await axios.post(
      `https://graph.instagram.com/${mediaId}/comments`,
      new URLSearchParams({
        message: text,
        access_token: user.accessToken
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    console.log("Comment post response:", response.data);
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Comment posting error:', error.response?.data || error.message);
    res.status(500).json({
      success: false, 
      error: 'Failed to post comment',
      details: error.response?.data || error.message
    });
  }
};

exports.addReply = async (req, res) => {
  try {
    const { parentCommentId, text } = req.body;
    const user = req.user;
    
    if (!parentCommentId || !text) {
      return res.status(400).json({ 
        success: false, 
        error: 'Parent comment ID and text are required' 
      });
    }
    
    const response = await axios.post(
      `https://graph.instagram.com/${parentCommentId}/replies`,
      new URLSearchParams({
        message: text,
        access_token: user.accessToken
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    console.log("Reply post response:", response.data);
    
    if (response.data && response.data.id) {
      res.status(201).json({
        success: true,
        data: {
          id: response.data.id,
          text: text,
          username: user.username,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      throw new Error('Instagram API did not return a valid comment ID');
    }
  } catch (error) {
    console.error('Reply creation error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to post reply',
      details: error.response?.data || error.message
    });
  }
};