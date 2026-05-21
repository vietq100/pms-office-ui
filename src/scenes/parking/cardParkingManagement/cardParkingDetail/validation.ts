const rules = {
  code: [{ required: true }],
  required: [{ required: true }],
  name: [{ required: true }],
  perioud: [{ required: true }],
  numberPlate: [{ required: true }, { max: 15 }]
}

export default rules
