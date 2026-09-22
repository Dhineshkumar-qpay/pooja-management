import { Op } from "sequelize";
import sequelize from "../config/sequelize.js";
import Address from "../models/Address.js";
import Cart from "../models/Cart.js";
import { Orders, OrderItems } from "../models/Orders.js";
import Products from "../models/Products.js";
import dayjs from "dayjs";
import Razorpay from "razorpay";
import crypto from "crypto";

const RAZORPAY_KEY_SECRET = "sjZ6vF0MpdRcq1mOoxYU28ZC";
const RAZORPAY_KEY_ID = "rzp_test_Tee0FU35xhyKoK";

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

export const PlaceOrder = async (req, res) => {
  const userid = req.user?.userid;
  const { addressid } = req.body;

  if (!userid) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  if (!addressid) {
    return res.status(400).json({
      message: "Address is required",
    });
  }

  const transaction = await sequelize.transaction();

  try {
    // -----------------------------------
    // 1. Check address
    // -----------------------------------

    const address = await Address.findOne({
      where: {
        addressid,
        userid,
      },
      transaction,
    });

    if (!address) {
      await transaction.rollback();

      return res.status(404).json({
        message: "Address not found",
      });
    }

    // -----------------------------------
    // 2. Get cart
    // -----------------------------------

    const cartItems = await Cart.findAll({
      where: {
        userid,
      },
      transaction,
    });

    if (!cartItems.length) {
      await transaction.rollback();

      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    let totalAmount = 0;
    const orderItems = [];

    // -----------------------------------
    // 3. Validate products and stock
    // -----------------------------------

    for (const item of cartItems) {
      const product = await Products.findByPk(item.productid, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!product) {
        await transaction.rollback();

        return res.status(404).json({
          message: `Product not found for product ID ${item.productid}`,
        });
      }

      const quantity = Number(item.quantity);
      const stock = Number(product.stockquantity);
      const price = Number(product.sellingprice);

      if (quantity <= 0) {
        await transaction.rollback();

        return res.status(400).json({
          message: `Invalid quantity for ${product.productname}`,
        });
      }

      if (stock < quantity) {
        await transaction.rollback();

        return res.status(400).json({
          message: `Not enough stock for ${product.productname}`,
          availableStock: stock,
        });
      }

      totalAmount += quantity * price;

      orderItems.push({
        userid,
        productid: product.productid,
        productname: product.productname,
        productimage: product.thumbnailimage,
        quantity,
        price,
      });
    }

    // -----------------------------------
    // 4. Create Razorpay Order
    // -----------------------------------

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: {
        userid: String(userid),
      },
    });

    // -----------------------------------
    // 5. Create DB Order
    // -----------------------------------

    const order = await Orders.create(
      {
        userid,
        addressid,
        totalamount: totalAmount,
        paymentstatus: "pending",
        orderstatus: "pending",
        shippingprice: 0,
        razorpayorderid: razorpayOrder.id,
      },
      {
        transaction,
      },
    );

    // -----------------------------------
    // 6. Create Order Items
    // -----------------------------------

    await OrderItems.bulkCreate(
      orderItems.map((item) => ({
        ...item,
        orderid: order.orderid,
      })),
      {
        transaction,
      },
    );

    // -----------------------------------
    // 7. Commit
    // -----------------------------------

    await transaction.commit();

    // -----------------------------------
    // 8. Response
    // -----------------------------------

    return res.status(200).json({
      status: 200,
      message: "Order created successfully",
      data: {
        orderid: order.orderid,
        razorpayorderid: razorpayOrder.id,
        razorpaykeyid: RAZORPAY_KEY_ID,
        amount: totalAmount,
        amountpaise: razorpayOrder.amount,
        currency: "INR",
        paymentstatus: "pending",
      },
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error("PlaceOrder Error:", error);

    return res.status(500).json({
      status: 500,
      message: "Server error",
      error: error.message,
    });
  }
};


export const VerifyPayment = async (req, res) => {
  const userid = req.user?.userid;

  const {
    orderid,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  if (!userid) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  if (
    !orderid ||
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  ) {
    return res.status(400).json({
      message: "All payment fields are required",
    });
  }

  const transaction = await sequelize.transaction();

  try {
    // -----------------------------------
    // 1. Find order
    // -----------------------------------

    const order = await Orders.findOne({
      where: {
        orderid,
        userid,
      },
      include: [
        {
          model: OrderItems,
          as: "orderitems",
        },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!order) {
      await transaction.rollback();

      return res.status(404).json({
        message: "Order not found",
      });
    }

    // -----------------------------------
    // 2. Already paid?
    // -----------------------------------

    if (order.paymentstatus === "paid") {
      await transaction.rollback();

      return res.status(200).json({
        status: 200,
        message: "Payment already verified",
        data: {
          orderid: order.orderid,
          paymentstatus: "paid",
          orderstatus: order.orderstatus,
        },
      });
    }

    // -----------------------------------
    // 3. Check Razorpay order ID
    // -----------------------------------

    if (order.razorpayorderid !== razorpay_order_id) {
      await transaction.rollback();

      return res.status(400).json({
        message: "Invalid Razorpay order",
      });
    }

    // -----------------------------------
    // 4. Generate signature
    // -----------------------------------

    const body =
      `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        RAZORPAY_KEY_SECRET,
      )
      .update(body)
      .digest("hex");

    // -----------------------------------
    // 5. Compare signature
    // -----------------------------------

    if (expectedSignature !== razorpay_signature) {
      await transaction.rollback();

      return res.status(400).json({
        status: 400,
        message: "Invalid payment signature",
      });
    }

    // -----------------------------------
    // 6. Verify Razorpay payment
    // -----------------------------------

    const razorpayPayment =
      await razorpay.payments.fetch(
        razorpay_payment_id,
      );

    if (
      razorpayPayment.order_id !==
      razorpay_order_id
    ) {
      await transaction.rollback();

      return res.status(400).json({
        message: "Payment does not belong to this order",
      });
    }

    // -----------------------------------
    // 7. Check payment amount
    // -----------------------------------

    const expectedAmount =
      Math.round(Number(order.totalamount) * 100);

    if (
      Number(razorpayPayment.amount) !==
      expectedAmount
    ) {
      await transaction.rollback();

      return res.status(400).json({
        message: "Payment amount mismatch",
      });
    }

    // -----------------------------------
    // 8. Check payment status
    // -----------------------------------

    if (razorpayPayment.status !== "captured") {
      await transaction.rollback();

      return res.status(400).json({
        message: `Payment is not captured. Current status: ${razorpayPayment.status}`,
      });
    }

    // -----------------------------------
    // 9. Check stock again
    // -----------------------------------

    for (const item of order.orderitems) {
      const product = await Products.findByPk(
        item.productid,
        {
          transaction,
          lock: transaction.LOCK.UPDATE,
        },
      );

      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          message: `Product not found: ${item.productid}`,
        });
      }

      const quantity = Number(item.quantity);
      const stock = Number(product.stockquantity);

      if (stock < quantity) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Not enough stock for ${product.productname}`,
        });
      }

      // Reduce stock
      product.stockquantity =
        stock - quantity;

      await product.save({
        transaction,
      });
    }

    // -----------------------------------
    // 10. Update order
    // -----------------------------------

    await order.update(
      {
        paymentstatus: "paid",
        orderstatus: "confirmed",
        razorpaypaymentid:
          razorpay_payment_id,
        razorpaysignature:
          razorpay_signature,
      },
      {
        transaction,
      },
    );

    // -----------------------------------
    // 11. Clear cart
    // -----------------------------------

    await Cart.destroy({
      where: {
        userid,
        productid: order.orderitems.map(item => item.productid),
      },
      transaction,
    });

    // -----------------------------------
    // 12. Commit
    // -----------------------------------

    await transaction.commit();

    return res.status(200).json({
      status: 200,
      message: "Payment verified successfully",
      data: {
        orderid: order.orderid,
        razorpayorderid: razorpay_order_id,
        razorpaypaymentid: razorpay_payment_id,
        paymentstatus: "paid",
        orderstatus: "confirmed",
        amount: order.totalamount,
      },
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error(
      "VerifyPayment Error:",
      error,
    );

    return res.status(500).json({
      status: 500,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

export const BuyAgain = async (req, res) => {
  const userid = req.user?.userid;
  const { orderid } = req.body;
  if (!orderid) {
    return res.status(400).json({
      message: "Order ID is required",
    });
  }
  try {
    const oldOrder = await Orders.findOne({
      where: {
        orderid,
        userid,
      },
      include: [
        {
          model: OrderItems,
          as: "orderitems",
        },
      ],
    });

    if (!oldOrder) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (!oldOrder.orderitems || oldOrder.orderitems.length === 0) {
      return res.status(400).json({
        message: "This order has no items",
      });
    }

    const addressExists = await Address.findOne({
      where: {
        addressid: oldOrder.addressid,
        userid,
      },
    });

    if (!addressExists) {
      return res.status(400).json({
        message: "Original delivery address is no longer available. Please select a new address.",
      });
    }

    const transaction = await sequelize.transaction();

    try {
      let totalAmount = 0;
      const newItems = [];

      for (const item of oldOrder.orderitems) {
        const product = await Products.findByPk(item.productid, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!product) {
          await transaction.rollback();
          return res.status(404).json({ message: `Product not found for product ID ${item.productid}` });
        }
        const quantity = Number(item.quantity);
        const stockQuantity = Number(product.stockquantity);

        if (quantity <= 0) {
          await transaction.rollback();
          return res.status(400).json({ message: `Invalid quantity for ${product.productname}` });
        }
        if (stockQuantity < quantity) {
          await transaction.rollback();
          return res.status(400).json({
            message: `Insufficient stock for ${product.productname}. Available stock: ${stockQuantity}`,
          });
        }
        const price = Number(product.sellingprice);

        const itemTotal = quantity * price;

        totalAmount += itemTotal;

        newItems.push({
          userid,
          productid: product.productid,
          productname: product.productname,
          productimage: product.thumbnailimage,
          orderid: null,
          quantity,
          price,
        });
      }

      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: `buyagain_${Date.now()}`,
        notes: {
          userid: String(userid),
        },
      });

      const newOrder = await Orders.create(
        {
          userid,
          addressid: oldOrder.addressid,
          totalamount: totalAmount,
          paymentstatus: "pending",
          orderstatus: "pending",
          shippingprice: 0,
          razorpayorderid: razorpayOrder.id,
        },
        {
          transaction,
        },
      );

      // Attach new order ID
      const orderItems = newItems.map((item) => ({
        ...item,
        orderid: newOrder.orderid,
      }));

      // Create order items
      await OrderItems.bulkCreate(orderItems, {
        transaction,
      });

      // Commit transaction
      await transaction.commit();

      return res.status(200).json({
        status: 200,
        message: "Order placed successfully",
        data: {
          orderid: newOrder.orderid,
          razorpayorderid: razorpayOrder.id,
          razorpaykeyid: RAZORPAY_KEY_ID,
          amount: totalAmount,
          amountpaise: razorpayOrder.amount,
          currency: "INR",
          paymentstatus: "pending",
        },
      });
    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }
  } catch (error) {
    console.error("BuyAgain Error:", error);

    return res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

// ------------------ Admin Orders ------------------

export const GetAllAdminOrders = async (req, res) => {
  const { startdate, enddate } = req.body;
  try {
    let startDate;
    let endDate;
    if (startdate && enddate) {
      startDate = dayjs(startdate).startOf("day").toDate();
      endDate = dayjs(enddate).endOf("day").toDate();
    } else {
      startDate = dayjs().startOf("month").toDate();
      endDate = dayjs().endOf("month").toDate();
    }
    const orders = await Orders.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: OrderItems,
          as: "orderitems",
          attributes: {
            exclude: ["userid", "orderid"],
          },
        },
      ],
      order: [["createdAt", "DESC"]],
      attributes: {
        exclude: ["updatedAt"],
      },
    });

    return res.status(200).json({
      status: 200,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ------------------ User Orders ------------------

export const GetAllUserOrders = async (req, res) => {
  const userid = req.user?.userid;

  try {
    const orders = await Orders.findAll({
      where: {
        userid,
      },
      include: [
        {
          model: OrderItems,
          as: "orderitems",
          attributes: {
            exclude: ["userid", "orderid"],
          },
        },
      ],
      order: [["createdAt", "DESC"]],
      attributes: {
        exclude: ["updatedAt"],
      },
    });

    return res.status(200).json({
      status: 200,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const GetOrderDetails = async (req, res) => {
  try {
    const userid = req.user?.userid;
    const { orderid } = req.body;

    const orderDetails = await Orders.findOne({
      where: {
        orderid,
        userid,
      },
      include: [
        {
          model: OrderItems,
          as: "orderitems",
          attributes: {
            exclude: ["userid", "orderid"],
          },
        },
      ],
    });

    if (!orderDetails) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const address = await Address.findOne({
      where: {
        userid,
        addressid: orderDetails.addressid,
      },
    });

    return res.status(200).json({
      status: 200,
      data: { orderdetails: orderDetails, address },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const UpdateOrderStatus = async (req, res) => {
  try {
    const { orderid, orderstatus } = req.body;
    const order = await Orders.findOne({
      where: {
        orderid,
      },
    });
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }
    order.orderstatus = orderstatus;
    await order.save();
    return res.status(200).json({
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
