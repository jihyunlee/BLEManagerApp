//
//  BTLEPeripheral.h
//
//  Created by jihyun on 3/19/14.
//
//

#import <CoreBluetooth/CoreBluetooth.h>

@class BTLEPeripheral;

@protocol BTLEPeripheralDelegate
@optional
@required
@end

@interface BTLEPeripheral : NSObject <CBPeripheralManagerDelegate> {
}

@property (nonatomic,assign) id <BTLEPeripheralDelegate> delegate;
@property (strong, nonatomic) CBPeripheralManager       *peripheralManager;
@property (strong, nonatomic) CBPeripheral              *activePeripheral;
@property (strong, nonatomic) CBMutableCharacteristic   *transferCharacteristic;
@property (strong, nonatomic) NSData                    *dataToSend;
@property (nonatomic, readwrite) NSInteger              sendDataIndex;

- (void)initPeripheral;
- (void)deinitPeripheral;

- (void)peripheralManagerDidUpdateState:(CBPeripheralManager *)peripheral;

// add service
- (void)doAddService:(NSString *)serviceName key:(NSString *)characteristicKey value:(NSData *)characteristicValue;
- (void)peripheralManager:(CBPeripheralManager *)peripheral didAddService:(NSError *)error;

// advertising
- (void)doStartAdvertising:(NSString *)serviceName;
- (void)doStopAdvertising;
- (void)peripheralManagerDidStartAdvertising:(CBPeripheralManager *)peripheral error:(NSError *)error;


@end