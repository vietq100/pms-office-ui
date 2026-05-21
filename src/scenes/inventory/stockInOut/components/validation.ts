const rules = {
  name: [{ required: true }]
}

export const rulesStockIn = {
  inventoryId: [{ required: true }],
  quantity: [{ required: true }],
  currentQuantity: [{ required: true }],
  inputDate: [{ required: true }],
  description: [{ required: true }]
}

export const rulesStockOut = {
  inventoryId: [{ required: true }],
  quantity: [{ required: true }],
  currentQuantity: [{ required: true }],
  outputDate: [{ required: true }],
  description: [{ required: true }]
}

export default rules
