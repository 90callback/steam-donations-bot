const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');

const adminTradeLink = ''
const client = new SteamUser();
const community = new SteamCommunity();
const manager = new TradeOfferManager({
    steam: client,
    community: community,
    language: 'en'
});

const logOnOptions = {
    accountName: '',
    password: '',
    twoFactorCode: SteamTotp.generateAuthCode('')
};

client.logOn(logOnOptions);

client.on('loggedOn', () => {
    console.log('Logged into Steam');

    client.setPersona(SteamUser.EPersonaState.Online)
    client.gamesPlayed(730);
});

client.on('webSession', (sessionid, cookies) => {
    manager.setCookies(cookies);

    community.setCookies(cookies);
    community.startConfirmationChecker(10000, '');
});

manager.on('newOffer', (offer) => {
    if (offer.itemsToGive.length === 0) {
        offer.accept((err, status) => {
            if (err) {
                console.log(err);
            } else {
                console.log(`Donation accepted. Status: ${status}.`);
            }
        });
    } else {
        offer.decline((err) => {
            if (err) {
                console.log(err);
            } else {
                console.log('Donation declined (wanted our items).');
            }
        });
    }
});

function sendItems () {
    manager.loadInventory(730, 2, true, (err, inventory) => {
        if (inventory.length === 0) return
        if (err) return console.log(err)
        const offer = manager.createOffer(adminTradeLink)
        inventory.forEach((item) => {
            offer.addMyItem(item)
        })
        offer.setMessage('Donation')
        offer.send((err, status) => {
            if (err) return console.log(err)
            console.log('Offer sent', status)
        })
    })
}

setInterval(() => {
    sendItems()
}, 1000 * 60 * 60)