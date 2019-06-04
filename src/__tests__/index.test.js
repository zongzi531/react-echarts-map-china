import React from 'react'
import { create } from 'react-test-renderer'
import { configure, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import EchartsMapChina from '../index'

configure({ adapter: new Adapter() })

test('Test DefaultProps.', async () => {
  let refs = null

  await create(
    <EchartsMapChina
      ref={ref => refs = ref}
    />,
  )

  const { props } = refs

  expect(props.option).toEqual({})
  expect(props.loadData()).toEqual([])
  expect(props.getWarnMessage('jest test')).toEqual(console.warn('⚠️警告信息:', 'jest test'))
  expect(props.backBtnKey).toEqual('my__back__btn__')
  expect(props.getData()).toEqual(undefined)
})

test('Test omitProps.', async () => {
  const renderer = await create(
    <EchartsMapChina
      option={{ test: 'test'}}
      loadData={() => [1, 2]}
      getWarnMessage={message => message}
      backBtnKey="my__back__btn__test"
      backBtnText="go Back"
      backBtnIcon="null"
      value={[1, 2]}
      equalValue={() => true}
      getData={() => [1, 2]}
    />,
  )

  const { props } = renderer.toJSON()

  for (const key of Object.keys(EchartsMapChina.propTypes)) {
    expect(props).not.toHaveProperty(key)
  }
})

test('Test componentDidUpdate Update value.', async () => {
  const SPY_componentDidUpdate = jest.spyOn(EchartsMapChina.prototype, 'componentDidUpdate')
  const wrapper = await mount((
    <EchartsMapChina
      value={[1, 2]}
      equalValue={(prevValue, value) => prevValue !== value}
    />
  ))

  wrapper.instance()._echarts = {
    setOption: jest.fn(),
    on: jest.fn(),
  }

  expect(SPY_componentDidUpdate).not.toHaveBeenCalled()

  wrapper.setProps({ value: [1, 2, 3] })

  expect(SPY_componentDidUpdate).toHaveBeenCalled()
})
