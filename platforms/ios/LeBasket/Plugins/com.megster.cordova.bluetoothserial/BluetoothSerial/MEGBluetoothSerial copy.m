//
//  BTLEManager.h
//  Bluetooth Low Energy Cordova Plugin
//
//  Created by jihyun on 3/19/14.
//
//

#import "MEGBluetoothSerial.h"
#import <Cordova/CDV.h>

@interface MEGBluetoothSerial()
- (NSString *)readUntilDelimiter:(NSString *)delimiter;
- (NSMutableArray *)getPeripheralList;
- (void)sendDataToSubscriber;
- (void)connectToUUID:(NSString *)uuid;
- (void)listPeripheralsTimer:(NSTimer *)timer;
- (void)connectFirstDeviceTimer:(NSTimer *)timer;
- (void)connectUuidTimer:(NSTimer *)timer;
@end

@implementation MEGBluetoothSerial

- (void)pluginInitialize {
    NSLog(@"pluginInitialize");
    NSLog(@"Bluetooth Serial Cordova Plugin - BLE version");
    NSLog(@"(c)2014 Jihyun Lee");

    [super pluginInitialize];
    
    _bleShield = [[BTLEManager alloc] init];
    [_bleShield setup];
    [_bleShield setDelegate:self];

    _buffer = [[NSMutableString alloc] init];
}

#pragma mark - Cordova Plugin Methods

- (void)connect:(CDVInvokedUrlCommand *)command {
    
    NSLog(@"connect");
    CDVPluginResult *pluginResult = nil;
    NSString *uuid = [command.arguments objectAtIndex:0];
    
    // if the uuid is null or blank, scan and
    // connect to the first available device

    if (uuid == (NSString*)[NSNull null]) {
        [self connectToFirstDevice];
    } else if ([uuid isEqualToString:@""]) {
        [self connectToFirstDevice];
    } else {
        [self connectToUUID:uuid];
    }
    
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_NO_RESULT];
    [pluginResult setKeepCallbackAsBool:TRUE];
    _connectCallbackId = [command.callbackId copy];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)disconnect:(CDVInvokedUrlCommand*)command {
    
    NSLog(@"disconnect");
    
    CDVPluginResult *pluginResult = nil;
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];

    [_bleShield.CM disconnect];
        
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    _connectCallbackId = nil;
}

- (void)subscribe:(CDVInvokedUrlCommand*)command {
    NSLog(@"subscribe");
    
    CDVPluginResult *pluginResult = nil;
    NSString *delimiter = [command.arguments objectAtIndex:0];
    
    if (delimiter != nil) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_NO_RESULT];
        [pluginResult setKeepCallbackAsBool:TRUE];
        _subscribeCallbackId = [command.callbackId copy];
        _delimiter = [delimiter copy];
    } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"delimiter was null"];
    }
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)write:(CDVInvokedUrlCommand*)command {
    NSLog(@"write");
    
    CDVPluginResult *pluginResult = nil;
    NSString *message = [command.arguments objectAtIndex:0];

    if (message != nil) {
        
        // todo: implement write API
//        NSData *d = [message dataUsingEncoding:NSUTF8StringEncoding];
//        [_bleShield write:d];
        
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"message was null"];
    }
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)list:(CDVInvokedUrlCommand*)command {
    NSLog(@"list");
    
    CDVPluginResult *pluginResult = nil;

    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_NO_RESULT];
    [pluginResult setKeepCallbackAsBool:TRUE];

    [_bleShield findBLEPeripherals:3];
    
    [NSTimer scheduledTimerWithTimeInterval:(float)3.0
                                     target:self
                                   selector:@selector(listPeripheralsTimer:)
                                   userInfo:[command.callbackId copy]
                                    repeats:NO];

    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)isEnabled:(CDVInvokedUrlCommand*)command {
    NSLog(@"isEnabled");
    
    // short delay so CBCentralManger can spin up bluetooth
    [NSTimer scheduledTimerWithTimeInterval:(float)0.2
                                     target:self
                                   selector:@selector(bluetoothStateTimer:)
                                   userInfo:[command.callbackId copy]
                                    repeats:NO];
    
    CDVPluginResult *pluginResult = nil;
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_NO_RESULT];
    [pluginResult setKeepCallbackAsBool:TRUE];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)isConnected:(CDVInvokedUrlCommand*)command {
    NSLog(@"isConnected");
    
    CDVPluginResult *pluginResult = nil;
    
    if (_bleShield.isConnected) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Not connected"];
    }
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)available:(CDVInvokedUrlCommand*)command {
    NSLog(@"available");
    CDVPluginResult *pluginResult = nil;
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:[_buffer length]];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)read:(CDVInvokedUrlCommand*)command {
    NSLog(@"read");
    CDVPluginResult *pluginResult = nil;
    NSString *message = @"";
    
    if ([_buffer length] > 0) {
        int end = [_buffer length] - 1;
        message = [_buffer substringToIndex:end];
        NSRange entireString = NSMakeRange(0, end);
        [_buffer deleteCharactersInRange:entireString];
    }
    
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:message];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)readUntil:(CDVInvokedUrlCommand*)command {
    NSLog(@"readUntil");
    NSString *delimiter = [command.arguments objectAtIndex:0];
    NSString *message = [self readUntilDelimiter:delimiter];
    CDVPluginResult *pluginResult = nil;

    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:message];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)clear:(CDVInvokedUrlCommand*)command {
    NSLog(@"clear");
    int end = [_buffer length] - 1;
    NSRange truncate = NSMakeRange(0, end);
    [_buffer deleteCharactersInRange:truncate];
}

