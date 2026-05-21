const rules = {
  advanceWallets: [{ required: true }],
  userId: [{ required: true }],
  feeTypeId: [{ required: true }],
  balanceAmount: [{ required: true }, { type: 'number' as const }],
  paymentChannel: [{ required: true }],
  date: [{ required: true }],
  description: [{ required: false, max: 2000 }]
}

export default rules
