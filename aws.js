const AWS = require("aws-sdk");
AWS.config.update({ region: "eu-north-1" });
const registerUser = async (
  username,
  password,
  email,
  userPoolId,
  clientId
) => {
  const cognitoIdentityServiceProvider =
    new AWS.CognitoIdentityServiceProvider();

  const params = {
    ClientId: clientId,

    Password: password,
    UserAttributes: [
      {
        Name: "email",
        Value: email,
      },
      {
        Name: "name",
        Value: "test Nu",
      },
      {
        Name: "phone_number",
        Value: "+918971633440",
      },
    ],
    Username: email,
  };

  try {
    const data = await cognitoIdentityServiceProvider.signUp(params).promise();
    console.log("User registered successfully:", data);
  } catch (error) {
    console.error("Error registering user:", error.message);
    throw error;
  }
};

const username = "testuser";
const password = "TestPassword@123";
const email = "mouhith@nuron.co.in";
const userPoolId = "eu-north-1_Nrgyqn4hG";
const clientId = "4l45nfd3228piuv6fbjtdj02u2";

registerUser(username, password, email, userPoolId, clientId)
  .then(() => {
    console.log("User registered successfully!");
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });
