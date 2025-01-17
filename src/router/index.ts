import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Lobby from "../views/Lobby.vue";
import Game from "../views/Game.vue";
import Leaderboard from "../views/Leaderboard.vue";

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/lobby", name: "Lobby", component: Lobby },
  { path: "/game", name: "Game", component: Game },
  { path: "/leaderboard", name: "Leaderboard", component: Leaderboard },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;