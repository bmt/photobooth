//
//  inputThread.cpp
//  pbInterface
//
//  Created by Brian Turnbull on 9/22/15.
//
//

#include "inputThread.h"
#include <iostream>
#include <string>
#include "view.h"



Command::Command(ViewMode mode, std::vector<std::string> args)
: mode(mode), args(args) {}

Command::Command() : mode(IDLE) {}

Command Command::FromString(std::string input) {
    ViewMode mode = UNKNOWN;
    vector<string> args;

    const char* c = input.c_str();

    // Parse mode
    size_t modeLength = 0;
    while(*c && *c != '\t') {
        modeLength++;
        ++c;
    }

    const string rawMode(input.c_str(), modeLength);
    int parsedMode = UNKNOWN;
    sscanf(rawMode.c_str(), "%d", &parsedMode);

    if (parsedMode >= 0 && parsedMode < UNKNOWN) {
      mode = static_cast<ViewMode>(parsedMode);
    }

    // Parse Args
    while(*c) {
        ++c;  // Consume the tab.
        const char* arg = c;
        size_t argLength = 0;
        while(*c && *c != '\t') {
            ++argLength;
            ++c;
        }
        if (argLength) {
            args.push_back(string(arg, argLength));
        }
    }

    // Create the command.
    auto_ptr<Command> cmd(new Command(mode, args));
    return *cmd;
}

void InputThread::threadedFunction() {
    while(isThreadRunning()) {
        string input;
        std::getline(std::cin, input);
        if (input.length()) {
            Command cmd = Command::FromString(input);
            if (cmd.mode != UNKNOWN) {
                ofNotifyEvent(onCommandReceived, cmd);
            }
        }
    }
}
