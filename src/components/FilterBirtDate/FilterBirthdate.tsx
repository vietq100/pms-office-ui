import { DatePicker } from 'antd'
import './index.css'
import { monthDateFormat } from '@lib/appconst'
import { L } from '@lib/abpUtility'

export interface Props {
  onChange: (value) => void
}
const FilterBirthdate = ({ onChange }: Props) => {
  return (
    <DatePicker
      className="full-width custom-picker-birtdate"
      format={monthDateFormat}
      placeholder={L('SELECT_DATE')}
      onChange={(value) => onChange(value)}
    />
  )
}

export default FilterBirthdate