- (void)readRSSI:(CDVInvokedUrlCommand*)command {
    NSLog(@"readRSSI");
    
    // TODO if callback exists...
    [_bleShield.CM readActiveRSSI];
    
    CDVPluginResult *pluginResult = nil;
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_NO_RESULT];
    [pluginResult setKeepCallbackAsBool:TRUE];
    _rssiCallbackId = [command.callbackId copy];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

#pragma mark - BLEDelegate 

- (void)bleDidReceiveData:(unsigned char *)data length:(int)length {
    NSLog(@"bleDidReceiveData");
    
    // Append to the buffer
    NSData *d = [NSData dataWithBytes:data length:length];
    NSString *s = [[NSString alloc] initWithData:d encoding:NSUTF8StringEncoding];
    NSLog(@"Received %@", s);

    if (s) {
        [_buffer appendString:s];

        if (_subscribeCallbackId) {
            [self sendDataToSubscriber];
        }
    } else {
        NSLog(@"Error converting received data into a String.");
    }
}

- (void)bleDidConnect {
    NSLog(@"bleDidConnect");
    CDVPluginResult *pluginResult = nil;
        
    if (_connectCallbackId) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [pluginResult setKeepCallbackAsBool:TRUE];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:_connectCallbackId];
    }
}

- (void)bleDidDisconnect {
    // TODO is there anyway to figure out why we disconnected?
    NSLog(@"bleDidDisconnect");
    
    CDVPluginResult *pluginResult = nil;
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Disconnected"];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:_connectCallbackId];

    _connectCallbackId = nil;
}

- (void)bleDidUpdateRSSI:(NSNumber *)rssi {
    NSLog(@"bleDidUpdateRSSI");
    if (_rssiCallbackId) {
        CDVPluginResult *pluginResult = nil;
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDouble:[rssi doubleValue]];
        [pluginResult setKeepCallbackAsBool:TRUE]; // TODO let expire, unless watching RSSI        
        [self.commandDelegate sendPluginResult:pluginResult callbackId:_rssiCallbackId];
    }
}

#pragma mark - timers

-(void)listPeripheralsTimer:(NSTimer *)timer {
    NSLog(@"listPeripheralsTimer");
    NSString *callbackId = [timer userInfo];
    NSMutableArray *peripherals = [self getPeripheralList];
    
    CDVPluginResult *pluginResult = nil;
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray: peripherals];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:callbackId];
}

-(void)connectFirstDeviceTimer:(NSTimer *)timer {
    NSLog(@"connectFirstDeviceTimer");
    if(_bleShield.CM.peripherals.count > 0) {
        NSLog(@"Connecting");
        [_bleShield connectPeripheral:[_bleShield.CM.peripherals objectAtIndex:0]];
    } else {
        NSString *error = @"Did not find any BLE peripherals";
        NSLog(@"%@", error);
        CDVPluginResult *pluginResult;
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:_connectCallbackId];
    }
}

