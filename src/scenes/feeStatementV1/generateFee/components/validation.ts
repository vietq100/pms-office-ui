const rules = {
  feeType: [{ required: true }],
  period: [{ required: true }],
  description: [{ required: true, max: 2000 }]
}

export default rules
