<template>
  <v-app>
    <!-- Navigation Bar -->
    <v-app-bar app color="white" dark>
      <v-btn icon to="/">
        <v-icon>mdi-home</v-icon>
      </v-btn>
      <v-toolbar-title>Trivia Game</v-toolbar-title>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container class="fill-height">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
/* Optional: Style the main container if needed */
.fill-height {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
