import Category from '../models/category.js';
import redisClient from '../db/redis.js';
import { validateFields, validateStringField } from '../utils/validators.js';

/* =========================
   GET /api/categories
   Cache: 1 hour
========================= */
export const getCategories = async (req, res) => {
  try {
    const cacheKey = 'categories:list';

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log('Serving categories from cache');
      return res.json(JSON.parse(cached));
    }

    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(categories));

    res.json(categories);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createCategory = async (req, res) => {
    try {
      const allowedKeys = ["name"];
  
      const { error } = validateFields(req.body, allowedKeys);
      if (error) {
        return res.status(400).json({ message: error });
      }
  
      const nameError = validateStringField(req.body.name, "Category name");
      if (nameError) {
        return res.status(400).json({ message: nameError });
      }
  
      const trimmedName = req.body.name.trim();
  
      // Duplicate check
      const existing = await Category.findOne({
        where: { name: trimmedName }
      });
  
      if (existing) {
        return res.status(409).json({
          message: "Category already exists"
        });
      }
  
      const category = await Category.create({ name: trimmedName });
  
      await redisClient.del("categories:list");
  
      res.status(201).json(category);
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };

  export const updateCategory = async (req, res) => {
    try {
      const { id } = req.params;
      const allowedKeys = ["name"];
  
      const { error } = validateFields(req.body, allowedKeys);
      if (error) {
        return res.status(400).json({ message: error });
      }
  
      const nameError = validateStringField(req.body.name, "Category name");
      if (nameError) {
        return res.status(400).json({ message: nameError });
      }
  
      const trimmedName = req.body.name.trim();
  
      const category = await Category.findByPk(id);
  
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
  
      const duplicate = await Category.findOne({
        where: { name: trimmedName }
      });
  
      if (duplicate && duplicate.id !== id) {
        return res.status(409).json({
          message: "Category already exists"
        });
      }
  
      await category.update({ name: trimmedName });
  
      await redisClient.del("categories:list");
  
      res.json(category);
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };


  export const deleteCategory = async (req, res) => {
    try {
      const { id } = req.params;
  
      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({ message: 'Category Not found' });
      }
  
      await category.destroy();
  
      await redisClient.del('categories:list');
  
      res.json({ message: 'Category deleted' });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };