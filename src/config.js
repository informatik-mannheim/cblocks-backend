exports.mqtt = {
    "url": "mqtt://mqtt:1883"
}

exports.mongo = {
    "url": "mongodb://mongo:27017",
    "db": "cblocks"
},

exports.hapi = {
    "port": 3000,
    "host": "0.0.0.0",
    "routes": {
        "cors": {
            "origin": ["*"]
        }
    }
}

exports.messaging =  {
    "timeoutMs": 2000
}

exports.ifttt = {
    "enabled": (process.env.NODE_ENV === 'production'),
    "service-key": (process.env.NODE_ENV !== 'test') ? "4Crt0huozALk7UOl-D5V6gEajUfN6twav9m2i8NGJ5x6i1Gy2fSHm8R_cpMEab-M": "test"
}