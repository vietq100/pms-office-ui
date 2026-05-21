const rules = {
  name: [{ required: true }],
  code: [{ required: true }, { max: 10 }],
  description: [{ required: false }]
}

export default rules
