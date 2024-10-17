const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const {validateToken} = require('../authentication/auth');
const upload = require('../utils/s3config');

router.post('/add-admin',validateToken ,AdminController.addAdmin);
router.post('/add-restaurant',validateToken,upload.array('images', 5),AdminController.addRestaurant);
router.post('/sign-in', AdminController.signIn);
router.get('/get-restaurants',validateToken ,AdminController.getAllRestaurants);
router.get('/get-admins',validateToken ,AdminController.getAllAdminRole);
router.put('/update-admin',validateToken,AdminController.updateAdmin);
router.put('/update-restaurant',validateToken,upload.array('images', 5),AdminController.updateRestaurant);
router.put('/delete-admin',validateToken,AdminController.updateAdminDeleteStatus);
router.put('/delete-restaurant',validateToken,AdminController.updateRestauranteDeleteStatus);
router.post('/sign-out', validateToken, AdminController.signOut);
router.get('/count-restaurants',validateToken,AdminController.getCountRestaurants);
router.get('/get-deleted-restaurants',validateToken,AdminController.getCountRestaurants);

module.exports = router;