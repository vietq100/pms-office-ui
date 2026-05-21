const rules = {
  name: [{ required: true }],
  surname: [{ required: true }],
  displayName: [{ required: true }, { min: 6 }, { max: 256 }],
  userName: [{ required: true }, { min: 5 }, { max: 256 }],
  emailAddress: [{ required: true }]
}

export default rules
