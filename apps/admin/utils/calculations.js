export const calculateTotal = (items) => {
  if (!Array.isArray(items)) return 0;
  const total = items.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    return sum + quantity * price;
  }, 0);
  return Math.round((total + Number.EPSILON) * 100) / 100;
};
