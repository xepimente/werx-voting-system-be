const mongoose = require('mongoose')

const AdminSchema = mongoose.Schema({
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    profile: {
        type:String,
    },
    first_name: {
        type:String,
    },
    last_name: {
      type: String,
    },
    street: {
      type: String,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
    },
    role: {
      type: String,
      default: 'admin'
    },
    delete_status:{
      type: Number,
      default: 0
    },
}, {timestamps: true})


module.exports = mongoose.model('Admin', AdminSchema);
