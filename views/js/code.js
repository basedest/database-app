function isVal() {
    let elems = document.querySelectorAll("input[type='text'],select,textarea");
    for (let i = 0; i < elems.length; ++i) {
        elems[i].classList.remove('wrong');
        if(elems[i].tagName == 'SELECT') {
            elems[i].nextSibling.classList.remove('wrong');
        }
    }
    for (let i = 0; i < elems.length; ++i) {
        if(!elems[i].value && elems[i].id != "dateget") {
            elems[i].classList.add('wrong');
            return false;
        }
        if(elems[i].tagName == 'SELECT' && elems[i].value == '0') {
            elems[i].nextSibling.classList.add('wrong');
            return false;
        }
        if(elems[i].classList.contains('quantity')) {
            let pattern = /^\d+$/;
            if (!pattern.test(elems[i].value)) {
                elems[i].classList.add('wrong');
                return false;
            }
            if (elems[i].value <= 0) {
                elems[i].classList.add('wrong');
                return false;
            }
        }
        if(elems[i].classList.contains('date') && elems[i].value) {
            let pattern = /^(0?[1-9]|[12][0-9]|3[01]).(0?[1-9]|1[012]).2\d\d\d$/;
            if (!pattern.test(elems[i].value)) {
                elems[i].classList.add('wrong');
                return false;
            }
        }
    }
    return true;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};

function getQueryVariable(variable)
{
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] == variable){return pair[1];}
    }
    return(false);
}

function back() {
    location.href = '/';
}

function exit() {
    $.post('/exit', function() {
        location.href = '/';
    });
}

function storage() {
    location.href = '/storage';
}

function customers() {
    location.href = '/customers';
}

function services() {
    location.href = '/services';
}

function addCustomer() {
    location.href = '/addCustomer';
}

function addStorage() {
    location.href = '/addStorage';
}

function addService() {
    location.href = '/addService';
}

