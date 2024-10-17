const mongoose = require("mongoose");

const VoterSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    phone_number: {
      type: String,
    },
    email: {
      type: String,
    },
    restaurants: [
      {
        restaurantId: {
          type: mongoose.Types.ObjectId,
        },
        rate: {
          type: String,
        },
        comment: {
          type: String,
        },
      },
    ],
    role: {
      type: String,
      default: "voter",
    },
    delete_status: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Voter", VoterSchema);
