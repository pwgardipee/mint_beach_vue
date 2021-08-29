import { mb } from "mint_beach_js";
import { reactive, toRefs } from "vue";

const state = reactive({
  currentUser: undefined,
});

export default function initAuth(config) {
  const MB = mb(config.tenantId, config.tenantId);
  const login = async (email, password) => {
    const l = await MB.auth.login(email, password);
    localStorage.setItem("mb_tok", l.data.tokenManager.accessToken);
    await checkAuth();
    return l;
  };

  const logout = async () => {
    localStorage.removeItem("mb_tok");
    await checkAuth();
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("mb_tok");
      if (!token) throw new Error();
      MB.auth.setAuthHeading(token);
      const me = await MB.auth.me();
      state.currentUser = me.data;
    } catch {
      state.currentUser = undefined;
    }
  };

  return {
    ...toRefs(state), // convert to refs when returning
    login,
    logout,
    checkAuth,
  };
}
