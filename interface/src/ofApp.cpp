#include "ofApp.h"
#include "positions.h"
#include <string>
#include <vector>
#include <algorithm>    // std::copy

namespace {
// TODO: Move to a utils package
void drawBigImage(ofImage& image, float x, float y, float w, float h) {
  ofImage left;
  ofImage right;
  left.cropFrom(image, 0, 0, w/2, h);
  right.cropFrom(image, w/2, 0, w/2, h);
  left.draw(x, y);
  right.draw(x + w/2, y);
}
};

ofApp::ofApp(const char* socket)
: ofBaseApp(),
socket_(socket),
images_(4, Image()),
previewVideo_(socket_),
loadingAnimation_(LOADING_X, LOADING_Y),
idle_(&text_),
error_(&text_),
preview_(&text_),
pending_(&photoBar_, &loadingAnimation_, &text_),
finished_(&text_),
processing_(&photoBar_, &loadingAnimation_, &text_) {};

//--------------------------------------------------------------
void ofApp::setup(){
    ofBackground(255);
    ofSetColor(255);
    ofTrueTypeFont::setGlobalDpi(72);
    heading_.init("verdana.ttf", HEADING_FONT_SIZE);
    heading_.setText("Block Party Photobooth");
    heading_.setColor(0, 0, 0, 255);
    heading_.setLineHeight(HEADING_LINE_HEIGHT);

    text_.init("verdana.ttf", TEXT_FONT_SIZE);
    text_.setText("Press a button to begin.");
    text_.setColor(0, 0, 0, 255);

    footerLeft_.init("verdana.ttf", TEXT_FONT_SIZE);
    footerLeft_.setText("NOTE: All photos will be viewable by anyone with the  event url.");
    footerLeft_.setColor(0, 0, 0, 255);

    footerRight_.init("verdana.ttf", TEXT_FONT_SIZE);
    footerRight_.setText("Owner: Brian Turnbull");
    footerRight_.setColor(0, 0, 0, 255);

    ofSetVerticalSync(true);
    inputThread_.startThread();
    previewVideo_.connect();
    previewVideo_.startThread();
    ofAddListener(inputThread_.onCommandReceived, this, &ofApp::commandReceived);

    // Random image handler
    randomImageReady_ = false;
    ofRegisterURLNotification(this);
}

//--------------------------------------------------------------
void ofApp::update(){
    m_.lock();
    photoBar_.update(images_);
    loadingAnimation_.setVisible(false);
    loadingAnimation_.update();
    if (randomImageReady_) {
        swap(randomImage_, randomImageBack_);
        randomImage_.setUseTexture(true);
        randomImage_.update();
        randomImageReady_ = false;
    }
    switch (mode_) {
        case PREVIEW:
            previewVideo_.update();
            break;
        case PENDING:
            previewVideo_.update();
            pending_.update(timeRemaining_, mode_ == CAPTURE);
            break;
        case CAPTURE:
            pending_.update(timeRemaining_, mode_ == CAPTURE);
            break;
        case PROCESSING:
            previewVideo_.clear();
            processing_.update(processingMsg_);
            break;
        case FINISHED:
            previewVideo_.clear();
            finished_.update(finalImage_, shareUrl_);
            break;
        case IDLE:
            previewVideo_.clear();
            idle_.update();
            break;
        case ERROR:
        case UNKNOWN:
        default:
            error_.update();
            previewVideo_.clear();
            break;
    }
    m_.unlock();
}

