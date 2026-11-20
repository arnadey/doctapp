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

## Doctor discovery

The Explore Doctor tab loads public approved doctors from `GET /api/v1/doctors/`.
Filter options are loaded from `GET /api/v1/doctors/filter-options/`, with the compatibility
endpoints `/api/v1/doctors/specialties/` and `/api/v1/doctors/hospitals/` used only if the
combined endpoint is unavailable.

The screen sends `search`, `specialization`, `hospital`, `ordering`, `page`, and `page_size`
query parameters. Specialization names and hospital UUIDs come from the filter-options API;
they are not hardcoded in the app.

## Authentication

Tokens are stored in Expo SecureStore. Startup loads tokens and validates the session with `GET /accounts/me/`. Protected requests use the access token; one failed request triggers a single refresh, stores rotated tokens, and retries once. Refresh failure clears credentials and returns to sign in. Logout calls the backend and clears local credentials even if the request fails.

Available screens include sign in, registration, forgot/reset password, profile, edit profile, and change password. Backend validation and account-status errors are shown to the user.

## Core domain features

The app includes role-aware patient, doctor, assistant, hospital, and chamber workflows:

- Patient users can load and edit only `GET/PATCH /api/v1/patients/me/`.
- Public and authenticated users can browse the approved doctor listing and doctor details.
- Doctors can edit only `PATCH /api/v1/doctors/me/`, manage assistants, and manage their chambers.
- Assistants can view active associated doctors and only receive chamber actions permitted by the server relationship.
- Public users can browse hospitals and public chamber information.
- Doctor verification status is shown as account status and has no verification edit control.
- Public registration creates a patient account. Doctor and assistant roles are assigned through backend administration and cannot be selected in the registration form.

Navigation routes are defined under `src/app/(app)/`; typed API models and services are in `src/types/domain.ts` and `src/api/domain.ts`.

Doctor search loads public specialty and approved-hospital options from `/api/v1/doctors/specialties/` and `/api/v1/doctors/hospitals/`. The filter sheet submits specialty names and hospital UUIDs only; stale selections are removed after option refresh.

The API client adds JWT access tokens automatically, retries one request after a successful refresh, and clears the secure session and redirects to login when refresh authentication fails.

## Commands

```bash
npm install
npx expo start
npm run lint
npx tsc --noEmit
```
