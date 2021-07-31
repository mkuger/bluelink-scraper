#!/usr/bin/env node

console.log("Starting...")

const { InfluxDB, Point, HttpError } = require('@influxdata/influxdb-client')
const { url, token, org, bucket, bluelinkUser, bluelinkPW, bluelinkRegion, bluelinkPIN } = require('./env')
const { hostname } = require('os')

const BlueLinky = require('bluelinky');

const client = new BlueLinky({
    username: bluelinkUser.trim(),
    password: bluelinkPW.trim(),
    region: bluelinkRegion.trim(),
    brand: 'hyundai',
    pin: bluelinkPIN.trim()
});

client.on('ready', async () => {
    try {
        const vehicles = await client.getVehicles();
        console.log(vehicles);
        for (let v of vehicles) {
            let status = v.status();
            let odometer = v.odometer();

            status = await status;
            odometer = await odometer;

            let vin = v.vehicleConfig.vin;

            // console.log(vin + ": ", status);
            // console.log(vin + ": ", status.evStatus);
            // console.log(vin + ": ", status.evStatus.drvDistance);
            // console.log(vin + ": ", status.evStatus.drvDistance[0].rangeByFuel);

            let range = status.evStatus.drvDistance[0].rangeByFuel.totalAvailableRange.value;
            odometer = odometer.value;
            let batteryStatus = status.evStatus.batteryStatus;

            console.log("Result:", range, odometer, batteryStatus)

            // create a write API, expecting point timestamps in nanoseconds (can be also 's', 'ms', 'us')
            const writeApi = new InfluxDB({ url, token }).getWriteApi(org, bucket, 's')
            // setup default tags for all writes through this API
            writeApi.useDefaultTags({ vehicle: vin })

            // write point with the current (client-side) timestamp
            const pointRemainingRange = new Point('battery')
                .intField('available-range', range)

            const pointOdometer = new Point('odometer')
                .intField('odometer', odometer)

            const pointBatteryStatus = new Point('battery')
                .intField('battery-status', batteryStatus)

            writeApi.writePoint(pointRemainingRange);
            writeApi.writePoint(pointOdometer);
            writeApi.writePoint(pointBatteryStatus);

            // WriteApi always buffer data into batches to optimize data transfer to InfluxDB server and retries
            // writing upon server/network failure. writeApi.flush() can be called to flush the buffered data,
            // close() also flushes the remaining buffered data and then cancels pending retries.
            writeApi
                .close()
                .then(() => {
                    console.log('FINISHED')
                })
                .catch(e => {
                    console.error(e)
                    if (e instanceof HttpError && e.statusCode === 401) {
                        console.log('Run ./onboarding.js to setup a new InfluxDB database.')
                    }
                    console.log('\nFinished ERROR')
                })
        }
    } catch (err) {
        // log the error from the command invocation 
        console.error("Error!", err)
    }
});

client.on('error', async (err) => {
    // something went wrong with login
    console.error("Login failed", err)
});