// const API_KEY = "pk.eyJ1Ijoia3VsaW5pIiwiYSI6ImNpeWN6bjJ0NjAwcGYzMnJzOWdoNXNqbnEifQ.jEzGgLAwQnZCv9rA6UTfxQ";

// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var queryurl1 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
var tectonic_data = d3.json(queryurl1);
console.log(tectonic_data)
// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data) {
  console.log(data.features);

  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features,tectonic_data);
});

var geojsonMarkerOptions = {
  radius: 8,
  fillColor: "#ff7800",
  color: "#000",
  weight: 1,
  opacity: 1,
  fillOpacity: 0.8
};

function setmarkerclrandsize(magnitude)
{
  magnitude = +magnitude;
  geojsonMarkerOptions.radius =  4 * magnitude
   if(magnitude  > 5){
    geojsonMarkerOptions.fillColor= "#ff471a";
  }
  else if(magnitude > 4)
  {
    geojsonMarkerOptions.fillColor="#ffbf00"
  }
  else if(magnitude > 3)
  {
    geojsonMarkerOptions.fillColor = "#ffcc33";
  }
  else if(magnitude > 2)
  {
    geojsonMarkerOptions.fillColor="#ccff33";
  }
  else if(magnitude > 1)
  {
    geojsonMarkerOptions.fillColor= "#99ff33";
  }

  else
  {
    geojsonMarkerOptions.fillColor="#66ff33";
  }
}

function createFeatures(earthquakeData,tdata) {
 
  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }
 
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      setmarkerclrandsize(feature.properties.mag);
      return L.circleMarker(latlng, geojsonMarkerOptions); }
  });

 tdata.then(function(tectdata) {
     
 tectonicdata = L.geoJson(tectdata, {
  style: function(feature) {
    return {
      stroke: true,
      color: "red",
      weight: 5
      
    };

  }
  // onEachFeature: function(feature, layer) {
  //   layer.bindPopup("id: " + feature.properties.OBJECTID + "<br>" +
  //     "Contract_N: " + feature.properties.Contract_N);
  // }
});
createMap(earthquakes,tectonicdata);
 })
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  

  // Sending our earthquakes layer to the createMap function
 
}

function createMap(earthquakes,tectonicdata) {

  // Define streetmap and darkmap layers
  var lightmap= L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var outdoormap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite": satellitemap,
    "Grayscale": lightmap,
    "Outdoors" : outdoormap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    TectonicPlates : tectonicdata
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [satellitemap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  // L.control.layers(baseMaps, overlayMaps, {
  //   collapsed: false
  // }).addTo(myMap);

  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var limits = ['0-1','1-2','2-3','3-4','4-5','5+']
    var colors = ['#66ff33','#99ff33','#ccff33','#ffcc33','#ffbf00','#ff471a']
    var labels = [];

    

    

    limits.forEach(function(limit, index) {
      labels.push(`<div class=legenddiv style=background-color:${colors[index]}>${limits[index]}</div>`);
    });

    div.innerHTML = "<div id='maglegend'>" + labels.join("") + "</div>";
    return div;
  };

  // Adding legend to the map
  legend.addTo(myMap);

  L.control.layers(baseMaps, overlayMaps,{collapsed:false}).addTo(myMap);
}