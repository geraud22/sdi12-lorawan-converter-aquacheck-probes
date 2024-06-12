class Decoder {
    constructor(fPort, bytes, variables) {
        this.bytes = bytes;
        this.sensorDataBytes = [];
        this.sensorDataPoints = [];
        this.dataObject = {};
        if (variables.itid) this.dataObject.itid = parseInt(variables.itid);
        this.frequencyBand = {
            0x01: "EU868",
            0x02: "US915",
            0x03: "IN865",
            0x04: "AU915",
            0x05: "KZ865",
            0x06: "RU864",
            0x07: "AS923",
            0x08: "AS923_1",
            0x09: "AS923_2",
            0x0A: "AS923_3",
            0x0F: "AS923_4",
            0x0B: "CN470",
            0x0C: "EU433",
            0x0D: "KR920",
            0x0E: "MA869"
        };
        if (fPort == 5) {
            this.fPort5_object();
        }
        else if (fPort == 100) {
            this.fPort100_object();
        }
        else {
            this.fPortX_object();
        }
    }

    fPort5_object() {
        const firm_ver = (this.bytes[1] & 0x0f) + '.' + (this.bytes[2] >> 4 & 0x0f) + '.' + (this.bytes[2] & 0x0f);
        const byteValue = this.bytes[3];
        const freq_band = this.frequencyBand[byteValue] || "Unknown";
        const bat = (this.bytes[5] << 8 | this.bytes[6]) / 1000;
        var sensor;
        if (this.bytes[0] == 0x17) sensor = "SDI12-LB";
        var sub_band;
        if (this.bytes[4] == 0xff)
            sub_band = "NULL";
        else
            sub_band = bytes[4];
        this.dataObject.SENSOR_MODEL = sensor;
        this.dataObject.FIRMWARE_VERSION = firm_ver;
        this.dataObject.FREQUENCY_BAND = freq_band;
        this.dataObject.SUB_BAND = sub_band;
        this.dataObject.BAT = bat;
    }

    fPort100_object() {
        for (var i = 0; i < this.bytes.length; i++) {
            var datas = String.fromCharCode(this.bytes[i]);
            if (i == '0')
                this.dataObject.datasum = datas;
            else
                this.dataObject.datasum += datas;
        }
    }

    fPortX_object() {
        this.dataObject.EXTI_Trigger = (this.bytes[0] & 0x80) ? "TRUE" : "FALSE";
        this.dataObject.BatV = ((this.bytes[0] << 8 | this.bytes[1]) & 0x7FFF) / 1000;
        this.dataObject.Payver = this.bytes[2];
        this.dataObject.SensorAddress = String.fromCharCode(this.bytes[5]);
        this.sensorDataBytes = this.bytes.slice(7);
        this.generate_sensor_data_points();
        this.append_moisture_and_temperature_data();
    }

    generate_sensor_data_points() {
        let sensorDataString = "";
        for (var i = 0; i < this.sensorDataBytes.length; i++) {
            if (this.sensorDataBytes[i] >= 0x20 && this.sensorDataBytes[i] <= 0x7E) {
                sensorDataString += String.fromCharCode(this.sensorDataBytes[i]);
            }
        }
        this.sensorDataPoints = sensorDataString.split(/(?=[\+\-])/);
    }

    append_moisture_and_temperature_data() {
        this.sensorDataPoints.forEach((dataPoint, index) => {
            if (index < 6) {
                this.dataObject["Probe_Moisture" + (index + 1)] = parseFloat(dataPoint.trim());
            } else {
                this.dataObject["Probe_Temperature" + (index - 5)] = parseFloat(dataPoint.trim());
            }
        });
    }
}

function decodeUplink(input) {
    const decoder = new Decoder(input.fPort, input.bytes, input.variables)
    return {
        data: decoder.dataObject
    };
}

function encodeDownlink(input) {
    const hexString = input.data;
    const byteLength = hexString.length / 2;
    const bytes = new Uint8Array(byteLength);
    for (let i = 0; i < byteLength; i++) {
        const hexPair = hexString.substr(i * 2, 2);
        bytes[i] = parseInt(hexPair, 16);
    }
    return {
        bytes: bytes
    };
}