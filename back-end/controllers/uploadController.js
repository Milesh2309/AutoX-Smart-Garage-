const { getDB } = require('../config/db');

const uploadProfilePhoto = async (req, res, next) => {
  try {
    const db = getDB();
    const userId = Number(req.user.id);
    const { fileName, mimeType, imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        message: 'imageBase64 is required'
      });
    }

    const uploadedAt = new Date().toISOString();
    const photoUrl = `/uploads/profile/${userId}-${Date.now()}`;

    await db.collection('uploads').insertOne({
      userId,
      type: 'profile-photo',
      fileName: fileName || 'profile-photo',
      mimeType: mimeType || 'image/*',
      imageBase64,
      photoUrl,
      uploadedAt
    });

    await db.collection('users').updateOne(
      { userId },
      { $set: { profilePhotoUrl: photoUrl, updatedAt: uploadedAt } }
    );

    return res.status(201).json({
      success: true,
      message: 'Profile photo uploaded',
      data: {
        photoUrl,
        uploadedAt
      }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  uploadProfilePhoto
};
