const CartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_CART": {
      const {
        stock,
        id,
        title,
        image,
        purchase_price,
        discount,
        regular_price,
        quantity,
        manufacturer_name,
        name,
        generic_name,
      } = action.payload;

      const existingProduct = state.cart.find((item) => item.id === id);

      if (existingProduct) {
        const updatedCart = state.cart.map((item) => {
          if (item.id === id) {
            const newQuantity = item.quantity + quantity;
            return {
              ...item,
              quantity: newQuantity > stock ? stock : newQuantity,
            };
          }
          return item;
        });

        return { ...state, cart: updatedCart };
      } else {
        const numDiscount = Number(discount) || 0;
        const numRegular = Number(regular_price) || 0;
        const effectivePrice = numDiscount > 0 ? numDiscount : numRegular;

        const newCartItem = {
          stock: Number(stock) || 0,
          id,
          title,
          image,
          price: effectivePrice,
          purchase_price: Number(purchase_price) || 0,
          discount: numDiscount,
          regular_price: numRegular,
          quantity,
          manufacturer_name,
          name,
          generic_name,
        };

        return { ...state, cart: [...state.cart, newCartItem] };
      }
    }

    case "SET_INCREMENT": {
      const updatedCart = state.cart.map((item) => {
        if (item.id === action.payload) {
          const newQuantity = item.quantity + 1;
          return {
            ...item,
            quantity: newQuantity > item.stock ? item.stock : newQuantity,
          };
        }
        return item;
      });

      return { ...state, cart: updatedCart };
    }

    case "SET_DECREMENT": {
      const updatedCart = state.cart.map((item) => {
        if (item.id === action.payload) {
          const newQuantity = item.quantity - 1;
          return {
            ...item,
            quantity: newQuantity < 1 ? 1 : newQuantity,
          };
        }
        return item;
      });

      return { ...state, cart: updatedCart };
    }

    case "REMOVE_CART": {
      const updatedCart = state.cart.filter(
        (item) => item.id !== action.payload
      );
      return { ...state, cart: updatedCart };
    }

    case "CART_TOTAL_ITEM": {
      const totalItems = state.cart.reduce(
        (total, item) => total + item.quantity,
        0
      );
      return { ...state, totalItems };
    }

    case "CART_TOTAL_PRICE": {
      const totalPrice = state.cart.reduce((total, item) => {
        const itemPrice = Number(item.price || item.discount || item.regular_price) || 0;
        return total + itemPrice * item.quantity;
      }, 0);
      const roundedTotal = Math.round((totalPrice + Number.EPSILON) * 100) / 100;
      return { ...state, totalPrice: roundedTotal };
    }

    default:
      return state;
  }
};

export default CartReducer;
