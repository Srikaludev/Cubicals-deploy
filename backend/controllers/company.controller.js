import Company from "../models/company.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

class CompanyController {
  // Register a new company
  async registerCompany(req, res, next) {
    try {
      const { companyName } = req.body;
      if (!companyName) {
        return res.status(400).json({ message: "Company name is required.", success: false });
      }

      const existingCompany = await Company.findOne({ name: companyName });
      if (existingCompany) {
        return res.status(400).json({ message: "You can't register the same company.", success: false });
      }

      const newCompany = await Company.create({ name: companyName, userId: req.id });
      return res.status(201).json({ message: "Company registered successfully.", company: newCompany, success: true });
    } catch (error) {
      next(error); // Use next for error propagation
    }
  }

  // Get all companies for a user
  async getCompany(req, res, next) {
    try {
      const userId = req.id; // Logged in user id
      const companies = await Company.find({ userId });

      if (companies.length === 0) {
        return res.status(404).json({ message: "Companies not found.", success: false });
      }

      return res.status(200).json({ companies, success: true });
    } catch (error) {
      next(error);
    }
  }

  // Get a specific company by ID
  async getCompanyById(req, res, next) {
    try {
      const companyId = req.params.id;
      const company = await Company.findById(companyId);

      if (!company) {
        return res.status(404).json({ message: "Company not found.", success: false });
      }

      return res.status(200).json({ company, success: true });
    } catch (error) {
      next(error);
    }
  }

  // Update company information
  async updateCompany(req, res, next) {
    try {
      const { name, description, website, location } = req.body;
      const file = req.file;

      // If there's a logo file, upload to Cloudinary
      let logo;
      if (file) {
        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
        logo = cloudResponse.secure_url;
      }

      const updateData = { name, description, website, location, ...(logo && { logo }) };
      const updatedCompany = await Company.findByIdAndUpdate(req.params.id, updateData, { new: true });

      if (!updatedCompany) {
        return res.status(404).json({ message: "Company not found.", success: false });
      }

      return res.status(200).json({ message: "Company information updated.", success: true });
    } catch (error) {
      next(error);
    }
  }
}

export default new CompanyController();