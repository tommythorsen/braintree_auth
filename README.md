# A payment app and backend using [Braintree Auth](https://developers.braintreepayments.com/guides/braintree-auth/overview)

The backend consists of an [e-commerce portal](ECommercePortal) and a [payment app](PaymentApp), which is meant to be used together with [the web payments extension for Chrome/Opera](https://github.com/tommythorsen/webpayments-demo/tree/gh-pages/mediator-extension).

There is also a simple [merchant site](Merchant) which can be onboarded through the e-commerce portal and uses the payment app for processing payments.

Here's how to test this code: 

## 1. Put Braintree Client ID and Client Secret in the environment

You can do this by adding this to your `.bashrc`, for instance:

```
export BRAINTREE_CLIENT_ID='<your client id>'
export BRAINTREE_CLIENT_SECRET='<your client secret>'
```


## 2. Create certificate files `cert.pem` and `key.pem` for https

```
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 999 -nodes
```


## 3. Set the username of the merchant braintree account

Change [this line](https://github.com/tommythorsen/braintree_auth/blob/master/Merchant/index.html#L10) so that it contains your braintree username instead of `tommyt@opera.com`.


## 4. Install/update node packages

```
npm install
```


## 5. Run the web server

```
node index.js
```

## 6. Install the web payments mediator extension.

By clicking [here](https://github.com/tommythorsen/webpayments-demo/tree/gh-pages/mediator-extension).


## 7. Install the Braintree Auth payment app.

By navigating to [https://localhost:9002/payment-app](https://localhost:9002/payment-app) and clicking `Install`.


## 8. Register the merchant in the e-commerce portal

Navigate to [https://localhost:9002/portal](https://localhost:9002/portal) and log in with the merchant braintree account used in step 3.


## 9. Do some shopping

Make a sandbox purchase in [https://localhost:9002/merchant](https://localhost:9002/merchant)
