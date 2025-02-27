<template>
    <v-container fluid class="activity-form-container">
      <v-card class="activity-form-card mx-auto" max-width="800" elevation="8">
        <v-card-title class="text-h4 font-weight-bold text-center my-6 text-wrap">
          {{ currentQuestion.question }}
        </v-card-title>
  
        <v-card-text>
          <!-- Answer Options -->
          <v-row justify="center" class="mb-2">
            <v-col
              v-for="(answer, index) in randomizedAnswers"
              :key="index"
              cols="12"
              sm="6"
            >
              <v-btn
                class="mode-card pa-4"
                :class="{ 
                  'selected-card': selectedAnswer === index,
                  'correct-answer': selectedAnswer !== null && answerMapping[index] === correctAnswerIndex,
                  'wrong-answer': selectedAnswer !== null && answerMapping[index] !== correctAnswerIndex && selectedAnswer === index
                }"
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

          <v-alert v-if="selectedAnswer !== null" type="success" class="mt-6">
            Correct Answer: {{ currentQuestion.answers[correctAnswerIndex] }}
          </v-alert>
  
          <!-- Display Results -->
          <!-- <v-alert v-if="currentQuestionAnswerCount > 0" type="info" class="mt-6">
              Votes Received: {{ currentQuestionAnswerCount }}
          </v-alert> -->

        </v-card-text>
  
        <!-- Next Question Button for Admin -->
        <v-card-actions class="justify-center pb-6">
          <v-btn
            v-if="isAdmin"
            color="success"
            x-large
            rounded
            elevation="2"
            @click="nextQuestion"
            class="start-button font-weight-bold"
          >
            Next Question
            <v-icon v-if="!allAnswered" class="ml-2">mdi-alert-circle-outline</v-icon>
          </v-btn>
          <p v-if="isAdmin && !allAnswered" class="text-caption mt-2">
            Not all players have answered yet.
          </p>

          <!-- End Game Button -->
          <v-btn
            v-if="isAdmin"
            color="error"
            x-large
            rounded
            elevation="2"
            @click="showEndGameDialog = true"
            class="start-button font-weight-bold ml-4"
          >
            End Game
          </v-btn>
        </v-card-actions>

        <!-- Vuetify Dialog for End Game Confirmation -->
        <v-dialog v-model="showEndGameDialog" max-width="500">
          <v-card>
            <v-card-title class="text-h5">End Game Confirmation</v-card-title>
            <v-card-text>Are you sure you want to end the game? This action cannot be undone.</v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="grey" text @click="showEndGameDialog = false">Cancel</v-btn>
              <v-btn color="error" text @click="endGame">End Game</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card>
    </v-container>
  </template>
  
  
  <script setup>
import { ref, onMounted, computed } from "vue";
import { doc, onSnapshot, updateDoc, getDocs, query, collection, where, arrayUnion } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useRouter } from "vue-router";

const showEndGameDialog = ref(false);
const currentQuestion = ref({ question: "", answers: [] });
const currentQuestionIndex = ref(null); // Track the current question index
const randomizedAnswers = ref([]);
const answerMapping = ref([]); // Maps randomized indices back to original indices
const correctAnswerIndex = ref(0); // Always the first answer in the original list
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

// Computed property to get the total number of answers for the current question
const currentQuestionAnswerCount = computed(() => {
  if (!results.value || currentQuestionIndex.value === null) return 0;

  // Filter answers for the current question
  const currentQuestionAnswers = results.value.filter(
    (answer) => answer.questionIndex === currentQuestionIndex.value
  );

  return currentQuestionAnswers.length;
});

onMounted(() => {
  const lobbyDoc = doc(db, "lobbies", lobbyId);

  // Listen for changes in the lobby document
  onSnapshot(lobbyDoc, async (snapshot) => {
    const lobbyData = snapshot.data();
    players.value = lobbyData.players;
    const mode = lobbyData.mode;

    // Load questions if not already loaded
    if (!questions.value.length) {
      questions.value = await loadQuestions(mode);
    }

    // Redirect to leaderboard if the game is complete
    if (lobbyData.questionIndex >= questions.value.length) {
      router.push(`/leaderboard?id=${lobbyId}&mode=${mode}`);
    } else {
      // Reset selectedAnswer only if the questionIndex changes
      if (currentQuestionIndex.value !== lobbyData.questionIndex) {
        currentQuestionIndex.value = lobbyData.questionIndex; // Update the current index
        currentQuestion.value = questions.value[lobbyData.questionIndex]; // Update the question
        selectedAnswer.value = null; // Reset selectedAnswer only when question changes

        // Store the correct answer index (always the first answer in the original list)
        correctAnswerIndex.value = 0;

        // Create a mapping and randomize the answers
        const answersWithIndices = currentQuestion.value.answers.map((answer, index) => ({ answer, index }));
        const randomized = answersWithIndices.sort(() => Math.random() - 0.5);

        randomizedAnswers.value = randomized.map((item) => item.answer);
        answerMapping.value = randomized.map((item) => item.index);
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

  // Map the selected randomized index back to the original index
  const originalIndex = answerMapping.value[index];
  const isCorrect = originalIndex === correctAnswerIndex.value;

  // Add questionIndex to each answer
  await updateDoc(lobbyDoc, {
    answers: arrayUnion({
      userId,
      answerIndex: originalIndex,
      isCorrect,
      questionIndex: currentQuestionIndex.value, // Tag with the current question index
    }),
  });
};

// Admin function to advance to the next question
const nextQuestion = async () => {
  // if (!allAnswered.value) return; // Prevent advancing if not all players have answered

  const lobbyDoc = doc(db, "lobbies", lobbyId);
  const newIndex = currentQuestionIndex.value + 1;

  await updateDoc(lobbyDoc, { questionIndex: newIndex });
};

const endGame = async () => {
  const lobbyDoc = doc(db, "lobbies", lobbyId);
  await updateDoc(lobbyDoc, { questionIndex: questions.value.length });
  showEndGameDialog.value = false;
};

</script>

<style scoped>
.correct-answer {
  background-color: #4caf50 !important;
  color: white !important;
}

.wrong-answer {
  background-color: #f44336 !important;
  color: white !important;
}

.selected-card {
  border: 2px solid #000 !important;
}
</style>