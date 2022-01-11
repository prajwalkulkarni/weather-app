// get your key from app.tomorrow.io/development/keys


const API_KEY = 'YOUR TOMORROW.IO API KEY'

const MAPS_API = 'YOUR GOOGLE MAPS API KEY'
// pick the field (like temperature, precipitationIntensity or cloudCover)
const DATA_FIELD = 'precipitationIntensity';


// set the ISO timestamp (now for all fields, up to 6 hour out for precipitationIntensity)
const TIMESTAMP = (new Date()).toISOString(); 


const searchElement = document.querySelector("#search")

const cardElement = document.querySelector('.card')
const temperatureElement = document.querySelector("#temperature")
const humidityElement = document.querySelector("#humidity")
const weatherElement = document.querySelector("#weather")
const imageElement = document.getElementsByTagName('img')[0]

const myLatlng = { 
  lat: 51.5072178, 
  lng: -0.1275862
};

// initMap()
searchElement.addEventListener('keypress',(e)=>{

  if(e.key==='Enter'){
    // console.log(e.target.value)

    fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${e.target.value}&key=${MAPS_API}`)
    .then(res=>res.json())
    .then(obj=>{
      const latitude = obj.results[0].geometry.location.lat
      const longitude = obj.results[0].geometry.location.lng


      myLatlng.lat = latitude
      myLatlng.lng = longitude

      console.log(latitude,longitude)
      initMap()
    })
  }
})
// initialize the map
function initMap() {

  

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 7,
    center: myLatlng
  });

  // inject the tile layer
  

  let timeout
  let res
  var imageMapType = new google.maps.ImageMapType({
    getTileUrl: function(coord, zoom) {
      if (zoom > 12) {
        return null;
      }
      
      // return `https://api.tomorrow.io/v4/map/tile/${zoom}/${coord.x}/${coord.y}/${DATA_FIELD}/${TIMESTAMP}.png?apikey=${API_KEY}`

      if(timeout){
        clearTimeout(timeout)
      }
      timeout = setTimeout(()=>{
        res = `https://api.tomorrow.io/v4/map/tile/${zoom}/${coord.x}/${coord.y}/${DATA_FIELD}/${TIMESTAMP}.png?apikey=${API_KEY}`
      },2000)
      

      return res
        
    },
    tileSize: new google.maps.Size(256, 256)
  });

  map.overlayMapTypes.push(imageMapType);

  

  fetch('https://api.tomorrow.io/v4/timelines',{
    method:'POST',
    headers:{
      'apiKey':`${API_KEY}`,
      'Content-Type':'application/json',
    },
    body:JSON.stringify({
      "location": {
          "type": "Point",
          "coordinates": [
              myLatlng.lng,
              myLatlng.lat
          ]
      },
      "fields": [
          "temperature",
          "humidity",
          "weatherCode"
      ],
      "timesteps": [
          "current"
      ]
  })
  })
  .then(res=>res.json())
  .then(data=>{
   const values = data.data.timelines[0].intervals[0].values
   
   const temperatureData = values.temperature
   const humidityData = values.humidity
   const weatherData = values.weatherCode

   const weatherDataInWords = getWeather(weatherData)

   temperatureElement.innerHTML = "Temperature: "+temperatureData+"C"
   humidityElement.innerHTML = "Humidity: "+humidityData+"%"
   weatherElement.innerHTML = "Weather: "+weatherDataInWords.description
   imageElement.src = `./assets/images/${weatherDataInWords.description.toLowerCase()}.png`

   cardElement.style.backgroundImage = weatherDataInWords.colorGradient
   weatherElement.style.color = weatherDataInWords.fontColor
   humidityElement.style.color = weatherDataInWords.fontColor
   temperatureElement.style.color = weatherDataInWords.fontColor
  })
  

  
}

function getWeather(weatherCode){
  // console.log(weatherCode)

  switch(weatherCode){
    case 1000:
    case 1100:
      return {
        description:"Clear",
        colorGradient:'linear-gradient(to bottom, #ffa970,#c5c5c5)',
        fontColor:'#000000'
      }
    case 1102:
    case 1001:
      return {
        description:"Cloudy",
        colorGradient:'linear-gradient(to bottom, #949494,#c5c5c5)',
        fontColor:"#ffffff"
      }
    case 4000:
    case 4200:
    case 4001:
      return {
        description:"Rainy",
        colorGradient:'linear-gradient(to bottom, #65b6fc,#8cc9ff)',
        fontColor:"#ffffff"
      }
      
    default:
      return {
        description:"Normal",
        colorGradient: 'linear-gradient(to bottom, #aed8fc,#cce7ff)',
        fontColor:"#000000"
      }
      
  }
}