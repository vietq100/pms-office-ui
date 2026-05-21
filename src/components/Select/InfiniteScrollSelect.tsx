import AppComponentBase from '@components/AppComponentBase'
import { Select, Spin } from 'antd'
import { debounce } from 'lodash'

/**
 * Supports:
 * - Infinite scrolling with paginated API fetching
 * - Server-side search with debounce
 * - Initial value support (even if not in the first page of results)
 *
 * @example
 * ```tsx
 * <InfiniteScrollSelect
 *   fetchApi={yourApiFunction}
 *   value={selectedId}
 *   onChange={(value) => setSelectedId(value)}
 *   labelKey="name"
 *   valueKey="id"
 *   placeholder="Select an item"
 *   optionRenderer={(item) => ({
 *      id: item?.id,
 *      value: item?.id,
 *      label: item?.serialNumber
 *   })}
 * />
 * ```
 *
 * @prop {ApiFunction} fetchApi - Function to fetch paginated data. It must return `{ items: [], totalCount: number }`
 * @prop {number} [maxResultCount=10] - Max results per page
 * @prop {boolean} [disabled] - Disables the select
 * @prop {string} [placeholder] - Placeholder for the select box
 * @prop {any} [value] - Controlled selected value
 * @prop {(value: any) => void} [onChange] - Called when user selects a value
 * @prop {(item: any) => object} [optionRenderer] - Called when customize options
 */

type ApiFunction = (params: {
  maxResultCount: number
  skipCount: number
  keyword?: any
}) => Promise<{ items: any[]; totalCount: number }>

interface InfiniteScrollSelectProps {
  fetchApi: ApiFunction
  maxResultCount?: number
  disabled?: boolean
  placeholder?: string
  value?: any
  onChange?: (value: any) => void
  optionRenderer?: (item: any) => { value: string; label: React.ReactNode; [key: string]: any }
}

interface InfiniteScrollSelectState {
  data: any[]
  loading: boolean
  skipCount: number
  totalCount: number
  keyword: any
}

class InfiniteScrollSelect extends AppComponentBase<InfiniteScrollSelectProps, InfiniteScrollSelectState> {
  static defaultProps = {
    maxResultCount: 10,
    placeholder: ''
  }

  state: InfiniteScrollSelectState = {
    data: [],
    loading: false,
    skipCount: 0,
    totalCount: 0,
    keyword: ''
  }

  componentDidMount() {
    this.fetchData()
  }

  async componentDidUpdate(prevProps: InfiniteScrollSelectProps) {
    const { value, fetchApi } = this.props
    const { data } = this.state

    if (prevProps.value !== value && value && !data.find((item) => item.id === value)) {
      fetchApi({ maxResultCount: 10, skipCount: 0, keyword: String(value) })
        .then((res) => {
          if (res?.items?.length) {
            this.setState((prev) => ({
              data: [res.items[0], ...prev.data]
            }))
          }
        })
        .catch((err) => {
          console.error('Error fetching default value item:', err)
        })
    }
  }

  fetchData = async (isLoadMore = false) => {
    const { fetchApi, maxResultCount } = this.props
    const { skipCount, keyword, loading } = this.state

    if (loading || !fetchApi) return

    this.setState({ loading: true })

    try {
      const res = await fetchApi({
        maxResultCount: maxResultCount!,
        skipCount,
        keyword
      })

      const items = res?.items || []

      this.setState((prev) => ({
        data: isLoadMore ? [...prev.data, ...items] : items,
        totalCount: res.totalCount || 0
      }))
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      this.setState({ loading: false })
    }
  }

  handleScroll = (e: any) => {
    const { data, totalCount, loading } = this.state
    const { maxResultCount } = this.props

    const { scrollTop, scrollHeight, clientHeight } = e.target

    if (scrollTop + clientHeight >= scrollHeight - 20 && data.length < totalCount && !loading) {
      this.setState(
        (prev) => ({
          skipCount: prev.skipCount + maxResultCount!
        }),
        () => this.fetchData(true)
      )
    }
  }

  handleSearch = debounce((value: string) => {
    this.setState(
      {
        keyword: value,
        skipCount: 0
      },
      () => this.fetchData(false)
    )
  }, 300)

  handleClear = () => {
    this.setState(
      {
        keyword: '',
        skipCount: 0
      },
      () => this.fetchData(false)
    )
  }

  render() {
    const { data, loading } = this.state
    const { value, placeholder, disabled, optionRenderer, onChange } = this.props

    return (
      <Select
        showSearch
        allowClear
        value={value}
        disabled={disabled}
        filterOption={false}
        placeholder={placeholder}
        onSearch={this.handleSearch}
        onClear={this.handleClear}
        onPopupScroll={this.handleScroll}
        notFoundContent={loading ? <Spin size="small" /> : null}
        className="full-width"
        onChange={onChange}
        options={optionRenderer ? data.map(optionRenderer) : this.renderOptions(data)}
      />
    )
  }
}

export default InfiniteScrollSelect
