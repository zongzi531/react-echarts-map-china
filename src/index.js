import React from 'react'
import PropTypes from 'prop-types'
import Echarts from 'echarts'

const CHINA = 'China'
const CHINACODE = '100000'
const LEVEL_1_CODE = '0000'

export default class EchartsMapChina extends React.Component {
  static proptTypes = {
    option: PropTypes.object.isRequired,
    loadData: PropTypes.fun,
  }
  static defaultProps = {
    option: {},
    loadData: () => [],
  }
  constructor(props) {
    super(props)
    this._ref = React.createRef()
    this._echarts = null

    this.cityMap = null

    this.currentMap = {
      mapCode: CHINACODE,
      mapType: CHINA,
    }

    this.registeredMap = new Map()

    this.stack = []
  }
  componentDidMount() {
    this._initEcharts()
  }
  // 初始化 Echarts
  _initEcharts = async () => {
    await this.getCityMap()
    this._echarts = Echarts.init(this._ref.current)

    this._echarts.on('mapselectchanged', async ({ batch }) => {
      const [selected] = batch
      const { name: mapType } = selected
      const mapCode = this.cityMap[mapType]

      // 暂时只进入2级数据
      if (mapCode.substr(2) !== LEVEL_1_CODE) {
        return
      }
      // if (!mapCode) {
      //   return notification.error({
      //     message: '错误',
      //     description: '无此区域地图显示',
      //   });
      // }

      this.stack.push({
        mapCode: this.currentMap.mapCode,
        mapType: this.currentMap.mapType
      });
      await this.loadingMap({ mapCode, mapType });
    })

    await this.loadingMap(this.currentMap)
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
    let mapJson = this.registeredMap.get(mapCode)
    if (!mapJson) {
      this._echarts.showLoading()
      mapJson = await import(`../static/${mapCode}.json`).then(res => res.default)
      Echarts.registerMap(mapType, mapJson)
      this.registeredMap.set(mapCode, mapJson)
      this._echarts.hideLoading()
    }

    const data = await this.props.loadData({ mapCode, mapType })

    // Echarts 官网实例
    // https://echarts.baidu.com/examples/editor.html?c=map-HK
    this._echarts.setOption({
      toolbox: {
        feature: {
          myTool: {
            show: true,
            title: 'Back',
            icon: 'path://M61.727867 365.421831S301.780326 127.048061 457.079486-0.040944l1.760576 218.92555s495.9501 0 502.992403 459.018953c0 0 10.604398 229.570892-91.754658 346.055497 0 0 77.629108-275.427749 3.521151-413.121151 0 0-74.107957-233.0511-414.758896-141.255498l1.760576 215.404398c-28.210156 0-398.872771-319.564974-398.872771-319.564974z',
            onclick: async () => {
              const pop = this.stack.pop()
              if (this.currentMap.mapCode === CHINACODE) {
                return alert('已经到达最上一级地图了')
              }
              await this.loadingMap(pop)
            }
          },
        }
      },
      visualMap: {
        text:['高', '低'],
        realtime: false,
        calculable: true,
        inRange: {
          color: ['lightskyblue', 'yellow', 'orangered']
        }
      },
      series: [
        {
          type: 'map',
          mapType, // 自定义扩展图表类型
          // 单选模式
          selectedMode: 'single',
          data,
        }
      ]
    })
  }
  render() {
    const { option, loadData, ...props } = this.props
    return (<div ref={this._ref} {...props} />)
  }
}
