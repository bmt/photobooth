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
        float imageX = x + i * (PHOTOBAR_PHOTO_WIDTH + PHOTOBAR_MARGIN);
        float imageY = y;
        if (!images_[i].draw(imageX, imageY)) {
            // Draw a placeholder
            ofPushStyle();
            ofFill();
            ofSetColor(PLACEHOLDER_GRAY);
            ofRect(imageX, imageY, PHOTOBAR_PHOTO_WIDTH,
                   PHOTOBAR_PHOTO_HEIGHT);
            ofPopStyle();
        }
    }
    ofPopStyle();
}

void IdleView::update() {
    text_->setText("Press green button to begin.");
}

void PreviewView::update() {
    text_->setText("Press button to start countdown.");
}

void PreviewView::draw() {
    ofPushStyle();
    ofSetColor(0);
    preview_->draw(PREVIEW_X, PREVIEW_Y);
    ofPopStyle();
}

void PendingView::update(const string& timeRemaining, bool capturing) {
    timeRemaining_ = timeRemaining;
    capturing_ = capturing;
    if (capturing_) {
        load_->setVisible(true);
        text_->setText("Say Cheese!");
    } else if (timeRemaining_ == "0") {
        load_->setVisible(true);
        text_->setText("Wait for the SECOND click.");
    } else {
        text_->setText("");
        countdown_.setText(timeRemaining_);
    }
}

void PendingView::draw() {
    ofPushStyle();
    ofSetColor(0);
    bar_->draw(PHOTOBAR_X, PHOTOBAR_Y);
    preview_->draw(PREVIEW_X, PREVIEW_Y);
    string output;
    if (!capturing_ && timeRemaining_ != "0") {
        countdown_.drawCenter(PREVIEW_CENTER_X, PREVIEW_CENTER_Y);
    }
    ofPopStyle();
}

void ProcessingView::update(const string& msg) {
    string output = "Processing, please wait";
    if (msg.size() > 0) {
        output += ": ";
        output += msg;
    } else {
        output += ".";
    }
    text_->setText(output);
    load_->setVisible(true);
}

void ProcessingView::draw() {
}

void FinishedView::update(const Image& image, const string& shareUrl) {
    if (image_.path != image.path) {
        image_ = image;
        image_.update();
    }
    shareUrl_ = shareUrl;
    text_->setText("Take card with url to view all photos from the party. Press green button to start over.");
}

void FinishedView::draw() {
    ofPushStyle();
    ofSetColor(255);
    image_.draw(PREVIEW_X, PREVIEW_Y);
    // Disabled for block party.
    // ofSetColor(0);
    // font_.drawString(shareUrl_, SHARE_URL_X, SHARE_URL_Y);
    ofPopStyle();
}

void ErrorView::update() {
    text_->setText("Error");
}

void ErrorView::draw() {
}