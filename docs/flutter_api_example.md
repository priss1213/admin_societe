Exemple simple Flutter (package `http`) pour consommer le mock API local

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<List<dynamic>> fetchPromos() async {
  final uri = Uri.parse('http://10.0.2.2:4000/api/promos'); // Android emulator uses 10.0.2.2
  final res = await http.get(uri);
  if (res.statusCode == 200) {
    return jsonDecode(res.body) as List<dynamic>;
  }
  throw Exception('Failed to load promos');
}

// exemple d'utilisation
// final promos = await fetchPromos();
```

Notes:
- Sur un émulateur Android utilisez `10.0.2.2` pour atteindre `localhost` du PC.
- Sur iOS simulator utilisez `http://localhost:4000`.
- Si vous testez sur un appareil physique, remplacez `localhost` par l'IP locale du PC (ex: `http://192.168.1.42:4000`).
