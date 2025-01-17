<template>
    <v-container fluid class="activity-form-container">
      <v-card class="activity-form-card mx-auto" max-width="800" elevation="8">
        <v-card-title class="text-h4 font-weight-bold text-center my-6">
          {{ currentQuestion.question }}
        </v-card-title>
  
        <v-card-text>
          <!-- Answer Options -->
          <v-row justify="center" class="mb-2">
            <v-col
              v-for="(answer, index) in currentQuestion.answers"
              :key="index"
              cols="12"
              sm="6"
            >
              <v-btn
                class="mode-card pa-4"
                :class="{ 'selected-card': selectedAnswer === index }"
                :disabled="selectedAnswer !== null"
                color="primary"
                elevation="2"
                block
                @click="submitAnswer(index)"
              >
                {{ answer }}
              </v-btn>
            </v-col>
          </v-row>
  
          <!-- Display Results -->
            <v-alert v-if="results" type="info" class="mt-6">
                Votes Received: {{ results.length }}
            </v-alert>

        </v-card-text>
  
        <!-- Next Question Button for Admin -->
        <v-card-actions class="justify-center pb-6">
          <v-btn
            v-if="isAdmin"
            :disabled="!allAnswered"
            color="success"
            x-large
            rounded
            elevation="2"
            @click="nextQuestion"
            class="start-button font-weight-bold"
          >
            Next Question
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </template>
  
  
  <script setup>
import { ref, onMounted, computed } from "vue";
import { doc, onSnapshot, updateDoc, getDocs, query, collection, where, arrayUnion } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useRouter } from "vue-router";

const currentQuestion = ref({ question: "", answers: [] });
const currentQuestionIndex = ref(null); // Track the current question index
const results = ref(null);
const isAdmin = ref(false);
const questions = ref([]);
const selectedAnswer = ref(null); // Tracks the selected answer
const players = ref([]);
const lobbyId = new URLSearchParams(window.location.search).get("id");
const router = useRouter();

// Computed property to check if all players have answered
const allAnswered = computed(() => {
  if (!results.value || players.value.length === 0) return false;

  // Filter answers for the current question
  const currentQuestionAnswers = results.value.filter(
    (answer) => answer.questionIndex === currentQuestionIndex.value
  );

  // Check if all players have submitted an answer
  return currentQuestionAnswers.length === players.value.length;
});


onMounted(() => {
  const lobbyDoc = doc(db, "lobbies", lobbyId);

  // Listen for changes in the lobby document
  onSnapshot(lobbyDoc, async (snapshot) => {
    const lobbyData = snapshot.data();
    players.value = lobbyData.players;

    // Load questions if not already loaded
    if (!questions.value.length) {
      const mode = lobbyData.mode;
      questions.value = await loadQuestions(mode);
    }

    // Redirect to leaderboard if the game is complete
    if (lobbyData.questionIndex >= questions.value.length) {
      router.push(`/leaderboard?id=${lobbyId}`);
    } else {
      // Reset selectedAnswer only if the questionIndex changes
      if (currentQuestionIndex.value !== lobbyData.questionIndex) {
        currentQuestionIndex.value = lobbyData.questionIndex; // Update the current index
        currentQuestion.value = questions.value[lobbyData.questionIndex]; // Update the question
        selectedAnswer.value = null; // Reset selectedAnswer only when question changes
      }
    }

    results.value = lobbyData.answers || [];
    isAdmin.value = lobbyData.adminId === auth.currentUser.uid;
  });
});

// Function to load questions based on the game mode
const loadQuestions = async (mode) => {
  const querySnapshot = await getDocs(
    query(collection(db, "questions"), where("mode", "==", mode))
  );
  return querySnapshot.docs.map((doc) => doc.data());
};

// Submit the current user's answer
const submitAnswer = async (index) => {
  if (selectedAnswer.value !== null) return;

  selectedAnswer.value = index;
  const lobbyDoc = doc(db, "lobbies", lobbyId);
  const userId = auth.currentUser.uid;

  const isCorrect = currentQuestion.value.correctAnswerIndex === index;

  // Add questionIndex to each answer
  await updateDoc(lobbyDoc, {
    answers: arrayUnion({
      userId,
      answerIndex: index,
      isCorrect,
      questionIndex: currentQuestionIndex.value, // Tag with the current question index
    }),
  });
};


// Admin function to advance to the next question
const nextQuestion = async () => {
  if (!allAnswered.value) return; // Prevent advancing if not all players have answered

  const lobbyDoc = doc(db, "lobbies", lobbyId);
  const newIndex = currentQuestionIndex.value + 1;

  await updateDoc(lobbyDoc, { questionIndex: newIndex });
};
</script>

  
<style scoped>
</style>
