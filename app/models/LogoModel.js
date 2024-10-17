const mongoose = require("mongoose");

const LogoSchema = mongoose.Schema(
  {
    image_url: {
      type: String,
    },
    title:  {
      type: String,
    },
    sideHeader: {
      type: String,
    },
    sideContent: {
      type: String,
    },
    bannerHeader: {
      type: String,
    },
    bannerDescription:{
      type: String,
    },
    adminId: {
        type: String,
    },
    delete_status:{
      type: Number,
      default: 0
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Logo", LogoSchema);
