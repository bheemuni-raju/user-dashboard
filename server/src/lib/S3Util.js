"use strict";

const AWS = require("aws-sdk");
const path = require("path");
const fs = require("fs");

const config = require("../config");

AWS.config.update({
  accessKeyId: config.awsS3.accessKeyId,
  secretAccessKey: config.awsS3.secretAccessKey,
  region: "ap-southeast-1"
});
AWS.config.setPromisesDependency(Promise);

const s3 = new AWS.S3();

const downloadFile = ({ Bucket, Key, localPath }) => {
  if (!Bucket) {
    return Promise.reject(new Error("Bucket should be present in options"));
  }
  if (!Key) {
    return Promise.reject(new Error("Key should be present in options"));
  }
  if (!localPath) {
    return Promise.reject(new Error("localPath should be present in options"));
  }
  const file = fs.createWriteStream(localPath);
  let currentDownload = 0;
  return new Promise((resolve, reject) => {
    s3.getObject({ Bucket, Key })
      .createReadStream()
      .on("error", error => {
        console.log("Error in downloading file from s3");
        return reject(error);
      })
      .on("data", data => {
        currentDownload += data.length;
        console.log(
          `Downloaded... ${(currentDownload / (1024 * 1024)).toFixed(2)} MB`
        );
      })
      .on("end", () => {
        console.log("File Downloaded Successfully");
        return resolve(null);
      })
      .pipe(file);
  });
};

const uploadFile = async ({ Bucket, Key, Body, ACL }) => {
  // if (process.env.NO_CACHE) return Promise.resolve();
  if (!Bucket) {
    return Promise.reject(new Error("Bucket should be present in options"));
  }
  if (!Key) {
    return Promise.reject(new Error("Key should be present in options"));
  }
  // if (!filePath) {
  //   return Promise.reject(new Error("filePath should be present in options"));
  // }
  //const readStream = fs.createReadStream(filePath);
  const params = { Bucket, Key, Body, ACL };
  s3.putObject(params).promise();
  return s3.getSignedUrl("putObject", params).split("?")[0];
};

const fileExists = ({ Bucket, Key }) => {
  if (process.env.NO_CACHE) return Promise.resolve(false);
  return s3
    .headObject({ Bucket, Key })
    .promise()
    .then(() => true)
    .catch(err => {
      if (err.code === "NotFound") {
        return false;
      }
      throw err;
    });
};

module.exports = { downloadFile, uploadFile, fileExists };
