const express = require('express')
const {getProductDetails, addProduct, deleteProduct, addToCart, retrieveCart, retrieveByTagName, getByID, updateProduct, getAll} = require('../Controller/productController')
const router = express.Router()

router.get('/getproducts/:cat', getProductDetails)

router.post('/addproducts', addProduct)

router.delete('/deleteproduct/:id', deleteProduct)

router.post('/addToCart', addToCart)

router.get('/retrieveCart', retrieveCart)

router.get('/retrieveByTagName/:TagName', retrieveByTagName)

router.get('/:id', getByID)

router.put('/edit-:id', updateProduct)




//fetching all products from all categories to display on frontend
router.get('/getProduct/getAll', getAll)

module.exports = router