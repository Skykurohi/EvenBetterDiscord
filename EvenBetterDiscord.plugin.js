//META{"name":"EvenBetterDiscord"}*//

let request = require('request');
let fs = require('fs');

let mEBD = {};

mEBD.targetAPI = "https://api.github.com/repos/DeathStrikeV/BetterDiscordApp/commits/master";
mEBD.targetURL = "https://raw.githubusercontent.com/DeathStrikeV/BetterDiscordApp/master/data/emotedata_ffz.json";

mEBD.bdPath = (process.platform == "win32" ?
	process.env.APPDATA : process.platform == "darwin" ?
	process.env.HOME + "/Library/Preferences/" : "/var/local/") + "/BetterDiscord/";

mEBD.preferencesFile = mEBD.bdPath + "/EBD_Preferences.json";
mEBD.emotesFile = mEBD.bdPath + "/EBD_Emotes.json";
mEBD.defaultEmotesFile = mEBD.bdPath + "/emotes_ffz.json";

let EvenBetterDiscord = function () { };

EvenBetterDiscord.prototype.start = function ()
{
    this.loadEBDFiles();
};

EvenBetterDiscord.prototype.loadEBDFiles = function ()
{
    fs.readFile(mEBD.preferencesFile, "utf8", (err, data) =>
    {
        if (data)
            mEBD.currentHash = JSON.parse(data).currentHash;
        else
            mEBD.currentHash = "";

        request({ url: mEBD.targetAPI, headers: { "User-Agent": "DeathStrikeV" } }, (error, response, body) =>
        {
            if (response.statusCode !== 200)
            {
                this.loadEmotes(mEBD.emotesFile);
                return;
            }

            mEBD.latestHash = JSON.parse(body).sha;

            if (mEBD.currentHash === mEBD.latestHash)
            {
                this.loadEmotes(mEBD.emotesFile);
                return;
            }

            request(mEBD.targetURL, (error, response, body) =>
            {
                if (response.statusCode !== 200)
                {
                    this.loadEmotes(mEBD.emotesFile);
                    return;
                }

                fs.writeFile(mEBD.emotesFile, body, (err) =>
                {
                    //console.log("Retreived new emotes file!");

                    if (!err)
                        fs.writeFile(mEBD.preferencesFile, JSON.stringify({ currentHash: mEBD.latestHash }), null);

                    this.loadEmotes(mEBD.emotesFile);
                });
            });
        });
    });
};

EvenBetterDiscord.prototype.loadEmotes = function (targetFile)
{
    fs.readFile(targetFile, "utf8", (err, data) =>
    {
        if (data)
        {
            let emoteData = JSON.parse(data);

            if (!emoteData)
            {
                //console.log("Failed to parse emotes file!");
                return;
            }

            window.emotesFfz = emoteData;
            //console.log("Loaded emotes file!");
        }
    });
};

EvenBetterDiscord.prototype.stop = function ()
{
    this.removeEBDFiles();
    this.loadEmotes(mEBD.defaultEmotesFile);
};

EvenBetterDiscord.prototype.removeEBDFiles = function ()
{
    fs.stat(mEBD.preferencesFile, (err, stats) =>
    {
        if (err)
            return;

        fs.unlink(mEBD.preferencesFile, (err) => { });
    });

    fs.stat(mEBD.emotesFile, (err, stats) =>
    {
        if (err)
            return;

        fs.unlink(mEBD.emotesFile, (err) => { });
    });
};

EvenBetterDiscord.prototype.load = function () { };
EvenBetterDiscord.prototype.unload = function () { };
EvenBetterDiscord.prototype.onMessage = function () { };
EvenBetterDiscord.prototype.onSwitch = function () { };

EvenBetterDiscord.prototype.getName = function ()
{
    return "EvenBetterDiscord";
};

EvenBetterDiscord.prototype.getDescription = function ()
{
    return "Loads FFZ emotes from alternate repository";
};

EvenBetterDiscord.prototype.getVersion = function ()
{
    return "1.0.0";
};

EvenBetterDiscord.prototype.getAuthor = function ()
{
    return "DeathStrikeV";
};