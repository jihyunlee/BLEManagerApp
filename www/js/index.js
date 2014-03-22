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
deviceready: function() {
    
    if(window.cordova.logger) {
        window.cordova.logger.__onDeviceReady();
    }
    
    // wire buttons to functions
    refreshButton.ontouchstart = app.list;
    disconnectButton.ontouchstart = app.disconnect;
    
    setTimeout(app.list, 2000);
},
setName: function(name) {
    BluetoothSerial.writePeripheralName("grocery","item","milk");
},
list: function(event) {
    console.log("=====================list========================");
    deviceList.firstChild.innerHTML = "Discovering...";
    app.setStatus("Looking for Bluetooth Devices...");
    
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

ondevicelist: function(devices) {
    
    // sort by distance (rssi)
    devices = devices.sort(function(a,b){
        if(a.rssi > 0) return 1;
        if(b.rssi > 0) return -1;
        return b.rssi-a.rssi;
    });
    
    var listItem, deviceId, rssi;
    
    // remove existing devices
    deviceList.innerHTML = "";
    app.setStatus("");
    
    var chickenParma = ["chicken", "pepper", "cheese", "garlicPowder", "oil", "marinaraSauce", "ItalianSeasoning"];
    
    devices.forEach(function(device) {
        listItem = document.createElement('li');
        listItem.className = "topcoat-list__item";
        if (device.hasOwnProperty("uuid")) { // TODO https://github.com/don/BluetoothSerial/issues/5
            deviceId = device.uuid;
        } else if (device.hasOwnProperty("address")) {
            deviceId = device.address;
        } else {
            deviceId = "ERROR " + JSON.stringify(device);
        }
        if (device.hasOwnProperty("uuid")) {
            rssi = device.rssi;
        } else {
            rssi = "unknown";
        }
        
        listItem.setAttribute('deviceId', device.address);
                    
        var randomnumber=Math.floor(Math.random()*11);
        var img = document.createElement('img');
        img.src = "img/"+chickenParma[randomnumber]+".png";
                    
        listItem.innerHTML = device.name + "<br/>" + rssi + "<br/><i>" + deviceId + "</i>";
        listItem.appendChild(img);
        deviceList.appendChild(listItem);
    });
    
    if (devices.length === 0) {
        
        if (cordova.platformId === "ios") { // BLE
            app.setStatus("No Bluetooth Peripherals Discovered.");
        } else { // Android
            app.setStatus("Please Pair a Bluetooth Device.");
        }
        
    } else {
        app.setStatus("Found " + devices.length + " device" + (devices.length === 1 ? "." : "s."));
    }
    setTimeout(app.list, 100);
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