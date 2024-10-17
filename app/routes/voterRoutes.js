const express = require('express');
const router = express.Router();
const VoterController = require('../controllers/votersController');
const {validateVoterToken} = require('../authentication/auth');

router.post('/register-voter',VoterController.registerVoter);
router.put('/update-voter',validateVoterToken,VoterController.updateVoter);
router.post('/check-restaurant',VoterController.checkIfRestaurantIsExists);
router.post('/get-restaurant',validateVoterToken,VoterController.findRestaurant);
router.post('/get-restaurant-logo',VoterController.getRestaurantLogo);
router.get('/count-voters',VoterController.countAllVoters);
router.post('/get-voters',VoterController.getVotersByRestaurant);


module.exports = router;