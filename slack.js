//THIS IS THE REMENANT OF A FUN PROJECT THAT SENT SURF REPORTS TO SLACK THROUGH A SLACKBOT, NOT IN USE ANYMORE

const config = require('./config/defaults.json')
const CronJob = require('cron').CronJob
const axios = require('axios')

function createSurfReport(channel) {
    axios({
        method: 'get',
        url: `http://magicseaweed.com/api/${config.apiSurfKey}/forecast/?spot_id=272`,
        responseType: 'json'
    }).then(surf => {
        surf = surf.data
        let message = `Here is your hourly surf report for Rincon Point:`
        message += `
        The primary swell is ${surf[0].swell.components.primary.height} foot from ${surf[0].swell.components.primary.compassDirection} maxing out at ${surf[0].swell.maxBreakingHeight} foot.`
        if (surf[0].wind.speed == surf[0].wind.gusts) {
            message += `
        The wind is ${surf[0].wind.speed} miles per hour ${surf[0].wind.compassDirection}.`
        } else {
            message += `
        The wind is ${surf[0].wind.speed} miles per hour ${surf[0].wind.compassDirection} with ${surf[0].wind.gusts} mile per hour gusts.`
        }
        message += `
        Here's a chart: ${surf[0].charts.swell}`
        sendMessage(channel, message)
    }).catch(error => { console.log(error); })
}

function sendMessage(channel, message) {
    const data = {
        channel,
        text: message,
    }
    axios({
        method: 'post',
        url: 'https://slack.com/api/chat.postMessage',
        contentType: 'application/json',
        headers: {
            'Content-type': 'application/json; charset=utf-8',
            Authorization: `Bearer ${config.slackAuth}`
        },
        data,
    }).then(res => {
        if (res.data && res.data.ok) {
            console.log('slackMessage sent')
        } else {
            console.log('error sending slackMessage', res.data)
        }
    })
}

let job = new CronJob('* * * * *', function () {
    createSurfReport(config.mainSlackChannel)
})

module.exports = {
    job,
}