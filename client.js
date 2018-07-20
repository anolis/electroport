const {ipcRenderer} = require('electron');

let host, portfrom, portto = '';
function runScan() {
    $('.result-item').remove();
    if (validateForm()) {
        $('#result_container').fadeIn(500);
        let args = {
            host: host,
            portfrom: portfrom,
            portto: portto
        };

        ipcRenderer.send('do-scan', args);
    }
}

function validateForm() {
    let ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    let hostnameRegex = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$/;

    host = $('#host').val();
    portfrom = $('#portFrom').val();
    portto = $('#portTo').val();

    console.log('Host: ' + host + " from: " + portfrom + " to: " + portto);
    let isValid = true;
    let isValidIP = true;
    let error = '';
    if (host === '') {
        isValid = false;
        error = 'host field is not set';
        console.log(error);
        alert(error);
    } else {
        //is it an ip?
        if (!ipRegex.test(host)) {
            isValid = false;
            error = 'invalid ip';
        } else {
            isValidIP = true;
            isValid = true;
            error = '';
        }

        if (!hostnameRegex.test(host) && !isValidIP) { //okay so is it a hostname?
            isValid = false;
            error = 'host field is not of proper form';
        } else {
            isValid = true;
            error = '';
        }

        if (!isValid) {
            console.log(error);
            alert(error);
        }
    }
    if (portfrom === '') {
        isValid = false;
        let error = 'from port needs to be set';
        console.log(error);
        alert(error);
    }
    if (portto === '') {
        isValid = false;
        let error = 'to port needs to be set';
        console.log(error);
        alert(error);
    }

    //check if from port is less than to port
    if (portfrom > portto) {
        isValid = false;
        let error = 'from port cannot be greater than to port';
        console.log(error);
        alert(error);
    }

    return isValid;
}

/*ipc stuff*/

//ipc progress bar

function setProgress(percent) {
    $('#progressBar .progress-bar').css({width: percent + '%'});
    $('#percent').text(percent + '%');
}
ipcRenderer.on('update-progress', (event, args) => {
    let {percent} = args;
    setProgress(percent);
});

ipcRenderer.on('port-found', (event, args) => {
    let {index, port} = args;
    console.log("Port Found: " +port);
    $('#results').append(`<tr class="result-item"><td>${index}</td><td style="text-align:right">${port}</td></tr>`);

});