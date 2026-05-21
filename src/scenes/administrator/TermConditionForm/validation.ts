const rules = {
  projectId: [{ required: true }],
  unitId: [{ required: true }],
  userId: [{ required: true }],
  subject: [{ required: true, max: 500 }],
  content: [{ required: true, max: 5000 }]
}

export default rules
