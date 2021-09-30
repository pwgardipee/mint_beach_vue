import { mb } from "mint_beach_js";
import { reactive, toRefs } from "vue";

const STORAGE_TOKEN = "mb_tok";

const state = reactive({
  currentUser: undefined,
});

export default function initAuth(config) {
  const MB = mb(config.tenantId, config.tenantId);

  const login = async (email, password) => {
    const l = await MB.auth.login(email, password);
    localStorage.setItem(STORAGE_TOKEN, l.data.tokenManager.accessToken);
    await checkAuth();
    return l;
  };

  const logout = async () => {
    localStorage.removeItem(STORAGE_TOKEN);
    await checkAuth();
  };

  const signup = async (email, password, name) => {
    const s = await MB.auth.signup(email, password, name);
    localStorage.setItem(STORAGE_TOKEN, s.data.tokenManager.accessToken);
    await checkAuth();
    return s;
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem(STORAGE_TOKEN);
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
    signup,
    checkAuth,
  };
}
