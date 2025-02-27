import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  //base: '/Trivia-Game/',  // Match your GitHub repository name
  build: {
      outDir: 'dist'
  },
  define: {
    'import.meta.env.VITE_FIREBASE_ENCRYPTED': JSON.stringify("8e7d3e493b18b2cf418945a76f46e104:58053388347787d18bb76798690761e3e579463ee95b2b1733ce32811f9c83a2ca16f6b50c8bf8cd020d555d3e05a7325e3db5613f6d24f25cbd7ee36be317daf17e2c2adf8888565828a1ac71936224df8c532c7df12c9d3227685bebd0de6976ab4d5df13c75b8c7eaa9ff8c56a0dcc2fca6f70ac7a68647fdbf54f891033e95b14d92fcea611638503cd769607317fd630001d1175a2ce487d6e787a8554af6dddf744d667cc83eb0949c4c3914f368098df2e3a26adc2009fea7bf561864fe6e094e141dd08aa6f1917184e358b9b785b3c31ef743f3546c93a412429ed18661c5e9be7e8405bfbc624bc426ba6830d5a01c1b0554db5381cb3086836768824967f56c4f36324006b4e391fd5bf449334e42b6641338d2863baced0e8e26"),
    'import.meta.env.VITE_FIREBASE_KEY': JSON.stringify("32a25a2d67559d3ee98aca0b17ba9a4f219c37222312222c1dc25a717a248861"),
  },
})
