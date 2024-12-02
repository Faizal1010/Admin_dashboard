const express = require('express');
const { updateDeleteImages, updateDetails, updateImageArray } = require('../Controller/updateController');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log("req.body at destination",req.body)
        const folderPath = path.join(__dirname, '../../Frontend/assets/ProductsImages', req.body.folderName);
        cb(null, folderPath);  // Default folder for file storage
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);  // Use original file name
    },
});

// Create the multer instance
const upload = multer({ storage });

// Middleware for file uploads (Multer)
router.post('/update-delete-images', upload.single('image'), updateDeleteImages);

router.put('/update-imageArray', updateImageArray)

router.put('/update-details', updateDetails)

module.exports = router;