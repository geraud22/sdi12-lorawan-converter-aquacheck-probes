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

function decodeUplink(input) {
    return {
        data: Decode(input.fPort, input.bytes)
    };
}

function createPayloadString(dataBytes) {
    var payloadString = '';
    for (var i = 0; i < dataBytes.length; i++) {
        if (dataBytes[i] >= 0x20 && dataBytes[i] <= 0x7E) {
            payloadString += String.fromCharCode(dataBytes[i]);
        }
    }
    return payloadString
}

function createSegments(segments, decode) {
    segments.forEach((segment, index) => {
        if (index < 6) {
            decode["Moisture" + (index + 1)] = parseFloat(segment.trim());
        } else {
            decode["Temperature" + (index - 5)] = parseFloat(segment.trim());
        }
    });
    return decode;
}

function fport5(bytes) {
    var freq_band;
    var sub_band;
    var sensor;

    if (bytes[0] == 0x17)
        sensor = "SDI12-LB";

    var firm_ver = (bytes[1] & 0x0f) + '.' + (bytes[2] >> 4 & 0x0f) + '.' + (bytes[2] & 0x0f);

    if (bytes[3] == 0x01)
        freq_band = "EU868";
    else if (bytes[3] == 0x02)
        freq_band = "US915";
    else if (bytes[3] == 0x03)
        freq_band = "IN865";
    else if (bytes[3] == 0x04)
        freq_band = "AU915";
    else if (bytes[3] == 0x05)
        freq_band = "KZ865";
    else if (bytes[3] == 0x06)
        freq_band = "RU864";
    else if (bytes[3] == 0x07)
        freq_band = "AS923";
    else if (bytes[3] == 0x08)
        freq_band = "AS923_1";
    else if (bytes[3] == 0x09)
        freq_band = "AS923_2";
    else if (bytes[3] == 0x0A)
        freq_band = "AS923_3";
    else if (bytes[3] == 0x0F)
        freq_band = "AS923_4";
    else if (bytes[3] == 0x0B)
        freq_band = "CN470";
    else if (bytes[3] == 0x0C)
        freq_band = "EU433";
    else if (bytes[3] == 0x0D)
        freq_band = "KR920";
    else if (bytes[3] == 0x0E)
        freq_band = "MA869";

    if (bytes[4] == 0xff)
        sub_band = "NULL";
    else
        sub_band = bytes[4];

    var bat = (bytes[5] << 8 | bytes[6]) / 1000;

    return {
        SENSOR_MODEL: sensor,
        FIRMWARE_VERSION: firm_ver,
        FREQUENCY_BAND: freq_band,
        SUB_BAND: sub_band,
        BAT: bat,
    }
}

function fport100(bytes) {
    var decode = {};
    for (var j = 0; j < bytes.length; j++) {
        var datas = String.fromCharCode(bytes[j]);
        if (j == '0')
            decode.datas_sum = datas;
        else
            decode.datas_sum += datas;
    }

    return decode;
}

function periodicUplink(bytes) {
    var decode = {};
    var payloadString = "";

    decode.EXTI_Trigger = (bytes[0] & 0x80) ? "TRUE" : "FALSE";
    decode.BatV = ((bytes[0] << 8 | bytes[1]) & 0x7FFF) / 1000;
    decode.Payver = bytes[2];
    decode.SensorAddress = String.fromCharCode(bytes[5]);

    dataBytes = bytes.slice(7);

    payloadString = createPayloadString(dataBytes);

    var segments = payloadString.split(/(?=[\+\-])/);
    return createSegments(segments, decode);
}

function Decode(fPort, bytes) {
    if (fPort == 5) {
        return fport5(bytes);
    }
    else if (fPort == 100) {
        return fport100(bytes);
    }
    else {
        return periodicUplink(bytes);
    }
}