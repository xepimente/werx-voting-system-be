const Logo = require("../models/LogoModel");
const { ObjectId } = require("mongodb");
const { decode } = require("../authentication/auth");

const LogoController = {
  uploadLogo: async (req, res) => {
    try {
      let auth = decode(req.headers["auth"]);
      if (auth.role !== "superadmin")
        return res
          .status(200)
          .json({
            status: "403",
            message: "You are not authorized to perform this action",
          });
      const { title, bannerDescription, bannerHeader, sideContent, sideHeader, adminId } = req.body;
      if (!title)
        return res
          .status(403)
          .json({ status: "403", message: "Please provide a title" });
      if (!bannerDescription)
        return res
          .status(403)
          .json({ status: "403", message: "Please provide a banner description" });
      if (!bannerHeader)
        return res
          .status(403)
          .json({ status: "403", message: "Please provide a banner header" });
      if (!sideContent)
        return res
          .status(403)
          .json({ status: "403", message: "Please provide a side content" });
      if (!sideHeader)
        return res
          .status(403)
          .json({ status: "403", message: "Please provide a side header" });
      if (!adminId)
        return res
          .status(403)
          .json({ status: "403", message: "Please provide a Owner" });
      const mediaUrls = req.file ? [req.file.location] : [];

      if (!mediaUrls || mediaUrls.length === 0)
        return res
          .status(403)
          .json({ status: "403", message: "Please upload an image" });
      const logo = new Logo({
        title: title,
        image_url: mediaUrls[0],
        bannerDescription: bannerDescription,
        bannerHeader: bannerHeader,
        sideContent: sideContent,
        sideHeader: sideHeader,
        adminId: adminId,
      });

      await logo.save();
      return res.status(200).json({
        status: "200",
        message: "Logo uploaded successfully",
        data: logo.image_url,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        status: "500",
        message: "Internal Server Error",
        description: err.message,
      });
    }
  },
  updateLogo: async (req, res) => {
    try {
      let auth = decode(req.headers["auth"]);
      if (auth.role !== "superadmin") {
        return res
          .status(200)
          .json({
            status: "403",
            message: "You are not authorized to perform this action",
          });
      }

      const {
        title,
        id,
        sideHeader,
        sideContent,
        bannerHeader,
        bannerDescription,
        adminId
      } = req.body;
      if (!title) {
        return res
          .status(200)
          .json({ status: "400", message: "Please provide a title" });
      }

      if (!id) {
        return res
          .status(200)
          .json({ status: "400", message: "Please provide a logo id" });
      }

      const currLogo = await Logo.findOne({ _id: new ObjectId(id) });

      // Handle single file
      const mediaUrls = req.file
        ? [req.file.location]
        : req.files
        ? req.files.map((file) => file.location)
        : [];

      const logo = await Logo.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            image_url: mediaUrls.length > 0 ? mediaUrls[0] : currLogo.image_url,
            title: title,
            sideHeader: sideHeader,
            bannerHeader: bannerHeader,
            sideContent: sideContent,
            bannerDescription: bannerDescription,
            adminId: adminId,
          },
        },
        { new: true }
      );

      if (!logo) {
        return res
          .status(200)
          .json({ status: "404", message: "Logo not found" });
      }

      return res.status(200).json({
        status: "200",
        message: "Logo updated successfully",
        data: logo.image_url,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        status: "500",
        message: "Internal Server Error",
        description: err.message,
      });
    }
  },
  getLogo: async (req, res) => {
    try {
      const logo = await Logo.aggregate([
        {
          $lookup: {
              let: { logoObjId: { "$toObjectId": "$adminId" } },
              from: "admins",
              pipeline: [
                { "$match": { "$expr": { "$eq": [ "$_id", "$$logoObjId" ] } } }
              ],
              as: "admin"
          },
        },
        {
          $lookup: {
            let: { logoObjId: { "$toString": "$_id" } },
            from: "restaurants",
            pipeline: [
              { "$match": { "$and": [ { "$expr": { "$eq": [ "$logoId", "$$logoObjId" ] } }, { "$expr": { "$ne": [ "$delete_status", 1 ] } } ] } }
            ],
            as: "restaurants"
          },
        },
        {
          $match: {
            "delete_status": { $ne: 1 }
          }
        }
    ]);

      return res.status(200).json({
        status: "200",
        message: "Logo fetched successfully",
        data: logo,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        status: "500",
        message: "Internal Server Error",
        description: err.message,
      });
    }
  },
  getDeletedLogo: async (req, res) => {
    try {
      const logo = await Logo.aggregate([
        {
          $lookup: {
              let: { logoObjId: { "$toObjectId": "$adminId" } },
              from: "admins",
              pipeline: [
                { "$match": { "$expr": { "$eq": [ "$_id", "$$logoObjId" ] } } }
              ],
              as: "admin"
          },
        },
        {
          $lookup: {
            let: { logoObjId: { "$toString": "$_id" } },
            from: "restaurants",
            pipeline: [
              { "$match": { "$and": [ { "$expr": { "$eq": [ "$logoId", "$$logoObjId" ] } }, { "$expr": { "$ne": [ "$delete_status", 1 ] } } ] } }
            ],
            as: "restaurants"
          },
        },
        {
          $match: {
            "delete_status": { $eq: 1 }
          }
        }
    ]);

      return res.status(200).json({
        status: "200",
        message: "Logo fetched successfully",
        data: logo,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        status: "500",
        message: "Internal Server Error",
        description: err.message,
      });
    }
  },
  getLogoById: async (req, res) => {
    try {
      const { logoId } = req.body;
      const logo = await Logo.findOne({ _id: logoId });
      if(!logoId) return res.status(200).json({ status: "404", message: "Missing logoId input" });
      if(!logo) return res.status(200).json({ status: "404", message: "Logo not found" });
      return res.status(200).json({
        status: "200",
        message: "Logo fetched successfully",
        data: logo,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        status: "500",
        message: "Internal Server Error",
        description: err.message,
      });
    }
  },
  updateLogoDeleteStatus: async(req,res) => {
    try{
      let auth = decode(req.headers["auth"]);
      if(auth.role !== "superadmin") return res.status(200).json({ status: "403", message: "You are not authorized to perform this action" });

      const {id} = req.body;
      const updatedLogo = await Logo.findOneAndUpdate({_id: id}, {
        delete_status: 1
      });
      res.status(200).json({ status: "200", message: "Restaurant updated successfully" });
    }catch(err){
      res.status(200).json({ status: "500", message: "Enternal Error" });
    }
  },
};

module.exports = LogoController;
