const Order = require('../../models/order');

// Edit an existing order
async function editOrder(req, res) {
  try {
    // Fetch the existing order from the database using req.params.id
    // Implement the logic to edit the order details based on your requirements
    const editedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.status(200).json(editedOrder);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
}


async function deleteOrder(req, res) {
  const orderId = req.params.id;

  try {
    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({ error: `Order with ID ${orderId} not found.` });
    }

    res.status(200).json({ message: `Order with ID ${orderId} deleted successfully.` });
  } catch (error) {
    console.error(`Error deleting order with ID ${orderId}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// A cart is the unpaid order for a user
async function cart(req, res) {
  try {
    const cart = await Order.getCart(req.user._id);
    res.status(200).json(cart);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}

// Add an item to the cart
async function addToCart(req, res) {
  try {
    const cart = await Order.getCart(req.user._id);
    await cart.addItemToCart(req.params.id);
    res.status(200).json(cart);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}

// Updates an item's qty in the cart
async function setItemQtyInCart(req, res) {
  try {
    const cart = await Order.getCart(req.user._id);
    await cart.setItemQty(req.body.itemId, req.body.newQty);
    res.status(200).json(cart);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}

// Update the cart's isPaid property to true
async function checkout(req, res) {
  try {
    const cart = await Order.getCart(req.user._id);
    cart.isPaid = true;
    await cart.save();
    res.status(200).json(cart);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}

// Return the logged in user's paid order history
async function history(req, res) {
  // Sort most recent orders first
  try {
    const orders = await Order
      .find({ user: req.user._id, isPaid: true })
      .sort('-updatedAt').exec();
    res.status(200).json(orders);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}

module.exports = {
  deleteOrder,
  cart,
  addToCart,
  setItemQtyInCart,
  checkout,
  history,
  editOrder,
};
