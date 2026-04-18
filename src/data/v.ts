const BASE_URL: string = "https://api.wittyground-e489ec01.westus2.azurecontainerapps.io/api/v1"; //Laptop IP
// const localHost: string = "https://localhost:3000/"
// const server: string = "https://api.wittyground-e489ec01.westus2.azurecontainerapps.io/api/v1"


// async function ApiSwitcher(api: string) {
//   const response = await fetch(api);
//   if (!response.ok) {
//     return false;
//   }
//   return true;
// }

// // TODO -> use ApiSwitcher function to switch between dev server and deployed api

// const BASE_URL: string = (await ApiSwitcher("https://localhost:3000/")) ? localHost : server;


// =========================
// USER ENDPOINTS
// =========================
const USERS = `${BASE_URL}/users`;
const CREATE_USER = `${USERS}`; // POST
const GET_ALL_USERS = `${USERS}`; // GET
const GET_USER_BY_ID = (id: string) => `${USERS}/${id}`; // GET
const GET_USER_BY_EMAIL = (email: string) => `${USERS}/email/${email}`; // GET
const UPDATE_USER = (id: string) => `${USERS}/${id}`; // PUT
const DELETE_USER = (id: string) => `${USERS}/${id}`; // DELETE

// =========================
// AUTH ENDPOINTS
// =========================
const AUTH = `${BASE_URL}/auth`;
const LOGIN = `${BASE_URL}/login`; // POST
const LOGOUT = `${AUTH}/logout`; // POST (optional)
const REGISTER = `${AUTH}/register`; // POST (optional)

// =========================
// EXPORTS
// =========================
export {
  BASE_URL,

  // Users
  USERS,
  CREATE_USER,
  GET_ALL_USERS,
  GET_USER_BY_ID,
  GET_USER_BY_EMAIL,
  UPDATE_USER,
  DELETE_USER,

  // Auth
  AUTH,
  LOGIN,
  LOGOUT,
  REGISTER,
};
