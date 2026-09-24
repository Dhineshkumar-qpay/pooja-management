import Products from "../models/Products.js";
import UserFavourite from "../models/UserFavourite.js";

export const AddFavouriteProduct = async (req, res) => {
  try {
    const userid = req.user?.userid || req.user?.id;
    const { productid } = req.body;

    // Validate user
    if (!userid) {
      return res.status(401).json({
        status: 401,
        message: "User not authenticated",
      });
    }

    // Validate product ID
    if (!productid) {
      return res.status(400).json({
        status: 400,
        message: "Product ID is required",
      });
    }

    // Check product exists
    const product = await Products.findOne({
      where: { productid },
    });

    if (!product) {
      return res.status(404).json({
        status: 404,
        message: "Product not found",
      });
    }

    // Check if product is already in user's favourites
    const existingFavourite = await UserFavourite.findOne({
      where: {
        userid,
        productid,
      },
    });

    if (existingFavourite) {
      return res.status(400).json({
        status: 400,
        message: "Product already in favorites",
      });
    }

    // Create favourite
    await UserFavourite.create({
      userid,
      productid,
    });

    // Update product favourite status
    product.isFavourite = true;
    await product.save();

    return res.status(200).json({
      status: 200,
      message: "Product added to favorites",
    });
  } catch (error) {
    console.error("AddFavouriteProduct Error:", error);

    return res.status(500).json({
      status: 500,
      message: "Server error",
      error: error.message,
    });
  }
};

export const DeleteFavouriteProduct = async (req, res) => {
  try {
    const userid = req.user?.userid || req.user?.id;
    const { favouriteid, productid } = req.body;

    // Validate user
    if (!userid) {
      return res.status(401).json({
        status: 401,
        message: "User not authenticated",
      });
    }

    // Validate input
    if (!favouriteid && !productid) {
      return res.status(400).json({
        status: 400,
        message: "favouriteid or productid is required",
      });
    }

    // Build favourite search condition
    const whereClause = {
      userid,
    };

    if (favouriteid) {
      whereClause.favouriteid = favouriteid;
    } else {
      whereClause.productid = productid;
    }

    // Find favourite
    const favourite = await UserFavourite.findOne({
      where: whereClause,
    });

    if (!favourite) {
      return res.status(404).json({
        status: 404,
        message: "Favourite not found",
      });
    }

    // Get product ID from favourite record
    const favouriteProductId = favourite.productid;

    // Delete favourite
    await favourite.destroy();

    // Check whether any other user still has this product as favourite
    const remainingFavourite = await UserFavourite.findOne({
      where: {
        productid: favouriteProductId,
      },
    });

    // Only set isFavourite = false if nobody else has favourited it
    if (!remainingFavourite) {
      await Products.update(
        {
          isFavourite: false,
        },
        {
          where: {
            productid: favouriteProductId,
          },
        },
      );
    }

    return res.status(200).json({
      status: 200,
      message: "Product removed from favorites",
    });
  } catch (error) {
    console.error("DeleteFavouriteProduct Error:", error);

    return res.status(500).json({
      status: 500,
      message: "Server error",
      error: error.message,
    });
  }
};

export const GetFavouriteProducts = async (req, res) => {
  try {
    const userid = req.user?.userid || req.user?.id;
    const favouriteProducts = await UserFavourite.findAll({
      where: { userid },
      include: [
        {
          model: Products,
          // Removed attribute restrictions to ensure all necessary product details are given
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    // Format the response to properly give the Products
    const formattedProducts = favouriteProducts.map((fav) => {
      const favJson = fav.toJSON();
      const product = favJson.Product;
      delete favJson.Product;

      return {
        ...favJson,
        ...product, // Flatten the product details directly into the object
      };
    });

    return res.status(200).json({
      status: 200,
      data: formattedProducts,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Server error",
      error: error.message,
    });
  }
};