-(void)connectUuidTimer:(NSTimer *)timer {
    NSLog(@"connectUuidTimer");
    NSString *uuid = [timer userInfo];
    
    CBPeripheral *peripheral = [_bleShield.CM getPeripheralByUUID:uuid];
    
    if (peripheral) {
        [_bleShield connectPeripheral:peripheral];
    } else {
        NSString *error = [NSString stringWithFormat:@"Could not find peripheral %@.", uuid];
        NSLog(@"%@", error);
        CDVPluginResult *pluginResult;
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:_connectCallbackId];
    }
}

- (void)bluetoothStateTimer:(NSTimer *)timer {
    NSLog(@"bluetoothStateTimer");
    NSString *callbackId = [timer userInfo];
    CDVPluginResult *pluginResult = nil;
    
    if ([_bleShield.CM isReady]) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt:[_bleShield.CM getState]];
    }
    [self.commandDelegate sendPluginResult:pluginResult callbackId:callbackId];
}

#pragma mark - internal implemetation

- (NSString*)readUntilDelimiter: (NSString*) delimiter {
    NSLog(@"readUntilDelimiter");
    
    NSRange range = [_buffer rangeOfString: delimiter];    
    NSString *message = @"";
    
    if (range.location != NSNotFound) {

        int end = range.location + range.length;
        message = [_buffer substringToIndex:end];
        
        NSRange truncate = NSMakeRange(0, end);
        [_buffer deleteCharactersInRange:truncate];
    }
    return message;
}

- (NSMutableArray*) getPeripheralList {
    NSLog(@"getPeripheralList");
    NSMutableArray *peripherals = [NSMutableArray array];
    
    for (int i = 0; i < _bleShield.CM.peripherals.count; i++) {
        NSMutableDictionary *peripheral = [NSMutableDictionary dictionary];
        CBPeripheral *p = [_bleShield.CM.peripherals objectAtIndex:i];
        
        if (p.UUID != NULL) {
            // Seriously WTF?
            CFStringRef s = CFUUIDCreateString(NULL, p.UUID);
            NSString *uuid = [NSString stringWithCString:CFStringGetCStringPtr(s, 0)
                                                encoding:(NSStringEncoding)NSUTF8StringEncoding];
            [peripheral setObject: uuid forKey: @"uuid"];
        }
        else {
            [peripheral setObject: @"" forKey: @"uuid"];
        }
        
        NSString *name = [p name];
        if (!name) {
            name = [peripheral objectForKey:@"uuid"];
        }
        [peripheral setObject: name forKey: @"name"];
        
        NSNumber *rssi = [p advertisementRSSI];
        if (rssi) { // BLEShield doesn't provide advertised RSSI
            [peripheral setObject: rssi forKey:@"rssi"];
        }
        
        [peripherals addObject:peripheral];
    }
    
    return peripherals;
}

// calls the JavaScript subscriber with data if we hit the _delimiter
- (void) sendDataToSubscriber {
    NSLog(@"sendDataToSubscriber");
    NSString *message = [self readUntilDelimiter:_delimiter];

    if ([message length] > 0) {
        CDVPluginResult *pluginResult = nil;
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString: message];
        [pluginResult setKeepCallbackAsBool:TRUE];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:_subscribeCallbackId];
        
        [self sendDataToSubscriber];
    }
    
}


- (void)connectToFirstDevice {
    NSLog(@"connectToFirstDevice");
    [_bleShield findBLEPeripherals:3];
    
    [NSTimer scheduledTimerWithTimeInterval:(float)3.0
                                     target:self
                                   selector:@selector(connectFirstDeviceTimer:)
                                   userInfo:nil
                                    repeats:NO];    
}

- (void)connectToUUID:(NSString *)uuid {
    NSLog(@"connectToUUID");
    int interval = 0;
    
    if (_bleShield.CM.peripherals.count < 1) {
        interval = 3;
        [_bleShield findBLEPeripherals:interval];
    }
    
    [NSTimer scheduledTimerWithTimeInterval:interval
                                     target:self
                                   selector:@selector(connectUuidTimer:)
                                   userInfo:uuid
                                    repeats:NO];
}


@end
