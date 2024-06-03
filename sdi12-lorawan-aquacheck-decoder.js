function decodeUplink(input) {
    return {
        data: Decode(input.fPort, input.bytes)
    };
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
    var buffer = ""; // Initialize a buffer to accumulate characters
    var commandIndex = 1; // Initialize a counter for command groups

    decode.EXTI_Trigger = (bytes[0] & 0x80) ? "TRUE" : "FALSE";
    decode.BatV = ((bytes[0] << 8 | bytes[1]) & 0x7FFF) / 1000;
    decode.Payver = bytes[2];
    decode.SensorAddress = String.fromCharCode(bytes[3]);
    for (var i = 4; i < bytes.length; i++) {
        if (bytes[i] >= 0xF0) {
            i = i + 1;
        }

        if (((bytes[i] == 0x0D) || (bytes[i] == 0x0A)) || (bytes[i] >= 0x20 && bytes[i] <= 0x7E)) {
            var current_character = String.fromCharCode(bytes[i]);
            if (current_character === ' ') {
                if (buffer !== "") {
                    decode["D" + commandIndex] = buffer.slice(1); // Remove the leading '+' and set the data
                    commandIndex++;
                }
                buffer = ""; // Reset the buffer for the next data point
            } else {
                buffer += current_character; // Accumulate characters into the buffer
            }
        }
    }
    // Store the last data group if the buffer is not empty
    if (buffer !== "") {
        decode["D" + commandIndex] = buffer.slice(1);
    }
    return decode;
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