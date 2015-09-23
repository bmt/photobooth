#pragma once

#include "ofMain.h"
#include "inputThread.h"
#include <string>
#include <vector>

class ofApp : public ofBaseApp{
public:
    void setup();
    void update();
    void draw();
    
    void keyPressed(int key);
    void keyReleased(int key);
    void mouseMoved(int x, int y );
    void mouseDragged(int x, int y, int button);
    void mousePressed(int x, int y, int button);
    void mouseReleased(int x, int y, int button);
    void windowResized(int w, int h);
    void dragEvent(ofDragInfo dragInfo);
    void gotMessage(ofMessage msg);
private:
    enum InterfaceMode { IDLE, PREVIEW, PENDING, PROCESSING, FINISHED, ERROR, UNKNOWN};
    void drawHeading();
    void drawIdle();
    void drawPreview();
    void drawPending();
    void drawProcessing();
    void drawFinished();
    void drawError();
    
    string lastMessage;
    
    ofTrueTypeFont	headingFont;
    ofTrueTypeFont	textFont;
    
    InputThread inputThread;
    
    vector<string> photoPaths;
    string finishedPhoto;
    InterfaceMode mode;
};
