// get your key from app.tomorrow.io/development/keys

// pick the field (like temperature, precipitationIntensity or cloudCover)
const DATA_FIELD = 'humidity';

// set the ISO timestamp (now for all fields, up to 6 hour out for precipitationIntensity)
const TIMESTAMP = (new Date()).toISOString(); 


const TILE_SIZE = 256;

const res = document.querySelector("#search")

const myLatlng = { 
  lat: 42.355438,
  lng: -71.059914 
};


res.addEventListener('keypress',(e)=>{

  if(e.key==='Enter'){
    // console.log(e.target.value)

    fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${e.target.value}&key=AIzaSyDhhp2Bfb9ouzAt-xVnoOCIkKgWwyfXJDA`)
    .then(res=>res.json())
    .then(obj=>{
      const latitude = obj.results[0].geometry.location.lat
      const longitude = obj.results[0].geometry.location.lng


      myLatlng.lat = latitude
      myLatlng.lng = longitude
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

      // console.log(timeout)

      if(timeout){
        clearTimeout(timeout)
      }
      timeout = setTimeout(()=>{
        res = `https://api.tomorrow.io/v4/map/tile/${zoom}/${coord.x}/${coord.y}/${DATA_FIELD}/${TIMESTAMP}.png?apikey=${API_KEY}`
      },2000)
      

      // console.log(res)
      return res

        
    },
    tileSize: new google.maps.Size(256, 256)
  });

  map.overlayMapTypes.push(imageMapType);

  

  fetch('https://api.tomorrow.io/v4/timelines',{
    method:'POST',
    headers:{
      'apiKey':'Kc4HFO75TNUmBRla3S661V2DkxJb4uiS',
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

   const temperatureElement = document.querySelector("#temperature")
   const humidityElement = document.querySelector("#humidity")
   const weatherElement = document.querySelector("#weather")
   const imageElement = document.getElementsByTagName('img')[0]
   temperatureElement.innerHTML = "Temperature: "+temperatureData+"ºC"
   humidityElement.innerHTML = "Humidity :"+humidityData+"%"
   weatherElement.innerHTML = "Weather: "+weatherDataInWords
   imageElement.src = `./assets/images/${weatherDataInWords.toLowerCase()}.png`
  })
  

  function getWeather(weatherCode){
    // console.log(weatherCode)

    switch(weatherCode){
      case 1000:
      case 1100:
        return "Clear"
      case 1102:
      case 1001:
        return "Cloudy"
      case 4000:
      case 4200:
      case 4001:
        return "Rainy"
      default:
        return "Default"
    }
  }
  
}