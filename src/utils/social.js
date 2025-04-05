const { OAuth2Client } = require("google-auth-library");
const { googleClientId, googleClientSecret } = require("../config/config");

exports.verifyGoogleToken = async (code) => {
  const CLIENT_ID = googleClientId;
  const CLIENT_SECRET = googleClientSecret;
  const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, "postmessage");
  const { tokens } = await client.getToken(code); // exchange code for tokens
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      requiredAudience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    // console.log('payload', payload);
    // const userid = payload['sub'];
    // console.log('userid', userid);
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
    return payload;
  }
  const response = await verify().catch((error) => {
    // return null;
    return null;
  });
  return response;
};
