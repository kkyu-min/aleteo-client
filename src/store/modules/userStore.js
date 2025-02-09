import jwtDecode from 'jwt-decode';
import router from "@/router";
import { login, findById, tokenRegeneration, logout, idCheck, join, modify, resign, sendPwdMail, sendAdminEmail } from "@/api/user";

const userStore = {
  namespaced: true,
  state: {
    isLogin: false,
    isLoginError: false,
    userInfo: null,
    isValidToken: false,
    isValidId: false,
    isJoin: false,
    isModify: false,
    isSendPwdMail: false,
    isSendAdminMail: false,
    adminKey: null,
  },
  getters: {
    checkUserInfo: function (state) {
      return state.userInfo;
    },
    checkToken: function (state) {
      return state.isValidToken;
    },
  },
  mutations: {
    SET_IS_LOGIN: (state, isLogin) => {
      state.isLogin = isLogin;
    },
    SET_IS_LOGIN_ERROR: (state, isLoginError) => {
      state.isLoginError = isLoginError;
    },
    SET_IS_VALID_TOKEN: (state, isValidToken) => {
      state.isValidToken = isValidToken;
    },
    SET_USER_INFO: (state, userInfo) => {
      state.isLogin = true;
      state.userInfo = userInfo;
      // console.log("userInfo: " + state.userInfo);
    },
    SET_IS_VALID_ID: (state, isValidId) => {
      state.isValidId = isValidId;
    },
    SET_IS_JOIN: (state, isJoin) => {
      state.isJoin = isJoin;
    },
    SET_IS_MODIFY: (state, isModify) => {
      state.isModify = isModify;
    },
    SET_IS_SEND_PWD_MAIL: (state, isSendPwdMail) => {
      state.isSendPwdMail = isSendPwdMail;
    },
    SET_IS_SEND_ADMIN_MAIL: (state, isSendAdminMail) => {
      state.isSendAdminMail = isSendAdminMail;
    },
    SET_ADMIN_NUM: (state, adminKey) => {
      state.adminKey = adminKey;
    }
  },
  actions: {
    async userConfirm({ commit }, user) {
      await login(
        user,
        ({ data }) => {
          if (data.message === "success") {
            let accessToken = data["access-token"];
            let refreshToken = data["refresh-token"];
            // console.log("login success token created!!!! >> ", accessToken, refreshToken);
            commit("SET_IS_LOGIN", true);
            commit("SET_IS_LOGIN_ERROR", false);
            commit("SET_IS_VALID_TOKEN", true);
            sessionStorage.setItem("access-token", accessToken);
            sessionStorage.setItem("refresh-token", refreshToken);
          } else {
            commit("SET_IS_LOGIN", false);
            commit("SET_IS_LOGIN_ERROR", true);
            commit("SET_IS_VALID_TOKEN", false);
          }
        },
        (error) => {
          console.log(error);
        }
      );
    },
    async getUserInfo({ commit, dispatch }, token) {
      let decodeToken = jwtDecode(token);
      // console.log("2. getUserInfo() decodeToken :: ", decodeToken);
      await findById(
        decodeToken.userId,
        ({ data }) => {
          // console.log(data);
          if (data.message === "success") {
            // console.log("userData :: ");
            // console.log(data);
            commit("SET_USER_INFO", data.userInfo);
            // console.log("3. getUserInfo data >> ", data);
          } else {
            console.log("유저 정보 없음!!!!");
          }
        },
        async (error) => {
          console.log("getUserInfo() error code [토큰 만료되어 사용 불가능.] ::: ", error.response.status);
          commit("SET_IS_VALID_TOKEN", false);
          await dispatch("tokenRegeneration");
        }
      );
    },
    async tokenRegeneration({ commit, state }) {
      // console.log("토큰 재발급 >> 기존 토큰 정보 : {}", sessionStorage.getItem("access-token"));
      await tokenRegeneration(
        JSON.stringify(state.userInfo),
        ({ data }) => {
          if (data.message === "success") {
            let accessToken = data["access-token"];
            // console.log("재발급 완료 >> 새로운 토큰 : {}", accessToken);
            sessionStorage.setItem("access-token", accessToken);
            commit("SET_IS_VALID_TOKEN", true);
          }
        },
        async (error) => {
          // HttpStatus.UNAUTHORIZE(401) : RefreshToken 기간 만료 >> 다시 로그인!!!!
          if (error.response.status === 401) {
            console.log("갱신 실패");
            // 다시 로그인 전 DB에 저장된 RefreshToken 제거.
            await logout(
              state.userInfo.userId,
              ({ data }) => {
                if (data.message === "success") {
                  console.log("리프레시 토큰 제거 성공");
                } else {
                  console.log("리프레시 토큰 제거 실패");
                }
                alert("RefreshToken 기간 만료!!! 다시 로그인해 주세요.");
                commit("SET_IS_LOGIN", false);
                commit("SET_USER_INFO", null);
                commit("SET_IS_VALID_TOKEN", false);
                router.push({ name: "login" });
              },
              (error) => {
                console.log(error);
                commit("SET_IS_LOGIN", false);
                commit("SET_USER_INFO", null);
              }
            );
          }
        }
      );
    },
    async userLogout({ commit }, userId) {
      await logout(
        userId,
        ({ data }) => {
          if (data.message === "success") {
            commit("SET_IS_LOGIN", false);
            commit("SET_USER_INFO", null);
            commit("SET_IS_VALID_TOKEN", false);
          } else {
            console.log("유저 정보 없음");
          }
        },
        (error) => {
          console.log(error);
        }
      )
    },
    async idConfirm({ commit }, userId) {
      await idCheck(
        userId,
        ({ data }) => {
          if (data === 0) {
            commit("SET_IS_VALID_ID", true);
          } else {
            commit("SET_IS_VALID_ID", false);
            console.log("유저 정보 없음");
          }
        },
        (error) => {
          console.log(error);
        }
      )
    },
    async userJoin({ commit }, user) {
      await join(
        user,
        ({ data }) => {
          if (data.message === "success") {
            commit("SET_IS_JOIN", true);
          } else {
            commit("SET_IS_JOIN", false);
          }
        },
        (error) => {
          console.log(error);
        }
      )
    },
    async userModify({ commit }, user) {
      await modify(
        user,
        ({ data }) => {
          if (data.message === "success") {
            commit("SET_IS_MODIFY", true);
          } else {
            commit("SET_IS_MODIFY", false);
          }
        },
        (error) => {
          console.log(error);
        }
      )
    },
    async userResign({ commit }, userId) {
      await resign(
        userId,
        ({ data }) => {
          if (data.message === "success") {
            commit("SET_IS_RESIGN", true);
            commit("SET_IS_LOGIN", false);
            commit("SET_USER_INFO", null);
            commit("SET_IS_VALID_TOKEN", false);
          } else {
            commit("SET_IS_RESIGN", false);
          }
        }
      )
    },
    // 비밀번호 찾기
    async sendUserPwdMail({ commit }, findUser) {
      await sendPwdMail(
        findUser,
        ({ data }) => {
          if (data.message === "success") {
            commit("SET_IS_SEND_PWD_MAIL", true);
          } else {
            commit("SET_IS_SEND_PWD_MAIL", false);
          }
        }
      )
    },
    // 이메일 인증 보내기
    async sendUserAdminEmail({ commit }, [emailId, emailDomain]) {
      await sendAdminEmail(
        [emailId, emailDomain],
        ({ data }) => {
          if (data.message === "success") {
            // console.log("data ::");
            // console.log(data);
            commit("SET_IS_SEND_ADMIN_MAIL", true);
            commit("SET_ADMIN_NUM", data.adminKey);
          } else {
            commit("SET_IS_SEND_ADMIN_MAIL", false);
          }
        }
      )
    },
  }
};

export default userStore;