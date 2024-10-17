const express = require('express');
const router = express.Router();
const LogoController = require('../controllers/LogoController');
const {validateToken} = require('../authentication/auth');
const upload = require('../utils/s3config');

router.post('/upload-logo', validateToken, upload.single("images"), LogoController.uploadLogo);
router.put('/update-logo', validateToken, upload.single("images"), LogoController.updateLogo);
router.get('/get-logos', LogoController.getLogo);
router.post('/get-logo', LogoController.getLogoById);
router.get('/get-deleted-logo', LogoController.getDeletedLogo);
router.put('/delete-logo', validateToken, LogoController.updateLogoDeleteStatus);




module.exports = router;