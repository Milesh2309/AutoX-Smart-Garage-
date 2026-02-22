const { getDB } = require('../config/db');

const submitContactForm = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    const db = getDB();

    const payload = {
      name,
      email: String(email).toLowerCase(),
      message,
      createdAt: new Date().toISOString()
    };

    const result = await db.collection('contact_submissions').insertOne(payload);

    return res.status(201).json({
      success: true,
      message: 'Contact form submitted',
      data: {
        id: result.insertedId,
        ...payload
      }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  submitContactForm
};
