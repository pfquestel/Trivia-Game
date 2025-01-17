import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify"; // Updated path
import "vuetify/styles"; // Import Vuetify styles
import '@mdi/font/css/materialdesignicons.css'; // Import MDI styles
import "./style.css"; // Your custom styles

createApp(App).use(router).use(vuetify).mount("#app");
