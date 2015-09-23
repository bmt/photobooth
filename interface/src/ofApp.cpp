#include "ofApp.h"
#include <string>


//--------------------------------------------------------------
void ofApp::setup(){
    ofBackground(255);
    ofTrueTypeFont::setGlobalDpi(72);    
    textFont.loadFont("verdana.ttf", 14, true, true);
    headingFont.loadFont("verdana.ttf", 60, true, true);
    
    mode = IDLE;
    inputThread.startThread();
}

//--------------------------------------------------------------
void ofApp::update(){

}

//--------------------------------------------------------------
void ofApp::draw(){
    drawHeading();
    switch (mode) {
        case IDLE:
            drawIdle();
            break;
        case PREVIEW:
            drawPreview();
            break;
        case PENDING:
            drawPending();
            break;
        case PROCESSING:
            drawProcessing();
            break;
        case FINISHED:
            drawFinished();
            break;
        case ERROR:
        case UNKNOWN:
            drawError();
            break;
    }
}

void ofApp::drawHeading() {
    ofSetColor(0);
    headingFont.drawString("Photobooth", 30, 65);
}

void ofApp::drawIdle(){
    textFont.drawString("Press button to begin.", 30, 130);
}

void ofApp::drawPreview(){
    textFont.drawString("Press button to start countdown.", 30, 130);
}

void ofApp::drawPending(){
    textFont.drawString("Time remaining: ##", 30, 130);
}

void ofApp::drawProcessing(){
    textFont.drawString("Processing...", 30, 130);
}

void ofApp::drawFinished(){
    textFont.drawString("Finished", 30, 130);
}

void ofApp::drawError(){
    textFont.drawString("Error", 30, 130);
}

//--------------------------------------------------------------
void ofApp::keyPressed(int key){

}

//--------------------------------------------------------------
void ofApp::keyReleased(int key){

}

//--------------------------------------------------------------
void ofApp::mouseMoved(int x, int y ){

}

//--------------------------------------------------------------
void ofApp::mouseDragged(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mousePressed(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mouseReleased(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::windowResized(int w, int h){

}

//--------------------------------------------------------------
void ofApp::gotMessage(ofMessage msg){
    // Parse the state notifications.
    lastMessage = msg.message;
    
    int cmd;
    sscanf(msg.message.c_str(), "%d", &cmd);
    if (cmd > 0 && cmd < UNKNOWN) {
        mode = static_cast<InterfaceMode>(cmd);
    }
}

//--------------------------------------------------------------
void ofApp::dragEvent(ofDragInfo dragInfo){ 

}
