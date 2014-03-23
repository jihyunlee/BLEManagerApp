/* jshint quotmark: false, unused: vars, browser: true */
'use strict';

var app = {
initialize: function() {
    this.bind();
},
bind: function() {
    document.addEventListener('deviceready', this.deviceready, false);
},
circleX: 140,
circleSize: 80,
verticalLineWidth: 6,
circleIcons: [],
selectedDiv: document.getElementById('selectedFood'),
deviceready: function() {
    
    if(window.cordova.logger) {
        window.cordova.logger.__onDeviceReady();
    }
    

    // setting style stuff for the images, because I suck at CSS
    var line = document.getElementById('verticalLine');
    line.style.left = Math.floor(app.circleX-(app.verticalLineWidth*1.3))+'px';
    var cornerButton = document.getElementById('cornerButton');
    cornerButton.style.left = Math.floor(window.innerWidth-(cornerButton.offsetWidth*1.5))+'px';
    cornerButton.style.top = Math.floor(cornerButton.offsetHeight*0.5)+'px';
    var getItButton = document.getElementById('getItButton');
    getItButton.style.top = Math.floor(window.innerHeight-getItButton.offsetHeight)+'px';

    // this holds the large circular image for when you click stuff
    app.selectedDiv.style.left = (app.circleX+50)+'px';
    app.selectedDiv.style.display = 'none';

    // just saving the different circle icons for easy loading later
    for(var i=0;i<4;i++){
        app.circleIcons[i] = document.createElement('img');
        app.circleIcons[i].src = 'img/lebasket_Dot_'+i+'.png';
        app.circleIcons[i].className = "circle";
        app.circleIcons[i].style.left = Math.floor(app.circleX-(app.circleSize/2))+'px';
    }
    
    // start scanning immediately
    app.list();
},
setName: function(name) {
    BluetoothSerial.writePeripheralName("grocery","item","milk");
},
list: function(event) {
    bluetoothSerial.list(app.ondevicelist, app.generateFailureFunction("List Failed"));
},
timeoutId: 0,
setStatus: function(status) {
    if (app.timeoutId) {
        clearTimeout(app.timeoutId);
    }
    messageDiv.innerText = status;
    app.timeoutId = setTimeout(function() { messageDiv.innerText = ""; }, 4000);
},
    
allPeripherals: {}, // global-ish object, holding all our found peripherals
    
totalPeripherals: 0,
    
ondevicelist: function(devices) {
    
    // sort by distance (rssi)
    devices = devices.sort(function(a,b){
        if(a.rssi > 0) return 1;
        if(b.rssi > 0) return -1;
        return b.rssi-a.rssi;
    });
        
    var chickenParma = ["chicken", "pepper", "cheese", "marinaraSauce"];
    
    devices.forEach(function(device) {
                    
        var deviceId = undefined;
        var rssi = undefined;
        
        if (device.hasOwnProperty("uuid")) {
            deviceId = device.uuid;
        } else if (device.hasOwnProperty("address")) {
            deviceId = device.address;
        }
        if (device.hasOwnProperty("uuid")) {
            rssi = device.rssi;
        }
        
        if(deviceId && !app.allPeripherals[deviceId]){

            var p = {
                'id':deviceId,
                'rssi':rssi || 'no RSSI',
                'circleImage': undefined,
                'foodName':undefined,
                'updateCounter':-1,
                'x':app.circleX,
                'y': undefined,
                'selected':false
            };
            
            var ri= Math.floor(Math.random()*chickenParma.length);
            p.foodName = chickenParma[ri];
            
            app.allPeripherals[deviceId] = p;

            app.totalPeripherals++;
        }
        else{
            app.allPeripherals[deviceId].rssi = rssi;
            app.allPeripherals[deviceId].updateCounter = 0;
        }
    });
    
    app.updateCircleOrder();
    setTimeout(app.list, 100);
},
updateCircleOrder: function(){

    // first, erase and peripherals that haven't been scanned in a while
    for(var p in app.allPeripherals){
        var temp = app.allPeripherals[p];
        temp.updateCounter++;
        if(temp.updateCounter>3){
            app.totalPeripherals--;
            if(temp.circleImage) temp.circleImage.parentNode.removeChild(temp.circleImage);
            delete app.allPeripherals[p];
        }
    }

    // now update all the circle's positions
    if(app.totalPeripherals>0){
        var iconThresh = app.totalPeripherals/4; // temporary, for developing
        var bottomMargin = Math.floor(window.innerHeight*.15);
        var topMargin = Math.floor(window.innerHeight*.15);
        var gap = ((window.innerHeight-bottomMargin)-topMargin)/app.totalPeripherals;
        var counter = 0;
        for(var p in app.allPeripherals){

            var _p = app.allPeripherals[p];

            // change the circle icon if it's different (will later be based off RSSI)
            var imageIndex = Math.floor(counter/iconThresh); // temporary, for developing
            if(imageIndex!=_p.imageIndex){
                var newImage = app.circleIcons[imageIndex].cloneNode(false);
                if(_p.circleImage){
                    document.getElementById('circlesDiv').replaceChild(newImage,_p.circleImage);
                }
                else{
                    document.getElementById('circlesDiv').appendChild(newImage);
                }
                _p.circleImage = newImage;
                _p.circleImage.ontouchstart = (function(){
                    var periph = _p;
                    return function(){
                        app.moveSelection(periph);
                    }
                })();
            }

            // move the circle to it's new spot
            var tempTop = Math.floor(((gap/2)+(gap*counter)));
            tempTop += topMargin;
            _p.y = tempTop;
            _p.circleImage.style.top = Math.floor(tempTop-(app.circleSize/2))+'px';

            // update the big selected div to the circle's new position
            if(_p.selected) app.moveSelection(_p);

            counter++;
        }
    }
    else{
        app.selectedDiv.style.display = 'none';
    }
},
moveSelection: function(_p){
    app.selectedDiv.style.display = 'block';
    app.selectedDiv.style.top = Math.floor(_p.y-(app.selectedDiv.offsetHeight/2))+'px';
    _p.selected = true;
    for(var p in app.allPeripherals){
        if(app.allPeripherals[p]!=_p){
            app.allPeripherals[p].selected = false;
        }
    }
},
generateFailureFunction: function(message) {
    var func = function(reason) {
        var details = "";
        if (reason) {
            details += ": " + JSON.stringify(reason);
        }
        app.setStatus(message + details);
    };
    return func;
}
};