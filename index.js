var https = require('https');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var braintree = require('braintree');

var app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.set('views', __dirname);

var gateway = braintree.connect({
    clientId: process.env.BRAINTREE_CLIENT_ID,
    clientSecret: process.env.BRAINTREE_CLIENT_SECRET
});

var connectUrl = gateway.oauth.connectUrl({
  redirectUri: "https://10.20.74.215:9002/portal/connect.html",
  scope: "read_write,shared_vault_transactions",
  state: "foo_state",
  landingPage: "signup",
  paymentMethods: ["credit_card", "paypal"]
});

var accessTokens = {};

app.get('/', function(req, res) {
    res.redirect('/merchant/');
});

app.get('/portal/*', function(req, res, next) {
    if (req.path == '/portal/style.css') {
        next();
        return;
    }

    if (req.cookies.secret != 'nonce') {
        if (req.path == '/portal/login.html') {
            next();
        } else {
            res.redirect('/portal/login.html');
        }
    } else if (!accessTokens[req.cookies.name]) {
        if (req.path == '/portal/connect.html') {
            next();
        } else {
            res.redirect('/portal/connect.html');
        }
    } else {
        next();
    }
});

app.get('/portal/connect.html', function(req, res) {
    if (req.query.code) {
        token = gateway.oauth.createTokenFromCode({
            code: req.query.code
        }, function(err, response) {
            try {
                accessTokens[req.cookies.name] = response.credentials.accessToken;
                res.redirect('/portal');
            } catch (err) {
                res.render("ECommercePortal/connect", {
                    connectUrl: connectUrl
                });
            }
        });
    } else {
        res.render("ECommercePortal/connect", {
            connectUrl: connectUrl
        });
    }
});

app.post('/portal/login.html', function(req, res, next) {
    if (req.body.login && req.body.password) {
        res.setHeader('Set-Cookie', [
            'type=session',
            'name=' + req.body.login,
            'secret=nonce',
            'path=/'
        ]);
        res.redirect('/portal');
    } else {
        next();
    }
});

app.use('/portal', express.static("ECommercePortal"));


app.post('/payment-app/pay', function(req, res) {
    console.log("Pay");
    console.log("url: " + req.originalUrl);
    console.log("name: " + req.query.merchantName);
    console.log("nonce: " + req.query.paymentMethodNonce);
    console.log("currency: " + req.query.currency);
    console.log("amount: " + req.query.amount);

    var accessToken = accessTokens[req.query.merchantName];
    console.log("Access token: " + accessToken);

    if (!accessToken) {
        console.log("Merchant not recognised: " + req.query.merchantName);
        res.status(403).send("Merchant not recognised");
        return;
    }

    gateway = braintree.connect({
        accessToken: accessToken
    });

    gateway.transaction.sale({
        amount: req.query.amount,
        currency: req.query.currency,
        paymentMethodNonce: req.query.paymentMethodNonce
    }, function(err, result) {
        if (err) {
            console.log("Payment error: " + JSON.stringify(err));
            res.status(500).send("Payment error");
        } else if (result.errors) {
            console.log("Payment error: " + JSON.stringify(result.errors));
            res.status(500).send("Payment error");
        } else {
            console.log("Payment success");
            console.log("result: " + JSON.stringify(result));
            res.send("Payment success");
        }
    });
});

app.get("/payment-app/client_token", function(req, res) {
    console.log("Get client token");
    console.log("url: " + req.originalUrl);
    var accessToken = accessTokens[req.query.merchantName];
    console.log("Access token: " + accessToken);
    if (!accessToken) {
        console.log("Merchant not recognised: " + req.query.merchantName);
        res.status(403).send("Merchant not recognised");
        return;
    }
    gateway = braintree.connect({
        accessToken: accessToken
    });
    gateway.clientToken.generate({}, function(err, response) {
        console.log("client_token: " + response.clientToken);
        res.send(response.clientToken);
    });
});

app.use('/payment-app', express.static("PaymentApp"));


app.use('/merchant', express.static("Merchant"));

var server = https.createServer(
        { key: fs.readFileSync('key.pem'),
          cert: fs.readFileSync('cert.pem') }, app);
server.listen(9002);
