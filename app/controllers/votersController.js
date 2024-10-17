const Voters = require('../models/votersModel');
const Restaurant = require('../models/restaurantModel');
const { createToken, decode } = require("../authentication/auth");

const VoterController = {
  registerVoter: async (req, res) => {
    try {
        const { name, phone_number, email } = req.body;
        
        // Validation for required fields
        if (!name || !phone_number || !email) {
            return res.status(200).json({ status: "400", message: "Name, phone number, and email are required" });
        }

        // Validation for email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(200).json({ status: "400", message: "Invalid email format" });
        }

        // Validation for phone number length
        if (phone_number.length < 10) {
            return res.status(200).json({ status: "400", message: "Phone number must be at least 10 characters long" });
        }
        
        // Check if email or phone number already exists
        const existingVoter = await Voters.findOne({
            $or: [
                { email: email },
                { phone_number: phone_number }
            ],
        });

        if (existingVoter) {
            const accessToken = createToken(existingVoter);
            return res.status(200).json({ status: "200", message: "You have already registered as a voter", accessToken: accessToken.accessToken });
        }

        // Create new voter
        const newVoter = new Voters({
            name,
            phone_number,
            email,
        });
        const savedVoter = await newVoter.save();

        // Create access token
        const accessToken = createToken(savedVoter);

        // Return success response
        return res.status(200).json({ status: "200", message: "Voter added successfully", accessToken: accessToken.accessToken });
    } catch (err) {
        // Handle internal server error
        console.error(err);
        return res.status(500).json({ status: "500", message: "Internal Server Error", description: err.message });
    }
},
updateVoter: async (req, res) => {
  try {
    const { restaurants } = req.body;
    if (!restaurants) {
      return res.status(400).json({ status: "400", message: "Missing required fields" });
    }
    
    const voter = decode(req.headers["voter"]);
    if (!voter || voter.role !== "voter") {
      return res.status(403).json({ status: "403", message: "Unauthorized access" });
    }

    const isAlreadyVoted = await Voters.findOne({ _id: voter.id });
    if (isAlreadyVoted) {
      const existingRestaurant = restaurants.find(rest =>
        isAlreadyVoted.restaurants.some(existingRest =>
          existingRest.restaurantId.toString() === rest.restaurantId
        )
      );
      if (existingRestaurant) {
        res.clearCookie("voter");
        return res.status(200).json({ status: "409", message: "You already voted for this restaurant" });
      } else {
        const updatedVoter = await Voters.findByIdAndUpdate(voter.id, { restaurants: [...isAlreadyVoted.restaurants, ...restaurants] }, { new: true });
        
        // Assuming you have a loop or async operation to update each restaurant's votes
        for (const restaurant of restaurants) {
          const incrementRestaurantVote = await Restaurant.findByIdAndUpdate(restaurant.restaurantId, { $inc: { votes: 1 } });
        }
        
        return res.status(200).json({ status: "200", message: "Voter updated successfully" });
      }
    }
    
    const updatedVoter = await Voters.findByIdAndUpdate(voter.id, { restaurants }, { new: true });
    
    // Assuming you have a loop or async operation to update each restaurant's votes
    for (const restaurant of restaurants) {
      const incrementRestaurantVote = await Restaurant.findByIdAndUpdate(restaurant.restaurantId, { $inc: { votes: 1 } });
    }
    
    res.status(200).json({ status: "200", message: "Voter updated successfully" });
  } catch (err) {
    res.status(500).json({ status: "500", message: "Internal Server Error", description: err.message });
  }
},
  checkIfRestaurantIsExists: async(req,res) => {
    try{
      const {restaurantId} = req.body;
      const restaurant = await Restaurant.findOne({_id: restaurantId});
      if(!restaurant) return res.status(200).json({ status: "404", message: "Restaurant not found" });
      res.status(200).json({ status: "200", message: "Restaurant found" });
    }catch(err){
      res.status(200).json({ status: "500", message: "Internal Server Error", description: err.message });
    }
  },
  findRestaurant: async(req, res) => {
    try{
      const {restaurantId} = req.body;
      const restaurant = await Restaurant.findOne({_id: restaurantId});
      if(!restaurant) return res.status(200).json({ status: "404", message: "Restaurant not found" });
      res.status(200).json({ status: "200", message: "Restaurant found", data: restaurant });
    }catch(err){
      res.status(200).json({ status: "500", message: "Internal Server Error", description: err.message });
    }
  },
  countAllVoters: async (req, res) => {
    try {
        const voters = await Voters.aggregate([
            {
                $unwind: "$restaurants" // Unwind the array to treat each element as a separate document
            },
            {
                $lookup: {
                    from: "restaurants",
                    localField: "restaurants.restaurantId",
                    foreignField: "_id",
                    as: "restaurant"
                }
            },
            {
                $match: {
                    $and: [
                        { "restaurant": { $ne: [] } }, // Filters out voters without matching restaurant
                        { "restaurant.delete_status": { $ne: 1 } } // Filters out voters with deleted restaurants
                    ]
                }
            },
            {
                $group: {
                    _id: "$_id", // Group by the original document _id
                    count: { $sum: 1 } // Count the documents in each group
                }
            },
            {
                $project: {
                    _id: 0, // Exclude the _id field from the result
                    count: 1 // Include only the count field in the result
                }
            }
        ]);

        // Assuming you want to return the total count of voters
        let totalCount = 0;
        voters.forEach(voter => {
            totalCount += voter.count;
        });

        res.status(200).json({ status: "200", message: "Voters count", data: totalCount });
    } catch (err) {
        res.status(500).json({ status: "500", message: "Internal Server Error", description: err.message });
    }
},
getVotersByRestaurant: async (req, res) => {
  try {
      const { restaurantId } = req.body;
      console.log("restaurantId",restaurantId);
      let mongoose = require('mongoose');
      let _id = new mongoose.Types.ObjectId(restaurantId);
      console.log("restaurantId(ObjectId)", _id);
      const voters = await Voters.aggregate([
          {
              $unwind: "$restaurants" // Unwind the array to treat each element as a separate document
          },
          {
              $lookup: {
                  from: "restaurants",
                  localField: "restaurants.restaurantId",
                  foreignField: "_id",
                  as: "restaurant"
              }
          },
          {
              $match: { "restaurant._id": { $eq: _id } }
          }
      ]);

      res.status(200).json({ status: "200", message: "Voters count", data: voters });
  } catch (err) {
      res.status(500).json({ status: "500", message: "Internal Server Error", description: err.message });
  }
},
getRestaurantLogo: async (req, res) => {
  try {
      const { restaurantId } = req.body;
      console.log("restaurantId",restaurantId);
      let mongoose = require('mongoose');
      let _id = new mongoose.Types.ObjectId(restaurantId);
      const voters = await Restaurant.aggregate([
          {
              $lookup: {
                  let: { logoObjId: { "$toObjectId": "$logoId" } },
                  from: "logos",
                  pipeline: [
                    { "$match": { "$expr": { "$eq": [ "$_id", "$$logoObjId" ] } } }
                  ],
                  as: "logo"
              }
          },
          {
              $match: { "_id": { $eq: _id } }
          }
      ]);

      res.status(200).json({ status: "200", message: "Restaurant", data: voters });
  } catch (err) {
      res.status(500).json({ status: "500", message: "Internal Server Error", description: err.message });
  }
}
}

module.exports = VoterController;