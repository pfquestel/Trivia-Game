<template>
    <v-container fluid class="activity-form-container">
      <v-card class="activity-form-card mx-auto" max-width="800" elevation="8">
        <v-card-title class="text-h4 font-weight-bold text-center my-6">
          Leaderboard
        </v-card-title>
  
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="player in sortedPlayers"
              :key="player.userId"
              class="player-list-item"
            >
              <v-list-item-content>
                <v-list-item-title>{{ player.name }}</v-list-item-title>
                <v-progress-linear
                  :model-value="player.percentage"
                  color="primary"
                  height="20"
                  rounded
                ></v-progress-linear>
                <v-list-item-subtitle>
                  {{ player.percentage }}% ({{ player.score }}/{{ totalQuestions }})
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
  
  
  <script setup>
import { ref, computed, onMounted } from "vue";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const players = ref([]);
const answers = ref([]);
const totalQuestions = ref(0); // Track total number of questions

// Dynamically calculate percentage scores for each player
const sortedPlayers = computed(() => {
  return players.value
    .map((player) => {
      const playerAnswers = answers.value.filter(
        (answer) => answer.userId === player.userId
      );
      const correctAnswers = playerAnswers.filter((answer) => answer.isCorrect).length;
      const percentage = totalQuestions.value
        ? Math.round((correctAnswers / totalQuestions.value) * 100)
        : 0;

      return { ...player, score: correctAnswers, percentage };
    })
    .sort((a, b) => b.percentage - a.percentage); // Sort by percentage
});

const lobbyId = new URLSearchParams(window.location.search).get("id");

onMounted(() => {
  const lobbyDoc = doc(db, "lobbies", lobbyId);

  // Listen for real-time updates to the lobby document
  onSnapshot(lobbyDoc, (snapshot) => {
    const lobbyData = snapshot.data();
    players.value = lobbyData.players;
    answers.value = lobbyData.answers || [];
    totalQuestions.value = lobbyData.totalQuestions || 0; // Ensure total questions are tracked
  });
});
</script>

  
  <style scoped>
  .player-list-item {
    margin-bottom: 16px;
  }
  </style>
  