#pragma once

#include "ofMain.h"
#include "inputThread.h"
#include "view.h"
#include <string>
#include <vector>

class ofApp : public ofBaseApp{
public:
    ofApp() : ofBaseApp(),
              preview_(&previewPhoto_),
              pending_(&photoBar_, &previewPhoto_),
              processing_(&photoBar_, &previewPhoto_) {};
    void setup();
    void update();
    void draw();
    
    void commandReceived(Command& cmd);
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
    InputThread inputThread_;
    
    // TODO: guard with mutex
    Command lastCommand_;
    
    Heading heading_;
    PreviewPhoto previewPhoto_;
    PhotoBar photoBar_;
    IdleView idle_;
    PreviewView preview_;
    PendingView pending_;
    ProcessingView processing_;
    FinishedView finished_;
    ErrorView error_;
};
