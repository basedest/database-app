var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");

const con = require('./bd');

app.disable("x-powered-by");

app.use(express.static(__dirname + '/views'));

var credentials = "8a489e226715eccf0f0c";
app.use(require('cookie-parser')(credentials));
app.use(cookieParser());

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//connecting to database
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});
con.query("SET SESSION wait_timeout = 604800");// 7 days timeout

app.set('view engine', 'ejs');

app.get('/login', function(req, res) {
    res.render('login');
});

app.post('/menu', function(req, res) {
    var str = '<div class="menustyle">';
    if(cookieParser.signedCookie(req.signedCookies.OSrole,credentials)) {
        if(cookieParser.signedCookie(req.signedCookies.OSrole,credentials) == "admin" || cookieParser.signedCookie(req.signedCookies.OSrole,credentials) == "storage")
            str += '<button onclick="storage();">Склад</button>';
        if(cookieParser.signedCookie(req.signedCookies.OSrole,credentials) == "admin" || cookieParser.signedCookie(req.signedCookies.OSrole,credentials) == "customer")
            str += '<button onclick="customers();">Клиенты</button>';
        if(cookieParser.signedCookie(req.signedCookies.OSrole,credentials) == "admin" || cookieParser.signedCookie(req.signedCookies.OSrole,credentials) == "service")
            str += '<button onclick="services();">Услуги</button>';
        str += '<button onclick="exit();">Выйти</button>';
        str += '</div>';
    }

    res.send(str);
});

app.get('/', authenticationMiddleware());

function authenticationMiddleware () {
    return function (req, res) {
        if (cookieParser.signedCookie(req.signedCookies.OSrole, credentials)) {
            res.render('index');
        } else {
            res.redirect('/login');
        }
    }
}

app.get('/addStorage', function(req, res) {
    res.render('addStorage');
});

app.get('/addCustomer', function(req, res) {
    res.render('addCustomer');
});

app.get('/addService', function(req, res) {
    res.render('addService');
});

app.get('/storage', function(req, res) {
    res.render('storage');
});

app.get('/customers', function(req, res) {
    res.render('customers');
});

app.get('/services', function(req, res) {
    res.render('services');
});

app.post('/authorization', function (req,res) {
    con.query('SELECT * FROM `office_service`.`users` WHERE login="'+req.body.login+'" AND password="'+req.body.pass+'";', function(err,result) {
        if(err) throw err;
        if (result.length == 1) {
            res.cookie('OSrole', result[0].role, { signed: true });
            res.send("ok");
        } else {
            res.send("Неверный пароль");
        }
    });
});

app.post('/exit', function (req,res) {
    res.clearCookie("OSrole");
    res.send("ok");
});

app.post('/storageUp', function (req,res) {
    con.query('SELECT id, model, type, cost FROM `office_service`.`storage` ORDER BY id DESC;', function(err,result) {
        if (err) throw err;
        res.send(assembleTableS(result));
    });
});

app.post('/servicesUp', function (req,res) {
    con.query('SELECT * FROM `office_service`.`services` ORDER BY id DESC;', function(err,result) {
        if (err) throw err;
        res.send(assembleTableSe(result));
    });
});

app.post('/customersUp', function (req,res) {
    con.query('SELECT cust.id, cust.name, serv.service, stor.model as device, stor.type, cust.cost, cust.quantity, comp.name as company, cust.address  FROM `office_service`.`customers` cust \n' +
        '\tLEFT JOIN office_service.services serv ON cust.service = serv.id\n' +
        '    LEFT JOIN office_service.`storage` stor ON cust.device = stor.id\n' +
        '    LEFT JOIN office_service.`companies` comp ON cust.company = comp.id\n' +
        '    ORDER BY cust.id DESC;', function(err,result) {
        if (err) throw err;
        res.send(assembleTableC(result));
    });
});

app.post('/saveStorage', function (req,res) {
    var values = [];

    values.push([req.body.model, req.body.type, req.body.cost]);
    con.query("INSERT INTO `office_service`.`storage` (model, type, cost) VALUES ?", [values], function(err) {
        if(err) {
            throw err;
            res.send('Error');
        }
        else {
            res.send('Success');
        }
    });
});

app.post('/updateStorage', function (req,res) {
    var values = [];

    values.push(req.body.model, req.body.type, req.body.cost, req.body.id);
    con.query("UPDATE `office_service`.`storage` SET model = ?, type  = ?, cost = ? WHERE id = ? ", values, function(err) {
        if(err) {
            throw err;
            res.send('Error');
        }
        else {
            res.send('Success');
        }
    });
});

app.post('/delStorage', function (req,res) {
    con.query('DELETE FROM `office_service`.`storage` WHERE id = ?', req.body.id, function (err) {
        if (err) {
            throw err;
            res.send('Error');
        }
        else {
            res.send('Success');
        }
    });
});

app.post('/saveService', function (req,res) {
    var values = [];

    values.push([req.body.service, req.body.cost, req.body.time]);
    con.query("INSERT INTO `office_service`.`services` (service, cost, time) VALUES ?", [values], function(err) {
        if(err) {
            throw err;
            res.send('Error');
        }
        else {
            res.send('Success');
        }
    });
});

app.post('/updateService', function (req,res) {
    var values = [];

    values.push(req.body.service, req.body.cost, req.body.time, req.body.id);
    con.query("UPDATE `office_service`.`services` SET service = ?, cost  = ?, time = ? WHERE id = ? ", values, function(err) {
        if(err) {
            throw err;
            res.send('Error');
        }
        else {
            res.send('Success');
        }
    });
});

