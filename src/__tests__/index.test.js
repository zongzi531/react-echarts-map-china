import React from 'react'
import EchartsMapChina from '../index'
import ReactTestRenderer from 'react-test-renderer'

test('Test DefaultProps.', () => {
  let refs = null

  ReactTestRenderer.create(
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

test('Test omitProps.', () => {
  const renderer = ReactTestRenderer.create(
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
