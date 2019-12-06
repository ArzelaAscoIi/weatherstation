let Component = require('component_js')
let fs = require('fs')

let Client = require('ssh2-sftp-client');
let sftp = new Client();

weatherStation = new Component();

let timestampRoof, timestampGround



(async function () {
    await weatherStation.init(async (input, params) => {
        return input.data
    })
})();


let timer = setInterval(checkWeather, 60000) //60000

async function checkWeather() {

    let result
    let result2

    await sftp.connect({
        host: '137.226.155.2',
        username: 'USERNAME',   //insert username
        password: 'PASSWORD'    //insert password
    })
    result = (await sftp.get('/online/messwiese_hoern_Public.dat')).toString()
    result = result.split('\r\n').splice(2, 3)
    result.splice(1, 1)
    result[1] = result[1].concat("]")
    result[1] = "[".concat(result[1])
    let labels = ['timestamp', 'recordnumber', 'batteryVoltage', 'airTemperature', 'humidity',
        '5cmTemperature', '10cmTemperature', '20cmTemperature', '50cmTemperature',
        '100cmTemperature', 'rainDropCount_2', 'rainDropCount_kip', 'evapoTranspiration']
    let data = JSON.parse(result[1])
    let ground = {};
    for (var i = 0; i < labels.length; i++) {
        ground[labels[i]] = data[i];
    }
    ground['timestamp'] = (new Date(ground['timestamp'])).toUTCString()

    result2 = (await sftp.get('/online/dach_hoern_aktuell-pub.dat')).toString()
    result2 = result2.split('\r\n').splice(2, 3)
    result2.splice(1, 1)
    result2[1] = result2[1].concat("]")
    result2[1] = "[".concat(result2[1])
    let labels2 = ['timestamp', 'recordnumber', 'batteryVoltage', 'atmosphericPressure', 'windSpeed', 'windDirection', 'globalRadiation', 'diffuseRadiation']
    let data2 = JSON.parse(result2[1])
    roof = {}
    for (var i = 0; i < labels2.length; i++) {
        roof[labels2[i]] = data2[i];
    }
    roof['timestamp'] = (new Date(roof['timestamp'])).toUTCString()

    let weatherData = {
        roof : roof,
        ground : ground
    }

    if(weatherData.roof.timestamp !== timestampRoof && weatherData.ground.timestamp !== timestampGround){
        await weatherStation.run(weatherData)
        timestampRoof = weatherData.roof.timestamp
        timestampGround = weatherData.ground.timestamp
    }else{
        timestampRoof = weatherData.roof.timestamp
        timestampGround = weatherData.ground.timestamp
    }
    //sample data in case the server is down
   /* 
    await weatherStation.run({
        "roof": {
            "timestamp": "Wed, 18 Sep 2019 14:07:00 GMT",
            "recordnumber": 6131789,
            "batteryVoltage": 11.66339,
            "atmosphericPressure": 999.5111,
            "windSpeed": 2.7244,
            "windDirection": 348.6758,
            "globalRadiation": 230.105,
            "diffuseRadiation": 183.2573
        },
        "ground": {
            "timestamp": "Wed, 18 Sep 2019 14:05:45 GMT",
            "recordnumber": 3285972,
            "batteryVoltage": 12.15772,
            "airTemperature": 15.759,
            "humidity": 57.749,
            "5cmTemperature": 17.68671,
            "10cmTemperature": 16.48578,
            "20cmTemperature": 15.77545,
            "50cmTemperature": 16.9053,
            "100cmTemperature": 16.98294,
            "rainDropCount_2": 0,
            "rainDropCount_kip": 0,
            "evapoTranspiration": -40.54488
        }
    })
    */
}