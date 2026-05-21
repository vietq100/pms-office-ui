import AppConsts from '@lib/appconst'
const { dataType } = AppConsts
const rules = {
  unit: [{ required: true }],
  zoneName: [{ required: true }],
  userName: [{ required: true }],
  code: [{ required: true }],
  description: [{ max: 250 }],
  size: [{ type: dataType.number, max: 999999999999, required: true }],
  powerConsumption: [{ type: dataType.number, max: 999999999999, required: false }]
}

export default rules
