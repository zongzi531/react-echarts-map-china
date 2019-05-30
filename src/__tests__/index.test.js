import React from 'react'
import EchartsMapChina from '../index'
import renderer from 'react-test-renderer'

test('EchartsMapChina rendered', () => {
  const component = renderer.create(
    <EchartsMapChina />,
  )
  // eslint-disable-next-line no-console
  console.log(component)
})
