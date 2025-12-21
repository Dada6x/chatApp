
```
chatApp
├─ backend
│  ├─ controller
│  │  ├─ auth_controller.js
│  │  ├─ message_Hall_controller.js
│  │  ├─ private_message_controller.js
│  │  └─ user_controller.js
│  ├─ middlewares
│  │  └─ middlewares.js
│  ├─ model
│  │  ├─ message_model.js
│  │  └─ user_model.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ README.md
│  ├─ routes
│  │  ├─ auth_routes.js
│  │  ├─ messages_routes.js
│  │  └─ user_routes.js
│  ├─ server.js
│  ├─ socket.js
│  ├─ test_private_messages.js
│  └─ utils
│     └─ jwt_helper.js
├─ front
│  └─ chat
│     ├─ backend
│     │  ├─ controller
│     │  │  ├─ auth_controller.js
│     │  │  ├─ message_Hall_controller.js
│     │  │  ├─ private_message_controller.js
│     │  │  └─ user_controller.js
│     │  ├─ middlewares
│     │  │  └─ middlewares.js
│     │  ├─ model
│     │  │  ├─ message_model.js
│     │  │  └─ user_model.js
│     │  ├─ package-lock.json
│     │  ├─ package.json
│     │  ├─ README.md
│     │  ├─ routes
│     │  │  ├─ auth_routes.js
│     │  │  ├─ messages_routes.js
│     │  │  ├─ private_messages_routes.js
│     │  │  └─ user_routes.js
│     │  ├─ server.js
│     │  ├─ socket.js
│     │  └─ utils
│     │     └─ jwt_helper.js
│     └─ chat_realTime
│        ├─ api.js
│        ├─ dist
│        │  ├─ assets
│        │  │  ├─ index-C_1m2jOY.css
│        │  │  └─ index-DytJKTjr.js
│        │  └─ index.html
│        ├─ eslint.config.js
│        ├─ index.html
│        ├─ my-react-router-app
│        │  ├─ .dockerignore
│        │  ├─ app
│        │  │  ├─ app.css
│        │  │  ├─ root.tsx
│        │  │  ├─ routes
│        │  │  │  └─ home.tsx
│        │  │  ├─ routes.ts
│        │  │  └─ welcome
│        │  │     ├─ logo-dark.svg
│        │  │     ├─ logo-light.svg
│        │  │     └─ welcome.tsx
│        │  ├─ Dockerfile
│        │  ├─ package-lock.json
│        │  ├─ package.json
│        │  ├─ public
│        │  │  └─ favicon.ico
│        │  ├─ react-router.config.ts
│        │  ├─ README.md
│        │  ├─ tsconfig.json
│        │  └─ vite.config.ts
│        ├─ package-lock.json
│        ├─ package.json
│        ├─ public
│        ├─ README.md
│        ├─ src
│        │  ├─ App.jsx
│        │  ├─ assets
│        │  │  └─ bg.jpg
│        │  ├─ components
│        │  │  ├─ chat
│        │  │  │  ├─ ChatCard.jsx
│        │  │  │  ├─ userCard.jsx
│        │  │  │  └─ Users.jsx
│        │  │  └─ ui
│        │  │     ├─ addUserButton.jsx
│        │  │     ├─ Button.jsx
│        │  │     └─ sendButton.jsx
│        │  ├─ index.css
│        │  ├─ main.jsx
│        │  ├─ pages
│        │  │  ├─ Chat.jsx
│        │  │  ├─ logIn.jsx
│        │  │  ├─ Profile.jsx
│        │  │  └─ Rejester.jsx
│        │  ├─ redux
│        │  │  ├─ slices
│        │  │  │  ├─ authSlice.js
│        │  │  │  └─ chatSlice.js
│        │  │  └─ store.js
│        │  └─ services
│        │     └─ socketService.js
│        └─ vite.config.js
├─ Mobile
│  ├─ .expo
│  │  ├─ devices.json
│  │  ├─ README.md
│  │  ├─ types
│  │  │  └─ router.d.ts
│  │  └─ web
│  │     └─ cache
│  │        └─ production
│  │           └─ images
│  │              ├─ android-adaptive-background
│  │              │  └─ android-adaptive-background-fb139c2dee362ebf2070e23b96da6fc0d43f8492de38b8af1fd7223e19b5861d-cover-transparent
│  │              │     ├─ icon_108.png
│  │              │     ├─ icon_162.png
│  │              │     ├─ icon_216.png
│  │              │     ├─ icon_324.png
│  │              │     └─ icon_432.png
│  │              ├─ android-adaptive-foreground
│  │              │  └─ android-adaptive-foreground-9e3d0315a33c6799de601dd34cd8bf8cc3a8d16f3bf75592baec2ceb7240b391-cover-transparent
│  │              │     ├─ icon_108.png
│  │              │     ├─ icon_162.png
│  │              │     ├─ icon_216.png
│  │              │     ├─ icon_324.png
│  │              │     └─ icon_432.png
│  │              ├─ android-adaptive-monochrome
│  │              │  └─ android-adaptive-monochrome-6371fc2c12e33ad2215a86c281db3d682a81bebe7c957a842c13b8bf00cceb83-cover-transparent
│  │              │     ├─ icon_108.png
│  │              │     ├─ icon_162.png
│  │              │     ├─ icon_216.png
│  │              │     ├─ icon_324.png
│  │              │     └─ icon_432.png
│  │              ├─ android-standard-circle
│  │              │  └─ android-standard-circle-9e3d0315a33c6799de601dd34cd8bf8cc3a8d16f3bf75592baec2ceb7240b391-cover-transparent
│  │              │     ├─ icon_144.png
│  │              │     ├─ icon_192.png
│  │              │     ├─ icon_48.png
│  │              │     ├─ icon_72.png
│  │              │     └─ icon_96.png
│  │              ├─ android-standard-round-background
│  │              │  └─ android-standard-round-background-fb139c2dee362ebf2070e23b96da6fc0d43f8492de38b8af1fd7223e19b5861d-cover-transparent
│  │              │     ├─ icon_144.png
│  │              │     ├─ icon_192.png
│  │              │     ├─ icon_48.png
│  │              │     ├─ icon_72.png
│  │              │     └─ icon_96.png
│  │              ├─ android-standard-square
│  │              │  └─ android-standard-square-9e3d0315a33c6799de601dd34cd8bf8cc3a8d16f3bf75592baec2ceb7240b391-cover-transparent
│  │              │     ├─ icon_144.png
│  │              │     ├─ icon_192.png
│  │              │     ├─ icon_48.png
│  │              │     ├─ icon_72.png
│  │              │     └─ icon_96.png
│  │              ├─ android-standard-square-background
│  │              │  └─ android-standard-square-background-fb139c2dee362ebf2070e23b96da6fc0d43f8492de38b8af1fd7223e19b5861d-cover-transparent
│  │              │     ├─ icon_144.png
│  │              │     ├─ icon_192.png
│  │              │     ├─ icon_48.png
│  │              │     ├─ icon_72.png
│  │              │     └─ icon_96.png
│  │              ├─ favicon
│  │              │  └─ favicon-a4e030697a7571b3e95d31860e4da55d2f98e5e861e2b55e414f45a8556828ba-contain-transparent
│  │              │     └─ favicon-48.png
│  │              └─ splash-android
│  │                 └─ splash-android-5f4c0a732b6325bf4071d9124d2ae67e037cb24fcc9c482ef82bea742109a3b8-contain
│  │                    ├─ icon_200.png
│  │                    ├─ icon_300.png
│  │                    ├─ icon_400.png
│  │                    ├─ icon_600.png
│  │                    └─ icon_800.png
│  ├─ app
│  │  ├─ api.js
│  │  ├─ auth
│  │  │  ├─ login.jsx
│  │  │  └─ signup.jsx
│  │  ├─ components
│  │  │  └─ userCard.jsx
│  │  ├─ context
│  │  │  └─ AuthContext.jsx
│  │  ├─ index.jsx
│  │  ├─ tabs
│  │  │  ├─ hall.tsx
│  │  │  ├─ messages.tsx
│  │  │  ├─ profile.tsx
│  │  │  └─ _layout.jsx
│  │  └─ _layout.jsx
│  ├─ app.json
│  ├─ assets
│  │  └─ images
│  │     ├─ android-icon-background.png
│  │     ├─ android-icon-foreground.png
│  │     ├─ android-icon-monochrome.png
│  │     ├─ b.png
│  │     ├─ ben.jpg
│  │     ├─ dog.jpg
│  │     ├─ favicon.png
│  │     ├─ icon.png
│  │     ├─ luffy.jpg
│  │     ├─ messi.jpg
│  │     ├─ partial-react-logo.png
│  │     ├─ react-logo.png
│  │     ├─ react-logo@2x.png
│  │     ├─ react-logo@3x.png
│  │     ├─ ronaldo.jpg
│  │     ├─ sar.jpg
│  │     ├─ sha.jpg
│  │     ├─ splash-icon.png
│  │     ├─ tom.jpg
│  │     ├─ za.jpg
│  │     └─ zebraa.jpg
│  ├─ babel.config.js
│  ├─ eslint.config.js
│  ├─ expo-env.d.ts
│  ├─ global.css
│  ├─ metro.config.js
│  ├─ nativewind-env.d.ts
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ README.md
│  ├─ tailwind.config.js
│  └─ tsconfig.json
└─ README.md

```