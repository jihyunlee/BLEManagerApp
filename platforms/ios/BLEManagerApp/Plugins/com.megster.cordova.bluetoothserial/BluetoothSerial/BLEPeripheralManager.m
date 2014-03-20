#import "BLEPeripheralManager.h"
#import "BLEDefines.h"

@implementation BTLEPeripheral

@synthesize peripheralManager;
@synthesize activePeripheral;
@synthesize transferCharacteristic;
@synthesize dataToSend;
@synthesize sendDataIndex;


#define NOTIFY_MTU      20


#pragma mark - View Lifecycle



- (void)initPeripheral {

    // Start up the CBPeripheralManager
    self.peripheralManager = [[CBPeripheralManager alloc] initWithDelegate:self queue:nil];
}


- (void)deinitPeripheral {
    
    // Don't keep it going while we're not showing.
    [self.peripheralManager stopAdvertising];
}

#pragma mark - Peripheral Methods

/** Required protocol method.  A full app should take care of all the possible states,
 *  but we're just waiting for  to know when the CBPeripheralManager is ready
 */
- (void)peripheralManagerDidUpdateState:(CBPeripheralManager *)peripheral
{
    // Opt out from any other state
    if (peripheral.state != CBPeripheralManagerStatePoweredOn) {
        return;
    }
    
    // We're in CBPeripheralManagerStatePoweredOn state...
    NSLog(@"self.peripheralManager powered on.");
    
    activePeripheral = peripheral;
}


- (void)doAddService:(NSString *)serviceName key:(NSString *)characteristicKey value:(NSData *)characteristicValue{
    
    // If we're already advertising, stop
    if (self.peripheralManager.isAdvertising) {
        [self.peripheralManager stopAdvertising];
    }
    
    // Start with the CBMutableCharacteristic
    self.transferCharacteristic = [[CBMutableCharacteristic alloc] initWithType:[CBUUID UUIDWithString:characteristicKey]
                                                                     properties:CBCharacteristicPropertyNotify
                                                                          value:characteristicValue
                                                                    permissions:CBAttributePermissionsReadable];
    
    // Then the service
    CBMutableService *transferService = [[CBMutableService alloc] initWithType:[CBUUID UUIDWithString:serviceName]
                                                                       primary:YES];
    
    // Add the characteristic to the service
    transferService.characteristics = @[self.transferCharacteristic];
    
    // And add it to the peripheral manager
    [self.peripheralManager addService:transferService];
}

- (void)peripheralManager:(CBPeripheralManager *)peripheral didAddService:(NSError *)error {

    if (error) {
        NSLog(@"Error Add service");
        return;
    }
    
    
}


- (void)doStartAdvertising:(NSString *)serviceName {
    [self.peripheralManager startAdvertising:@{ CBAdvertisementDataServiceUUIDsKey : @[[CBUUID UUIDWithString:serviceName]] }];
}

- (void)peripheralManagerDidStartAdvertising:(CBPeripheralManager *)peripheral error:(NSError *)error {
    
    if (error) {
        NSLog(@"Error start advertising");
        return;
    }
    
}

- (void)doStopAdvertising {
    [self.peripheralManager stopAdvertising];
}

@end
