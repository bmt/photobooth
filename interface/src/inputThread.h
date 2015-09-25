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
#include "view.h"

struct Command {
    ViewMode mode;
    std::vector<std::string> args;
    Command();
    Command(ViewMode mode, std::vector<std::string> args);
    static Command FromString(std::string);
};

class InputThread : public ofThread {
    void threadedFunction();
public:
    ofEvent<Command> onCommandReceived;
};

#endif /* inputThread_h */
