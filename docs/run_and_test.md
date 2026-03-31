Run & test instructions for admin + mock API + Flutter

1) Install dependencies (in `admin_societe`):

```bash
npm install
```

2) Start the mock API server (starts on port 4000):

```bash
npm run mock-api
# -> Mock API server running on http://localhost:4000
```

3) Start the frontend (Vite):

```bash
npm run dev
```

Important ordering: start the mock API **before** the frontend so that `AppContext` can detect and load the remote data on mount. If you start the frontend first, reload the page after starting the mock API.

4) Quick checks (from your PC):

- List promos:

```bash
curl http://localhost:4000/api/promos | jq
```

- Create promo (example):

```bash
curl -X POST http://localhost:4000/api/promos -H "Content-Type: application/json" -d '{"title":"Test promo","description":"desc","category":"Alimentation"}'
```

5) From Flutter (notes):

- Android emulator: use `http://10.0.2.2:4000/api/promos`.
- iOS simulator: use `http://localhost:4000/api/promos`.
- Physical device: use your PC LAN IP (ex: `http://192.168.1.42:4000/api/promos`) and ensure device is on same network.

Example (Dart, package `http`):

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<List<dynamic>> fetchPromos() async {
  final uri = Uri.parse('http://10.0.2.2:4000/api/promos');
  final res = await http.get(uri);
  if (res.statusCode == 200) return jsonDecode(res.body) as List<dynamic>;
  throw Exception('Failed to load');
}

// call fetchPromos() and render the list
```

6) Troubleshooting

- CORS is enabled on the mock server; if your mobile app cannot reach the server, check firewall and use correct host/IP for emulator/device.
- If new promos created in the admin UI do not appear on mobile: ensure the mock API was running when the admin frontend was loaded (reload admin), then re-create the promo to trigger POST to `/api/promos`.
- To persist mock data between restarts, I can update the mock server to read/write a JSON file — tell me if you want that.

---

If you voulez, je peux:
- ajouter persistance file-based au mock server (JSON) ;
- configurer un proxy Vite (`/api` → `http://localhost:4000`) pour éviter CORS dans dev ;
- ou créer un petit écran Flutter de test que je fournis (code complet).
