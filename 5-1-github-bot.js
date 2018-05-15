var builder = require('botbuilder');
var restify = require('restify');
var githubClient = require('./5-github-client.js');

var connector = new builder.ChatConnector();
var bot = new builder.UniversalBot(connector);

var dialog = new builder.IntentDialog();
dialog.matches(/^search/i, [
    function (session, args, next) {
        if (session.message.text.toLowerCase() == 'search') {
            // TODO: Prompt user for text
            builder.Prompts.text(session, `Who did you want to search for?`);
        } else {
            // else the user typed in: search <<name>>
            var query = session.message.text.substring(7);
            next({ response: query });
        }
    },
    function (session, results, next) {
        var query = results.response;
        if (!query) {
            session.endDialog('Request cancelled');
        } else {
            githubClient.executeSearch(query, function (profiles) {
                var totalCount = profiles.total_count;
                if (totalCount == 0) {
                    session.endDialog('Sorry, no results found.');
                } else if (totalCount > 10) {
                    session.endDialog('More than 10 results were found. Please provide a more restrictive query.');
                } else {
                    var usernames = profiles.items.map((item) => { return item.login });
                    
                    // TODO: Prompt user with list
                    builder.Prompts.choice(
                        session,
                        `Please choose the user`,
                        usernames,
                        { listStyle: builder.ListStyle.button }
                    )
                }
            });
        }
    }, function(session, results, next) {
        // TODO: Display final request
        // When you're using choice, the value is inside of results.response.entity
        session.endConversation(`You choose ${results.response.entity}`);
    }
]);

bot.dialog('/', dialog);

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
server.post('/api/messages', connector.listen());