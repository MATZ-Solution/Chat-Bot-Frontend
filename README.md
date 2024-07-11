## Intents

### 1. companyInfo
- **Description**: Inquire about the company or website, such as its mission, services, or contact information.
- **Parameters**: None

### 2. chatbotInfo
- **Description**: Ask about the chatbot.
- **Parameters**: None

### 3. chatbotFeatures
- **Description**: Inquire about the features and capabilities of the chatbot, including what it can do, services it provides, and information it retrieves.
- **Parameters**: None

### 4. findFacilitiesByLocation
- **Description**: Find Medicare facilities in a specific city, state, and zip code within a particular category.
- **Parameters**:
  - `city`
  - `state`
  - `zipCode`
  - `category`

### 5. findNearbyFacilities
- **Description**: Find Medicare facilities nearby based on a given category.
- **Parameters**:
  - `category`

### 6. searchFacility
- **Description**: Search for a specific Medicare facility by its name.
- **Parameters**:
  - `facilityName`

### 7. listServices
- **Description**: List the services provided by a specific Medicare facility.
- **Parameters**:
  - `facilityName`

### 8. listContactInfo
- **Description**: List the contact information for a specific Medicare facility.
- **Parameters**:
  - `facilityName`

### 9. listFacilityRatings
- **Description**: List the ratings of a specific Medicare facility.
- **Parameters**:
  - `facilityName`

### 10. checkTopRated
- **Description**: Check if a specific Medicare facility is top-rated.
- **Parameters**:
  - `facilityName`

### 11. locateFacilityOnMap
- **Description**: Locate a specific Medicare facility on a map.
- **Parameters**:
  - `facilityName`

### 12. miscellaneous
- **Description**: Handle miscellaneous queries that do not fit into other predefined intents.
- **Parameters**: None
