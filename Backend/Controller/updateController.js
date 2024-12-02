const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose')



const formatCategoryName = (name) => {
    return name.trim().toLowerCase().replace(/\s+/g, '-'); // Lowercase and hyphens for spaces
};




const updateDeleteImages = async (req, res) => {
    // Log the request body and file data
    console.log('Request Body from fncn:', req.body);  // Should have 'folderName' and other fields
    console.log('Request File from fncn:', req.file);  // Should have file data (e.g., filename)

    const { folderName, previousImage } = req.body;  // Extract text fields
    const imageFile = req.file;  // File handled by multer

    if (!folderName || !imageFile) {
        return res.status(400).json({ success: false, message: 'Missing folderName or image file.' });
    }

    try {
        // Ensure folder exists
        const folderPath = path.join(__dirname, '../../Frontend/assets/ProductsImages', folderName);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        // Delete previous image if exists
        if (previousImage) {
            const previousImagePath = path.join(folderPath, previousImage);
            if (fs.existsSync(previousImagePath)) {
                fs.unlinkSync(previousImagePath);
            }
        }

        // Send success response
        res.json({
            success: true,
            message: 'Image updated successfully.',
            imageName: imageFile.filename,
        });
    } catch (error) {
        console.error('Error updating image:', error);
        res.status(500).json({ success: false, message: 'Error updating image.' });
    }
};





const updateDetails = async (req, res) => {
    const {
        productName,
        productUpdateId,
        productCode,
        productDescription,
        categoryDropdown,
        oldCategory,
        imagesArray,
    } = req.body;

    try {
        // Format the category names to ensure consistency
        const formattedOldCategory = formatCategoryName(oldCategory);
        const formattedNewCategory = formatCategoryName(categoryDropdown);

        // Dynamically get the old category model
        const OldCategoryModel = mongoose.models[formattedOldCategory] ||
            mongoose.model(formattedOldCategory, ProductsSchema, formattedOldCategory);

        // Search for the product in the old category
        const product = await OldCategoryModel.findById(productUpdateId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: `Product not found in the category "${formattedOldCategory}"`,
            });
        }

        // Check if the category has changed
        if (formattedOldCategory !== formattedNewCategory) {
            // Remove the product from the old category
            await OldCategoryModel.findByIdAndDelete(productUpdateId);

            // Dynamically get or create the new category model
            const NewCategoryModel = mongoose.models[formattedNewCategory]

            // Add the product to the new category
            const newProduct = new NewCategoryModel({
                ...product.toObject(),
                Category: formattedNewCategory,
            });
            await newProduct.save();
        } else {
            // Update the existing product if the category is the same
            await OldCategoryModel.findByIdAndUpdate(
                productUpdateId,
                {
                    ProductTitle: productName,
                    ProductDescription: productDescription,
                    ProductCode: productCode,
                    Images: imagesArray,
                    updatedAt: new Date(),
                },
                { new: true } // Return updated document
            );
        }

        // Handle folder renaming if the product name has changed
        if (product.ProductTitle !== productName) {
            const oldFolderPath = path.join(
                __dirname,
                "../../Frontend/assets/ProductsImages",
                product.ProductTitle
            );
            const newFolderPath = path.join(
                __dirname,
                "../../Frontend/assets/ProductsImages",
                productName
            );
            console.log("Old Folder Path:", oldFolderPath);
            console.log("New Folder Path:", newFolderPath);
            
            if (fs.existsSync(oldFolderPath)) {
                fs.renameSync(oldFolderPath, newFolderPath);
            }
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully!",
        });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while updating the product.",
            error: error.message,
        });
    }
};


const updateImageArray = async (req, res) =>{
    console.log(req.body)

    const { imagesArray, productUpdateId, categoryDropdown } = req.body

    const formattedCategory = formatCategoryName(categoryDropdown);
    const Model = mongoose.models[formattedCategory]

    const product = await Model.findById(productUpdateId);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: `Product not found in the category "${formattedCategory}"`,
        });
    }


    try {
        // Update the imagesArray attribute of the product
        product.Images = imagesArray;

        // Save the updated product back to the database
        await product.save();

        return res.status(200).json({
            success: true,
            message: 'Product image array updated successfully.',
            updatedProduct: product, // Optionally return the updated product
        });
    } catch (error) {
        console.error('Error updating product:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating product.',
        });
    }

}






module.exports = { updateDeleteImages, updateDetails, updateImageArray };
