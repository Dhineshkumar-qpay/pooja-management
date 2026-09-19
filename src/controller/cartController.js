import Cart from "../models/Cart.js";
import Products from "../models/Products.js";

const addOrUpdateCartItem = async (userid, productid, quantityToAdd = 1) => {
  const product = await Products.findByPk(productid);
  if (!product) throw new Error("Product not found");

  let cartItem = await Cart.findOne({ where: { userid, productid } });

  if (cartItem) {
    cartItem.quantity += quantityToAdd;
    await cartItem.save();
  } else {
    cartItem = await Cart.create({
      userid,
      productid,
      quantity: quantityToAdd,
    });
  }
  return cartItem;
};

export const addToCart = async (req, res) => {
  try {
    const { productid } = req.body;
    const userid = req.user.userid;

    if (!productid) {
      return res.status(400).json({ message: "productid is required" });
    }

    const cartItem = await addOrUpdateCartItem(userid, productid, 1);

    return res.status(200).json({
      message: "Product added to cart successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "server error",
      error: error.message,
    });
  }
};

export const increaseQuantity = async (req, res) => {
  try {
    const { cartid } = req.params;
    const userid = req.user.userid || req.user.id;

    const cartItem = await Cart.findOne({ where: { cartid, userid } });
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    cartItem.quantity += 1;
    await cartItem.save();

    return res.status(200).json({
      message: "Quantity increased",
      data: cartItem.quantity,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

export const decreaseQuantity = async (req, res) => {
  try {
    const { cartid } = req.params;
    const userid = req.user.userid || req.user.id;

    const cartItem = await Cart.findOne({ where: { cartid, userid } });
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
      await cartItem.save();
      return res.status(200).json({
        message: "Quantity decreased",
        data: cartItem.quantity,
      });
    } else {
      await cartItem.destroy();
      return res.status(200).json({
        message: "Item removed from cart",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

export const deleteCartItem = async (req, res) => {
  try {
    const { cartid } = req.params;
    const userid = req.user.userid || req.user.id;

    const cartItem = await Cart.findOne({ where: { cartid, userid } });
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    await cartItem.destroy();

    return res.status(200).json({ message: "Cart item deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

export const getCartCount = async (req, res) => {
  try {
    const userid = req.user.userid;

    const count = await Cart.count({
      where: {
        userid,
      },
    });

    return res.status(200).json({
      message: "Cart count fetched",
      count: count || 0,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

export const buyNow = async (req, res) => {
  try {
    const { productid } = req.body;
    const userid = req.user.userid || req.user.id;

    if (!productid) {
      return res.status(400).json({ message: "productid is required" });
    }

    const cartItem = await addOrUpdateCartItem(userid, productid, 1);

    return res.status(200).json({
      message: "Item added to cart, ready for checkout",
      data: cartItem,
      buyNow: true,
    });
  } catch (error) {
    return res.status(error.message === "Product not found" ? 404 : 500).json({
      message: error.message || "server error",
    });
  }
};

export const getCartItems = async (req, res) => {
  try {
    const userid = req.user.userid;
    const cartItems = await Cart.findAll({
      where: { userid },
      include: [
        {
          model: Products,
          attributes: [
            "thumbnailimage",
            "productname",
            "categoryname",
            "price",
            "sellingprice",
          ],
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });
    let totalamount = 0;

    const updatedCartItems = await Promise.all(
      cartItems.map(async (item) => {
        totalamount += item.quantity * parseFloat(item.Product.sellingprice);
        return {
          ...item.toJSON(),
        };
      }),
    );

    return res.status(200).json({
      status: 200,
      data: {
        cartItems: updatedCartItems,
        totalamount: totalamount.toFixed(2),
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};
