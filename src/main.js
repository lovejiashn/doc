import { createApp } from 'vue'
import Home from './views/Home'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css';

createApp(Home).use(store).use(router).use(ElementPlus).mount('#app')
