const execFile = require('child_process').execFile;
const {
    spawn
} = require('child_process');
const log4js = require('log4js')
log4js.configure({
    appenders: {
        file: {
            type: 'file',
            filename: '/var/log/usbreset.log',
            layout: {
                type: 'pattern',
                pattern: '%r %p - %m',
            }
        }
    },
    categories: {
        default: {
            appenders: ['file'],
            level: 'debug'
        }
    }
})

const logger = log4js.getLogger()

//if install adb with docker images like sorccu/adb
execFile('docker', ['run', '--rm', '--net', 'container:adbd', 'sorccu/adb', 'adb', 'devices'], (err, stdout, stderr) => {
//if install adb on linux server
//execFile('adb', ['devices'], (err, stdout, stderr) => {
    if (stdout) {
        var offlineDevices = []
        lines = stdout.split('\n')
        lines.forEach(function (line) {
            if (line.includes('offline')) {
                values = line.split('\t')
                offlineDevices.push(values[0])
            }

        });
        offlineDevices.forEach(function (device) {
            logger.info('reset usb for device: ' + device)

            const ps = spawn('lsusb', ['-v']);
            const grep = spawn('grep', ['-B', '14', device]);

            ps.stdout.on('data', (data) => {
                grep.stdin.write(data);
            });

            ps.stderr.on('data', (data) => {
                logger.info(`ps stderr: ${data}`);
            });

            ps.on('close', (code) => {
                if (code !== 0) {
                    logger.info(`ps process exited with code ${code}`);
                }
                grep.stdin.end();
            });

            grep.stdout.on('data', (data) => {
                if (data) {
                    var busDevice = (data.toString().split('\n'))[0]
                    logger.info('busDevice: ' + busDevice)
                    str = busDevice.split(':')[0]
                    logger.info('str: ' + str)
                    if (str) {
                        terms = str.split(' ')
                        logger.info('term1: ' + terms[1] + '   ' + terms[3])
                        const usbreset = spawn('/etc/docker/usbreset', [terms[1], terms[3]]);
                        usbreset.stdout.on('data', (data) => {
                            logger.info(data.toString())
                        });

                        usbreset.stderr.on('data', (data) => {
                            logger.info(`usbreset stderr: ${data}`);
                        });

                        usbreset.on('close', (code) => {
                            if (code !== 0) {
                                logger.info(`usbreset process exited with code ${code}`);
                            }
                        });
                    }
                }
            });

            grep.stderr.on('data', (data) => {
                logger.info(`grep stderr: ${data}`);
            });

            grep.on('close', (code) => {
                if (code !== 0) {
                    logger.info(`grep process exited with code ${code}`);
                }
            });
        })
    } else {
        if (err) {
            logger.error('err: ' + err)
        }
        if (stderr) {
            logger.error('stderr: ' + stderr)
        }
        
        logger.info('no offline devices')
    }
});
