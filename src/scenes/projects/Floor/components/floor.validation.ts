import AppConsts from '@lib/appconst'
const { dataType } = AppConsts
const rules = {
  name: [{ required: true }],
  surname: [{ required: true }],
  userName: [{ required: true }],
  code: [{ required: true }],
  description: [{ max: 250 }],
  size: [{ type: dataType.number, max: 999999999999, required: true }]
}

export default rules
