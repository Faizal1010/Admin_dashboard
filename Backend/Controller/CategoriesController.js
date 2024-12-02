const Categories = require('../Models/CategoriesModel');
const ProductModel = require('../Models/ProductModel')
const mongoose = require('mongoose');

// Utility function to ensure consistent, singular, and lowercase category names
const formatCategoryName = (name) => {
    return name.trim().toLowerCase().replace(/\s+/g, '-'); // Lowercase and hyphens for spaces
};


const addCategories = async (req, res) => {
    const { Name, slug, Description } = req.body;

    try {
        const categoryName = formatCategoryName(Name); // Ensure consistent format

        const existingCategory = await Categories.findOne({ Name: categoryName });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category with this name already exists"
            });
        }

        const addCategory = new Categories({ Name: categoryName, slug, Description });
        await addCategory.save();

        // Check if collection already exists
        const existingCollections = await mongoose.connection.db.listCollections().toArray();
        const collectionExists = existingCollections.some(coll => coll.name === categoryName);

        if (!collectionExists) {
            await mongoose.connection.createCollection(categoryName);
            console.log(`Collection created: ${categoryName}`);

            // Register the model for the newly created collection
            mongoose.model(categoryName, new mongoose.Schema(ProductModel), categoryName);
        } else {
            console.log(`Collection already exists: ${categoryName}`);
        }

        res.status(201).json({
            success: true,
            message: "Category was added and collection created successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Category couldn't be added"
        });
    }
};



const getCategories = async (req, res) => {
    try {
        // Fetch categories from the 'categories' collection
        const categories = await Categories.find();

        // Map to extract the category names and ensure they are consistently formatted
        const formattedCategories = categories.map(category => ({
            _id: category._id, 
            Name: formatCategoryName(category.Name), // Ensure consistent format
            slug: category.slug,                    // Assuming you might want the slug
            Description: category.Description       // Assuming description is also important
        }));
// console.log(formattedCategories)
        // Send response with the formatted category names
        res.status(200).json({
            success: true,
            categories: formattedCategories
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Unable to fetch categories"
        });
    }
};


const deleteCategories = async (req, res) => {
    const category_id = req.params.id;

    try {
        const category = await Categories.findByIdAndDelete(category_id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        const collectionName = formatCategoryName(category.Name); // Ensure the name is consistent
        await mongoose.connection.db.dropCollection(collectionName);
        res.status(200).json({
            success: true,
            message: "Category and corresponding collection deleted successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Some error has occurred"
        });
    }
};


module.exports = { addCategories, getCategories, deleteCategories };