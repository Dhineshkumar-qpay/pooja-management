import Address from "../models/Address.js";

export const AddAddress = async (req, res) => {
  try {
    const userid = req.user.userid;
    const {
      firstname,
      lastname,
      phone,
      addressline1,
      addressline2,
      city,
      state,
      country,
      pincode,
    } = req.body;

    if (
      !firstname ||
      !lastname ||
      !phone ||
      !addressline1 ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const address = await Address.create({
      ...req.body,
      userid,
    });
    return res.status(201).json({
      status: 200,
      message: "Address added successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "server error",
      error: error.message,
    });
  }
};

export const EditAddress = async (req, res) => {
  try {
    const { addressid } = req.params;
    const userid = req.user.userid;

    const address = await Address.findOne({ where: { addressid, userid } });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    await address.update(req.body);

    return res.status(200).json({
      status: 200,
      message: "Address updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "server error",
      error: error.message,
    });
  }
};

export const DeleteAddress = async (req, res) => {
  try {
    const { addressid } = req.params;
    const userid = req.user.userid;

    const address = await Address.findOne({ where: { addressid, userid } });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    await address.destroy();

    return res.status(200).json({
      status: 200,
      message: "Address deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "server error",
      error: error.message,
    });
  }
};

export const GetAllAddress = async (req, res) => {
  try {
    const userid = req.user.userid;
    const addresses = await Address.findAll({
      where: { userid },
    });
    return res.status(200).json({
      status: 200,
      data: addresses,
    });
  } catch (error) {
    return res.status(500).json({
      message: "server error",
      error: error.message,
    });
  }
};
