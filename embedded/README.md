= Embedded Service
This is intended to run on a raspberry pi and interface with the Canon camera, a
monitor for UI, and a button to take the photos.

== Set up host
=== Pi
`sudo apt-get install gphoto2`

=== Mac
Install macports (requires xcode). Then install gphoto2 with:
`sudo port install gphoto2`

Then setup the node environment.
npm install

Every time you plug in the camera, you have to kill the system app that takes
over the camera.
`killall PTPCamera`
