
//#import <objc/runtime.h>
//#import <Foundation/Foundation.h>
#import <CoreBluetooth/CoreBluetooth.h>

@interface BTLECentral

@property (strong, nonatomic) CBCentralManager      *centralManager;
@property (strong, nonatomic) NSMutableArray        *peripherals;
@property (strong, nonatomic) CBPeripheral          *activePeripheral;
@property (strong, nonatomic) NSMutableData         *data;

@end



