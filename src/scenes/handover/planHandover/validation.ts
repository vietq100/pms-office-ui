import { L, LError } from '@lib/abpUtility'

const rules = {
  required: [
    {
      required: true,
      message: LError('REQUIRED_FIELD_{0}', L('MY_PROFILE_SURNAME'))
    }
  ],
  title: [
    {
      required: true,
      message: LError('REQUIRED_FIELD_{0}', L('TITLE'))
    }
  ],
  maxSlotPerDay: [
    {
      required: true,
      message: LError('REQUIRED_FIELD_{0}', L('MAXIMUM_HANDOVER_PER_DAY'))
    }
  ],
  handoverTime: [
    {
      required: true,
      message: LError('REQUIRED_FIELD_{0}', L('HANDOVER_TIME'))
    }
  ],
  maxTimePerSlot: [
    {
      required: true,
      message: LError('REQUIRED_FIELD_{0}', L('HANDOVER_SLOT_NUMBER'))
    }
  ],
  description: [
    {
      required: true,
      max: 500,
      message: LError('REQUIRED_FIELD_{0}', L('DESCRIPTION'))
    }
  ],
  assignUserIds: [
    {
      required: true,
      message: LError('REQUIRED_FIELD_{0}', L('ASSIGNED_USER'))
    }
  ]
}

export default rules
