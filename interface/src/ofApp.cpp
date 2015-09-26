#include "ofApp.h"
#include "positions.h"
#include <string>
#include <vector>
#include <algorithm>    // std::copy


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
    previewPhoto_.update(previewImage_);
    photoBar_.update(images_);
    switch (mode_) {
        case PENDING:
            pending_.update(timeRemaining_);
            break;
        case FINISHED:
            finished_.update(finalImage_);
            break;
        case IDLE:
        case PREVIEW:
        case PROCESSING:
        case ERROR:
        case UNKNOWN:
        default:
            break;
    }

}

//--------------------------------------------------------------
void ofApp::draw(){
    heading_.draw();
    switch (mode_) {
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

void updateImageIfChanged(const string& newPath,
                          const Image& current,
                          int width,
                          int height,
                          Image* newImg) {
    newImg->path = newPath;
    if (newPath.size() && current.path != newPath) {
        newImg->preLoad(newPath);
        newImg->image->resize(width, height);
    }
}

void swapImageIfChanged(Image* current, Image* newImg) {
    if (current->path != newImg->path) {
        current->swap(newImg);
    }
}

void ofApp::commandReceived(Command& cmd) {
    vector<string> imgPaths(3, "");
    string timeRemaining, previewPath, finalPath;
    switch(cmd.mode) {
        case PREVIEW:
            if (cmd.args.size() > 0) {
                previewPath = cmd.args[0];
            }
            break;
        case PENDING:
            if (cmd.args.size() > 0) {
                timeRemaining = cmd.args[0];
            }
    
            if (cmd.args.size() > 1) {
                previewPath = cmd.args[1];
            }
            
            std::copy(cmd.args.begin() + 2,
                      cmd.args.end(), imgPaths.begin());
            break;
        case PROCESSING:
            if (cmd.args.size() > 0) {
                previewPath = cmd.args[1];
            }
            
            std::copy(cmd.args.begin() + 1, cmd.args.end(),
                      imgPaths.begin());
        case FINISHED:
            if (cmd.args.size() > 0) {
                finalPath = cmd.args[0];
            }
        case IDLE:
        case ERROR:
        case UNKNOWN:
            break;
    }
    
    Image newPreviewImage;
    newPreviewImage.image->setUseTexture(false);
    Image newFinalImage;
    newFinalImage.image->setUseTexture(false);
    vector<Image> newImages(3);
    for (Image i : newImages) {
        i.image->setUseTexture(false);
    }
    
    // Load any new images.
    for (int i = 0; i < 3; ++i) {
        updateImageIfChanged(imgPaths[i], images_[i],
                                PHOTOBAR_PHOTO_WIDTH,
                                PHOTOBAR_PHOTO_HEIGHT,
                                &(newImages[i]));
    }
    updateImageIfChanged(previewPath, previewImage_,
                            PREVIEW_PHOTO_WIDTH,
                            PREVIEW_PHOTO_HEIGHT, &newPreviewImage);
    updateImageIfChanged(finalPath, finalImage_,
                            0, 0, &newFinalImage);
    // TODO: grab a mutex
    
    // Apply any changes images.
    for (int i = 0; i < 3; ++i) {
        swapImageIfChanged(&images_[i], &newImages[i]);
    }
    swapImageIfChanged(&previewImage_, &newPreviewImage);
    swapImageIfChanged(&finalImage_, &newFinalImage);
    mode_ = cmd.mode;
    timeRemaining_ = timeRemaining;
    
    // TODO: release mutex
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
