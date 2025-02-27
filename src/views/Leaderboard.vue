<template>
  <v-container fluid class="activity-form-container">
    <v-card class="activity-form-card mx-auto" max-width="1000" elevation="8">
      <v-card-title class="text-h4 font-weight-bold text-center my-6">
        Results
      </v-card-title>

      <v-card-text>
        <!-- Conditional Render Based on Mode -->
        <template v-if="mode === 'world_trivia'">
          <v-row dense>
            <v-col
              v-for="player in sortedPlayers"
              :key="player.userId"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card class="pa-4 leaderboard-card" outlined>
                <v-card-title class="text-center">{{ player.name }}</v-card-title>
                <v-card-text class="text-center">
                  <v-progress-linear
                    :model-value="player.percentage"
                    color="primary"
                    height="20"
                    rounded
                  ></v-progress-linear>
                  <div class="mt-2">{{ player.percentage }}% ({{ player.score }}/{{ totalQuestions }})</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </template>

        <template v-else-if="mode === 'would_you_rather'">
          <v-list>
            <v-list-item
              v-for="(question, index) in questions"
              :key="index"
              class="question-item"
            >
              <!-- Question Title -->
              <div class="question-title mb-6">
                {{ question.text }}
              </div>

              <!-- Answer Statistics -->
              <v-row class="pa-1">
                <v-col
                  v-for="(option, optionIndex) in question.options"
                  :key="optionIndex"
                  cols="12"
                  sm="6"
                >
                  <v-card outlined class="pa-6 answer-card">
                    <v-card-title class="text-center answer-text">
                      {{ option.text }}
                    </v-card-title>
                    <v-progress-linear
                      :model-value="option.percentage"
                      color="primary"
                      height="20"
                      rounded
                    ></v-progress-linear>
                    <v-card-subtitle class="text-center mt-2">
                      {{ option.percentage }}% ({{ option.votes }} votes)
                    </v-card-subtitle>
                  </v-card>
                </v-col>
              </v-row>
            </v-list-item>
          </v-list>
        </template>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { doc, onSnapshot, getDocs, query, collection, where } from "firebase/firestore";
import { db } from "../firebase";
import { useRoute } from "vue-router";

const players = ref([]);
const answers = ref([]);
const questions = ref([]);
const totalQuestions = ref(0);
const route = useRoute();
const mode = route.query.mode;
const lobbyId = route.query.id;

onMounted(async () => {
  const lobbyDoc = doc(db, "lobbies", lobbyId);

  // Listen for real-time updates to the lobby document
  onSnapshot(lobbyDoc, async (snapshot) => {
    const lobbyData = snapshot.data();
    players.value = lobbyData.players || [];
    answers.value = lobbyData.answers || [];
    totalQuestions.value = lobbyData.totalQuestions || 0;

    if (mode.value === "would_you_rather") {
      // Fetch questions from the 'questions' collection based on mode
      questions.value = await loadQuestionsByMode("would_you_rather");
      parseQuestionsWithAnswers();
    }
  });
});

// Fetch questions for a specific mode
const loadQuestionsByMode = async (mode) => {
  const questionQuery = query(
    collection(db, "questions"),
    where("mode", "==", mode)
  );
  const querySnapshot = await getDocs(questionQuery);
  return querySnapshot.docs.map((doc) => doc.data());
};

// Parse questions and attach vote percentages
function parseQuestionsWithAnswers() {
  questions.value = questions.value.map((question, questionIndex) => {
    // Filter answers for the current question
    const currentQuestionAnswers = answers.value.filter(
      (answer) => answer.questionIndex === questionIndex
    );

    // Calculate total votes for this question
    const totalVotesForQuestion = currentQuestionAnswers.length;

    const options = question.answers.map((option, optionIndex) => {
      // Count votes for the current option
      const votes = currentQuestionAnswers.filter(
        (answer) => answer.answerIndex === optionIndex
      ).length;

      // Calculate percentage scoped to the current question
      const percentage = totalVotesForQuestion
        ? Math.round((votes / totalVotesForQuestion) * 100)
        : 0;

      return { text: option, votes, percentage };
    });

    return { text: question.question, options };
  });
}


// Compute sorted players for "World Trivia" mode
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
    .sort((a, b) => b.percentage - a.percentage);
});
</script>


<style scoped>
.question-item {
  margin-bottom: 16px;
}

.activity-form-container {
  max-width: 1200px; /* Increase the overall container width */
  margin: 0 auto;
  padding: 20px;
}

.activity-form-card {
  width: 100%;
  max-width: 1000px; /* Set a wider maximum width for the card */
  padding: 24px;
}

.question-title {
  font-size: 1.8rem; /* Slightly larger font for question titles */
  font-weight: bold;
  text-align: left;
  margin-bottom: 1.5rem; /* Add more space below each question */
}

.answer-card {
  margin-bottom: 1.5rem; /* Space between answer cards */
}

.answer-text {
  font-size: 1.3rem; /* Slightly larger font for answers */
  font-weight: 500;
}

.v-card-subtitle {
  font-size: 1rem;
  margin-top: 0.5rem;
}
</style>
