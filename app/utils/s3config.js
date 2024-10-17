const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const multer = require('multer');

// Configure AWS SDK with your credentials
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY_VALUE,
  region: process.env.AWS_BUCKET_REGION,
});

// Create an instance of the S3 class
const s3 = new aws.S3();

// Multer setup for file upload to AWS S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname);
    },
  }),
});

module.exports = upload;