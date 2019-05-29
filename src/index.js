import React from 'react'
import PropTypes from 'prop-types'
import Echarts from 'echarts'

const CHINA = 'China'
const CHINACODE = '100000'
const LEVEL_1_CODE = '0000'

export default class EchartsMapChina extends React.Component {
  static proptTypes = {
    option: PropTypes.object,
    loadData: PropTypes.fun,
    getWarnMessage: PropTypes.fun,
    backBtnKey: PropTypes.string,
    backBtnText: PropTypes.string,
    backBtnIcon: PropTypes.string,
    value: PropTypes.array,
    equalValue: PropTypes.fun,
    getData: PropTypes.fun,
  }

  static defaultProps = {
    option: {},
    loadData: () => [],
    getWarnMessage: message => console.warn('⚠️警告信息:', message),
    backBtnKey: 'my__back__btn__',
    getData: () => {},
  }

  constructor (props) {
    super(props)
    this._ref = React.createRef()
    this._echarts = null

    this.cityMap = null

    this.currentMap = {
      mapCode: CHINACODE,
      mapType: CHINA,
    }

    this.dataCache = new Map()

    this.stack = []
  }

  componentDidMount () {
    this._initEcharts()
  }
  componentWillReceiveProps (nextProps) {
    if (this.props.equalValue && this.props.equalValue(nextProps.value, this.props.value)) {
      this.setSeries(nextProps.value)
    }
  }

  // 通过 ref 暴露在外的 setSeries 方法
  setSeries = data => {
    this.dataCache.set(this.currentMap.mapType, data)
    this._echarts.setOption({
      series: [
        {
          type: 'map',
          mapType: this.currentMap.mapType, // 自定义扩展图表类型
          // 单选模式
          selectedMode: 'single',
          data,
        },
      ],
    })
  }

  // 初始化 Echarts
  _initEcharts = async () => {
    await this.getCityMap()
    this._echarts = Echarts.init(this._ref.current)
    this._initOption()

    this._echarts.on('mapselectchanged', async ({ batch }) => {
      const [selected] = batch
      const { name: mapType } = selected
      const mapCode = this.cityMap[mapType]

      if (!mapCode) {
        return this.props.getWarnMessage('无此区域地图显示')
      } else if (mapCode.substr(2) !== LEVEL_1_CODE) {
        // 暂时只进入2级数据
        return this.props.getWarnMessage(LEVEL_1_CODE)
      }

      this.stack.push({
        mapCode: this.currentMap.mapCode,
        mapType: this.currentMap.mapType
      })
      await this.loadingMap({ mapCode, mapType })
    })

    await this.loadingMap(this.currentMap)
  }

  _initOption = () => {
    // Echarts 官网实例
    // https://echarts.baidu.com/examples/editor.html?c=map-HK
    const option = this.props.option
    option.toolbox = option.toolbox || {}
    option.toolbox.feature = option.toolbox.feature || {}
    const feature = {
      ...option.toolbox.feature,

      // 穿梭返回按钮
      [this.props.backBtnKey]: {
        show: true,
        title: this.props.backBtnText || '返回',
        icon: this.props.backBtnIcon || 'path://M61.727867 365.421831S301.780326 127.048061 457.079486-0.040944l1.760576 218.92555s495.9501 0 502.992403 459.018953c0 0 10.604398 229.570892-91.754658 346.055497 0 0 77.629108-275.427749 3.521151-413.121151 0 0-74.107957-233.0511-414.758896-141.255498l1.760576 215.404398c-28.210156 0-398.872771-319.564974-398.872771-319.564974z',
        onclick: async () => {
          const pop = this.stack.pop()
          if (this.currentMap.mapCode === CHINACODE) {
            return this.props.getWarnMessage('已经到达最上一级地图了')
          }
          await this.loadingMap(pop)
        }
      },
    }

    option.toolbox.feature = feature

    this._echarts.setOption({
      visualMap: {
        min: 800,
        max: 50000,
        text: ['High', 'Low'],
        realtime: false,
        calculable: true,
        inRange: {
          color: ['lightskyblue', 'yellow', 'orangered']
        }
      },

      // 默认地图配置，建议不要覆盖
      series: [
        {
          type: 'map',
          mapType: this.currentMap.mapType, // 自定义扩展图表类型
          // 单选模式
          selectedMode: 'single',
          data: [],
        }
      ],
      ...option,
    })
  }

  // 获取城市数据
  getCityMap = async () => {
    this.cityMap = await import('../static/china_address_v4.json').then(({ default: data } = []) => {
      const cityMap = {}
      for (let i = 0; i < data.length; i++) {
        cityMap[data[i].name] = data[i].value
      }
      return cityMap
    })
  }

  // 加载地图方法
  loadingMap = async ({ mapCode, mapType }) => {
    this.currentMap = {
      mapCode,
      mapType,
    }

    this._echarts.showLoading()
    const mapJson = await import(`../static/${mapCode}.json`).then(res => res.default)
    Echarts.registerMap(mapType, mapJson)
    this._echarts.hideLoading()

    const data = this.dataCache.get(mapType)

    this.setSeries(data || [])

    if (data) {
      this.props.getData(data)
    } else {
      await this.props.loadData({ mapCode, mapType })
    }
  }

  render () {
    const {
      option,
      loadData,
      getWarnMessage,
      backBtnKey,
      backBtnText,
      backBtnIcon,
      value,
      equalValue,
      getData,
      ...props
    } = this.props

    return (<div ref={this._ref} {...props} />)
  }
}
