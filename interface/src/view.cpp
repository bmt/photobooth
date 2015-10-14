//
//  view.cpp
//  pbInterface
//
//  Created by Brian Turnbull on 9/23/15.
//
//

#include "view.h"
#include "positions.h"
#include "ofMain.h"
#include <string>

LoadingAnimation::LoadingAnimation(float x, float y)
: x_(x), y_(y), visible_(false) { };

void LoadingAnimation::setVisible(bool visible) {
    visible_ = visible;
};

void LoadingAnimation::update() {
  int durationMillis = 900;
  float angleBegin  = (ofGetElapsedTimeMillis() % durationMillis) / (float) durationMillis * 360.0;
  float angleEnd = 360.0 / 4.0 + angleBegin; // 1/4 of circle

  line_.clear();
  line_.arc(ofPoint(x_, y_), LOADING_W, LOADING_H, angleBegin, angleEnd,
            60);
};

void LoadingAnimation::draw() {
    if (visible_) {
      ofPushStyle();
      ofSetColor(230, 230, 230);
      ofSetLineWidth(10);
      line_.draw();
      ofPopStyle();
    }
};

void drawArgs(ofTrueTypeFont font, vector<string> args) {
    string allArgs = "Args: ";
    for(string arg : args) {
        allArgs += arg;
        allArgs += "\n";
    }
    font.drawString(allArgs, GUTTER, TEXT_Y);
}

void PhotoBar::update(const vector<Image>& images) {
    // TODO: Only copy if changed.
    for (int i=0; i < images.size(); ++i) {
        if (images_[i].path != images[i].path) {
            images_[i] = images[i];
            images_[i].update();
        }
    }
}

void PhotoBar::draw(int x, int y) {
    ofPushStyle();
    ofSetColor(255);
    for (int i=0; i < images_.size(); ++i) {
        images_[i].draw(x, y + i * (PHOTOBAR_PHOTO_HEIGHT + PHOTOBAR_MARGIN));
    }
    ofPopStyle();
}

void Heading::draw() {
    ofPushStyle();
    ofSetColor(0);
    font_.drawString("Photobooth", GUTTER, HEADING_Y);
    ofPopStyle();
}

void IdleView::draw() {
    ofPushStyle();
    ofSetColor(0);
    defaultFont_.drawString("Press button to begin.",
                            GUTTER, TEXT_Y);
    ofPopStyle();
}

void PreviewView::draw() {
    ofPushStyle();
    ofSetColor(0);
    defaultFont_.drawString("Press button to start countdown.", GUTTER, TEXT_Y);
    preview_->draw(PREVIEW_X, PREVIEW_Y);
    ofPopStyle();
}

void PendingView::update(const string& timeRemaining, bool capturing) {
    timeRemaining_ = timeRemaining;
    capturing_ = capturing;
}

void PendingView::draw() {
    ofPushStyle();
    ofSetColor(0);
    bar_->draw(PHOTOBAR_X, PHOTOBAR_Y);
    preview_->draw(PREVIEW_X, PREVIEW_Y);
    string output;
    if (capturing_) {
        load_->setVisible(true);
        defaultFont_.drawString("Say Cheese!", GUTTER, TEXT_Y);
    } else if (timeRemaining_ == "0") {
        load_->setVisible(true);
        defaultFont_.drawString("Wait for the SECOND click.",
                                GUTTER, TEXT_Y);
    } else {
        ofSetColor(255, 255, 255, 150);
        font_.drawString(timeRemaining_, COUNTDOWN_X, COUNTDOWN_Y);
    }
    ofPopStyle();
}

void ProcessingView::update(const string& msg) {
    msg_ = msg;
}

void ProcessingView::draw() {
    ofPushStyle();
    ofSetColor(0);
    string output = "Processing, please wait";
    if (msg_.size() > 0) {
        output += ": ";
        output += msg_;
    } else {
        output += ".";
    }
    defaultFont_.drawString(output, GUTTER, TEXT_Y);
    load_->setVisible(true);
    bar_->draw(PHOTOBAR_X, PHOTOBAR_Y);
    // TODO: show last snapshot in video slot.
    // preview_->draw(PREVIEW_X, PREVIEW_Y);
    ofPopStyle();
}

void FinishedView::update(const Image& image, const string& shareUrl) {
    if (image_.path != image.path) {
        image_ = image;
        image_.update();
    }
    shareUrl_ = shareUrl;
}

void FinishedView::draw() {
    image_.draw(FINAL_PHOTO_X, FINAL_PHOTO_Y);
    ofPushStyle();
    ofSetColor(0);
    font_.drawString(shareUrl_, SHARE_URL_X, SHARE_URL_Y);
    defaultFont_.drawString("Take receipt with share url and scannable QRcode.  Press button to start again.",
                            SHARE_TEXT_X, SHARE_TEXT_Y);
    ofPopStyle();
}

void ErrorView::draw() {
    ofSetColor(0);
    defaultFont_.drawString("Error", GUTTER, TEXT_Y);
    ofPopStyle();
}
