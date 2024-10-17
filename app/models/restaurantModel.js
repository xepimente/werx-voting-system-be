const mongoose = require('mongoose')

const RestaurantSchema = mongoose.Schema({
    restaurant_name: {
        type: String,
    },
    adminId: {
        type: String,
    },
    drinks: {
        type:String,
    },
    votes: {
      type:Number,
      default:0,
    },
    drink_description: {
     type:String,
    },
    background_image:{
      type:String,
    },
    images: {
      type: Array,
    },
    profile_image: {
      type: String,
    },
    delete_status:{
      type: Number,
      default: 0
    },
    logoId: {
      type: String,
    },
}, {timestamps: true})


module.exports = mongoose.model('Restaurant', RestaurantSchema);
