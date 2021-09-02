import { reactive, toRefs } from "vue";
const STORAGE_KEY = "cart_items";

export default {
  install(Vue) {
    const state = reactive({
      cart: undefined,
      numItems: 0,
      cartValue: 0,
    });

    const addItem = (item, quantity) => {
      if (!state.cart) state.cart = {};
      if (!state.cart[item.id]) state.cart[item.id] = { ...item, quantity: 0 };
      state.cart[item.id].quantity += quantity;
      calculateMetadata();
      saveToStorage();
    };

    const removeItem = (itemID, quantity) => {
      if (!state.cart || !state.cart[itemID]) return;

      const numItems = state.cart[itemID];
      if (numItems <= quantity) delete state.cart[itemID];
      else state.cart[itemID] -= quantity;

      calculateMetadata();
      saveToStorage();
    };

    const clearCart = () => {
      state.cart = undefined;
      localStorage.removeItem(STORAGE_KEY);
      calculateMetadata();
    };

    const saveToStorage = () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart));
    };

    const loadFromStorage = () => {
      state.cart = JSON.parse(localStorage.getItem(STORAGE_KEY));
      calculateMetadata();
    };

    const calculateMetadata = () => {
      if (!state.cart) {
        state.cartValue = 0;
        state.numItems = 0;
        return;
      }

      let _cartValue = 0;
      let _numItems = 0;
      Object.keys(state.cart).forEach((id) => {
        const item = state.cart[id];
        _cartValue += item.quantity * item.price;
        _numItems += item.quantity;
      });

      state.cartValue = _cartValue;
      state.numItems = _numItems;
    };

    const { cart, numItems, cartValue } = toRefs(state);

    //Add $mb and $mb_admin to Vue's gobal properties
    Vue.config.globalProperties.$mb.cart = {};
    Vue.config.globalProperties.$mb.cart.getCart = cart;
    Vue.config.globalProperties.$mb.cart.getNumItems = numItems;
    Vue.config.globalProperties.$mb.cart.cartValue = cartValue;
    Vue.config.globalProperties.$mb.cart.addItem = addItem;
    Vue.config.globalProperties.$mb.cart.removeItem = removeItem;
    Vue.config.globalProperties.$mb.cart.clearCart = clearCart;
    Vue.config.globalProperties.$mb.cart.loadFromStorage = loadFromStorage;

    //Define a vue mixin that will be added to the root vue instance
    Vue.mixin({
      data() {
        return {
          cart: this.$mb.cart.getCart,
          numCartItems: this.$mb.cart.getNumItems,
          cartValue: this.$mb.cart.cartValue,
        };
      },
      created() {
        this.$mb.cart.loadFromStorage();
      },
    });
  },
};
