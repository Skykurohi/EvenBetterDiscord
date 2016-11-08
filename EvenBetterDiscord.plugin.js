//META{"name":"EvenBetterDiscord"}*//

let request = require('request');
let fs = require('fs');

let EvenBetterDiscord = function ()
{
    this.targetAPI = "https://api.github.com/repos/DeathStrikeV/BetterDiscordApp/commits/master";
    this.targetURL = "https://raw.githubusercontent.com/DeathStrikeV/BetterDiscordApp/master/data/emotedata_ffz.json";

    this.bdPath = (process.platform == "win32" ?
        process.env.APPDATA : process.platform == "darwin" ?
        process.env.HOME + "/Library/Preferences/" : "/var/local/") + "/BetterDiscord/";

    this.preferencesFile = this.bdPath + "/EBD_Preferences.json";
    this.emotesFile = this.bdPath + "/EBD_Emotes.json";
    this.defaultEmotesFile = this.bdPath + "/emotes_ffz.json";
};

EvenBetterDiscord.prototype.start = function ()
{
    this.loadEBDFiles();
};

EvenBetterDiscord.prototype.loadEBDFiles = function ()
{
    let readPreferencesFile = function (err, data)
    {
        if (data)
            this.currentHash = JSON.parse(data).currentHash;
        else
            this.currentHash = "";

        if (this.currentHash === "ignore")
        {
            this.loadEmotes(this.emotesFile);
            return;
        }

        request({ url: this.targetAPI, headers: { "User-Agent": "DeathStrikeV" } }, requestRepoHash.bind(this));
    };

    let requestRepoHash = function (error, response, body)
    {
        if (response.statusCode !== 200)
        {
            this.loadEmotes(this.emotesFile);
            return;
        }

        this.latestHash = JSON.parse(body).sha;

        if (this.currentHash === this.latestHash)
        {
            this.loadEmotes(this.emotesFile);
            return;
        }

        request(this.targetURL, downloadEmotesFile.bind(this));
    };

    let downloadEmotesFile = function (error, response, body)
    {
        if (response.statusCode !== 200)
        {
            this.loadEmotes(this.emotesFile);
            return;
        }

        fs.writeFile(this.emotesFile, body, saveEmotesFile.bind(this));
    };

    let saveEmotesFile = function (err)
    {
        if (!err)
        {
            //console.log("Retreived new emotes file!");
            fs.writeFile(this.preferencesFile, JSON.stringify({ currentHash: this.latestHash }), null);
        }

        this.loadEmotes(this.emotesFile);
    }

    fs.readFile(this.preferencesFile, "utf8", readPreferencesFile.bind(this));
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
    this.loadEmotes(this.defaultEmotesFile);
};

EvenBetterDiscord.prototype.removeEBDFiles = function ()
{
    fs.stat(this.preferencesFile, (err, stats) =>
    {
        if (err)
            return;

        fs.unlink(this.preferencesFile, (err) => { });
    });

    fs.stat(this.emotesFile, (err, stats) =>
    {
        if (err)
            return;

        fs.unlink(this.emotesFile, (err) => { });
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