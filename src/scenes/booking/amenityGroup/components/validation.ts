import { emailRegex } from '../../../../lib/appconst'

const rules = {
  projectId: [{ required: true }],
  name: [{ required: true }, { max: 250 }],
  amenityGroupId: [{ required: false }],
  timeZoneId: [{ required: false }],
  buildingIds: [{ required: false }],
  emailReceiveNotify: [{ required: true, pattern: emailRegex }],
  icon: [{ required: true }]
}

export default rules
