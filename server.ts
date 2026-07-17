import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dns from "dns";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// Initialize Gemini SDK with lazy check helper
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined in the environment. Using smart simulation fallback.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// Fix dns resolution issues if they occur
dns.setDefaultResultOrder("ipv4first");

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Real-time AI Contextual Recommendation Endpoint using Gemini
  app.post("/api/gemini/recommend", async (req, res) => {
    try {
      const { weather, behavior, historyState } = req.body;
      const client = getGeminiClient();

      if (!client) {
        // High-fidelity fallback when GEMINI_API_KEY is not defined
        console.log("No GEMINI_API_KEY found, running beautiful realistic local AI simulation.");
        let recommendations = [
          "Sugerencia: Ofrecer promos de sopas y pastas calientes con 15% de descuento.",
          "Notificación: Enviar alerta push para activar el modo impermeable en mochilas.",
          "Monitoreo: Aumentar la concentración de repartidores en zonas de alta densidad gastronómica."
        ];
        let multiplier = 1.0;
        let behaviorAnalysis = "Comportamiento estándar de fin de semana con hábitos estables.";
        let heading = "Recomendación Estándar";

        if (weather === "tormenta" || weather === "lluvia") {
          recommendations = [
            `⛈️ Alerta de clima severo (${weather === "tormenta" ? "Tormenta Fuerte" : "Lluvia"}): Ofrecer envíos express con 20% OFF para que los usuarios no salgan de casa.`,
            "Sugerencia VIP: Empujar promociones de helados y postres premium a usuarios frecuentes que buscan confort en días grises.",
            "Logística: Activar bonos contra lluvia de +$150 por orden para fleteros para asegurar retención."
          ];
          multiplier = weather === "tormenta" ? 1.5 : 1.3;
          heading = `Clima Adverso: ${weather.toUpperCase()}`;
          behaviorAnalysis = "Se detecta un incremento drástico del 35% en pedidos hogareños motivado por precipitaciones.";
        } else if (weather === "calido") {
          recommendations = [
            "☀️ Sensor Clima Cálido: Empujar campañas de bebidas heladas, ensaladas y postres frescos.",
            "Comportamiento: Estimular compras nocturnas grupales debido al clima templado agradable.",
            "B2B: Asignar bloques fijos de fleteros de 4 horas para heladerías céntricas."
          ];
          multiplier = 1.1;
          heading = "Clima Cálido Optimizado";
          behaviorAnalysis = "Preferencias orientadas a consumos frescos tras el incremento de temperatura ambiente.";
        }

        return res.json({
          recommendations,
          multiplier,
          behaviorAnalysis,
          heading,
          isSimulation: true
        });
      }

      // We have a live Gemini client! Prepare prompt.
      const prompt = `Analiza las siguientes variables logísticas actuales para el sistema Delivery Plus en Argentina:
- Clima actual: ${weather || "normal"}
- Comportamiento de usuarios observado: ${behavior || "habitual"}
- Estado del historial / perfil de red: ${historyState || "volúmenes estables"}

Genera una respuesta en formato JSON estrictamente estructurado de la siguiente forma:
{
  "recommendations": ["Recomendación 1", "Recomendación 2", "Recomendación 3"],
  "multiplier": 1.2,
  "behaviorAnalysis": "Resumen del comportamiento del usuario y la red...",
  "heading": "Título corto de la recomendación"
}

Donde:
1. "recommendations" consiste en exactamente 3 sugerencias operacionales sumamente prácticas y detalladas en español.
2. "multiplier" es un número decimal entre 1.0 y 1.6 que represente el recargo por tarifa de congestión recomendado (ej. 1.0, 1.3, 1.5).
3. "behaviorAnalysis" es un breve análisis explicativo en español de cómo afecta este comportamiento y el clima al rendimiento de la red.
4. "heading" es un título llamativo e ilustrativo en español.

No agregues markdown adicional, explicaciones por fuera del JSON, ni barras invertidas. Retorna ÚNICAMENTE la cadena JSON pura.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text || "";
      console.log("Raw response from Gemini API:", text);
      const parsed = JSON.parse(text);
      return res.json({
        ...parsed,
        isSimulation: false
      });

    } catch (error: any) {
      console.error("Error in Gemini route:", error);
      res.status(500).json({
        error: "Internal Gemini Server error",
        message: error.message,
        recommendations: [
          "Fallo de conexión en API. Intente nuevamente.",
          "Mantener comisiones estables.",
          "Verificar configuración del servidor."
        ],
        multiplier: 1.0,
        behaviorAnalysis: "La API experimentó un retraso inusual o token de acceso offline.",
        heading: "Error en Motor de IA"
      });
    }
  });

  // ElevenLabs Text-to-Speech Proxy Route
  app.post("/api/elevenlabs/tts", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text parameter is required." });
      }

      // Get key from request headers, request body, env of server, or fallback
      const customKey = req.headers["x-elevenlabs-key"] || req.body.apiKey;
      const apiKey = typeof customKey === "string" && customKey.trim() !== "" 
        ? customKey.trim() 
        : (process.env.ELEVENLABS_API_KEY || "7b55c915bb8d4340967067f22da1d64c3735e244df78448274519ae7a112afef");
      
      const voiceId = typeof req.body.voiceId === "string" && req.body.voiceId.trim() !== ""
        ? req.body.voiceId.trim()
        : (process.env.ELEVENLABS_VOICE_ID || "4wDRKlxcHNOFO5kBvE81"); // Use ENV var or Default Voice ID
      
      const elevenlabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

      console.log(`ElevenLabs Proxy Request: "${text.substring(0, 60)}..." using Voice ID: ${voiceId}`);

      const response = await fetch(elevenlabsUrl, {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("ElevenLabs API Call Failed:", errText);

        const isPaymentRequired = response.status === 402 || 
          errText.includes("paid_plan_required") || 
          errText.includes("payment_required") || 
          errText.includes("library voices");

        if (isPaymentRequired) {
          // Fallback to official default pre-made voices which are free and don't require custom subscriptions
          let fallbackVoiceId = "21m00Tcm4TlvDq8ikWAM"; // Rachel (female)
          const voiceProfile = req.body.voiceProfile || "";
          
          if (voiceProfile === "carlos") {
            fallbackVoiceId = "ErXwobaYWBteAsidvWS9"; // Antoni (male)
          } else if (voiceProfile === "vendedor_bot") {
            fallbackVoiceId = "pNInz6obpgfr9S92pWrH"; // Adam (male)
          } else if (voiceProfile === "agustina") {
            fallbackVoiceId = "21m00Tcm4TlvDq8ikWAM"; // Rachel (female)
          } else {
            // Default based on original requested voice
            fallbackVoiceId = "ErXwobaYWBteAsidvWS9"; // Antoni (male)
          }

          console.log(`ElevenLabs subscription limit hit for Library Voice. Retrying with free-tier compatible Voice ID: ${fallbackVoiceId}`);
          
          const retryUrl = `https://api.elevenlabs.io/v1/text-to-speech/${fallbackVoiceId}`;
          const retryResponse = await fetch(retryUrl, {
            method: "POST",
            headers: {
              "xi-api-key": apiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: text,
              model_id: "eleven_multilingual_v2",
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                style: 0.0,
                use_speaker_boost: true
              }
            }),
          });

          if (retryResponse.ok) {
            const arrayBuffer = await retryResponse.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            res.setHeader("Content-Type", "audio/mpeg");
            res.setHeader("Content-Length", buffer.length);
            res.setHeader("x-applied-fallback-voice", "true");
            res.setHeader("x-fallback-used-id", fallbackVoiceId);
            return res.send(buffer);
          } else {
            const retryErrText = await retryResponse.text();
            console.error("Fallback ElevenLabs API Call also failed:", retryErrText);
            return res.status(retryResponse.status).json({
              error: "ElevenLabs API error response (Fallback)",
              details: retryErrText
            });
          }
        }

        return res.status(response.status).json({
          error: "ElevenLabs API error response",
          details: errText
        });
      }

      // Read audio data and return it as professional audio stream
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Length", buffer.length);
      res.send(buffer);

    } catch (err: any) {
      console.error("Exception in ElevenLabs TTS API Route:", err);
      res.status(500).json({ error: "Internal Server Error", message: err.message });
    }
  });

  // Simple API health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", serverMode: "Full-Stack Express + Vite Integration" });
  });

  // Apply Vite middlewares in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting up on http://localhost:${PORT}`);
  });
}

startServer();
