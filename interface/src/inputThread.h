//
//  inputThread.h
//  pbInterface
//
//  Created by Brian Turnbull on 9/22/15.
//
//

#ifndef inputThread_h
#define inputThread_h

#include <stdio.h>
#include "ofMain.h"

class InputThread : public ofThread {
    void threadedFunction();
};

#endif /* inputThread_h */
