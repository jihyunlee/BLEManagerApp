/* jshint quotmark: false, unused: vars, browser: true */
/* global cordova, console, $, bluetoothSerial, _, refreshButton, deviceList, previewColor, red, green, blue, disconnectButton, connectionScreen, colorScreen, rgbText, messageDiv */
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
deviceready: function() {
    
    if(window.cordova.logger) {
        window.cordova.logger.__onDeviceReady();
    }
        
    var line = document.getElementById('verticalLine');
    line.style.left = Math.floor(app.circleX-(app.verticalLineWidth*1.3))+'px';
    var cornerButton = document.getElementById('cornerButton');
    cornerButton.style.left = Math.floor(window.innerWidth-100)+'px';
    var getItButton = document.getElementById('getItButton');
    getItButton.style.top = Math.floor(window.innerHeight-getItButton.offsetHeight)+'px';
    
    // wire buttons to functions
    refreshButton.ontouchstart = app.list;
    disconnectButton.ontouchstart = app.disconnect;
},
setName: function(name) {
    BluetoothSerial.writePeripheralName("grocery","item","milk");
},
list: function(event) {
    document.getElementById('status').innerHTML = "Discovering...";
    
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
    
    document.getElementById('status').innerHTML = "Found Devices: "+devices.length;
    
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
                'circleImage': document.createElement('img'),
                'foodName':undefined,
                'updateCounter':0
            };

            p.circleImage.className = "circle";
            p.circleImage.style.left = Math.floor(app.circleX-(app.circleSize/2))+'px';
            p.circleImage.src = 'img/lebasket_Dot12.png';
            document.getElementById('circlesDiv').appendChild(p.circleImage);
            
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
    for(var p in app.allPeripherals){
        var temp = app.allPeripherals[p];
        temp.updateCounter++;
        if(temp.updateCounter>3){
            app.totalPeripherals--;
            delete app.allPeripherals[p];
            temp.circleImage.parentNode.removeChild(temp);
        }
    }
    if(app.totalPeripherals>0){
        var gap = window.innerHeight/app.totalPeripherals;
        var counter = 0;
        for(var temp in app.allPeripherals){
            var temp = app.allPeripherals[p];
            temp.circleImage.style.top = (Math.floor((gap/2)+(gap*counter))-app.circleSize/2)+'px';
            counter++;
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