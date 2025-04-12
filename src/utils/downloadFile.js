const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const logger = require("../config/logger");

async function downloadFile(fileUrl) {
  const fileExtension = path.extname(fileUrl).split("?")[0];
  const fileName = `${uuidv4()}${fileExtension}`;

  // Download the file using axios with a stream
  const response = await axios.get(fileUrl, {
    responseType: "stream",
  });

  // Create a writable stream and pipe the file data into it
  const writer = fs.createWriteStream(`files/${fileName}`);
  response.data.pipe(writer);

  // Wait for the download to complete
  await new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });

  logger.info(`File downloaded successfully: files/${fileName}`);
  return fileName;
}

module.exports = downloadFile;
