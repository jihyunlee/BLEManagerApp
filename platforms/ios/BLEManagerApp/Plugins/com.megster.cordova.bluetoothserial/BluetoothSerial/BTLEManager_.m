

#import "BTLEManager.h"
#import "BLEDefines.h"

@implementation BTLEManager

@synthesize delegate;
@synthesize CM;
@synthesize PM;

static bool isConnected = false;


- (void) setup {

    self.CM = [[BTLECentral alloc] init];
    self.CM.delegate = self;
    
    self.PM = [[BTLEPeripheral alloc] init];
    self.PM.delegate = self;
        
    [self.CM initCentral];
    [self.PM initPeripheral];
}


-(BOOL) isConnected {
    
    return isConnected;
}


- (int) findBLEPeripherals:(int) timeout {
    
    if (![self.CM isReady]) {
        return -1;
    }
    
    [NSTimer scheduledTimerWithTimeInterval:(float)timeout target:self selector:@selector(scanTimer:) userInfo:nil repeats:NO];
    
    [self.CM startScan];
    
    return 0;
}


- (void) connectPeripheral:(CBPeripheral *)peripheral {
    
    [self.CM connect: peripheral];
}

- (void) scanTimer:(NSTimer *)timer {
    
    [self.CM stopScan];

    [self printKnownPeripherals];
}

- (void) printKnownPeripherals {
    
    NSLog(@"Known peripherals : %lu", (unsigned long)[self.CM.peripherals count]);
    
    for (int i = 0; i < self.CM.peripherals.count; i++) {
        CBPeripheral *p = [self.CM.peripherals objectAtIndex:i];
        NSLog(@"peripheral : %@", p);

        if (p.identifier != NULL)
            NSLog(@"%d  |  %@", i, p.identifier.UUIDString);
        else
            NSLog(@"%d  |  NULL", i);
        
        [self printPeripheralInfo:p];
    }
}

- (void) printPeripheralInfo:(CBPeripheral*)peripheral {
    
    NSLog(@"------------------------------------");
    NSLog(@"Peripheral Info :");
    
    if (peripheral.identifier != NULL)
        NSLog(@"UUID : %@", peripheral.identifier.UUIDString);
    else
        NSLog(@"UUID : NULL");
    
    NSLog(@"Name : %@", peripheral.name);
    NSLog(@"RSSI : %@", [peripheral advertisementRSSI]);
    
    NSLog(@"peripheral : %@", peripheral);
    NSLog(@"-------------------------------------");
}


@end
