#include "ofApp.h"
#include <string>


//--------------------------------------------------------------
void ofApp::setup(){
    ofBackground(255);
    ofTrueTypeFont::setGlobalDpi(72);
    ofSetFrameRate(20);
    inputThread_.startThread();
    ofAddListener(inputThread_.onCommandReceived, this, &ofApp::commandReceived);
}

//--------------------------------------------------------------
void ofApp::update(){
    switch (lastCommand_.mode) {
        case IDLE:
            idle_.update(lastCommand_.args);
            break;
        case PREVIEW:
            preview_.update(lastCommand_.args);
            break;
        case PENDING:
            pending_.update(lastCommand_.args);
            break;
        case PROCESSING:
            processing_.update(lastCommand_.args);
            break;
        case FINISHED:
            finished_.update(lastCommand_.args);
            break;
        case ERROR:
        case UNKNOWN:
            error_.update(lastCommand_.args);
            break;
    }

}

//--------------------------------------------------------------
void ofApp::draw(){
    heading_.draw();
    switch (lastCommand_.mode) {
        case IDLE:
            idle_.draw();
            break;
        case PREVIEW:
            preview_.draw();
            break;
        case PENDING:
            pending_.draw();
            break;
        case PROCESSING:
            processing_.draw();
            break;
        case FINISHED:
            finished_.draw();
            break;
        case ERROR:
        case UNKNOWN:
            error_.draw();
            break;
    }
}

void ofApp::commandReceived(Command& cmd) {
    lastCommand_ = cmd;
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

}

//--------------------------------------------------------------
void ofApp::dragEvent(ofDragInfo dragInfo){ 

}
