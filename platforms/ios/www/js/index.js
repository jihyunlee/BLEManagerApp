/* jshint quotmark: false, unused: vars, browser: true */
/* global cordova, console, $, bluetoothSerial, _, refreshButton, deviceList, previewColor, red, green, blue, disconnectButton, connectionScreen, colorScreen, rgbText, messageDiv */
'use strict';

var app = {
initialize: function() {
    this.bind();
},
bind: function() {
    document.addEventListener('deviceready', this.deviceready, false);
    colorScreen.hidden = true;
},
circleX: 100,
deviceready: function() {
    
    if(window.cordova.logger) {
        window.cordova.logger.__onDeviceReady();
    }
    
    console.log("deviceready");
        
//    var line = document.getElementById('verticalLine');
//    line.style.left = this.circleX+'px';
//    
    // wire buttons to functions
    refreshButton.ontouchstart = app.list;
    disconnectButton.ontouchstart = app.disconnect;
},
setName: function(name) {
    bluetoothSerial.writePeripheralName("grocery","item",name);
},
list: function(event) {
    console.log("===============list=============");
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
    
    console.log("ondevicelist", devices.length);
    
    // sort by distance (rssi)
    devices = devices.sort(function(a,b){
                    if(a.rssi > 0) return 1;
                    if(b.rssi > 0) return -1;
                    return b.rssi-a.rssi;
                    });
    
    document.getElementById('status').innerHTML = "Found Devices: "+devices.length;
    
    var chickenParma = ["chicken", "pepper", "cheese", "marinaraSauce"];
    
    devices.forEach(function(device) {
                    
                    console.log(device);
                    
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
                    'elem': document.createElement('li'),
                    'img': document.createElement('img'),
                    'text': document.createElement('div'),
                    'food':undefined,
                    'inBasket': false
                    }
                    p.elem.className ="topcoat-list__item";
                    
                    if(rssi < -50)
                        p.inBasket = true;
                    
                    var ri= Math.floor(Math.random()*chickenParma.length);
                    p.food = chickenParma[ri];
                    p.img.src = "./img/"+p.food+".png";
                    p.text.innerHTML = p.food + "<br/>" + rssi + "<br/><i>" + deviceId + "</i>";
                    
                    p.elem.appendChild(p.text);
                    p.elem.appendChild(p.img);
                    
                    document.getElementById('deviceList').appendChild(p.elem);
                    app.allPeripherals[deviceId] = p;
                    totalPeripherals++;
                    }
                    
                    else{
                    app.allPeripherals[deviceId].rssi = rssi;
                    app.allPeripherals[deviceId].text.innerHTML = app.allPeripherals[deviceId].food + "<br/>" + rssi + "<br/><i>" + deviceId + "</i>";
                    }
                    });
    
    console.log("nearest ", app.getNearestItem);
    
    setTimeout(app.list, 30);
},
getNearestItem: function() {
    
    allPeripherals.forEach(function(p) {
        if(!p.inBasket) return p;
    });
    
    // all items in the basket
    return null;
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