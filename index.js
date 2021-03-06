// Util

function dayOfYear() {
    var d = new Date();
    var j1= new Date(d);
    j1.setMonth(0, 0);
    return Math.round((d-j1)/8.64e7);
}

function determineIfMissedYesterday(chain) {
    return dayOfYear() - chain.last_entered_day > 1
}

// Templating

function makeChainSelector(chain, app) {
    var chainEl = document.createElement('div');
    chainEl.classList = "chain-selector";
    chainEl.addEventListener('click', function() {
        showChain(chain, app);
    })
    chainEl.innerHTML = "<span>" + chain.name + "</span>";
    return chainEl;
}

function makeChainEntry() {
    var entry = document.createElement("input");
    entry.setAttribute('type', 'text');
    entry.addEventListener('keypress', handleEntry);
    return entry;
}

function makeLogButton(chain, app, missedYesterday) {
    var button = document.createElement("button");

    button.innerHTML = "Did it!";
    button.addEventListener('click', function() {
        chain.last_entered_day = dayOfYear();
        if (missedYesterday) {
            chain.created_day = dayOfYear();
        }
        updateChain(chain);
        showChain(chain, app);
    });

    return button;
}

function makeLink() {
    var x = document.createElement('div');
    x.className = "x";
    return x;
}

function makeCounter(currentLength, record) {
    var counter = document.createElement('div');
    counter.className = "counter";
    counter.innerHTML = "current: " + currentLength + " / record: " + record;
    return counter;

}

// Data Access

function getChains() {
    return JSON.parse(window.localStorage.chains || "[]");
}

function setChains(chains) {
    window.localStorage.chains = JSON.stringify(chains);
}

function updateChain(updatedChain) {
    var chains = getChains();
    chains = chains.map(function(chain){
        if (updatedChain.name === chain.name) {
            return updatedChain;
        }
        return chain;
    });
    setChains(chains);
}

// App

function showChains(chains, app) {
    var chainContainer = document.createElement("div");
    chains.forEach(function(chain) {
        chainContainer.appendChild(makeChainSelector(chain, app));
    });
    app.appendChild(chainContainer);
}

function hasAnyLogs(chain) {
    return chain.last_entered_day;
}

function showChain(chain, app) {
    clearEl(app);

    var missedYesterday = determineIfMissedYesterday(chain);
    app.appendChild(makeLogButton(chain, app, missedYesterday));

    if (!hasAnyLogs(chain)) {
        return;
    }

    if (missedYesterday) {
        var lostEl = document.createElement('div');
        lostEl.innerHTML = "You fucked up.";
        app.appendChild(lostEl);
        return;
    }

    var createdDay = chain.created_day;
    var lastEntered = chain.last_entered_day;
    var chainLength = 0;
    while (createdDay <= lastEntered) {
        app.appendChild(makeLink());
        chainLength++;
        createdDay++;
    }

    if (chainLength > chain.record) {
        chain.record = chainLength;
        updateChain(chain);
    }

    app.appendChild(makeCounter(chainLength, chain.record));

}


function clearEl(el) {
    el.innerHTML = "";
}

function showChainEntry(el) {
    el.appendChild(makeChainEntry());
}

function handleEntry(e) {
    if (e.charCode === 13) {
        if (e.target.value == 'clearall') {
            delete window.localStorage.chains;
            return;
        }
        createChain(e.target.value);
    }
}

function createChain(name) {
    var chains = getChains();
    chains.push({
        "name": name, 
        "last_entered_day": null, 
        "created_day": dayOfYear(),
        "record" : 0
    });
    setChains(chains);
    run();
}

var app = document.getElementById("app");

function run() {

    clearEl(app);

    var chains = getChains();

    if (chains.length) {
        showChains(chains, app);
    }

    showChainEntry(app);
}

run();
