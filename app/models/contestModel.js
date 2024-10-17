const mongoose = require('mongoose')

const ContestSchema = mongoose.Schema({
    contest_name: {
        type: String,
    },
    contest_description: {
     type:String,
    },
    contestants: {
        type: Array,
    },
    adminId: {
        type:String,
    },
    delete_status:{
      type: Number,
      default: 0
    },
}, {timestamps: true})


module.exports = mongoose.model('Contest', ContestSchema);