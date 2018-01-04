//mapcreation javascript for landmarks assignment
var myLt = 0;
var myLng = 0;
var ID;
var request = new XMLHttpRequest();
var myLocation = new google.maps.LatLng(myLt, myLng);
var Options = {
	zoom: 14,
	center: myLocation,
	mapTypeId: google.maps.MapTypeId.ROADMAP
};
var map;
var marker;

var infowindow = new google.maps.InfoWindow();
var people;
var disFromMeLand;

function init(){
	map = new google.maps.Map(document.getElementById("map_display"), Options);
	getMyLocation();
}

function datastore(){
		var httprequest = request;
		var url = 'https://hidden-taiga-87881.herokuapp.com/sendLocation';
		httprequest.open('POST', url, true);
		httprequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		httprequest.onreadystatechange = function() {
			if(httprequest.readyState == 4 && httprequest.status == 200) {
				rawData = httprequest.responseText;

				messages = JSON.parse(rawData);

				people = messages["people"];
				landmarks = messages["landmarks"];
				renderMap();
			}
		}
		httprequest.send("login=IRXHEl1C&lat="+myLt+"&lng="+myLng);
}

function getMyLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			myLt = position.coords.latitude;
			myLng = position.coords.longitude;
			datastore();
		});
	}
	else {
		alert("Your web browser does not support geolocation.");
	}
}

//places a general marker
function setMarker(position, icon, title, content){
	var newmarker = new google.maps.Marker({
			position: position,
			icon: icon,
			title: title,
		});
		newmarker.setMap(map);
		google.maps.event.addListener(newmarker, 'click', function(){
			infowindow.setContent(newmarker.title, content);
			infowindow.open(map, newmarker);
		});	
}

//adds classmates to map
function populateMap (){
	for (var i = 0; i < people.length; i++){
		var pplLocation = new google.maps.LatLng(people[i].lat, people[i].lng);
		var disFromMe = findDistance(pplLocation, myLocation);
		var pplmarkerTitle = people[i].login + " is " + disFromMe + " miles away";

		setMarker(pplLocation, "pin.png", pplmarkerTitle);
	}
}

//adds landmarks to map
function addLandmarks(){
	for (i = 0; i < landmarks.length; i++){
		var landmarkLoc = new google.maps.LatLng(landmarks[i].geometry.coordinates[1], landmarks[i].geometry.coordinates[0]);
		var disFromMe = findDistance(landmarkLoc, myLocation);

		setMarker(landmarkLoc, "landmark.png", landmarks[i].properties.Details);
	}
}

//determines distance between two points
function findDistance(latLngA, latLngB){
	var distanceMeters = google.maps.geometry.spherical.computeDistanceBetween(latLngA, latLngB);
	var distanceMiles = distanceMeters * 0.000621371192;
	return distanceMiles;
}

//finds smallest distance between a series of points and my location
function smallDistance(latLngA){
	var firstLocation = new google.maps.LatLng(landmarks[0].geometry.coordinates[1], landmarks[0].geometry.coordinates[0]);
	var smallest = findDistance(myLocation, firstLocation);
	var arrayLocation = 0;
	for (i = 0; i < landmarks.length; i++){
		var landmarkLat = landmarks[i].geometry.coordinates[1];
		var landmarkLng = landmarks[i].geometry.coordinates[0];
		var landmarkCoord = new google.maps.LatLng(landmarkLat, landmarkLng);
		disFromMeLand = findDistance(latLngA, landmarkCoord);
		//resets smallest to the smallest distance found 
		if (smallest > disFromMeLand){ 
			smallest = disFromMeLand;
			arrayLocation = i;
		}	
	}
	var closestLandmark = [smallest, arrayLocation];
	return closestLandmark;
}

//draw polyline
function drawPolyline (latLngA, latLngB){ //https://developers.google.com/maps/documentation/javascript/examples/polyline-simple
	var landPolyline = [latLngA, latLngB];
	var drawlandPolyline = new google.maps.Polyline({
          path: landPolyline,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 2
        });
	drawlandPolyline.setMap(map);
}

function renderMap(){
	myLocation = new google.maps.LatLng(myLt, myLng);
	
	map.panTo(myLocation);

	var closestToMe = smallDistance(myLocation);
	var landmarkName = landmarks[closestToMe[1]].properties.Location_Name;
	
	
	marker = new google.maps.Marker({
		position: myLocation,
		icon: "dumpling.png",
		title: "IRXHEl1C" + ", Closest landmark: "+landmarkName+" at "+closestToMe[0]+" miles away"
	});
	marker.setMap(map);

	google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent(marker.title);
		infowindow.open(map, marker);
	});
	populateMap();
	addLandmarks();

	var closestLandLat = landmarks[closestToMe[1]].geometry.coordinates[1];
	var closestLandLng = landmarks[closestToMe[1]].geometry.coordinates[0];
	var closestLandCoord = new google.maps.LatLng(closestLandLat, closestLandLng);

	drawPolyline(myLocation, closestLandCoord);
}



