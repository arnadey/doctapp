# DocTapp mobile app

This Expo React Native app uses the DocTapp Django API.

## Configuration

Set `EXPO_PUBLIC_API_BASE_URL` in `.env.local` when the default is not suitable:

- iOS Simulator: `http://localhost:8000/api/v1`
- Android Emulator: `http://10.0.2.2:8000/api/v1`
- Physical device: `http://<computer-LAN-IP>:8000/api/v1`

The app defaults to the iOS URL on iOS/web and the Android URL on Android. Never commit `.env.local`.

## Backend

From the Django backend directory, install its dependencies, run migrations, and start:

```bash
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

For a physical device, allow port 8000 through the computer firewall and use the computer's LAN IP.

## Authentication

Tokens are stored in Expo SecureStore. Startup loads tokens and validates the session with `GET /accounts/me/`. Protected requests use the access token; one failed request triggers a single refresh, stores rotated tokens, and retries once. Refresh failure clears credentials and returns to sign in. Logout calls the backend and clears local credentials even if the request fails.

Available screens include sign in, registration, forgot/reset password, profile, edit profile, and change password. Backend validation and account-status errors are shown to the user.

## Commands

```bash
npm install
npx expo start
npm run lint
npx tsc --noEmit
```
