import { mb, mb_admin, init } from "mint_beach_js";
import initAuth from "./auth.js";
import cart from "./cart.plugin.js";

export default {
  install(Vue, options) {
    //Initialize base URL for API
    init(options.baseURL);

    const { currentUser, checkAuth, login, logout } = initAuth(options);

    //Add $mb and $mb_admin to Vue's gobal properties
    Vue.config.globalProperties.$mb = mb(options.tenantId, options.tenantId);
    Vue.config.globalProperties.$mb.auth.login = login;
    Vue.config.globalProperties.$mb.auth.logout = logout;
    Vue.config.globalProperties.$mb.auth.getCurrentUser = () => currentUser;
    Vue.config.globalProperties.$mb_admin = mb_admin;

    //Define a vue mixin that will be added to the root vue instance
    Vue.mixin({
      data() {
        return {
          currentUser: this.$mb.auth.getCurrentUser(),
        };
      },
      methods: {
        async loadCurrentUser() {
          await checkAuth();
        },
      },
    });

    //Use cart plugin
    Vue.use(cart);
  },
};
