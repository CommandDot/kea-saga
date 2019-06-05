/* global test, expect */
import { kea, resetContext, getStore, getContext } from 'kea'
import sagaPlugin from '../index' // install the plugin

import './helper/jsdom'
import { delay } from 'redux-saga/effects'

const promiseDelay = ms => new Promise((resolve) => setTimeout(resolve, ms))

test('extending sagas works', () => {
  let actionLog = []

  resetContext({ plugins: [ sagaPlugin ] })
  getStore()

  // first verify that it just works like it is

  const logic = kea({
    actions: () => ({
      increment: true,
      decrement: true
    }),

    start: function * () {
      actionLog.push('start')
    },

    takeEvery: ({ actions }) => ({
      [actions.increment]: function * () {
        actionLog.push('takeEvery-increment')
      }
    }),

    takeLatest: ({ actions }) => ({
      [actions.decrement]: function * () {
        actionLog.push('takeLatest-decrement')
      }
    })
  })
  logic.mount()

  expect(actionLog).toEqual(['start'])

  getContext().store.dispatch(logic.actions.increment())
  getContext().store.dispatch(logic.actions.decrement())

  expect(actionLog).toEqual(['start', 'takeEvery-increment', 'takeLatest-decrement'])

  // reset everything
  actionLog = []
  resetContext({ plugins: [ sagaPlugin ] })
  getStore()

  // extend with more operations

  logic.extend({
    start: function * () {
      actionLog.push('extend-start')
    },

    takeEvery: ({ actions }) => ({
      [actions.increment]: function * () {
        actionLog.push('extend-takeEvery-increment')
      }
    }),

    takeLatest: ({ actions }) => ({
      [actions.decrement]: function * () {
        actionLog.push('extend-takeLatest-decrement')
      }
    })
  })

  logic.mount()

  expect(actionLog).toEqual(['start', 'extend-start'])

  getContext().store.dispatch(logic.actions.increment())
  getContext().store.dispatch(logic.actions.decrement())

  expect(actionLog).toEqual([
    'start', 'extend-start', 'takeEvery-increment', 'extend-takeEvery-increment', 'takeLatest-decrement', 'extend-takeLatest-decrement'
  ])
})