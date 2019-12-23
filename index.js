const axios = require("axios");

const stringify = input =>
  typeof input === "string" ? input : JSON.stringify(input);

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.index = (req, res) => {
  const { auth, webhooks } = req.body;
  if (auth !== process.env.AUTH_KEY) {
    res.status(401).send("Access denied");
    return;
  }
  if (!webhooks || webhooks.length < 1) {
    res.status(400).send('Required argument "webhooks" is missing or empty');
    return;
  }
  Promise.all(
    webhooks.map(hook =>
      axios.get(hook).catch(error => ({
        data: `Error from ${hook}: ${stringify(error.response.data)}`
      }))
    )
  ).then(responses =>
    res
      .status(200)
      .send(responses.map(response => stringify(response.data)).join("\n"))
  );
};
