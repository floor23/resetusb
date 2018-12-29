# resetusb

reset usb connection with system commands

## Theory

Usb reset with [libusb](https://libusb.info/). The specified api is [libusb_reset_device](http://libusb.sourceforge.net/api-1.0/group__libusb__dev.html#gafee9c4638f1713ca5faa867948878111)

- The c program shows how to call libusb functions to reset specify usb device.
- The nodejs program shows how we use Docker adb [sorccu/adb](https://github.com/sorccu/docker-adb)  or **ADB** to find the offline devices and reset the connection with commnads via libusb

## Usage

1. Build c program and generate a runnable command
- gcc usbreset.c -o usbreset -lusb-1.0
- chmod +x usbreset
2. Install nodejs
- curl -sL https://deb.nodesource.com/setup_10.x | sudo bash -
- sudo apt install nodejs
- sudo npm install log4js --save
3. Check every minutes and reconnect devices which are offline.In my case, I use Ubuntu crontab to do this.
- vi /etc/rsyslog.d/50-default.conf
>  uncomment cron.* with delete the '#' before it
- sudo  service rsyslog  restart
- sudo crontab -e
> Add this line at the end of the file ```* * * * * node /etc/docker/reset_usb.js``` Means check every minutes.
  
