const INTENTS = {
  intents: [
    {
      id: 'company-info',
      description:
        'Inquire about the company or website, such as its mission, services, or contact information.',
      params: []
    },
    {
      id: 'chatbot-info-and-features',
      description: 'Ask about the chatbot, its features, and capabilities.',
      params: []
    },
    {
      id: 'find-facilities-by-location',
      description:
        'Find Medicare facilities in a specific city, state, and zip code within a particular category.',
      params: ['city', 'state', 'zipCode', 'category']
    },
    {
      id: 'find-nearby-facilities',
      description: 'Find Medicare facilities nearby based on a given category.',
      params: ['category']
    },
    {
      id: 'search-facility',
      description: 'Search for a specific Medicare facility by its name.',
      params: ['facilityName']
    },
    {
      id: 'list-facility-services',
      description: 'List the services provided by a specific Medicare facility.',
      params: ['facilityName']
    },
    {
      id: 'list-facility-contact-info',
      description: 'List the contact information for a specific Medicare facility.',
      params: ['facilityName']
    },
    {
      id: 'list-facility-ratings',
      description: 'List the ratings of a specific Medicare facility.',
      params: ['facilityName']
    },
    {
      id: 'check-top-rated',
      description: 'Check if a specific Medicare facility is top-rated.',
      params: ['facilityName']
    },
    {
      id: 'locate-facility-on-map',
      description: 'Locate a specific Medicare facility on a map.',
      params: ['facilityName']
    }
  ]
}

module.exports = { INTENTS }
