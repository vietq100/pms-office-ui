import { emailRegex, phoneRegex } from '../../../../lib/appconst'

const rules = {
  name: [{ required: true }, { min: 1 }, { max: 64 }],
  surname: [{ required: true }, { min: 1 }, { max: 64 }],
  displayName: [{ required: true }, { min: 6 }, { max: 256 }],
  userName: [{ required: true }, { min: 5 }, { max: 256 }],
  emailAddress: [
    { required: true },
    { min: 6 },
    { max: 256 },
    {
      required: false,
      pattern: emailRegex
    }
  ],
  password: [{ required: true }, { min: 6 }, { max: 256 }],
  phoneNumber: [
    { max: 15 },
    {
      required: false,
      pattern: phoneRegex
    }
  ],
  identityNumber: [{ max: 64 }],
  passport: [{ max: 64 }],
  shopName: [{ required: true, message: 'Please input your shop name !' }],
  shopAddress: [{ required: true, message: 'Please input your shop address !' }],
  shopPhoneNumber: [{ required: true, message: 'Please input your shop phone number !' }],
  shopEmail: [{ message: 'Please input your shop email correctly !' }],
  companyCode: [{ required: true, message: 'Please input your company code !' }]
}

export default rules
