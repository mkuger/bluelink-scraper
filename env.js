/** InfluxDB v2 URL */
const url = process.env['INFLUX_URL'] || 'http://localhost'
/** InfluxDB authorization token */
const token = process.env['INFLUX_TOKEN'] || 'TOKEN'
/** Organization within InfluxDB  */
const org = process.env['INFLUX_ORG'] || 'BUCKET'
/**InfluxDB bucket used in examples  */
const bucket = process.env['INFLUX_BUCKET'] || 'dev_null'

const bluelinkUser = process.env['BLUELINK_USER'] || 'foo'
const bluelinkPW = process.env['BLUELINK_PW'] || 'bar'
const bluelinkRegion = process.env['BLUELINK_REGION'] || 'EU'
const bluelinkPIN = process.env['BLUELINK_PIN'] || '0711'

module.exports = {
  url,
  token,
  org,
  bucket,
  bluelinkUser,
  bluelinkPW,
  bluelinkRegion,
  bluelinkPIN
}