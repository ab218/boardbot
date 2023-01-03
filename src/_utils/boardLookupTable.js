const CHRONICLES = 'Chronicles'
const BUY = 'MarketB'
const SELL = 'MarketS'
const COMMUNITY = 'Community'
const DREAMS = 'Dreams'
const COMM_EVENTS = 'ComEvents'
const WHISPERING_WINDS = 'WhisperingWinds'
const POETRY = 'Poetry'
const STORY_CONTEST = 'Story'
const HUNTING = 'Hunting'
const CARNAGE = 'Carnage'
const DRIFTING_WINDS = 'DriftingWinds'

export const DREAM_WEAVER = 'DreamWeaver'

export const boardLookupTable = {
  [CHRONICLES]: process.env.CHRONICLES,
  [BUY]: process.env.BUY,
  [SELL]: process.env.SELL,
  [COMMUNITY]: process.env.COMMUNITY,
  [DREAM_WEAVER]: process.env.DREAM_WEAVER,
  [DREAMS]: process.env.DREAMS,
  [COMM_EVENTS]: process.env.COMM_EVENTS,
  [WHISPERING_WINDS]: process.env.WHISPERING_WINDS,
  [POETRY]: process.env.POETRY,
  [STORY_CONTEST]: process.env.STORY_CONTEST,
  [HUNTING]: process.env.HUNTING,
  [CARNAGE]: process.env.CARNAGE,
  [DRIFTING_WINDS]: process.env.DRIFTING_WINDS,
}

export const boardKeys = Object.keys(boardLookupTable)
