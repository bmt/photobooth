//
//  positions.h
//  pbInterface
//
//  Created by Brian Turnbull on 9/25/15.
//
//

#ifndef positions_h
#define positions_h

#define PLACEHOLDER_GRAY 200
#define GUTTER 30
#define HEADING_Y 20
#define HEADING_FONT_SIZE 80
#define HEADING_LINE_HEIGHT 80

#define PREVIEW_PHOTO_WIDTH 840
#define PREVIEW_PHOTO_HEIGHT 560
#define PREVIEW_X (ofGetWidth()/2 - PREVIEW_PHOTO_WIDTH/2)
#define PREVIEW_Y HEADING_Y + HEADING_FONT_SIZE + 40
#define PREVIEW_CENTER_X ofGetWidth()/2
#define PREVIEW_CENTER_Y (PREVIEW_PHOTO_HEIGHT/2 + PREVIEW_Y)

#define LOADING_R 50
#define LOADING_X PREVIEW_CENTER_X
#define LOADING_Y PREVIEW_CENTER_Y

#define COUNTDOWN_FONT_SIZE 80
#define COUNTDOWN_X PREVIEW_CENTER_X
#define COUNTDOWN_Y PREVIEW_CENTER_Y - COUNTDOWN_FONT_SIZE

#define TEXT_FONT_SIZE 16
#define TEXT_X PREVIEW_X
#define TEXT_Y PREVIEW_Y + PREVIEW_PHOTO_HEIGHT

#define PHOTOBAR_X 25
#define PHOTOBAR_Y TEXT_Y + TEXT_FONT_SIZE*2 + 20
#define PHOTOBAR_PHOTO_WIDTH 300
#define PHOTOBAR_PHOTO_HEIGHT 225
#define PHOTOBAR_MARGIN 10

#define FINAL_PHOTO_X GUTTER
#define FINAL_PHOTO_Y 140
#define FINAL_PHOTO_WIDTH 1200

#define SHARE_URL_X GUTTER
#define SHARE_URL_Y FINAL_PHOTO_Y + 500
#define SHARE_TEXT_X GUTTER
#define SHARE_TEXT_Y SHARE_URL_Y + 45

#define FOOTER_TEXT_Y ofGetHeight() - TEXT_FONT_SIZE*2

#endif /* positions_h */
