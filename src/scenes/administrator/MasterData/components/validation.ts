const rules = {
  name: [{ required: true }],
  code: [{ required: true }],
  projectId: [{ required: true }],
  description: [{ max: 250 }]
}

export default rules
