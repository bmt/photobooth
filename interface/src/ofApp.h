#pragma once

#include "ofMain.h"
#include "inputThread.h"
#include "videoGrabber.h"
#include "view.h"
#include <string>
#include <vector>

class ofApp : public ofBaseApp{
public:
    ofApp(const char* socket);
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
    const string socket_;
    InputThread inputThread_;

    // App State
    ViewMode mode_;
    string timeRemaining_;
    vector<Image> images_;
    VideoGrabber previewVideo_;
    Image finalImage_;

    // View objects
    PhotoBar photoBar_;
    Heading heading_;
    IdleView idle_;
    PreviewView preview_;
    PendingView pending_;
    ProcessingView processing_;
    FinishedView finished_;
    ErrorView error_;
};
