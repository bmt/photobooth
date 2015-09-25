//
//  view.cpp
//  pbInterface
//
//  Created by Brian Turnbull on 9/23/15.
//
//

#include "view.h"
#include "ofMain.h"
#include <string>

#define PREVIEW_PHOTO_WIDTH 900
#define PREVIEW_PHOTO_HEIGHT 600
#define GUTTER 30
#define HEADING_Y 100
#define TEXT_Y HEADING_Y + 30
#define PREVIEW_X GUTTER
#define PREVIEW_Y TEXT_Y + 20
#define PHOTOBAR_X GUTTER + PREVIEW_PHOTO_WIDTH + 10
#define PHOTOBAR_Y 55
#define FINAL_PHOTO_X GUTTER
#define FINAL_PHOTO_Y 140
#define PHOTOBAR_PHOTO_WIDTH 300
#define PHOTOBAR_PHOTO_HEIGHT 225
#define PHOTOBAR_MARGIN 10


void drawArgs(ofTrueTypeFont font, vector<string> args) {
    string allArgs = "Args: ";
    for(string arg : args) {
        allArgs += arg;
        allArgs += "\n";
    }
    font.drawString(allArgs, GUTTER, TEXT_Y);
}

void PhotoBar::update(vector<string> paths) {
    // Load referenced images.
    switch (paths.size()) {
        case 3:
            photo3_.update(paths[2]);
            photo3_.photo.resize(PHOTOBAR_PHOTO_WIDTH,
                                 PHOTOBAR_PHOTO_HEIGHT);
        case 2:
            photo2_.update(paths[1]);
            photo2_.photo.resize(PHOTOBAR_PHOTO_WIDTH,
                                 PHOTOBAR_PHOTO_HEIGHT);
        case 1:
            photo1_.update(paths[0]);
            photo1_.photo.resize(PHOTOBAR_PHOTO_WIDTH,
                                 PHOTOBAR_PHOTO_HEIGHT);
        default:
            break;
    }
    
    // Clear unused images.
    switch (paths.size()) {
        case 0:
            photo1_.clear();
        case 1:
            photo2_.clear();
        case 2:
            photo3_.clear();
        default:
            break;
    }
}

void PhotoBar::clear() {
    photo1_.clear();
    photo2_.clear();
    photo3_.clear();
}

void PhotoBar::draw(int x, int y) {
    ofSetColor(255);
    photo1_.draw(x, y);
    photo2_.draw(x, y + PHOTOBAR_PHOTO_HEIGHT + PHOTOBAR_MARGIN);
    photo3_.draw(
        x, y + 2 * (PHOTOBAR_PHOTO_HEIGHT + PHOTOBAR_MARGIN));
}

void PreviewPhoto::update(string path) {
    if (path.size()) {
        photo_.update(path);
        photo_.photo.resize(PREVIEW_PHOTO_WIDTH,
                            PREVIEW_PHOTO_HEIGHT);
    } else {
        photo_.clear();
    }
}

void PreviewPhoto::clear() {
    photo_.clear();
}

void PreviewPhoto::draw(int x, int y) {
    ofSetColor(255);
    photo_.draw(x, y);
}

void Heading::draw() {
    ofSetColor(0);
    font_.drawString("Photobooth", GUTTER, HEADING_Y);
}

void IdleView::draw() {
    ofSetColor(0);
    defaultFont_.drawString("Press button to begin.", GUTTER, TEXT_Y);
}

void PreviewView::update(vector<string> args) {
    if (args.size() > 0) {
        previewPhoto_->update(args[0]);
    }
}

void PreviewView::draw() {
    ofSetColor(0);
    defaultFont_.drawString("Press button to start countdown.", GUTTER, TEXT_Y);
    previewPhoto_->draw(PREVIEW_X, PREVIEW_Y);
}

void PendingView::update(vector<string> args) {
    if (args.size() < 1) {
        cerr << "Expected at least 1 arg for pending view, got "
             << args.size();
    }
    
    if (args.size() > 0) {
        timeRemaining_ = args[0];
    }
    
    if (args.size() > 1) {
        previewPhoto_->update(args[1]);
    }
    
    if (args.size() > 2) {
        vector<string> paths(args.begin()+2, args.end());
        photoBar_->update(paths);
    } else {
        photoBar_->clear();
    }
}

void PendingView::draw() {
    ofSetColor(0);
    string output = "Time remaining: " + timeRemaining_;
    defaultFont_.drawString(output, GUTTER, TEXT_Y);
    photoBar_->draw(PHOTOBAR_X, PHOTOBAR_Y);
    previewPhoto_->draw(PREVIEW_X, PREVIEW_Y);
}

void ProcessingView::update(vector<string> args) {
    if (args.size() < 4) {
        cerr << "Expected at least 4 args for processing view, got "
             << args.size();
        return;
    }
    
    previewPhoto_->update(args[0]);
    vector<string> paths(args.begin()+1, args.end());
    photoBar_->update(paths);
}

void ProcessingView::draw() {
    ofSetColor(0);
    defaultFont_.drawString("Processing...", GUTTER, TEXT_Y);
    photoBar_->draw(PHOTOBAR_X, PHOTOBAR_Y);
    previewPhoto_->draw(PREVIEW_X, PREVIEW_Y);
}

void FinishedView::update(vector<string> args) {
    if (args.size() < 1) {
        cerr << "Expected at least 1 arg for finished view, got "
             << args.size();
        return;
    }
    finalPhoto_.update(args[0]);
}

void FinishedView::draw() {
    ofSetColor(0);
    defaultFont_.drawString("Finished", GUTTER, TEXT_Y);
    finalPhoto_.draw(FINAL_PHOTO_X, FINAL_PHOTO_Y);
}

void ErrorView::draw() {
    ofSetColor(0);
    defaultFont_.drawString("Error", GUTTER, TEXT_Y);
}