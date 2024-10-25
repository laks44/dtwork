const express = require('express')
const productControlller = require('../controllers/productController')

const router = express.Router()

router.post('/', productControlller.createProduct);
router.get('/', productControlller.getAllProducts);
router.get('/:id', productControlller.getProductById);
router.put('/:id', productControlller.updateProductById);
router.delete('/:id', productControlller.deleteProductById);



module.exports= router;