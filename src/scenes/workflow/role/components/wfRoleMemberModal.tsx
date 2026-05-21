import { Modal, List, Select } from 'antd'
import { L } from '../../../../lib/abpUtility'
import MemberItem from './memberItem'
import { IUserModel } from '../../../../models/User/IUserModel'
import { useState, useRef, useEffect } from 'react'
import { isEqual } from 'lodash'
import staffService from '../../../../services/member/staff/staffService'
const { Option } = Select

const usePrevious = (value) => {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

export interface IRoleMemberModalProps {
  visible: boolean
  onCancel: () => void
  onAddOrRemove: (isAdd, member) => void
  onSave: (userIds) => void
  members?: IUserModel[]
  isLoading: boolean
}

function WfRoleMemberModal({ visible, members, onCancel, onSave, isLoading }: IRoleMemberModalProps) {
  const previousValue = usePrevious(members)
  const previousVisibleValue = usePrevious(visible)
  const [employees, setEmployees] = useState([])
  const [selectedEmployees, setSelectedEmployees] = useState(members || [])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')

  useEffect(() => {
    if (previousValue && !isEqual(previousValue, members)) {
      setSelectedEmployees(members || [])
    }
  }, [members])

  useEffect(() => {
    if (!previousVisibleValue && visible) {
      setSelectedEmployeeId('')
      findEmployees('')
    }
  }, [visible])

  const findEmployees = async (keyword) => {
    const results = await staffService.filterOptions({ keyword })
    setEmployees(results)
  }

  const onAddMember = (value) => {
    const selectedEmployee = employees.find((item: any) => item.value === value) as any
    if (selectedEmployee && selectedEmployees.findIndex((item: any) => item.id === value) === -1) {
      setSelectedEmployees([
        ...selectedEmployees,
        {
          id: selectedEmployee.value,
          displayName: selectedEmployee.label
        } as IUserModel
      ])
    }
  }

  const onRemoveMember = (value) => {
    setSelectedEmployees(selectedEmployees.filter((item) => item.id !== value))
  }

  const handleSave = () => {
    onSave(selectedEmployees.map((item) => item.id))
  }

  return (
    <Modal
      open={visible}
      cancelText={L('BTN_CANCEL')}
      okText={L('BTN_SAVE')}
      onCancel={onCancel}
      onOk={handleSave}
      title={L('WF_ROLE_MEMBER')}
      confirmLoading={isLoading}>
      <div>
        <label>{L('EMPLOYEE')}</label>
        <Select
          showSearch
          className="full-width"
          value={selectedEmployeeId}
          onSearch={findEmployees}
          filterOption={false}
          onChange={(value) => onAddMember(value)}>
          {(employees || []).map((option: any) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </div>
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 2,
          lg: 2,
          xl: 2,
          xxl: 2
        }}
        dataSource={selectedEmployees}
        renderItem={(employee) => <MemberItem member={employee} onRemove={() => onRemoveMember(employee.id)} />}
      />
    </Modal>
  )
}

export default WfRoleMemberModal
