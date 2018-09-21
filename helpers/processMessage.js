const DIALOGFLOW_PROJECTID = process.env.DIALOGFLOW_PROJECTID;
const DIALOGFLOW_SESSIONID = process.env.DIALOGFLOW_SESSIONID;
const FACEBOOK_TOKEN = process.env.FACEBOOK_TOKEN;

const request = require('request');
const dialogflow = require('dialogflow');
const sessionClient = new dialogflow.SessionsClient();

const sendTextMessage = (senderId, payload) => {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: FACEBOOK_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: senderId },
            message: payload,
        }
    }, function(error, response, body) {
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print the HTML for the Google homepage.
    });
};
console.log(process.env);
const sessionPath = sessionClient.sessionPath(DIALOGFLOW_PROJECTID, DIALOGFLOW_SESSIONID);

module.exports = (event) => {
    const messageText = event.message.text;
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: messageText,
                languageCode: 'en-US',
            },
        },
    };

    sessionClient.detectIntent(request).then(responses => {
        const result = responses[0].queryResult;
        let returnedValue = {text: result.fulfillmentText};
        if (result.fulfillmentMessages.some(entry => entry.message === 'payload')) {
            // returnedValue = result.fulfillmentMessages.find(entry => entry.message === 'payload').payload.fields;
            returnedValue = {
                text: "Guess which one !",
                quick_replies: [
                    {
                        content_type: "text",
                        title: "Red",
                        payload: "<DEVELOPER_DEFINED_PAYLOAD>",
                        image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Disc_Plain_red.svg/2000px-Disc_Plain_red.svg.png"
                    },
                    {
                        content_type: "text",
                        title: "Blue",
                        payload: "<DEVELOPER_DEFINED_PAYLOAD>",
                        image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Location_dot_blue.svg/1024px-Location_dot_blue.svg.png"
                    }
                ]
            }
        }
        sendTextMessage(event.sender.id, returnedValue);
    }).catch(error => {
        console.log(error)
    });
};