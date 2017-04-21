const _ = require('lodash')
const fs = require('fs')
const osascript = require('node-osascript')
const setup = require('./setup')
const exec = require('child_process')
const getHomePath = require('home-path')
const path = require('path')

const HOME = getHomePath()
let loopTimer

/*
    Get Informations
*/

const getPhoenixData = args => {
  return new Promise(resolve => {
    let appleScript = `tell application "System Events" to keystroke "${args.keystroke}" using {control down, shift down}`
    osascript.execute(appleScript)

    // eslint-disable-next-line
    let child = exec.spawn('log', [
      'stream',
      '--style',
      'json',
      '--predicate',
      `eventMessage contains "hyperspace-${args.message}"`,
      '--info',
    ])

    child.stdout.on('data', function(data) {
      const message = JSON.parse(data.toString()).eventMessage
      const result = args.parse(message.split(':')[1])
      child.kill('SIGKILL')
      resolve(result)
    })
  })
}

const setStorage = () => {
  let appleScript =
    'tell application "System Events" to keystroke "s" using {control down, shift down}'
  osascript.execute(appleScript)

  loopTimer = setInterval(positionWaitLoop, 2000)

  // eslint-disable-next-line
  let child = exec.spawn('log', [
    'stream',
    '--style',
    'json',
    '--predicate',
    'eventMessage contains "hyperspace-DONE"',
    '--info',
  ])

  child.stdout.on('data', function() {
    clearInterval(loopTimer)
    child.kill('SIGKILL')
  })
}

const positionWaitLoop = () => {
  let appleScript =
    'tell application "System Events" to keystroke "p" using {control down, shift down}'
  osascript.execute(appleScript)
}

getPhoenixData({
  message: 'DISPLAY',
  keystroke: 'd',
  parse: value => parseInt(value),
}).then(data => {
  console.log('Yay! ' + data)
})

getPhoenixData({
  message: 'SPACE',
  keystroke: 'g',
  parse: value => value.replace(/[[\]']+/g, '').split(','),
}).then(data => {
  console.log('Yay! ' + data)
})

/* Controler */
const project = require('./mocks/project-template.json')

setup(project)

// Time to open windows files (fail safe)
setTimeout(function() {
  setStorage()
}, 500)