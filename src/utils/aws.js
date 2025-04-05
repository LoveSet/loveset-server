const AWS = require("../config/aws");
const { S3_BUCKET_NAME } = require("../config/config");
const fs = require("fs");
const axios = require("axios");

const uploadToS3 = async ({ data, s3AbsolutePath, mimetype }) => {
  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: s3AbsolutePath,
    Body: data,
    ContentType: mimetype,
  };

  const s3 = new AWS.S3();
  return s3.upload(params).promise();
};

const multipartUploadToS3 = async (
  fileKey,
  filePath,
  contentType,
  options = {}
) => {
  const s3 = new AWS.S3({
    httpOptions: { timeout: 300000 }, // 5 minutes
    useAccelerateEndpoint: true,
  });

  // Read the file into a buffer
  const buffer = fs.readFileSync(filePath);

  // Define the multipart upload parameters
  const multiPartParams = {
    Bucket: S3_BUCKET_NAME,
    Key: fileKey,
    ContentType: contentType,
    ...options,
  };
  const multipart = await s3.createMultipartUpload(multiPartParams).promise();
  console.log("Got upload ID", multipart.UploadId);

  const partSize = 1024 * 1024 * 10; // 10MB per chunk
  const numPartsLeft = Math.ceil(buffer.length / partSize);
  const maxUploadTries = 3;
  const multipartMap = {
    Parts: [],
  };

  // Upload each part in parallel
  await Promise.all(
    Array.from({ length: numPartsLeft }, async (_, i) => {
      const rangeStart = i * partSize;
      const rangeEnd = Math.min(rangeStart + partSize, buffer.length);
      const partParams = {
        Body: buffer.slice(rangeStart, rangeEnd),
        Bucket: S3_BUCKET_NAME,
        Key: fileKey,
        PartNumber: String(i + 1),
        UploadId: multipart.UploadId,
      };
      console.log(
        `Uploading part: #${partParams.PartNumber}, Range start: ${rangeStart}`
      );

      // Upload a single part, retrying up to maxUploadTries times if necessary
      let tryNum = 1;
      while (true) {
        try {
          const mData = await s3.uploadPart(partParams).promise();
          multipartMap.Parts[i] = {
            ETag: mData.ETag,
            PartNumber: Number(partParams.PartNumber),
          };
          console.log(`Completed part ${partParams.PartNumber}`);
          console.log("mData", mData);
          break;
        } catch (multiErr) {
          console.log(`multiErr, upload part error:`, multiErr);
          if (tryNum < maxUploadTries) {
            console.log(`Retrying upload of part: #${partParams.PartNumber}`);
            tryNum++;
          } else {
            console.log(`Failed uploading part: #${partParams.PartNumber}`);
            throw multiErr;
          }
        }
      }
    })
  );

  // Complete the multipart upload
  const doneParams = {
    Bucket: S3_BUCKET_NAME,
    Key: fileKey,
    MultipartUpload: multipartMap,
    UploadId: multipart.UploadId,
  };
  const data = await s3.completeMultipartUpload(doneParams).promise();

  const delta = (new Date() - new Date(multipart.UploadDate)) / 1000;
  console.log(`Completed upload in ${delta} seconds`);
  console.log("Final upload data:", data);
};

const uploadToS3FromUrl = async (url, s3Key, contentType) => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: s3Key,
    Body: Buffer.from(response.data),
    ContentType: contentType,
  };

  const s3 = new AWS.S3();
  return s3.upload(params).promise();
};

module.exports = {
  uploadToS3,
  multipartUploadToS3,
  uploadToS3FromUrl,
};
