export const questionRules = {
  questionTypeId: [{ required: true }],
  questionLabel: [{ required: true }],
  questionDescription: [{ required: true }]
}
export const sectionRules = {
  name: [{ required: true }]
}

export const ruleMoveQuestion = {
  id: [{ required: true }],
  targetId: [{ required: true }]
}

const rules = {
  formName: [{ required: true }, { max: 200 }]
}

export default rules
