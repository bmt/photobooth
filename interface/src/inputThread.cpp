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

void InputThread::threadedFunction() {
    while(isThreadRunning()) {
        string input;
        std::getline(std::cin, input);
        if (input.length()) {
            ofSendMessage(ofMessage(input));
        }
    }
}