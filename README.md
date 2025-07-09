## 🎯 **New: Real-Time Formant Analysis**

Kotoba now includes cutting-edge real-time phonetic analysis capabilities:

### Features
- **Live Formant Tracking**: Real-time visualization of F1 and F2 formant frequencies as you speak
- **Interactive Vowel Space**: Dynamic plotting on IPA vowel charts with trajectory tracking
- **IPA Vowel Classification**: Instant detection and classification of vowel sounds
- **Multi-speaker Models**: Adaptive analysis for male, female, and child voice patterns
- **Confidence Scoring**: Visual feedback on measurement reliability
- **WebSocket Streaming**: Low-latency audio processing for smooth real-time experience

### Quick Start
1. **One-Command Setup**: Run `./start_realtime_formants.sh` to start both servers
2. **Navigate**: Go to `/realtime-formants` in the application
3. **Start Recording**: Click "Start Recording" and speak vowel sounds
4. **Watch Visualization**: See your formants plotted live with confidence indicators

### Access Points
- **Real-time Analysis**: `/realtime-formants` - Live formant visualization
- **Batch Analysis**: `/formants` - Upload and analyze audio files
- **Navigation**: Use "Real-time" and "Formants" links in the navigation bar

### Technical Documentation
- `REALTIME_FORMANTS.md` - Comprehensive real-time analysis guide
- `FORMANT_INTEGRATION.md` - Technical implementation details

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
