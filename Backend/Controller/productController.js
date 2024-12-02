const ProductsSchema = require('../Models/ProductModel');
const mongoose = require('mongoose');

// Utility function to ensure consistent, singular, and lowercase category names
const formatCategoryName = (name) => {
    return name.trim().toLowerCase().replace(/\s+/g, '-'); // Lowercase and hyphens for spaces
};


const getProductDetails = async (req, res) => {
    const cat = req.params.cat;
    // console.log(cat, "category to fetch products for");

    try {
        const formattedCat = formatCategoryName(cat); // Ensure consistent category name
        
        // Directly access the existing collection using the collection name
        const products = await mongoose.connection.collection(formattedCat).find().toArray();
        // console.log(products, "products");

        return res.json(products);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: `Unable to fetch products from ${cat} category`
        });
    }
};


const addProduct = async (req, res) => {
    try {
        const { ProductTitle, ProductDescription, ProductCode, Category, Images } = req.body;
        if (!ProductTitle, !ProductDescription, !ProductCode, !Category, !Images ){
            return res.status(201).json({
                success : false,
                message: " Entire product details not found!"
            })
        }
        const formattedCategoryName = formatCategoryName(Category);
        // if(Checkbox){
        //     try {
        //         // Access the 'customer-cart' model
        //         const popularCollection = mongoose.model('populars', ProductsSchema, 'populars');
        //         // Check if the model exists
        //         if (!popularCollection) {
        //             return res.status(404).json({ message: "Cart model not found" });
        //         }

        //         const popular =  await popularCollection.create({
        //             ProductTitle,
        //             ProductDescription,
        //             RegularPrice,
        //             PromotionalPrice,
        //             Currency,
        //             TaxRate,
        //             Width,
        //             Height,
        //             Weight,
        //             ShippingFees,
        //             Tags,
        //             Category: formattedCategoryName // Ensure consistent category name
        //         });
        //         popular.save()
        //     }
        //     catch(error){
        //         console.log(error)
        //     }
        // }

        let DynamicProductModel;
        if (mongoose.models[formattedCategoryName]) {
            DynamicProductModel = mongoose.models[formattedCategoryName];
        } else {
            // Explicitly set the collection name to avoid pluralization
            DynamicProductModel = mongoose.model(formattedCategoryName, ProductsSchema, formattedCategoryName);
        }
        const product = await DynamicProductModel.create({
            ProductTitle,
            ProductDescription,
            ProductCode,
            Images,
            Category: formattedCategoryName // Ensure consistent category name
        });

        res.status(201).json({
            success: true,
            message: "Product added successfully",
            product
        });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({
            success: false,
            message: "Product couldn't be added due to an internal conflict",
            error: error.message
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const deleteProductId = req.params.id;
        console.log(deleteProductId, "Product ID to delete");

        const categoryName = req.body.category;
        const formattedCategoryName = formatCategoryName(categoryName);
        console.log(formattedCategoryName, "formatted category name");
        console.log("Available models in mongoose:", mongoose.models);

        if (!mongoose.models[formattedCategoryName]) {
            // Register the model if it's not already registered but don't create a new collection
            mongoose.model(formattedCategoryName, new mongoose.Schema(ProductsSchema), formattedCategoryName);
            console.log(`Model registered dynamically for existing collection: ${formattedCategoryName}`);
        }

        const DynamicProductModel = mongoose.models[formattedCategoryName];
        console.log(DynamicProductModel, "Model found");
        const deleteItem = await DynamicProductModel.findByIdAndDelete(deleteProductId);
        if (deleteItem) {
            res.json({
                success: true,
                message: 'Product deleted successfully',
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }
    } catch (error) {
        console.log(error);
        res.status(503).json({
            success: false,
            message: 'Unable to delete product',
        });
    }
};

const addToCart = async (req, res) => {
    const productId = req.body.productId;
    const categoryName = req.body.Category;

    const formattedCategoryName = formatCategoryName(categoryName);
    console.log(formattedCategoryName, "formatted category name");

    if (!mongoose.models[formattedCategoryName]) {
        mongoose.model(formattedCategoryName, new mongoose.Schema(ProductsSchema), formattedCategoryName);
        console.log(`Model registered dynamically for existing collection: ${formattedCategoryName}`);
    }

    const DynamicProductModel = mongoose.models[formattedCategoryName];

    try {
        // Find the product by ID
        const findProduct = await DynamicProductModel.findOne({ _id: productId });

        if (findProduct) {
            // Define or retrieve the `customer-cart` model
            const CartModel = mongoose.models['customer-cart'] || mongoose.model('customer-cart', new mongoose.Schema(ProductsSchema), 'customer-cart');

            // Add the product document directly to the cart
            const addToCart = new CartModel(findProduct.toObject()); 
            await addToCart.save();

            res.status(200).json({
                success: true,
                message: "Product added to cart!",
                cartEntry: addToCart
            });
        } else {
            res.status(404).json({
                success: false,
                message: "Product was not found"
            });
        }
    } catch (error) {
        console.error("Error adding product to cart:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while adding the product to the cart."
        });
    }
};

const retrieveCart = async (req, res) => {
    try {
        // Access the 'customer-cart' model
        const CartModel = mongoose.model('customer-cart', ProductsSchema, 'customer-cart');
        // Check if the model exists
        if (!CartModel) {
            return res.status(404).json({ message: "Cart model not found" });
        }

        // Fetch all products in the cart
        const cartProducts = await CartModel.find(); // No need for toArray()
        // Send the cart products back in the response
        res.json(cartProducts);
    } catch (error) {
        console.error("Error retrieving cart:", error);
        res.status(500).json({ message: "An error occurred while retrieving the cart." });
    }
};

const retrieveByTagName = async (req, res) => {
    let { TagName } = req.params;

    // Decode the URL-encoded tag name
    TagName = decodeURIComponent(TagName);

    // Normalize the tag input (if needed)
    const formattedTagName = formatCategoryName(TagName);

    try {
        // List all collection names in Mongoose
        const collections = await mongoose.connection.db.listCollections().toArray();

        let products = [];

        // Loop through each collection to find products with the specified tag
        for (const collection of collections) {
            const collectionName = collection.name;

            // Skip the "customer-cart" collection (exclusion)
            if (collectionName === 'customer-cart') {
                continue; // Move to the next collection without querying "customer-cart"
            }

            // Access the model dynamically or create it if it doesn't exist
            const DynamicProductModel = mongoose.models[collectionName] || mongoose.model(collectionName, ProductsSchema, collectionName);

            // Use a regex to search for the TagName within both comma-separated or space-separated tags
            const regex = new RegExp(`(?:^|[ ,]+)${formattedTagName}(?:[ ,]+|$)`, 'i'); // Case-insensitive search

            // Search for products where the Tags field contains the TagName
            const taggedProducts = await DynamicProductModel.find({ Tags: { $regex: regex } });
            products = products.concat(taggedProducts); // Append results to products array
        }

        if (products.length > 0) {
            res.status(200).json({
                success: true,
                products,
            });
        } else {
            res.status(404).json({
                success: false,
                message: "No products found with the specified tag.",
            });
        }
    } catch (error) {
        console.error("Error retrieving products by tag name:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while retrieving products by tag name.",
        });
    }
};

const getByID = async (req, res) => {
    const productId = req.params.id
    try {
        // List all collection names in Mongoose
        const collections = await mongoose.connection.db.listCollections().toArray();

        let products = [];

        // Loop through each collection to find products with the specified tag
        for (const collection of collections) {
            const collectionName = collection.name;

            // Skip the "customer-cart" collection (exclusion)
            if (collectionName === 'Categories') {
                continue; // Move to the next collection without querying "customer-cart"
            }

            // Access the model dynamically or create it if it doesn't exist
            const DynamicProductModel = mongoose.models[collectionName] || mongoose.model(collectionName, ProductsSchema, collectionName);



            // Search for products where the Tags field contains the TagName
            const taggedProducts = await DynamicProductModel.find({ _id : productId });
            products = products.concat(taggedProducts); // Append results to products array
        }
        if (products.length > 0) {
            res.status(200).json({
                success: true,
                products: products[0],
            });
        } else {
            res.status(404).json({
                success: false,
                message: "No products found with the specified tag.",
            });
        }
    } catch (error) {
        console.error("Error retrieving products by tag name:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while retrieving products by tag name.",
        });
    }
}

const updateProduct = async (req, res) => {
    const productId = req.params.id; // Extract product ID from the request parameters
    const category = req.body.category; // Extract category name from the request body
    const updateData = req.body.updateData; // Extract the data to update from the request body

    try {
        // Ensure the category collection exists
        const CategoryModel = mongoose.model(category); // Dynamically get the category collection model
        if (!CategoryModel) {
            return res.status(404).json({
                success: false,
                message: `Category "${category}" does not exist.`,
            });
        }

        // Search for the product in the category collection
        const product = await CategoryModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: `Product with ID "${productId}" not found in category "${category}".`,
            });
        }

        // Update the product
        const updatedProduct = await CategoryModel.findByIdAndUpdate(
            productId,
            { $set: updateData }, // Update with new data
            { new: true } // Return the updated document
        );

        res.status(200).json({
            success: true,
            message: "Product updated successfully!",
            data: updatedProduct,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Product updation failed!",
        });
    }
};

const getAll = async (req, res) => {
    try {
        // List all collection names in Mongoose, excluding 'category'
        const collections = await mongoose.connection.db.listCollections().toArray();

        let allProducts = [];

        // Loop through each collection to find all products
        for (const collection of collections) {
            const collectionName = collection.name;

            if (collectionName === 'Categories' || collectionName === 'clients') {
                continue;
            }

            // Access the model dynamically or create it if it doesn't exist
            const DynamicProductModel = mongoose.models[collectionName] || mongoose.model(collectionName, ProductsSchema, collectionName);

            // Fetch all products in this collection
            const productsInCollection = await DynamicProductModel.find({});
            allProducts = allProducts.concat(productsInCollection); // Append results to allProducts array
        }

        if (allProducts.length > 0) {
            res.status(200).json({
                success: true,
                products: allProducts,
            });
        } else {
            res.status(404).json({
                success: false,
                message: "No products found in any collection.",
            });
        }
    } catch (error) {
        console.error("Error retrieving products from all collections:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while retrieving products from all collections.",
        });
    }
};





module.exports = { getProductDetails, addProduct, deleteProduct, addToCart, retrieveCart, retrieveByTagName, getByID, updateProduct, getAll};