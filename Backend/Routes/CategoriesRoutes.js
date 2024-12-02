const express = require('express')
const { getCategories, addCategories, deleteCategories } = require('../Controller/CategoriesController')
const router = express.Router()

router.get('/getcategories', getCategories)

router.post('/addcategories', addCategories)

router.delete('/deletecategory/:id', deleteCategories)

module.exports = router