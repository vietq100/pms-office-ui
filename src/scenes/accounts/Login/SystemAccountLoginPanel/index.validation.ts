const rules = {
  userNameOrEmailAddress: [
    {
      required: true,
      max: 250
    }
  ],
  password: [{ required: true, max: 32 }]
}

export default rules
