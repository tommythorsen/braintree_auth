# A payment app and backend using [Braintree Auth](https://developers.braintreepayments.com/guides/braintree-auth/overview)

The backend consists of an [e-commerce portal](ECommercePortal) and a [payment app](PaymentApp), which is meant to be used together with [the web payments extension for Chrome/Opera](https://github.com/tommythorsen/webpayments-demo/tree/gh-pages/mediator-extension).

There is also a simple [merchant site](Merchant) which can be onboarded through the e-commerce portal and uses the payment app for processing payments.


## Prerequisites

### 1. Put Braintree Client ID and Client Secret in the environment

You can do this by adding this to your `.bashrc`, for instance:

```
export BRAINTREE_CLIENT_ID='<your client id>'
export BRAINTREE_CLIENT_SECRET='<your client secret>'
```


### 2. Create certificate files `cert.pem` and `key.pem` for https

```
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 999 -nodes
```
