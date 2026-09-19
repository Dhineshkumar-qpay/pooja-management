import ContactUs from "../models/Contactus.js";

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: "name, email, subject, and message are required fields",
      });
    }
    const newContact = await ContactUs.create({
      name,
      email,
      phone,
      subject,
      message,
    });

    return res.status(201).json({
      message: "Contact form submitted successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

export const getAllContacts = async (req, res) => {
  try {
    const contacts = await ContactUs.findAll({
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({
      message: "Contacts fetched successfully",
      data: contacts,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await ContactUs.findByPk(id);
    if (!contact) {
      return res.status(404).json({ message: "Contact submission not found" });
    }

    await contact.destroy();

    return res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};
