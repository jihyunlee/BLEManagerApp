/* jshint quotmark: false, unused: vars, browser: true */
'use strict';

var app = {
initialize: function() {
    this.bind();
},
bind: function() {
    document.addEventListener('deviceready', this.deviceready, false);
},
circleX: 0,
circleSize: 80,
verticalLineWidth: 6,
circleIcons: [],
selectedDiv: document.getElementById('selectedFood'),
deviceready: function() {
    
    if(window.cordova.logger) {
        window.cordova.logger.__onDeviceReady();
    }

    app.circleX = Math.floor(window.innerWidth * .15);

    // setting style stuff for the images, because I suck at CSS
    var line = document.getElementById('verticalLine');
//    line.style.left = Math.floor(app.circleX-(app.verticalLineWidth*1.3))+'px';
    line.style.left = app.circleX-app.verticalLineWidth+'px';
    
    // var getItButton = document.getElementById('getItButton');
    // getItButton.style.top = Math.floor(window.innerHeight-getItButton.offsetHeight)+'px';

    // this holds the large circular image for when you click stuff
    app.selectedDiv.style.left = (app.circleX+50)+'px';
    app.selectedDiv.style.display = 'none';
    app.selectedDiv.ontouchstart = function(){
        app.selectedDiv.style.display = 'none';
    }

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
                'span': document.createElement('span'),
                'foodName':undefined,
                'updateCounter':-1,
                'x':app.circleX,
                'y': undefined,
                'selected':false,
                'inBasket': false
            };

            p.span.className = 'circleSpan';
            document.getElementById('circlesDiv').appendChild(p.span);
            
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

    if(app.totalPeripherals>0){

        var onShelf = [];
        var inBasket = [];

        // first, erase the peripherals that haven't been scanned in a while
        for(var p in app.allPeripherals){
            var temp = app.allPeripherals[p];
            temp.updateCounter++;
            if(temp.updateCounter>3){
                app.totalPeripherals--;
                if(temp.circleImage) temp.circleImage.parentNode.removeChild(temp.circleImage);
                if(temp.span) temp.span.parentNode.removeChild(temp.span);
                delete app.allPeripherals[p];
            }
            else if(temp.inBasket){
                inBasket.push(temp);
            }
            else{
                onShelf.push(temp);
            }
        }

        if(!app.totalPeripherals>0) app.selectedDiv.style.display = 'none';

        // sort by distance (rssi) only the peripherals not in basket yet
        onShelf = onShelf.sort(function(a,b){
            if(a.rssi > 0) return 1;
            if(b.rssi > 0) return -1;
            return b.rssi-a.rssi;
        });

        var counter = 0;

        // first draw the sorted, on-shelf items
        for(var i=0;i<onShelf.length;i++){
            var _p = onShelf[i];

            // move it, and change it's image if necessary
            app.updateCircleIcon(_p,counter)

            // update the big selected div to the circle's new position
            if(_p.selected) app.moveSelection(_p);

            counter++;
        }

        // then update the inBasket items (all checkmarked and at the bottom)
        for(var i=0;i<inBasket.length;i++){
            var _p = inBasket[i];

            // move it, and change it's image if necessary
            app.updateCircleIcon(_p,counter)

            // update the big selected div to the circle's new position
            if(_p.selected) app.moveSelection(_p);

            counter++;
        }
    }
    else{
        app.selectedDiv.style.display = 'none';
    }
},
updateCircleIcon: function(_p,counter){

    // set the space to put them, and the distance between each circle
    var bottomMargin = Math.floor(window.innerHeight*.15);
    var topMargin = Math.floor(window.innerHeight*.15);
    var gap = ((window.innerHeight-bottomMargin)-topMargin)/app.totalPeripherals;

    // this doesn't feel right to me................... whatever
    var iconThresh = app.totalPeripherals/3;
    var imageIndex = Math.floor(counter/iconThresh);

    if(_p.inBasket) imageIndex = 3; // if it's in the basket, make it a checkmark

    // change the circle icon if it's different (will later be based off RSSI)
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

    _p.span.style.top = Math.floor(tempTop-(app.circleSize/2))+'px';
    _p.span.innerHTML = _p.foodName + '     ' + _p.rssi;
},
moveSelection: function(_p){
    // pass the touched peripheral to the big info thing
    // this moves the big info thing to that circle, and can later set it's image/text
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