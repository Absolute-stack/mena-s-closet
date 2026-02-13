import express from 'express';
import {
  addProduct,
  updateProduct,
  removeProduct,
  listProducts,
  singleProduct,
} from '../controllers/productController.js';
import upload from '../middleware/multer.js';

const router = express.Router();

router.post(
  '/add',
  upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 },
  ]),
  addProduct,
);

router.post(
  '/update',
  upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 },
  ]),
  updateProduct,
);

router.post('/remove', removeProduct);
router.get('/list', listProducts);
router.post('/single', singleProduct);

export default router;
