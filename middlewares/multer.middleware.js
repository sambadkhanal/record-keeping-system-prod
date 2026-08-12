import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(), // File exists only in ram and not saved on disk and is available as buffer ie req.file.buffer
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg", // JPG
      "image/png", // PNG
      "application/pdf", // PDF
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX,
      "application/msword", // DOC
      "text/plain", // TXT
    ];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"), false);
    }

    cb(null, true);
  },
});

export default upload;

// What you should know

// MULTER allows us to access req.file and req.body and thats it. Here we have used memoryStorage as storage, Meaning we access req.file.buffer which is currently in our ram and that file is not saved anywhere right now and which we will later upload it to cloudinary.
// Also, FILEFILTER is used to filter files ie which ones or "mime types" will be allowed to be uploaded.
