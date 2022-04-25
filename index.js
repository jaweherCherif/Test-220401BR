import fetch from "node-fetch";

const authenticate = async (authData) => {
  let auth =
    "Basic " +
    Buffer.from(authData.client_id + ":" + authData.client_secret).toString(
      "base64"
    );
  const refreshToken = await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
    body: JSON.stringify({
      user: authData.user,
      password: authData.password,
    }),
  })
    .then((res) => res.json())
    .then((json) => json)
    .catch((err) => console.log(err));
  console.log(refreshToken);
  return refreshToken;
};

const getToken = (refreshToken) => {
  return fetch("http://localhost:3000/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  })
    .then((res) => res.json())
    .then((json) => json)
    .catch((err) => console.log(err));
};
const getAccounts = async (token) => {
  return fetch("http://localhost:3000/accounts", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((json) => json)
    .catch((err) => console.log(err));
};

const getTransactions = async (token, account) => {
  fetch(`http://localhost:3000/accounts/${account}/transaction`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((json) => json)
    .catch((err) => console.log(err));
};

const refreshToken = authenticate({
  user: "BankinUser",
  password: "12345678",
  client_id: "BankinClientId",
  client_secret: "secret",
}).then((data) => {
  if (data.refresh_token) {
    getToken(data.refresh_token).then((data) => {
      const token = data.access_token;
      if (token) {
        getAccounts(token).then((accounts) => {
          accounts.account.map((account) =>
            getTransactions(token, account.acc_number).then((transaction) =>
              console.log(transaction)
            )
          );
        });
      }
    });
  }
});
