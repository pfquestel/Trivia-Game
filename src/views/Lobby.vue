<template>
    <v-container fluid class="activity-form-container">
      <v-card class="activity-form-card mx-auto" max-width="1500" elevation="8">
        <v-card-title class="text-h4 font-weight-bold text-center my-6">
          Lobby
        </v-card-title>
  
        <v-card-text>
          <p class="text-subtitle-1 mb-2">Lobby Code: <strong>{{ lobbyCode }}</strong></p>
          <p class="text-subtitle-1 mb-2">Players in the Lobby:</p>

          <v-row class="player-grid pa-3" justify="center">
            <div
              v-for="player in players"
              :key="player.userId"
              class="player-item d-flex flex-column justify-center align-center"
            >
              <div class="avatar" :style="{ backgroundPosition: getAvatarPosition(player.avatar) }"></div>
              {{ player.name }}
            </div>
          </v-row>
        </v-card-text>
  
        <v-card-actions class="justify-center pb-6">
          <v-btn
            v-if="isAdmin"
            color="success"
            x-large
            rounded
            elevation="2"
            @click="startGame"
            class="start-button font-weight-bold"
          >
            Start Game
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import { doc, onSnapshot, updateDoc } from "firebase/firestore";
  import { db, auth } from "../firebase";
  import { getAvatarPosition } from "../utils/avatarUtils"; // Import helper function
  
  const players = ref([]);
  const isAdmin = ref(false);
  const router = useRouter();
  const lobbyCode = ref("");
  const isStarted = ref(false);
  const route = useRoute();
  const mode = route.query.mode;
  const lobbyId = route.query.id;
  
  onMounted(() => {
    const lobbyDoc = doc(db, "lobbies", lobbyId);
    onSnapshot(lobbyDoc, (snapshot) => {
        const lobbyData = snapshot.data();
        players.value = lobbyData.players;
        lobbyCode.value = lobbyData.code;
        isStarted.value = lobbyData.isStarted || false; // Default to false if undefined
        isAdmin.value = lobbyData.adminId === auth.currentUser.uid;

        // Redirect to the game if the game is started
        if (isStarted.value) {
        router.push(`/game?id=${lobbyId}&mode=${mode.value}`);
        }
    });
  });
  
  const startGame = async () => {
    const lobbyDoc = doc(db, "lobbies", lobbyId);
    await updateDoc(lobbyDoc, { isStarted: true });
    router.push(`/game?id=${lobbyId}&mode=${mode.value}`);
  };

  </script>
  
  <style scoped>
  </style>