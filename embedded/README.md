# Embedded Service
This is intended to run on a raspberry pi and interface with the Canon camera, a
monitor for UI, and a button to take the photos.

## Set up host (Only works on Mac right now)
### Install XCode
If you don't already have xcode installed, it is available in the [App Store](http://itunes.apple.com/us/app/xcode/id497799835?mt=12).

### Install Gphoto (required to take new photos)
#### Install macports
Install from [MacPorts Project Homepage](http://www.macports.org/install.php)
Update your enviroment:
`sudo port -v selfupdate`

#### Install gphoto2
`sudo port install gphoto2`

Every time you plug in the camera, you have to kill the system app that takes
over the camera.
`killall PTPCamera`

To avoid this, you can instead use mejedi/mac-gphoto-enabler to patch your
device discovery database (reversibly).
`git clone https://github.com/mejedi/mac-gphoto-enabler`
`cd mac-gphoto-enabler`
`./gphoto-enable.sh`

## Running the embedded software (and interface)
### Build the interface.
Follow the instructions in interface/README.md to build the interface.

### Set up Node environment.
`npm install`

### Set up environment
This downloads the private repo with credentials and certs.
`./setup.sh`

### Run the server
`./start.sh`

You can emulate button presses by running the shell scripts in tools:
`./tools/activate`
`./tools/reset`

