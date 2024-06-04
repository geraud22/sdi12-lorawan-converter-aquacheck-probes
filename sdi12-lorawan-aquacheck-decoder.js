class Decoder {
    constructor(fPort, bytes) {
        this.fPort = fPort;
        this.bytes = bytes;
        this.sensorDataBytes;
        this.sensorDataPoints;
        this.dataObject;
        this.create_decoded_object();
    }

    _sensor_data_points() {
        let sensorDataString;
        for (var i = 0; i < this.dataBytes.length; i++) {
            if (this.dataBytes[i] >= 0x20 && this.dataBytes[i] <= 0x7E) {
                sensorDataString += String.fromCharCode(this.dataBytes[i]);
            }
        }
        this.sensorDataPoints = sensorDataString.split(/(?=[\+\-])/);
    }

    _append_moisture_and_temperature() {
        this.segments.forEach((segment, index) => {
            if (index < 6) {
                this.dataObject["Moisture" + (index + 1)] = parseFloat(segment.trim());
            } else {
                this.dataObject["Temperature" + (index - 5)] = parseFloat(segment.trim());
            }
        });
    }

    fport5_object() {
        var freq_band;
        var sub_band;
        var sensor;

        if (this.bytes[0] == 0x17) sensor = "SDI12-LB";

        var firm_ver = (this.bytes[1] & 0x0f) + '.' + (this.bytes[2] >> 4 & 0x0f) + '.' + (this.bytes[2] & 0x0f);

        if (this.bytes[3] == 0x01)
            freq_band = "EU868";
        else if (this.bytes[3] == 0x02)
            freq_band = "US915";
        else if (this.bytes[3] == 0x03)
            freq_band = "IN865";
        else if (this.bytes[3] == 0x04)
            freq_band = "AU915";
        else if (this.bytes[3] == 0x05)
            freq_band = "KZ865";
        else if (this.bytes[3] == 0x06)
            freq_band = "RU864";
        else if (this.bytes[3] == 0x07)
            freq_band = "AS923";
        else if (this.bytes[3] == 0x08)
            freq_band = "AS923_1";
        else if (this.bytes[3] == 0x09)
            freq_band = "AS923_2";
        else if (this.bytes[3] == 0x0A)
            freq_band = "AS923_3";
        else if (this.bytes[3] == 0x0F)
            freq_band = "AS923_4";
        else if (this.bytes[3] == 0x0B)
            freq_band = "CN470";
        else if (this.bytes[3] == 0x0C)
            freq_band = "EU433";
        else if (this.bytes[3] == 0x0D)
            freq_band = "KR920";
        else if (this.bytes[3] == 0x0E)
            freq_band = "MA869";

        if (this.bytes[4] == 0xff)
            sub_band = "NULL";
        else
            sub_band = bytes[4];

        var bat = (this.bytes[5] << 8 | this.bytes[6]) / 1000;

        this.dataObject.SENSOR_MODEL = sensor;
        this.dataObject.FIRMWARE_VERSION = firm_ver;
        this.dataObject.FREQUENCY_BAND = freq_band;
        this.dataObject.SUB_BAND = sub_band;
        this.dataObject.BAT = bat;
    }

    fport100_object() {
        for (var i = 0; j < this.bytes.length; i++) {
            var datas = String.fromCharCode(this.bytes[i]);
            if (i == '0')
                this.dataObject.datasum = datas;
            else
                this.dataObject.datasum += datas;
        }
    }

    fportX_object() {
        this.dataObject.EXTI_Trigger = (this.bytes[0] & 0x80) ? "TRUE" : "FALSE";
        this.dataObject.BatV = ((this.bytes[0] << 8 | this.bytes[1]) & 0x7FFF) / 1000;
        this.dataObject.Payver = this.bytes[2];
        this.dataObject.SensorAddress = String.fromCharCode(this.bytes[5]);
        this.sensorDataBytes = this.bytes.slice(7);
        this.sensorDataPoints = _sensor_data_points();
        this._append_moisture_and_temperature();
    }

    create_decoded_object() {
        if (this.fPort == 5) {
            fport5_object();
        }
        else if (this.fPort == 100) {
            fport100_object();
        }
        else {
            fportX_object();
        }
    }
}

function decodeUplink(input) {
    const decoder = Decoder(input.fport, input.bytes)
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