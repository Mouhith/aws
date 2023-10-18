const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");
const AmazonCognitoIdentity = require("amazon-cognito-identity-js");
const jwksClient = require("jwks-rsa");
AWS.config.update({ region: "eu-north-1" });
const CognitoIdentityProvider = new AWS.CognitoIdentityServiceProvider();

const poolData = {
  UserPoolId: process.env.UPOOL_ID,
  ClientId: process.env.CLIENT_ID,
};

exports.registerUser = async (name, pno, email, password) => {
  const parms = {
    ClientId: poolData.ClientId,
    Username: pno,
    Password: password,
    UserAttributes: [
      {
        Name: "name",
        Value: name,
      },
      {
        Name: "email",
        Value: email,
      },

      {
        Name: "phone_number",
        Value: pno,
      },
    ],
  };
  try {
    return await CognitoIdentityProvider.signUp(parms).promise();
  } catch (err) {
    return err;
  }
};

exports.confirmUser = async (username, confirmationCode) => {
  const params = {
    ClientId: poolData.ClientId,
    ConfirmationCode: confirmationCode,
    Username: username,
  };

  try {
    return await CognitoIdentityProvider.confirmSignUp(params).promise();
  } catch (error) {
    return error;
  }
};

exports.login = async (username, password) => {
  const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  const authenticationData = {
    Username: username,
    Password: password,
  };

  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
    authenticationData
  );

  const userData = {
    Username: username,
    Pool: userPool,
  };

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  return new Promise((resolve, rejected) => {
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session) => resolve(session),
      onFailure: (err) => rejected(err),
    });
  });
};

exports.verifyAndRefreshToken = async (accessToken, refreshToken) => {
  const client = jwksClient({
    jwksUri: `https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_Nrgyqn4hG/.well-known/jwks.json`,
  });

  async function getPublicKey(kid) {
    return new Promise((resolve, reject) => {
      client.getSigningKey(kid, (err, key) => {
        if (err) {
          reject(err);
        } else {
          const signingKey = key.publicKey || key.rsaPublicKey;
          resolve(signingKey);
        }
      });
    });
  }
  async function verifyToken(token) {
    const decodedToken = jwt.decode(token, { complete: true });

    if (!decodedToken) {
      throw new Error("Invalid token");
    }

    const kid = decodedToken.header.kid;
    const publicKey = await getPublicKey(kid);

    return jwt.verify(token, publicKey, { algorithms: ["RS256"] });
  }

  try {
    const decodedAccessToken = await verifyToken(accessToken);

    const params = {
      AuthFlow: "REFRESH_TOKEN_AUTH",
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
      ClientId: poolData.ClientId,
    };

    const data = await CognitoIdentityProvider.initiateAuth(params).promise();
    const newAccessToken = data.AuthenticationResult.AccessToken;

    return { AccessToken: newAccessToken, DecodedToken: decodedAccessToken };
  } catch (error) {
    console.error("Error:", error.message);
    return error;
  }
};
