const { sendEmail } = require('../utils/emailService');

exports.submitContactForm = async (req, res) => {
  try {
    const { email, mobile, message } = req.body;
    
    if (!email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Email and message are required'
      });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }
    
    const emailSubject = 'New Contact Form Submission';
    const emailText = `
      New contact form submission:
      
      Email: ${email}
      Mobile: ${mobile || 'Not provided'}
      
      Message:
      ${message}
    `;
    
    const emailHtml = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mobile:</strong> ${mobile || 'Not provided'}</p>
      <h3>Message:</h3>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `;
    
    await sendEmail({
      to: process.env.EMAIL_USER,
      subject: emailSubject,
      text: emailText,
      html: emailHtml
    });
    
    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully'
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send your message',
      details: error.message
    });
  }
};