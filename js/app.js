

var googleMap;
var fsAccount;
var fsPWD;

//load the viewer
function runApp() {
    ko.applyBindings(new viewer());
}


// main body for the viewer
function viewer() {
    // hard code here Account and pwd for Foursquare 
    fsAccount = "GPRP1D11EOWJ0EFV0HTM0N545T145RBBQIJ2AXVBNXYBC1NT";
    fsPWD = "PM1BKLP4PLF3M3BOFNYHRRHFO4ZVCI4CPI2R5R4BYS0X3P4U";

    // hard code San Diego DownTown loc:
    var docMap = document.getElementById('googlemap')
    googleMap = new google.maps.Map(docMap, { zoom: 12, center: {lat: 32.696904, lng: -117.179623} });

    self.forSearch = ko.observable("");
    self.allLoc = ko.observableArray([]);

    self.mapObj = document.getElementById('googlemap');
    self.mapObj.style.height = window.innerHeight - 40;

    // get each default places information (san diego)
    sandiegoLoc.forEach(function(eachLoc) { self.allLoc.push( new locInfo(eachLoc)); });

    var search = function() {
        var searched = self.forSearch().toLowerCase();
        if (searched) {
            var filter = function(eachLoc) {
                var content = eachLoc.loc.toLowerCase();
                var filted = (content.search(searched) >= 0);
                // only make filted visible
                eachLoc.visible(filted);
                return filted;
            }
            var res = ko.utils.arrayFilter(self.allLoc(), filter);
            return res 

        } else {
            self.allLoc().forEach(function(eachLoc){ eachLoc.visible(true); });
            return self.allLoc();
        }
    }

    self.filtering = ko.computed(search, self);
}


// use foursquare api to get full information about given location name/lat/long
function locInfo(input) {
    this.visible = ko.observable(true);
    this.url = "";
    this.phone = "";
    this.addr = "";
    this.city = "";
    this.loc = input.loc;
    this.lat = input.lat;
    this.long = input.long;

    var fsAPI = 'https://api.foursquare.com/v2/venues/search?ll='+ 
    this.lat + ',' + this.long + 
    '&client_id=' + fsAccount + '&client_secret=' + 
    fsPWD+ '&v=20160118' + '&query=' + this.loc;
    
    // create marker on map
    this.placeMarker = new google.maps.Marker({ position: new google.maps.LatLng(input.lat, input.long), map: googleMap,title: input.loc });
    this.placeMarker.setMap(googleMap);

    // make 'bounce' effect when clik the marker
    this.bounce = function(place) {
        google.maps.event.trigger(self.placeMarker, 'click');
    };

    // use Ajax to get detail inform from fourSquare:
    var self = this;
    $.getJSON(fsAPI).done(function(input) {
        var data = input.response.venues[0];
        // avoid get 'undefined' word shows to users if invalid response from API call
        if (typeof data != 'undefined') {
            // avoid get 'undefined' word shows to users if invalid inform included in 'data'
            if (typeof data.url != 'undefined'){
                this.url = data.url;
            } 
            if (typeof data.location.formattedAddress[0] != 'undefined'){
                self.addr = data.location.formattedAddress[0];
            }
            if (typeof data.location.formattedAddress[1] != 'undefined') {
                self.city = data.location.formattedAddress[1];
            }
            if (typeof data.contact.phone != 'undefined'){
                self.phone = getPhoneFormatted(data.contact.phone);
            }
        }
    // handle the failure of Ajax
    }).fail(function() {
        alert("Got error when call API from Foursquare. Please try again..");
    });

    // add list of detail info to markers
    var addToMarker = function(){
        self.blockInfo = '<div class="details"><div class="name"><b>' + 
        input.loc + '</b></div><div class="infor"><a href="' + self.url +'">' + 
        self.url + '</a></div><div class="infor">' + 
        self.addr + '</div><div class="infor">' +
        self.city + '</div><div class="infor"><a href="tel:' + 
        self.phone +'">' + self.phone +"</a></div></div>";

        self.inforBlock = new google.maps.InfoWindow({content: this.blockInfo});
        self.inforBlock.setContent(self.blockInfo);
        self.inforBlock.open(googleMap, this);

        self.placeMarker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.placeMarker.setAnimation(null);
        }, 2100);
    }

    this.placeMarker.addListener('click', addToMarker);

};



// make the phone number infomation formatted, used by 
function getPhoneFormatted(unformattedNum) {
    var reg = /^(?:\+?1[-. ]?)?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})$/;
    var match = reg.test(unformattedNum)
    if (match) {
        var sections = unformattedNum.match(reg);
        var phone = "";
        if (sections[1]) { 
            phone += "+1 (" + sections[1] + ") "; 
        }
        phone += sections[2] + "-" + sections[3];
        return phone;
    }
    else {
        return unformattedNum;
    }
}


function handError() {
    alert("Opps, There is an error loading Google Maps. Please Try Again!");
}


//default places to shown:
var sandiegoLoc = [
    // { loc: 'Hotel del Coronado',lat: 32.680886,long: -117.178448 }, 
    // {loc: 'San Diego Zoo', lat: 37.735516, long: -117.149637 },
    // {loc: 'USS Midway Museum',lat: 32.713738,long: -117.175562},
    // {loc: 'Seaport Village',lat: 32.709466,long:-117.171056},
    // {loc: 'SeaWorld San Diego',lat: 32.765496,long: -117.22745},
    // {loc: 'Cabrillo National Monument',lat: 32.672635,long: -117.242315},
    // {loc: 'Balboa Park',lat: 32.730441,long: -117.151607},
    // {loc: 'Old Town History Park',lat: 32.75503,long: -117.199142},
    // {loc: 'La Jolla',lat: 32.831731,long: -117.279394},
    // {loc: 'Gaslamp Str.',lat: 32.711627,long: -117.15937},
    {loc: 'Sunset Cliffs Natureal Park',lat: 32.718073,long: -117.255170} 
    ];


