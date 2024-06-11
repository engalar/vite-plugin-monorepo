import React from 'react'
import ReactDOM from 'react-dom'
import ReactDOMScheduler from 'scheduler'
import RuntimeDev from 'react/jsx-dev-runtime'
import Runtime from 'react/jsx-runtime'

// @ts-ignore
window.ReactFamily = { React, ReactDOM, Runtime, RuntimeDev, ReactDOMScheduler }
