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

const templatize = (json, index) => {
  var { name, fullAddress, city, state, zipCode, mainCategory: category } = json

  name = toTitleCase(name)
  fullAddress = toTitleCase(fullAddress)
  city = toTitleCase(city)
  state = toTitleCase(state)
  category = toTitleCase(category)

  return `
  <li class="py-1">
    <h2>${index + 1}. <b>${name}</b></h2>
    <ul class="pl-4">
      <li>
        <b>Address:</b> ${fullAddress}, ${city}, ${state} ${zipCode}
      </li>
      <li>
        <b>Category:</b> ${category}
      </li>
    </ul>
  </li>
  `
}

module.exports = { toTitleCase, normalizeState, templatize }
