<template>
    <v-container fluid class="activity-form-container">
      <v-card class="activity-form-card mx-auto" max-width="800" elevation="8">
        <v-card-title class="text-h4 font-weight-bold text-center my-6">
          Welcome to our Activity!
        </v-card-title>
  
        <v-card-text>
          <!-- Name Input -->
          <v-text-field
            v-model="name"
            label="Enter your name"
            outlined
            dense
            hide-details="auto"
            class="mb-6"
            prepend-inner-icon="mdi-account"
          />
  
          <v-divider class="my-6"></v-divider>
  
          <!-- Action Sections -->
          <v-row>
            <!-- Create Lobby Section -->
            <v-col cols="12" sm="6" class="pa-10">
              <h2 class="text-h6 font-weight-bold text-center mb-4">Create a Lobby</h2>
  
              <p class="text-subtitle-1 mb-2">Select a game mode:</p>
              <v-row justify="center" class="mb-2">
                <v-col v-for="mode in modes" :key="mode.value" cols="12" sm="12">
                  <v-card
                    :class="['mode-card', { 'selected-card': selectedMode === mode.value }, 'pa-5']"
                    elevation="2"
                    :disabled="mode.disabled"
                    @click="selectMode(mode.value)"
                  >
                    <v-card-title class="text-center">{{ mode.label }}</v-card-title>
                  </v-card>
                </v-col>
              </v-row>
  
              <v-btn
                :disabled="!name || !selectedMode"
                color="primary"
                x-large
                rounded
                elevation="2"
                @click="startLobby"
                class="start-button font-weight-bold"
                block
              >
                Create Lobby
              </v-btn>
            </v-col>
  
            <v-divider vertical class="hidden-sm-and-down"></v-divider>
  
            <!-- Join Lobby Section -->
            <v-col cols="12" sm="6" class="d-flex flex-column align-items-center justify-center ma-auto pa-10">
                <h2 class="text-h6 font-weight-bold text-center mb-4">Join a Lobby</h2>

                <v-text-field
                    v-model="lobbyCode"
                    label="Enter Lobby Code"
                    outlined
                    dense
                    hide-details="auto"
                    class="mb-6"
                    prepend-inner-icon="mdi-key"
                />

                <v-btn
                    :disabled="!name || !lobbyCode"
                    color="primary"
                    x-large
                    rounded
                    elevation="2"
                    @click="joinLobby"
                    class="start-button font-weight-bold"
                    block
                >
                    Join Lobby
                </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
  
  <script setup>
  import { ref } from "vue";
  import { useRouter } from "vue-router";
  import { db, auth } from "../firebase";
  import { collection, addDoc, updateDoc, query, where, getDocs } from "firebase/firestore";
  import { nanoid } from "nanoid"; // Install nanoid: npm install nanoid
  
  const name = ref("");
  const selectedMode = ref("");
  const lobbyCode = ref("");
  const modes = ref([
    { label: "Would You Rather", value: "would_you_rather", disabled: true },
    { label: "World Trivia", value: "world_trivia" },
  ]);
  
  const router = useRouter();
  
  const selectMode = (mode) => {
    selectedMode.value = mode;
  };
  
  const startLobby = async () => {
    const user = auth.currentUser;
    const mode = selectedMode.value;

    const questionsSnapshot = await getDocs(
      query(collection(db, "questions"), where("mode", "==", mode))
    );
    const totalQuestions = questionsSnapshot.size;

    const code = nanoid(6);

    const lobby = await addDoc(collection(db, "lobbies"), {
      adminId: user.uid,
      players: [{ userId: user.uid, name: name.value, score: 0 }],
      mode,
      questionIndex: 0,
      code,
      totalQuestions,
      questionsAsked: 0,  // New field to track the number of questions actually asked
    });

    router.push(`/lobby?id=${lobby.id}&mode=${mode}`);
  };

  const joinLobby = async () => {
    const q = query(collection(db, "lobbies"), where("code", "==", lobbyCode.value));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const lobby = querySnapshot.docs[0];
      const lobbyRef = lobby.ref;
      const lobbyData = lobby.data();

      const user = auth.currentUser;
      if (!user) {
        alert("You must be signed in to join a lobby.");
        return;
      }

      const isAlreadyInLobby = lobbyData.players.some(
        (player) => player.userId === user.uid
      );

      if (!isAlreadyInLobby) {
        const newPlayer = { userId: user.uid, name: name.value, score: 0 };
        await updateDoc(lobbyRef, {
          players: [...lobbyData.players, newPlayer],
        });
      }

      router.push(`/lobby?id=${lobby.id}&mode=${lobbyData.mode}`);
    } else {
      alert("Invalid lobby code.");
    }
  };
  </script>
  
  <style scoped>  
  .hidden-sm-and-down {
    display: none;
  }
  
  @media (min-width: 960px) {
    .hidden-sm-and-down {
      display: block;
    }
  }

  .selected-card {
    background-color: rgb(55, 55, 184);
    color: white;
  }

  .mode-card.v-card--disabled {
    background-color: #e7e7e7;
  }
  </style>
  