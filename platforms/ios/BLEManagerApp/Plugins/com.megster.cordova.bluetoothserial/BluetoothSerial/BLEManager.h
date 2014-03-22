//
//  BTLEManager.h
//  Bluetooth Low Energy Cordova Plugin
//
//  Created by jihyun on 3/19/14.
//
//

#ifndef SimpleSerial_MEGBluetoothSerial_h
#define SimpleSerial_MEGBluetoothSerial_h

#import <Cordova/CDV.h>
#import <Foundation/Foundation.h>
#import <CoreBluetooth/CoreBluetooth.h>

#import "BLECentralManager.h"
#import "BLEPeripheralManager.h"
#import "CBPeripheral+Extensions.h"

@class BTLEManager;

@protocol BTLEManagerDelegate
@end

@interface BTLEManager : CDVPlugin <BTLECentralDelegate, BTLEPeripheralDelegate> {
    NSString* _connectCallbackId;
    NSString* _subscribeCallbackId;
    NSString* _rssiCallbackId;
    NSMutableString *_buffer;
    NSString *_delimiter;
}

@property (nonatomic,assign) id <BTLEManagerDelegate> delegate;
@property (strong, nonatomic) BTLECentral *CM;
@property (strong, nonatomic) BTLEPeripheral *PM;

-(void) scanTimer:(NSTimer *)timer;
-(void) printKnownPeripherals;
-(void) printPeripheralInfo:(CBPeripheral*)peripheral;

- (void)connect:(CDVInvokedUrlCommand *)command;
- (void)disconnect:(CDVInvokedUrlCommand *)command;

- (void)subscribe:(CDVInvokedUrlCommand *)command;
- (void)write:(CDVInvokedUrlCommand *)command;

- (void)list:(CDVInvokedUrlCommand *)command;
- (void)isEnabled:(CDVInvokedUrlCommand *)command;
- (void)isConnected:(CDVInvokedUrlCommand *)command;

- (void)available:(CDVInvokedUrlCommand *)command;
- (void)read:(CDVInvokedUrlCommand *)command;
- (void)readUntil:(CDVInvokedUrlCommand *)command;
- (void)clear:(CDVInvokedUrlCommand *)command;

- (void)readRSSI:(CDVInvokedUrlCommand *)command;

@end

#endif
