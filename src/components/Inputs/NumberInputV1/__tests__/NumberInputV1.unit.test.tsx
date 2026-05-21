import { mount, shallow } from 'enzyme'
import NumberInputV1 from '../index'

describe('Test for Number Input Component', function () {
  let wrapper

  beforeEach(function () {
    wrapper = document.createElement('div')
    document.body.appendChild(wrapper)
  })

  afterEach(function () {
    wrapper = null
  })

  it('Test output with scientific notation 1e-8 === 0.00000001', async () => {
    wrapper = mount(<NumberInputV1 value="1e-8" />)
    const input = wrapper.find('input')
    expect(input.length).toBe(1)
    expect(input.props().value).toBe('0.00000001')
  })

  it('Test number was formatted', async () => {
    wrapper = mount(<NumberInputV1 value="100000" />)
    const input = wrapper.find('input')
    expect(input.length).toBe(1)
    expect(input.props().value).toBe('100,000')
  })

  it('Test number negative was formatted', async () => {
    wrapper = mount(<NumberInputV1 value="-100000" />)
    const input = wrapper.find('input')
    expect(input.length).toBe(1)
    expect(input.props().value).toBe('-100,000')
  })

  it('Test input change value and emmit to parent', async () => {
    let value = '1e-8'
    wrapper = shallow(<NumberInputV1 value={value} onChange={(e) => (value = e)} />)
      .dive()
      .dive()
      .dive()
    const input = wrapper.find('input')
    input.simulate('onChange', { currentTarget: { value: '1' } })
    input.simulate('blur', { currentTarget: { value: '1' } })
    expect(value).toBe('1')
  })
})
