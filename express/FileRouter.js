const express = require("express");
let fileRouter = express.Router();
const multer = require("multer");
const fs = require("fs-extra");
const os = require("os");
const path = require("path");
const { getUser } = require("../UserDb");
const { v4: uuidv4 } = require("uuid");
const tempDir = path.join(os.tmpdir(), "uploads-weShare");
fs.ensureDirSync(tempDir);

// Multer configuration to store files temporarily
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir); // Store files in the temp directory
  },
  filename: (req, file, cb) => {
    let fileNameTextArray = file.originalname.split(".");
    let fileExtension = fileNameTextArray[fileNameTextArray.length - 1];
    let uniqueFileName = uuidv4() + "." + fileExtension;
    cb(null, uniqueFileName); // Unique filename
  },
});

const upload = multer({ storage });
let userFiles = [];
fileRouter.get("/all-files", (req, res) => {
  res.json({ files: userFiles });
});
fileRouter.post("/file-upload/:userId", upload.single("file"), (req, res) => {
  const userId = req.params.userId;
  let user = getUser(userId);
  let userName = "unknown";
  if (user) userName = user.name;
  console.log(user);
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  console.log("File saved at:", req.file.path);

  // Store the file path for the user
  userFiles.push({
    fileOriginalName: req.file.originalname,
    fileNewName: req.file.filename,
    filePath: req.file.path,
    size: req.file.size,
    userId,
    userName,
  });
  res.json({
    message: "File temporarily stored",
    path: req.file.path,
    filename: req.file.filename,
  });
});

// Serve files as downloadable links
fileRouter.get("/download/:filename", (req, res) => {
  console.log("hitting download");
  const filename = req.params.filename;
  const fileRecord = userFiles.find((file) => file.fileNewName == filename);

  if (!fileRecord) {
    return res.status(404).json({ error: "File not found" });
  }

  const filePath = fileRecord.filePath;
  res.download(filePath, fileRecord.filename, (err) => {
    if (err) console.error("Error sending file:", err);
  });
});

// Clean up temp storage when the app is closing
const cleanup = () => {
  console.log("Cleaning up temporary files...");
  fs.emptyDirSync(tempDir); // Delete all files in temp storage
};

// Handle app exit events
process.on("SIGINT", () => {
  cleanup();
  process.exit();
});
process.on("SIGTERM", () => {
  cleanup();
  process.exit();
});
process.on("exit", () => {
  cleanup();
});
module.exports = { fileRouter };
