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

void PendingView::update(const string& timeRemaining) {
    timeRemaining_ = timeRemaining;
}

void PendingView::draw() {
    ofPushStyle();
    ofSetColor(0);
    string output = "Time remaining: " + timeRemaining_;
    defaultFont_.drawString(output, GUTTER, TEXT_Y);
    bar_->draw(PHOTOBAR_X, PHOTOBAR_Y);
    preview_->draw(PREVIEW_X, PREVIEW_Y);
    ofPopStyle();
}

void ProcessingView::draw() {
    ofPushStyle();
    ofSetColor(0);
    defaultFont_.drawString("Processing...", GUTTER, TEXT_Y);
    bar_->draw(PHOTOBAR_X, PHOTOBAR_Y);
    // TODO: show last snapshot in video slot.
    // preview_->draw(PREVIEW_X, PREVIEW_Y);
    ofPopStyle();
}

void FinishedView::update(const Image& image) {
    if (image_.path != image.path) {
        image_ = image;
        image_.update();
    }
}

void FinishedView::draw() {
    ofPushStyle();
    ofSetColor(0);
    defaultFont_.drawString("Finished", GUTTER, TEXT_Y);
    ofPopStyle();
    image_.draw(FINAL_PHOTO_X, FINAL_PHOTO_Y);
}

void ErrorView::draw() {
    ofSetColor(0);
    defaultFont_.drawString("Error", GUTTER, TEXT_Y);
    ofPopStyle();
}
