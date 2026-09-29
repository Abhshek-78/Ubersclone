const fs = require('fs');
const path = require('path');

const profileDirectory = path.join(__dirname, '..', 'uploads', 'profile');
const maxImageBytes = 5 * 1024 * 1024;

fs.mkdirSync(profileDirectory, { recursive: true });

function getImageBuffer(imageData) {
    if (typeof imageData !== 'string') return null;

    const match = imageData.match(/^data:(image\/(?:jpeg|png));base64,([A-Za-z0-9+/=\s]+)$/);
    if (!match) return null;

    const [, mimeType, encodedImage] = match;
    const imageBuffer = Buffer.from(encodedImage, 'base64');
    if (imageBuffer.length === 0 || imageBuffer.length > maxImageBytes) return null;

    const isJpeg = mimeType === 'image/jpeg'
        && imageBuffer[0] === 0xff
        && imageBuffer[1] === 0xd8
        && imageBuffer[2] === 0xff;
    const isPng = mimeType === 'image/png'
        && imageBuffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));

    return isJpeg || isPng ? { imageBuffer, extension: isJpeg ? 'jpg' : 'png' } : null;
}

function publicPhotoUrl(req, filename) {
    const baseUrl = process.env.PUBLIC_API_URL || `${req.protocol}://${req.get('host')}`;
    return `${baseUrl.replace(/\/$/, '')}/uploads/profile/${filename}`;
}

async function uploadPhoto(req, res, profile, profileType, ProfileModel) {
    const image = getImageBuffer(req.body?.imageData);
    if (!image) {
        return res.status(400).json({ message: 'Upload a valid JPEG or PNG image up to 5 MB.' });
    }

    const filename = `${profileType}-${profile._id}.${image.extension}`;
    await fs.promises.writeFile(path.join(profileDirectory, filename), image.imageBuffer, { mode: 0o600 });
    const photo = publicPhotoUrl(req, filename);
    await ProfileModel.findByIdAndUpdate(profile._id, { photo });

    return res.status(200).json({ photo });
}

module.exports.uploadUserPhoto = (req, res) => uploadPhoto(req, res, req.user, 'user', require('../models/usermodel'));
module.exports.uploadCaptainPhoto = (req, res) => uploadPhoto(req, res, req.captain, 'captain', require('../models/captain.model'));