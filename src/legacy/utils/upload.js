const path = require("path");

const publicDirectory = path.join(__dirname, "../public");

const uploadFile = async (file, destination) => {
  if (!file) return "";
  const filename = Date.now() + file.name;

  try {
    await file.mv(path.join(publicDirectory, destination, filename));
    return filename;
  } catch (err) {
    console.error("Error uploading file:", err);
    throw err;
  }
};

module.exports = { uploadFile, publicDirectory };
