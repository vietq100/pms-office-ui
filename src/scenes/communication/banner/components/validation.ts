const rules = {
  required: [{ required: true }],
  subject: [{ required: true }, { max: 255 }],
  message: [{ required: false }, { max: 5000 }],
  bannerTypeId: [{ required: true }],
  forClient: [{ required: true }],
  fromToDate: [{ required: true }],
  image: [{ required: true }]
}

export default rules
