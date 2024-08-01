class Decoder {
	constructor(fPort, bytes, variables) {
		this.bytes = bytes;
		this.ascii_string = "";
		this.probe_data_points = [];
		this.ec_data_points = [];
		this.data_object = {};
		this.data_object.devEUI = variables.devEUI || null;
		this.frequency_band = {
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
			this.fPort5();
		}
		else if (fPort == 100) {
			this.fPort100();
		}
		else {
			this.fPortX();
		}
	}

	fPort5() {
		const firm_ver = (this.bytes[1] & 0x0f) + '.' + (this.bytes[2] >> 4 & 0x0f) + '.' + (this.bytes[2] & 0x0f);
		const byte_value = this.bytes[3];
		const freq_band = this.frequency_band[byte_value] || "Unknown";
		const bat = (this.bytes[5] << 8 | this.bytes[6]) / 1000;
		var sensor;
		if (this.bytes[0] == 0x17) sensor = "SDI12-LB";
		var sub_band;
		if (this.bytes[4] == 0xff)
			sub_band = "NULL";
		else
			sub_band = bytes[4];
		this.data_object.SENSOR_MODEL = sensor;
		this.data_object.FIRMWARE_VERSION = firm_ver;
		this.data_object.FREQUENCY_BAND = freq_band;
		this.data_object.SUB_BAND = sub_band;
		this.data_object.BAT = bat;
	}

	fPort100() {
		this.byteArray2ASCII();
		this.data_object.datasum = this.ascii_string;
	}

	fPortX() {
		this.data_object.EXTI_Trigger = (this.bytes[0] & 0x80) ? "TRUE" : "FALSE";
		this.data_object.BatV = ((this.bytes[0] << 8 | this.bytes[1]) & 0x7FFF) / 1000;
		switch (this.bytes[4]) {
			case '0x00':
				this.byteArray2ASCII()
				this.ascii_string = this.ascii_string.slice(0, -1)
				this.probe_data_points = this.ascii_string.split(/(?=[\+\-])/);
				this.appendMoistureProbeData("Probe_Moisture", 110)
				break;
			case '0x01':
				this.byteArray2ASCII()
				this.probe_data_points = this.ascii_string.split(/(?=[\+\-])/);
				this.appendMoistureProbeData("Probe_Temperature", 70)
				break;
			case '0x02':
				this.byteArray2ASCII()
				this.ec_data_points = this.ascii_string.split(/(?=[\+\-])/);
				this.appendECProbeData();
				break;
			default:
				this.data_object['Decoder Error'] = "Could not find this uplink's sequence number from byte 5."

		}
	}

	byteArray2ASCII() {
		for (var i = 7; i < this.bytes.length; i++) {
			if (this.bytes[i] >= 0x20 && this.bytes[i] <= 0x7E) {
				this.ascii_string += String.fromCharCode(this.bytes[i]);
			}
		}
		this.ascii_string = this.ascii_string.replace(/[^\x20-\x7E]/g, '');
		this.ascii_string.trim();
	}

	appendMoistureProbeData(prefix, absurdValueGuard) {
		this.probe_data_points.forEach((dataPoint, index) => {
			let value = parseFloat(dataPoint.trim())
			if (value < absurdValueGuard)
				this.data_object[prefix + (index + 1)] = value;
		});
	}

	appendECProbeData() {
		this.ec_data_points.forEach((dataPoint, index) => {
			let value = parseFloat(dataPoint.trim())
			if (index < 2) {
				if (value < 5.0)
					this.data_object["EC_Level" + (index + 1)] = value;
			} else if (index >= 2 && index < 4) {
				if (value < 60.0)
					this.data_object["EC_Temperature" + (index - 1)] = value;
			}
		});
	}
}

function decodeUplink(input) {
	const decoder = new Decoder(input.fPort, input.bytes, input.variables)
	return {
		data: decoder.data_object
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
