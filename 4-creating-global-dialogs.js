/*
This code sample demonstrates a more complex dialog. It uses session.userData and session.dialogData to store 
conversation state and uses beginDialog and endDialogWithResult to manipulate the conversation stack. Step 
through the code and take a look at how the session.sessionState.callstack object changes as we begin and 
end dialogs.
*/
var restify = require('restify');
var builder = require('botbuilder');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//Root dialog
bot.dialog('/', [
    (session) => {
        builder.Prompts.text(
            session,
            'What is your name?',
            { retryPrompt: 'Please enter your name...'}
        );
    },
    (session, results) => {
        session.endConversation(`Welcome, ${results.response}`);
    }
]);

bot.dialog('help', [
    (session) => {
        session.endDialog('I am a simple bot...');
    }
]).triggerAction({
    matches: /^help$/i,
    onSelectAction: (session, args) => {
        // Execute just before dialog launches
        // Change the default behaviour
        // The default behaviour is to REPLACE the dialog stack
        session.beginDialog(args.action, args);
    }
})