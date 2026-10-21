import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';
import './styles/global.css';

const app = createApp(App);

app.config.errorHandler = (error, _instance, info) => {
  console.error({ event: 'vue_render_error', info, error });
};

window.addEventListener('unhandledrejection', (event) => {
  console.error({ event: 'unhandled_rejection', error: event.reason });
});

app.use(router).mount('#app');
