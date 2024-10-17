const Admin = require("../models/adminModel");
const Restaurant = require("../models/restaurantModel");
const bcrypt = require("bcrypt");
const { createToken, decode } = require("../authentication/auth");
const QRCode = require('qrcode');


function getPositionSuffix(position) {
  const suffixes = ["st", "nd", "rd"];
  const remainder10 = position % 10;
  const remainder100 = position % 100;

  if (remainder10 >= 1 && remainder10 <= 3 && !(remainder100 >= 11 && remainder100 <= 13)) {
    return suffixes[remainder10 - 1];
  } else {
    return "th";
  }
}

const AdminController = {
  addAdmin: async (req, res) => {
    try {
      let auth = decode(req.headers["auth"]);
      if(auth.role !== "superadmin") return res.status(200).json({ status: "403", message: "You are not authorized to perform this action" });

      const {
        email,
        password,
        profile,
        first_name,
        last_name,
        street,
        city,
        country,
        restaurant,
      } = req.body;
      const isEmailExists = await Admin.findOne({ email: email, delete_status: 0});

      if (isEmailExists)
        return res
          .status(200)
          .json({ status: "403", message: "Email already exists" });

      if(!email) return res.status(200).json({ status: "403", message: "Email is required" });
      if(!password) return res.status(200).json({ status: "403", message: "Password is required" });
      if(first_name === "") return res.status(200).json({ status: "403", message: "First name is required" });
      if(last_name === "") return res.status(200).json({ status: "403", message: "Last name is required" });

      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = new Admin({
        email,
        password: hashedPassword,
        profile,
        first_name,
        last_name,
        street,
        city,
        country,
        restaurant,
      });
      const savedAdmin = await newAdmin.save();
      res
        .status(200)
        .json({ status: "200", message: "Admin added successfully" });
    } catch (err) {
      res.status(200).json({ status: "500", message: "Enternal Error", description: err.message });
    }
  },
  getAllAdminRole: async (req, res) => {
    try {
      let auth = decode(req.headers["auth"]);
      if (auth.role !== "superadmin") return res.status(200).json({ status: "403", message: "You are not authorized to perform this action" });
  
      const admins = await Admin.find({ role: "admin", delete_status: 0 });
      const adminsWithRestaurantNames = await Promise.all(admins.map(async admin => {
        const restaurants = await Restaurant.find({ adminId: admin._id, delete_status: 0 }, 'restaurant_name');
        const restaurantNames = restaurants.map(restaurant => restaurant.restaurant_name);
        return {
          ...admin.toObject(),
          restaurant: restaurantNames
        };
      }));
  
      res.status(200).json({ status: "200", data: adminsWithRestaurantNames });
    } catch (err) {
      res.status(200).json({ status: "500", message: "Internal Error", description: err.message });
    }
  },
  updateAdmin: async(req,res) => {
    try{
      let auth = decode(req.headers["auth"]);
      if(auth.role !== "superadmin") return res.status(200).json({ status: "403", message: "You are not authorized to perform this action" });

      const {email, password, profile, first_name, last_name, street, city, country, restaurant, id} = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const currUser = await Admin.findOne({_id: id});

      const updatedAdmin = await Admin.findOneAndUpdate({_id: id}, {
        password: password !== "" ? hashedPassword : currUser.password, 
        profile,
        first_name,
        last_name,
        street,
        city,
        country,
        restaurant
      });
      res.status(200).json({ status: "200", message: "Admin updated successfully" });
    }catch(err){
      res.status(200).json({ status: "500", message: "Enternal Error" });
    }
  },
  updateAdminDeleteStatus: async(req,res) => {
    try{
      let auth = decode(req.headers["auth"]);
      if(auth.role !== "superadmin") return res.status(200).json({ status: "403", message: "You are not authorized to perform this action" });

      const {id} = req.body;
      console.log(id);
      const updatedAdmin = await Admin.findOneAndUpdate({_id: id}, {
        delete_status: 1
      });
      console.log(updatedAdmin)
      res.status(200).json({ status: "200", message: "Admin updated successfully" });
    }catch(err){
      res.status(200).json({ status: "500", message: "Enternal Error", description: err.message });
    }
  },
  updateRestauranteDeleteStatus: async(req,res) => {
    try{
      let auth = decode(req.headers["auth"]);
      if(auth.role !== "superadmin") return res.status(200).json({ status: "403", message: "You are not authorized to perform this action" });

      const {id} = req.body;
      const updatedRestaurant = await Restaurant.findOneAndUpdate({_id: id}, {
        delete_status: 1
      });
      res.status(200).json({ status: "200", message: "Restaurant updated successfully" });
    }catch(err){
      res.status(200).json({ status: "500", message: "Enternal Error" });
    }
  },
  signIn: async (req, res) => {
    try {
      const { email, password } = req.body;
      const admin = await Admin.findOne({ email: email });
      if (!admin)
        return res
          .status(200)
          .json({ status: "401", message: "Invalid email or password" });
      const isPasswordCorrect = await bcrypt.compare(password, admin.password);
      if (!isPasswordCorrect)
        return res
          .status(200)
          .json({ status: "401", message: "Invalid email or password" });

      // if(admin.role !== 'superadmin') return res.status(200).json({ status: "403", message: "You are not authorized to perform this action" });

      const accessToken = createToken(admin);

      // res.cookie("auth", accessToken.accessToken, {
      //   maxAge: 86400000,
      //   domain: "voting-system-admin-zeta.vercel.app", 
      //   secure:false,
      //   sameSite: 'None',
      // });

      res.status(200).json({ status: "200", message: "Login successful", accessToken: accessToken.accessToken });
    } catch (err) {
      res.status(200).json({ status: "500", message: "Enternal Error" });
    }
  },
  signOut: async(req,res) => {
    try{
      res.clearCookie("auth");
      res.status(200).json({ status: "200", message: "Logout successful" });
    }catch(err){
      res.status(200).json({ status: "500", message: "Enternal Error" });
    }
  },
  addRestaurant: async(req,res) => {
    try{  
      let auth = decode(req.headers["auth"]);
      if(auth.role !== "superadmin") return res.status(200).json({ status: "403", message: "You are not authorized to perform this action" });

      const {restaurant_name,adminId,logoId,drinks, drink_description, background_image, profile_image} = req.body;

      const cleanRestaurantName = restaurant_name.trim().toLowerCase();
      const regexPattern = cleanRestaurantName.split(/\s+/).map(word => `(?=.*${word})`).join('');
      const regex = new RegExp(regexPattern, 'i');

      const isRestaurantExists = await Restaurant.findOne({ restaurant_name: { $regex: regex }, delete_status: 0 });
      if(isRestaurantExists) return res.status(200).json({ status: "400", message: "Restaurant already exists" });
      if(!restaurant_name) return res.status(200).json({ status: "400", message: "Restaurant name is required!" });
      if(!drinks) return res.status(200).json({ status: "400", message: "Product name is required!" });
      if(!drink_description) return res.status(200).json({ status: "400", message: "Product description is required!" });
      if(!adminId) return res.status(200).json({ status: "400", message: "Owner/Admin is required!" });
      if(!logoId) return res.status(200).json({ status: "400", message: "Logo is required!" });

      const mediaUrls = req.files.map(file => file.location);
     
      const newRestaurant = new Restaurant({
        restaurant_name,
        adminId,
        logoId,
        drinks,
        drink_description,
        background_image,
        images: mediaUrls,
        profile_image
      });
      const savedRestaurant = await newRestaurant.save();

      // const qrCode = await QRCode.toDataURL(savedRestaurant._id.toString());
      const qrCode = await QRCode.toDataURL(`https://voting-system-lovat.vercel.app/voters-registration/${savedRestaurant._id.toString()}`);

      res.status(200).json({ status: "200", message: "Restaurant added successfully", qrCode: qrCode });
    }catch(err){
      res.status(200).json({ status: "500", message: "Enternal Error", description: err.message }); 
    }
  },
  updateRestaurant: async(req,res) => {
    try{
      let auth = decode(req.headers["auth"]);
      if(auth.role !== "superadmin") return res.status(200).json({ status: "403", message: "You are not authorized to perform this action" });

      const {restaurant_name, adminId, logoId, drinks, drink_description, background_image, images, profile_image, id} = req.body;
      const currRestaurant = await Restaurant.findOne({_id: id});

      const mediaUrls = req.files.map(file => file.location);

      const updatedRestaurant = await Restaurant.findOneAndUpdate({_id: id}, {
        restaurant_name,
        adminId,
        logoId,
        drinks,
        drink_description,
        background_image,
        images: mediaUrls.length > 0 ? mediaUrls : currRestaurant.images,
        profile_image
      });
      res.status(200).json({ status: "200", message: "Restaurant updated successfully" });
    }catch(err){
      res.status(200).json({ status: "500", message: "Enternal Error", description: err.message });
    }
  },
  getAllRestaurants: async (req, res) => {
    try {
      let auth = decode(req.headers["auth"]);
      if (auth.role !== "superadmin") return res.status(200).json({ status: "403", message: "You are not authorized to perform this action" });
  
      const restaurants = await Restaurant.find({ delete_status: 0 });
  
      // Sort restaurants based on popularity (number of votes)
      restaurants.sort((a, b) => b.votes - a.votes);
  
      const restaurantsWithOwner = await Promise.all(restaurants.map(async (restaurant, index) => {
        const admin = await Admin.findById(restaurant.adminId);
        const owner = `${admin.first_name} ${admin.last_name}`;
        const position = index + 1; // Position starts from 1
        return {
          ...restaurant.toObject(),
          owner,
          position: `${position}${getPositionSuffix(position)}`
        };
      }));
  
      res.status(200).json({ status: "200", data: restaurantsWithOwner });
    } catch (err) {
      res.status(200).json({ status: "500", message: "Internal Error", description: err.message });
    }
  },
  getCountRestaurants: async(req,res) => {
    try{
      const restaurants = await Restaurant.find({ delete_status: 0 });
      res.status(200).json({ status: "200", data: restaurants.length });
    }catch(err){
      res.status(200).json({ status: "500", message: "Internal Error", description: err.message });
    }
  }
};

module.exports = AdminController;
