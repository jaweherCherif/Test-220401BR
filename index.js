import fetch from "node-fetch";

const login = async (authData) => {
  let auth =
    "Basic " +
    Buffer.from(authData.client_id + ":" + authData.client_secret).toString(
      "base64"
    );
  try {
    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
      },
      body: JSON.stringify({
        user: authData.user,
        password: authData.password,
      }),
    });
    return res.status == 200 ? res.json() : res;
  } catch (err) {
    return err;
  }
};

const getToken = async (refreshToken) => {
  try {
    const res = await fetch("http://localhost:3000/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });
    return res.status == 200 ? res.json() : res;
  } catch (err) {
    return err;
  }
};
const getAccounts = async (token) => {
  try {
    const res = await fetch("http://localhost:3000/accounts", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res.status == 200 ? res.json() : res;
  } catch (err) {
    return err;
  }
};

const getTransactions = async (token, account) => {
  try {
    const res = await fetch(
      `http://localhost:3000/accounts/${account}/transactions`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res;
  } catch (err) {
    return err;
  }
};

const loginInfo = {
  user: "BankinUser",
  password: "12345678",
  client_id: "BankinClientId",
  client_secret: "secret",
};

const getAccountsFullData = async () => {
  try {
    const loginRes = await login(loginInfo);
    const refreshToken = loginRes.refresh_token;
    if (!refreshToken) return { status: "not authorized", accounts: [] };
    let accountsFullData = [];
    const tokenRes = await getToken(refreshToken);
    if (!tokenRes.access_token)
      return { status: "refresh token is worng", accounts: [] };
    const token = tokenRes.access_token;
    const accountsRes = await getAccounts(token);
    if (!accountsRes.account)
      return { status: "access token is wrong", accounts: [] };
    await Promise.all(
      accountsRes.account.map(async (account) => {
        let accountFullData = {
          acc_number: account.acc_number,
          amount: account.amount,
        };
        const transactions = await getTransactions(token, account.acc_number);
        if (transactions.status !== 200)
          accountFullData = { ...accountFullData, transactions: [] };
        else {
          const transactionList = await transactions.json();
          accountFullData = {
            ...accountFullData,
            transactions: transactionList.transactions.map((transaction) => ({
              label: transaction.label,
              amount: transaction.amount,
              currency: transaction.currency,
            })),
          };
        }
        accountsFullData.push(accountFullData);
      })
    );
    return { status: "authorized", accounts: accountsFullData };
  } catch (err) {
    console.log("err", err);
    return err;
  }
};

getAccountsFullData().then((result) => console.log(result.accounts));
