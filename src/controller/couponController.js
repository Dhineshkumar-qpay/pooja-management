import Coupon from "../models/Coupon.js";

export const createCoupon = async (req, res) => {
  try {
    const { couponcode, type, value, minorder, expiry } = req.body;

    if (!couponcode || !type || !value || !expiry) {
      return res
        .status(400)
        .json({ message: "couponcode, type, value and expiry are required" });
    }

    const existingCoupon = await Coupon.findOne({ where: { couponcode } });
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    const coupon = await Coupon.create({
      couponcode,
      type,
      value,
      minorder: minorder || 0,
      expiry,
    });

    return res.status(201).json({ message: "Coupon created successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { couponcode, type, value, minorder, expiry } = req.body;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    if (couponcode && couponcode !== coupon.couponcode) {
      const existingCoupon = await Coupon.findOne({ where: { couponcode } });
      if (existingCoupon) {
        return res.status(400).json({ message: "Coupon code already exists" });
      }
      coupon.couponcode = couponcode;
    }

    if (type) coupon.type = type;
    if (value) coupon.value = value;
    if (minorder !== undefined) coupon.minorder = minorder;
    if (expiry) coupon.expiry = expiry;

    await coupon.save();

    return res
      .status(200)
      .json({ message: "Coupon updated successfully", data: coupon });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.findAll({
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({ status: 200, data: coupons });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    await coupon.destroy();

    return res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