//--------------------------------------------------------------
void ofApp::draw(){
    m_.lock();
    ofPushStyle();
    ofSetColor(0);

    // Heading
    heading_.drawCenter(ofGetWidth()/2, HEADING_Y);

    // Preview Placeholder
    ofPushStyle();
    ofSetColor(PLACEHOLDER_GRAY);
    ofFill();
    ofRect(PREVIEW_X, PREVIEW_Y, PREVIEW_PHOTO_WIDTH,
           PREVIEW_PHOTO_HEIGHT);
    ofPopStyle();

    // Photobar
    photoBar_.draw(PHOTOBAR_X, PHOTOBAR_Y);

    // View-specific content
    switch (mode_) {
        case PREVIEW:
            previewVideo_.draw(PREVIEW_X, PREVIEW_Y);
            preview_.draw();
            break;
        case PENDING:
            previewVideo_.draw(PREVIEW_X, PREVIEW_Y);
            pending_.draw();
            break;
        case CAPTURE:
            pending_.draw();
            break;
        case IDLE:
            if (randomImage_.isAllocated()) {
                ofPushStyle();
                ofSetColor(255);
                drawBigImage(randomImage_, PREVIEW_X, PREVIEW_Y,
                             PREVIEW_PHOTO_WIDTH, PREVIEW_PHOTO_HEIGHT);
                ofPopStyle();
            }
            idle_.draw();
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

    // Animation
    loadingAnimation_.draw();

    // General text
    text_.drawLeft(TEXT_X, TEXT_Y);
    footerLeft_.drawLeft(GUTTER, FOOTER_TEXT_Y);
    footerRight_.drawRight(ofGetWidth() - GUTTER, FOOTER_TEXT_Y);
    ofPopStyle();
    m_.unlock();
}

void printSize(float width, float height) {
  cout << width << " X " << height;
}

void updateImageIfChanged(const string& newPath,
                          const Image& current,
                          int width,
                          int height,
                          Image* newImg) {
    newImg->path = newPath;
    if (newPath.size() && current.path != newPath) {
        newImg->preLoad(newPath);
        if (width > 0 && height > 0) {
          //printSize(width, height);
          newImg->image->resize(width, height);
        } else if (width > 0) {
          float ratio = width / newImg->image->getWidth();
          float newHeight = ratio * newImg->image->getHeight();
          //printSize(width, newHeight);
          newImg->image->resize(width, newHeight);
        } else if (height > 0) {
          float ratio = height / newImg->image->getHeight();
          float newWidth = ratio * newImg->image->getWidth();
          //printSize(newWidth, height);
          newImg->image->resize(newWidth, height);
        }
    }
}

void swapImageIfChanged(Image* current, Image* newImg) {
    if (current->path != newImg->path) {
        current->swap(newImg);
    }
}

void ofApp::commandReceived(Command& cmd) {
    vector<string> imgPaths(4, "");
    string timeRemaining, finalPath, finalUrl, processingMsg;
    switch(cmd.mode) {
        case PENDING:
            if (cmd.args.size() > 0) {
                timeRemaining = cmd.args[0];
            }

            std::copy(cmd.args.begin() + 1,
                      cmd.args.end(), imgPaths.begin());
            break;
        case CAPTURE:
            std::copy(cmd.args.begin(),
                      cmd.args.end(), imgPaths.begin());
            break;
        case PROCESSING:
            if (cmd.args.size() > 3) {
                std::copy(cmd.args.begin(), cmd.args.begin() + 4,
                          imgPaths.begin());
            }
            if (cmd.args.size() > 4) {
                processingMsg = cmd.args[4];
            }
            break;
        case FINISHED:
            if (cmd.args.size() > 0) {
                finalPath = cmd.args[0];
            }
            if (cmd.args.size() > 1) {
                finalUrl = cmd.args[1];
            }
            break;
        case IDLE:
            if (cmd.args.size() > 0) {
                cout << "Loading random image." << endl;
                ofLoadURLAsync(cmd.args[0], "randomImage");
            } else {
                // Clear the image.
                m_.lock();
                randomImage_.clear();
                m_.unlock();
            }
        case PREVIEW:
        case ERROR:
        case UNKNOWN:
            break;
    }

    Image newFinalImage;
    newFinalImage.image->setUseTexture(false);
    vector<Image> newImages(4);
    for (Image i : newImages) {
        i.image->setUseTexture(false);
    }

    // Load any new images.
    for (int i = 0; i < 4; ++i) {
        updateImageIfChanged(imgPaths[i], images_[i],
                             PHOTOBAR_PHOTO_WIDTH, 0,
                             &(newImages[i]));
    }
    // TODO: This is slightly skewing the image.
    updateImageIfChanged(finalPath, finalImage_,
                         PREVIEW_PHOTO_WIDTH, PREVIEW_PHOTO_HEIGHT,
                         &newFinalImage);

    m_.lock();
    // Apply any changes to images.
    for (int i = 0; i < 4; ++i) {
        swapImageIfChanged(&images_[i], &newImages[i]);
    }
    swapImageIfChanged(&finalImage_, &newFinalImage);
    mode_ = cmd.mode;
    timeRemaining_ = timeRemaining;
    shareUrl_ = finalUrl;
    processingMsg_ = processingMsg;
    m_.unlock();
}

void ofApp::urlResponse(ofHttpResponse& response) {
    if(response.status==200) {
        cout << "Random image loaded.";
        randomImageBack_.setUseTexture(false);
        randomImageBack_.loadImage(response.data);
        randomImageBack_.resize(PREVIEW_PHOTO_WIDTH, PREVIEW_PHOTO_HEIGHT);
        m_.lock();
        randomImageReady_ = true;
        m_.unlock();
    }else{
        cout << response.status << " " << response.error << endl;
    }
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
