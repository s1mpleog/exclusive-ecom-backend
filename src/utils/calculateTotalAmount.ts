export const calculateTotalPrice = (cartItems: any[]): number => {
	return cartItems.reduce((total, cartItem) => {
		return total + cartItem.totalAmount * cartItem.quantity;
	}, 0);
};
