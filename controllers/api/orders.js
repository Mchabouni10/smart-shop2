//controllers/api/orders.js
const Order = require('../../models/order');

async function editOrder(req, res) {
  try {
    const editedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Return updated doc and run validators
    );

    if (!editedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(editedOrder);
  } catch (error) {
    console.error('Error editing order:', error);
    res.status(400).json({ 
      error: 'Validation Error',
      details: error.errors 
    });
  }
}

async function deleteOrder(req, res) {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    
    if (!deletedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ 
      error: 'Server Error',
      message: error.message 
    });
  }
}

async function cart(req, res) {
  try {
    const cart = await Order.getCart(req.user._id);
    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ 
      error: 'Server Error',
      message: error.message 
    });
  }
}

async function addToCart(req, res) {
  try {
    const cart = await Order.getCart(req.user._id);
    await cart.addItemToCart(req.params.id);
    res.json(await Order.findById(cart._id).populate('lineItems.item'));
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(400).json({ 
      error: 'Invalid Request',
      message: error.message 
    });
  }
}

async function setItemQtyInCart(req, res) {
  try {
    const cart = await Order.getCart(req.user._id);
    await cart.setItemQty(req.body.itemId, req.body.newQty);
    res.json(await Order.findById(cart._id).populate('lineItems.item'));
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    res.status(400).json({ 
      error: 'Invalid Request',
      message: error.message 
    });
  }
}

async function checkout(req, res) {
  try {
    const cart = await Order.getCart(req.user._id);
    cart.isPaid = true;
    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(400).json({ 
      error: 'Checkout Failed',
      message: error.message 
    });
  }
}

async function history(req, res) {
  try {
    const orders = await Order.find({ 
      user: req.user._id, 
      isPaid: true 
    })
    .sort('-updatedAt')
    .populate('lineItems.item')
    .exec();

    res.json(orders);
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).json({ 
      error: 'Server Error',
      message: error.message 
    });
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
