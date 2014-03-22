

#import <Foundation/Foundation.h>
#import <CoreBluetooth/CoreBluetooth.h>

#import "BTLECentral.h"
#import "BTLEPeripheral.h"
#import "CBPeripheral+Extensions.h"

@class BTLEManager;

@protocol BTLEManagerDelegate
@end

@interface BTLEManager : NSObject <BTLECentralDelegate, BTLEPeripheralDelegate> {
    
}

@property (nonatomic,assign) id <BTLEManagerDelegate> delegate;
@property (strong, nonatomic) BTLECentral *CM;
@property (strong, nonatomic) BTLEPeripheral *PM;


-(void) setup;

-(BOOL) isConnected;

-(int) findBLEPeripherals:(int) timeout;
-(void) connectPeripheral:(CBPeripheral *)peripheral;

-(void) scanTimer:(NSTimer *)timer;
-(void) printKnownPeripherals;
-(void) printPeripheralInfo:(CBPeripheral*)peripheral;

@end
