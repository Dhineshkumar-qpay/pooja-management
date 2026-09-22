import Banner from "../models/Banner.js";
import { saveImage, deleteImage } from "../middleware/uploadMiddleware.js";

export const createBanner = async (req, res) => {
  try {
    const { title } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "bannerimage is required" });
    }

    let bannerimagePath = "";
    try {
      bannerimagePath = await saveImage(req.file.buffer, "banners", 1200, 400);
    } catch (imageError) {
      return res.status(500).json({
        message: "image processing failed",
        error: imageError.message,
      });
    }

    const banner = await Banner.create({
      title,
      bannerimage: bannerimagePath,
    });

    return res.status(201).json({ message: "Banner created successfully", data: banner });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const banner = await Banner.findByPk(id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    if (title !== undefined) {
      banner.title = title;
    }

    if (req.file) {
      try {
        const oldImage = banner.bannerimage;
        banner.bannerimage = await saveImage(req.file.buffer, "banners", 1200, 400);
        deleteImage(oldImage);
      } catch (imageError) {
        return res.status(500).json({
          message: "image processing failed",
          error: imageError.message,
        });
      }
    }

    await banner.save();

    return res.status(200).json({ message: "Banner updated successfully", data: banner });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({ message: "Banners fetched successfully", data: banners });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findByPk(id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    await banner.destroy();
    deleteImage(banner.bannerimage);

    return res.status(200).json({ message: "Banner deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
