import { apiInstance } from "./index.js";

const api = apiInstance();

async function login(user, success, fail) {
  await api.post(`/user/login`, JSON.stringify(user)).then(success).catch(fail);
}

async function findById(userId, success, fail) {
  api.defaults.headers["access-token"] = sessionStorage.getItem("access-token");
  console.log("userId: " + userId);
  await api.get(`/user/info/${userId}`).then(success).catch(fail);
}

async function tokenRegeneration(user, success, fail) {
  api.defaults.headers["refresh-token"] = sessionStorage.getItem("refresh-token"); //axios header에 refresh-token 셋팅
  await api.post(`/user/refresh`, user).then(success).catch(fail);
}

async function logout(userId, success, fail) {
  await api.get(`/user/logout/${userId}`, { headers: { "X-ACCESS-TOKEN": "Bearer " + sessionStorage.getItem("refresh-token")}}).then(success).catch(fail);
}

async function idCheck(userId, success, fail) {
  await api.get(`/user/${userId}`).then(success).catch(fail);
}

async function join(user, success, fail) {
  await api.post(`/user/join`, JSON.stringify(user)).then(success).catch(fail);
}

async function modify(user, success, fail) {
  await api.put(`/user/modify`, JSON.stringify(user), { headers: { "X-ACCESS-TOKEN": "Bearer " + sessionStorage.getItem("refresh-token")}}).then(success).catch(fail);
}

async function resign(userId, success, fail) {
  await api.get(`/user/resign/${userId}`, { headers: { "X-ACCESS-TOKEN": "Bearer " + sessionStorage.getItem("refresh-token")}}).then(success).catch(fail);
}

async function sendPwdMail(findUser, success, fail) {
  await api.post(`/user/find`, findUser, { headers: { "X-ACCESS-TOKEN": "Bearer " + sessionStorage.getItem("refresh-token")}}).then(success).catch(fail);
}

export { login, findById, tokenRegeneration, logout, idCheck, join, modify, resign, sendPwdMail };
