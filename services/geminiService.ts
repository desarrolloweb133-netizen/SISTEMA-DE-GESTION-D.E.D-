import { GoogleGenAI } from "@google/genai";
import { QualityCheckResult } from "../types";

// Initialize Gemini Client
// In a real app, ensure process.env.API_KEY is set.
const getClient = () => {
    // Graceful fallback if no key is present to prevent app crashing during pure UI demo
    const apiKey = process.env.API_KEY; 
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
};

export const checkProfilePhotoQuality = async (base64Image: string): Promise<QualityCheckResult> => {
    const client = getClient();
    if (!client) {
        console.warn("Gemini API Key missing. Skipping AI check.");
        return { isValid: true }; // Allow bypass if no key
    }

    try {
        const cleanBase64 = base64Image.split(',')[1];
        
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: cleanBase64
                        }
                    },
                    {
                        text: "Analiza esta imagen para una foto de perfil profesional. Responde SOLO un JSON con este formato: { \"isValid\": boolean, \"reason\": string }. isValid es true si se ve claramente UN solo rostro humano con buena iluminación. False si no hay rostro, hay múltiples rostros, o es muy borrosa."
                    }
                ]
            },
            config: {
                responseMimeType: "application/json"
            }
        });

        const text = response.text;
        if (!text) return { isValid: false, reason: "No se pudo analizar la imagen." };
        
        return JSON.parse(text) as QualityCheckResult;

    } catch (error) {
        console.error("Gemini Error:", error);
        return { isValid: true, reason: "Error de conexión AI (Bypassed)" };
    }
};

export const generateAttendanceReport = async (recordsStr: string): Promise<string> => {
    const client = getClient();
    if (!client) return "Configure API Key para ver reportes inteligentes.";

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Genera un breve resumen ejecutivo y motivacional para el director de la Escuela Dominical basado en estos registros de asistencia. Destaca tendencias. Datos: ${recordsStr}`
        });
        return response.text || "No se pudo generar el reporte.";
    } catch (error) {
        console.error(error);
        return "Error generando reporte.";
    }
};