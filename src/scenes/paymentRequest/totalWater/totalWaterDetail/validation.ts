const rules = {
  projectId: [{ required: true }],
  userId: [{ required: true }],
  relatedTo: [{ required: true }],
  companyId: [{ required: true }],
  required: [{ required: true }],
  contractNo: [{ required: true }],
  contractCategoryId: [{ required: true }],
  contractTypeCode: [{ required: true }],
  unitPrice: [{ required: true }],
  usageTimes: [{ required: true }],
  unitIds: [
    {
      required: true
    }
  ]
}

export default rules
