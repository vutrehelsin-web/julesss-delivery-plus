// ==========================================
// CODE REPOSITORY - DELIVERYPLUS B2B ECOSYSTEM
// Contains clean, concise and production-ready source code
// for the backend and Flutter app to display in the editor.
// ==========================================

export interface CodeFile {
  name: string;
  path: string;
  language: 'dart' | 'javascript' | 'json' | 'yaml' | 'sql';
  content: string;
  description: string;
}

export const FLUTTER_CODE_FILES: CodeFile[] = [
  {
    name: 'pubspec.yaml',
    path: 'app_repartidor/pubspec.yaml',
    language: 'yaml',
    description: 'Dependencias del proyecto Flutter (BLoC, Dio, Google Maps, fl_chart).',
    content: `name: app_repartidor
description: "App móvil para Repartidores - Sistema DeliveryPlus B2B"
version: 1.0.0+1
environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  flutter_bloc: ^8.1.3
  equatable: ^2.0.5
  dio: ^5.4.0
  shared_preferences: ^2.2.2
  flutter_secure_storage: ^9.0.0
  google_fonts: ^6.1.0
  google_maps_flutter: ^2.5.3
  geolocator: ^10.1.0
`
  },
  {
    name: 'api_config.dart',
    path: 'app_repartidor/lib/core/config/api_config.dart',
    language: 'dart',
    description: 'Configuración centralizada de endpoints y timeouts globales.',
    content: `class ApiConfig {
  static const String baseUrlProduction = "https://mini-api.deliveryplus.com/api";
  static const String baseUrlEmulator = "http://10.0.2.2:3000/api";
  static const String baseUrlWeb = "http://localhost:3000/api";

  static String get baseUrl => baseUrlProduction;
  static const int connectTimeout = 10000;
  static const int receiveTimeout = 10000;
}`
  },
  {
    name: 'colors.dart',
    path: 'app_repartidor/lib/core/theme/colors.dart',
    language: 'dart',
    description: 'Paleta cromática oficial B2B de DeliveryPlus (Primary: #FF6B35).',
    content: `import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color(0xFFFF6B35);     // Naranja Primario (Energético)
  static const Color secondary = Color(0xFF2D3436);   // Antracita Secundario
  static const Color accent = Color(0xFF00B894);      // Verde Esmeralda (Éxito)
  static const Color background = Color(0xFFF8F9FA);
  static const Color darkBackground = Color(0xFF1E272E);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color darkSurface = Color(0xFF2D3436);
  static const Color error = Color(0xFFD63031);
}`
  },
  {
    name: 'auth_bloc.dart',
    path: 'app_repartidor/lib/features/auth/bloc/auth_bloc.dart',
    language: 'dart',
    description: 'Gestor de estado BLoC para autenticación, almacenamiento del JWT y logout.',
    content: `import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../../core/services/api_client.dart';
import '../../../core/services/storage_service.dart';

// Eventos
abstract class AuthEvent extends Equatable {
  const AuthEvent();
  @override
  List<Object?> get props => [];
}
class LoginRequested extends AuthEvent {
  final String email;
  final String password;
  const LoginRequested(this.email, this.password);
}
class LogoutRequested extends AuthEvent {}

// Estados
abstract class AuthState extends Equatable {
  const AuthState();
  @override
  List<Object?> get props => [];
}
class AuthInitial extends AuthState {}
class AuthLoading extends AuthState {}
class Authenticated extends AuthState {
  final String email;
  const Authenticated(this.email);
}
class AuthFailure extends AuthState {
  final String error;
  const AuthFailure(this.error);
}

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final ApiClient apiClient = ApiClient();
  final StorageService storage = StorageService();

  AuthBloc() : super(AuthInitial()) {
    on<LoginRequested>((event, emit) async {
      emit(AuthLoading());
      try {
        final res = await apiClient.post('/auth/login', {
          'email': event.email,
          'password': event.password,
        });
        await storage.saveToken(res.data['token']);
        emit(Authenticated(event.email));
      } catch (e) {
        emit(AuthFailure(e.toString()));
      }
    });

    on<LogoutRequested>((event, emit) async {
      await storage.clearToken();
      emit(AuthInitial());
    });
  }
}`
  },
  {
    name: 'home_screen.dart',
    path: 'app_repartidor/lib/features/home/screens/home_screen.dart',
    language: 'dart',
    description: 'Dashboard principal con toggle de disponibilidad, perfil y clima.',
    content: `import 'package:flutter/material.dart';
import '../../clima/widgets/clima_widget.dart';
import '../../../core/theme/colors.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _isAvailable = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('DeliveryPlus Repartidores'),
        backgroundColor: AppColors.secondary,
        actions: [
          Switch(
            value: _isAvailable,
            activeColor: AppColors.accent,
            onChanged: (val) => setState(() => _isAvailable = val),
          )
        ],
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              const ClimaWidget(),
              const SizedBox(height: 16),
              Card(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: const ListTile(
                  leading: Icon(Icons.wallet, color: AppColors.primary),
                  title: Text('Billetera de Carlos'),
                  subtitle: Text('Saldo: $24,000.00 (80% Neto)'),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}`
  }
];

export const BACKEND_CODE_FILES: CodeFile[] = [
  {
    name: 'package.json',
    path: 'backend/package.json',
    language: 'json',
    description: 'Metadatos del backend en Express, bcryptjs y mysql2.',
    content: `{
  "name": "deliveryplus-backend",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  },
  "dependencies": {
    "express": "^4.21.2",
    "mysql2": "^3.9.2",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2"
  }
}`
  },
  {
    name: 'database.js',
    path: 'backend/src/config/database.js',
    language: 'javascript',
    description: 'Configuración pool de conexión MariaDB/MySQL local (sin Docker).',
    content: `const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'deliveryplus',
  port: parseInt(process.env.DB_PORT || '3306')
});

module.exports = pool;`
  },
  {
    name: 'authController.js',
    path: 'backend/src/controllers/authController.js',
    language: 'javascript',
    description: 'Controlador de registro y login con cifrado bcryptjs.',
    content: `const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (users.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });

    const isMatch = await bcrypt.compare(password, users[0].password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign({ userId: users[0].id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, usuario: { email: users[0].email, rol_id: users[0].rol_id } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};`
  },
  {
    name: 'billetera.js',
    path: 'backend/src/routes/billetera.js',
    language: 'javascript',
    description: 'Endpoints de la billetera virtual: cobros (80/20) y registro histórico.',
    content: `const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Obtener saldo del repartidor
router.get('/saldo', async (req, res) => {
  try {
    const [wallet] = await pool.query('SELECT saldo FROM billeteras WHERE usuario_id = ?', [req.userId]);
    res.json(wallet[0] || { saldo: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener movimientos recientes
router.get('/movimientos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM transacciones WHERE usuario_id = ? ORDER BY fecha DESC', [req.userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;`
  }
];
