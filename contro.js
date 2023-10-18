const awsFunc = require("./awsCognito");

exports.registeruser = async (req, res) => {
  try {
    const { name, phoneno, email, password } = req.body;

    if (!name || !phoneno || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const registrationResult = await awsFunc.registerUser(
      name,
      phoneno,
      email,
      password
    );

    if (
      registrationResult.statusCode &&
      registrationResult.statusCode !== 200
    ) {
      return res.status(registrationResult.statusCode).json(registrationResult);
    }

    res.status(200).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.conformUser = async (req, res) => {
  try {
    if (req.body.length === 0) {
      return res.status(400).json({ error: "Body is required" });
    }
    const { username, code } = req.body;
    if (!username || !code) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const verification = await awsFunc.confirmUser(username, code);

    if (verification.statusCode && verification.statusCode !== 200) {
      return res.status(verification.statusCode).json(verification);
    }

    res.status(200).json({ message: "User Verified successfully." });
  } catch (error) {
    console.error("Error during user verification:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const responce = await awsFunc.login(username, password);
  res.json(responce);
};

exports.VerifyAndRefresh = async (req, res) => {
  const { accessToken, refreshToken } = req.body;
  const data = await awsFunc.verifyAndRefreshToken(accessToken, refreshToken);
  res.json(data);
};
