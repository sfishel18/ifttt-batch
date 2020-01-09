const axios = require("axios");
const promiseTools = require("promise-tools")

const stringify = input =>
  typeof input === "string" ? input : JSON.stringify(input);

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.index = (req, res) => {
  if (req.method === "HEAD") {
    res.status(200).send();
    return;
  }
  const { auth, webhooks } = req.body;
  if (auth !== process.env.AUTH_KEY) {
    res.status(401).send("Access denied");
    return;
  }
  if (!webhooks || webhooks.length < 1) {
    res.status(400).send('Required argument "webhooks" is missing or empty');
    return;
  }
  promiseTools.series(
    webhooks.map(hook => () =>
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