app.post('/delService', function (req,res) {
    con.query('DELETE FROM `office_service`.`services` WHERE id = ?', req.body.id, function (err) {
        if (err) {
            throw err;
            res.send('Error');
        }
        else {
            res.send('Success');
        }
    });
});

app.post('/saveCustomer', function (req,res) {
    var values = [];

    values.push([req.body.name, req.body.service, req.body.device, req.body.cost, req.body.quantity, req.body.address, req.body.company]);
    con.query("INSERT INTO `office_service`.`customers` (name, service, device, cost, quantity, address, company) VALUES ?", [values], function(err) {
        if(err) {
            throw err;
            res.send('Error');
        }
        else {
            res.send('Success');
        }
    });
});

app.post('/updateCustomer', function (req,res) {
    var values = [];

    values.push(req.body.name, req.body.service, req.body.device, req.body.cost, req.body.quantity, req.body.address, req.body.company, req.body.id);
    con.query("UPDATE `office_service`.`customers` SET name = ?, service = ?, device = ?, cost = ?, quantity = ?, address = ?, company = ? WHERE id = ? ", values, function(err) {
        if(err) {
            throw err;
            res.send('Error');
        }
        else {
            res.send('Success');
        }
    });
});

app.post('/delCustomer', function (req,res) {
    con.query('DELETE FROM `office_service`.`customers` WHERE id = ?', req.body.id, function (err) {
        if (err) {
            throw err;
            res.send('Error');
        }
        else {
            res.send('Success');
        }
    });
});

app.get('/editStorage', function(req, res) {
    con.query("SELECT * FROM `office_service`.`storage` WHERE id = ?", req.query.id, function (err, result) {
        if (err) throw err;
            res.render('editStorage', { data: result[0]});
    });
});

app.get('/editService', function(req, res) {
    con.query("SELECT * FROM `office_service`.`services` WHERE id = ?", req.query.id, function (err, result) {
        if (err) throw err;
        res.render('editService', { data: result[0]});
    });
});

app.get('/editCustomer', function(req, res) {
    con.query("SELECT * FROM `office_service`.`customers` WHERE id = ?", req.query.id, function (err, result) {
        if (err) throw err;
        res.render('editCustomer', { data: result[0]});
    });
});

app.post('/getCompanies', function(req, res) {
    con.query("SELECT * FROM `office_service`.`companies`", function (err, result) {
        if (err) throw err;
        res.send(assembleCompanies(result));
    });
});

function assembleCompanies(rows) {
    var str = '';
    str += `<option value='' disabled selected>-- Выберите компанию --</option>`;
    for(var i = 0; i < rows.length; ++i) {
        str += `<option value='`+ rows[i].id +`'>` + rows[i].name +`</option>`;
    }
    return str;
}

app.post('/getServices', function(req, res) {
    con.query("SELECT * FROM `office_service`.`services`", function (err, result) {
        if (err) throw err;
        res.send(assembleServices(result));
    });
});

function assembleServices(rows) {
    var str = '';
    str += `<option value='' disabled selected>-- Выберите услугу --</option>`;
    for(var i = 0; i < rows.length; ++i) {
        str += `<option value='`+ rows[i].id +`'>` + rows[i].service +`</option>`;
    }
    return str;
}

app.post('/getStorage', function(req, res) {
    con.query("SELECT * FROM `office_service`.`storage`", function (err, result) {
        if (err) throw err;
        res.send(assembleStorage(result));
    });
});

function assembleStorage(rows) {
    var str = '';
    str += `<option value='' disabled selected>-- Выберите устройство --</option>`;
    for(var i = 0; i < rows.length; ++i) {
        str += `<option value='`+ rows[i].id +`'>` + rows[i].model +`</option>`;
    }
    return str;
}

function assembleTableS(rows) {
    var str = '';
    for(var i = 0; i < rows.length; ++i) {
        str = str + (`<tr>
                <td>` + rows[i].id + `</td>
                <td>` + rows[i].model + `</td>
                <td>` + rows[i].type + `</td>
                <td>` + rows[i].cost + `</td>
                <td>
                    <input type="button" value="Редактировать" onclick="edit(`+rows[i].id+`)">
                    <input type="button" value="Удалить" onclick="del(`+rows[i].id+`)">
                </td>
            </tr>`);
    }
    return str;
}

function assembleTableSe(rows) {
    var str = '';
    for(var i = 0; i < rows.length; ++i) {
        str = str + (`<tr>
                <td>` + rows[i].id + `</td>
                <td>` + rows[i].service + `</td>
                <td>` + rows[i].cost + `</td>
                <td>` + rows[i].time + `</td>
                <td>
                    <input type="button" value="Редактировать" onclick="edit(`+rows[i].id+`)">
                    <input type="button" value="Удалить" onclick="del(`+rows[i].id+`)">
                </td>
            </tr>`);
    }
    return str;
}

function assembleTableC(rows) {
    var str = '';
    for(var i = 0; i < rows.length; ++i) {
        str = str + (`<tr>
                <td>` + rows[i].id + `</td>
                <td>` + rows[i].name + `</td>
                <td>` + rows[i].service + `</td>
                <td>` + rows[i].device + `</td>
                <td>` + rows[i].type + `</td>
                <td>` + rows[i].cost + `</td>
                <td>` + rows[i].quantity + `</td>
                <td>` + rows[i].address + `</td>
                <td>` + rows[i].company + `</td>
                <td>
                    <input type="button" value="Редактировать" onclick="edit(`+rows[i].id+`)">
                    <input type="button" value="Удалить" onclick="del(`+rows[i].id+`)">
                </td>
            </tr>`);
    }
    return str;
}

app.listen(8080);