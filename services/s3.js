const AWS = require('aws-sdk');
const fs = require('fs');

require("dotenv").config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3Params = {
  Bucket: process.env.AWS_BUCKET_NAME,
  ACL: 'public-read',
}

exports.upload = function (filePath, fileName) {
  const params = {
    ...s3Params,
    Body: fs.createReadStream(filePath),
    Key: fileName,
  }

  return new Promise((resolve, reject) => {
    s3.upload(params, function (err, data) {
      if (err) reject(err);
      if (data) resolve(data);
    });
  })
}

exports.delete = function (fileName) {
  const params = {
    ...s3Params,
    Key: fileName,
  }

  return new Promise((resolve, reject) => {
    s3.deleteObject(params, function (err, data) {
      if (err) reject(err);
      if (data) resolve(data);
    });
  })
}
