const rules = {
  projectId: [{ required: true }],
  userId: [{ required: true }],
  relatedTo: [{ required: true }],

  required: [{ required: true }],
  contractNo: [{ required: true }],
  contractCategoryId: [{ required: true }],
  contractTypeCode: [{ required: true }],
  unitPrice: [{ required: true }],
  usageTimes: [{ required: true }],
  maxText: [{ max: 255 }],
  maxTextArea: [{ max: 2000 }],
  maxNumber: [{ type: 'number' as const, max: 999999999999 }],

  unitIds: [
    {
      required: true
    }
  ]
}

export default rules
