/**
 * Service to integrate Google Gemini API for essay / math problem correction.
 */

export async function evaluateEssayWithGemini({ prompt, answer, photo, apiKey }) {
  const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY;

  if (!key || key.trim() === '') {
    throw new Error('API Key Gemini tidak ditemukan. Harap masukkan API Key Gemini di Pengaturan / Input API Key.');
  }

  const parts = [];

  const systemInstruction = `Kamu adalah seorang guru matematika yang profesional, teliti, dan komunikatif.
Tugasmu adalah mereview dan mengevaluasi jawaban siswa terhadap pertanyaan/soal matematika berikut.

Detail Tugas:
1. Soal: "${prompt}"
2. Jawaban Teks Siswa: "${answer || '(Siswa tidak mengisi teks, periksa lembar jawaban foto di bawah ini)'}"

Petunjuk Evaluasi:
- Periksa langkah-langkah logika matematika, pemahaman konsep, dan ketepatan hasil akhir.
- Jika ada gambar/foto lembar kerja siswa, analisis tulisan tangan atau grafik/langkah pengerjaan pada foto tersebut.
- Tentukan skor nilai akhir berbentuk angka bulat dari 0 hingga 100.
- Tuliskan saran/catatan umpan balik (feedback) yang membangun, ramah, dan solutif bagi siswa dalam Bahasa Indonesia.

Tanggapan kamu HARUS berformat JSON valid dengan struktur persis seperti ini:
{
  "score": 85,
  "feedback": "Langkah pengerjaan awal sudah tepat, namun ada sedikit kekeliruan perhitungan pada langkah akhir."
}`;

  parts.push({ text: systemInstruction });

  // Handle image input if essay photo exists (base64 data URL format)
  if (photo && typeof photo === 'string') {
    const match = photo.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (match) {
      const mimeType = match[1];
      const data = match[2];
      parts.push({
        inlineData: {
          mimeType,
          data
        }
      });
    }
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key.trim()}`;

  const requestBody = {
    contents: [
      {
        parts
      }
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || `HTTP Error ${response.status}: ${response.statusText}`;
    throw new Error(`Gagal menghubungi Gemini API: ${errorMessage}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('Respon dari Gemini API kosong atau tidak dapat diproses.');
  }

  try {
    const result = JSON.parse(rawText);
    const scoreNum = Math.min(100, Math.max(0, Math.round(Number(result.score) || 0)));
    return {
      score: scoreNum,
      feedback: String(result.feedback || '').trim() || 'Evaluasi berhasil dilakukan oleh AI.'
    };
  } catch (err) {
    throw new Error('Format respon AI tidak berupa JSON yang valid. Silakan coba lagi.');
  }
}
