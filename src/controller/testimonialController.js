import Testimonials from "../models/Testimonials.js";

export const addTestimonial = async (req, res) => {
  try {
    const { fullname, location, title, rating, review } = req.body;

    if (!fullname || !rating || !review) {
      return res.status(400).json({
        message: "fullname, rating, and review are required fields",
      });
    }

    const newTestimonial = await Testimonials.create({
      fullname,
      location,
      title,
      rating,
      review,
    });

    return res.status(200).json({
      status: 200,
      message: "Testimonial added successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

export const getAllTestimonials = async (req, res) => {
  const { status } = req.body;
  try {
    let where = {};
    if (status) {
      where.status = status;
    }

    const testimonials = await Testimonials.findAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: status === "active" ? 10 : 100,
    });
    return res.status(200).json({
      status:200,
      data: testimonials,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonials.findByPk(id);
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    await testimonial.destroy();

    return res
      .status(200)
      .json({ message: "Testimonial deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

export const updateTestimonialStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "status is required" });
    }

    const testimonial = await Testimonials.findByPk(id);
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    testimonial.status = status;
    await testimonial.save();

    return res.status(200).json({
      message: "Testimonial status updated successfully",
      data: testimonial,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};
