//controllers/api/items
const Item = require('../../models/item');

module.exports = {
  index,
  show
};

async function index(req, res) {
  try {
    const items = await Item.find({})
      .sort('name')
      .populate('category')
      .lean() // Convert to plain JS object for performance
      .exec();

    // Re-sort based on category sortOrder
    const sortedItems = items.sort((a, b) => a.category.sortOrder - b.category.sortOrder);
    
    res.json(sortedItems);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ 
      error: 'Server Error',
      message: error.message 
    });
  }
}

async function show(req, res) {
  try {
    const item = await Item.findById(req.params.id).lean();
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error(`Error fetching item ${req.params.id}:`, error);
    res.status(400).json({ 
      error: 'Invalid Request',
      message: error.message 
    });
  }
}