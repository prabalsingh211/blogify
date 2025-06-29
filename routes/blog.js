const { Router } = require("express");
const multer = require("multer");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const fs = require("fs");
const path = require("path");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const router = Router();

//for storing value in local storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.resolve(`./public/uploads`));
//   },
//   filename: (req, file, cb) => {
//     const fileName = `${Date.now()}-${file.originalname}`;
//     cb(null, fileName);
//   },
// });

// const upload = multer({ storage: storage });

//for storing value in cloudinary
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.resolve("./temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.get("/add-new", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({ blogId: req.params.id }).populate(
    "createdBy"
  );
  return res.render("blog", {
    user: req.user,
    blog,
    comments,
  });
});

router.post("/comment/:blogId", async (req, res) => {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

router.post("/", upload.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;
  let imageUrl = "";

  if (req.file?.path) {
    const cloudRes = await uploadOnCloudinary(req.file.path);
    if (cloudRes?.secure_url) {
      imageUrl = cloudRes.secure_url;
    } else {
      return res.status(500).send("Image upload failed. Please try again.");
    }
  }

  const blog = await Blog.create({
    title,
    body,
    createdBy: req.user._id,
    coverImageURL: imageUrl,
  });

  res.redirect(`/blog/${blog._id}`);
});

module.exports = router;
