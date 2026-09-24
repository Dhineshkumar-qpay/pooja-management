import { Op } from "sequelize";
import { Orders } from "../models/Orders.js";
import Products from "../models/Products.js";
import Users from "../models/Users.js";

export const DashboardCounts = async (req, res) => {
  try {
    const [
      totalrevenue,
      totalorders,
      totalproducts,
      totalcustomers,
      pendingorders,
      confirmedorders,
      shippedorders,
      deliveredorders,
      cancelledorders,
      lowstockproducts,
    ] = await Promise.all([
      await Orders.sum("totalamount"),
      await Orders.count(),
      await Products.count(),
      await Users.count({ where: { role: "user" } }),
      await Orders.count({
        where: {
          orderstatus: "pending",
        },
      }),
      await Orders.count({
        where: {
          orderstatus: "confirmed",
        },
      }),
      await Orders.count({
        where: {
          orderstatus: "shipped",
        },
      }),
      await Orders.count({ where: { orderstatus: "delivered" } }),
      await Orders.count({ where: { orderstatus: "cancelled" } }),
      await Products.count({
        where: { stockquantity: { [Op.lt]: 5 } },
      }),
    ]);

    return res.status(200).json({
      totalrevenue: totalrevenue || 0,
      totalorders,
      totalproducts,
      totalcustomers,
      pendingorders,
      confirmedorders,
      shippedorders,
      deliveredorders,
      cancelledorders,
      lowstockproducts,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const DashboardSales = async (req, res) => {
  try {
    const { year } = req.body;

    const orders = await Orders.findAll({
      where: {
        createdAt: {
          [Op.between]: [new Date(year, 0, 1), new Date(year, 11, 31)],
        },
      },
      attributes: [
        [
          Orders.sequelize.fn("COUNT", Orders.sequelize.col("orderid")),
          "totalorders",
        ],
        [
          Orders.sequelize.fn("SUM", Orders.sequelize.col("totalamount")),
          "totalamount",
        ],
        [
          Orders.sequelize.fn(
            "DATE_FORMAT",
            Orders.sequelize.col("createdAt"),
            "%M",
          ),
          "month",
        ],
      ],
      group: [Orders.sequelize.fn("DATE", Orders.sequelize.col("createdAt"))],
      order: [
        [Orders.sequelize.fn("DATE", Orders.sequelize.col("createdAt")), "ASC"],
      ],
    });

    return res.status(200).json({
      sales: orders,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
