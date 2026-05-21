import AppConsts from '@lib/appconst'
const { dataType } = AppConsts
const rules = {
  name: [{ required: true }],
  code: [{ required: true }],
  fullUnitCode: [{ required: true }],
  projectId: [{ required: true }],
  buildingId: [{ required: true }],
  floorId: [{ required: true }],
  typeId: [{ required: true }],
  statusId: [{ required: true }],
  size: [{ type: dataType.number, max: 999999999999, required: true }],
  moveOutReason: [{ required: true }],
  member: [{ required: true }],
  pecode: [{ required: true }],
  wa: [{ required: true }]
}

export default rules
