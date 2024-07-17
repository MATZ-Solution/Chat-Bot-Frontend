import { STATES } from './states'

function toTitleCase(str) {
  str = str.replace(/[-_]/g, ' ')
  str = str.replace(/([a-z])([A-Z])/g, '$1 $2')
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

const normalizeState = (state) => {
  state = state.trim()
  return state.length === 2 ? STATES[state.toUpperCase()] : toTitleCase(state)
}

module.exports = { toTitleCase, normalizeState }
