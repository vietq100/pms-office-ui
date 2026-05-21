const rules = {
  name: [{ required: true }, { min: 1 }, { max: 64 }],
  projectId: [{ required: true }],
  teamId: [{ required: true }],
  assignedIds: [{ required: true }],
  watcherIds: [{ required: true }],
  statusId: [{ required: true }],
  priorityId: [{ required: true }],
  assetIds: [],
  startDate: [{ required: true }],
  description: []
}

export default rules
