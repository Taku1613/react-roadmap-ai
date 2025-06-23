// /api/gemini.js

export default async function handler(req, res) {
  // フロントエンドからのリクエストがPOSTでなければエラー
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  try {
    // フロントエンドから送られてきたプロンプトを取得
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    // ★★★ ここで、Vercelの環境変数から安全にAPIキーを読み込みます ★★★
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        // VercelにAPIキーが設定されていない場合のエラー
        return res.status(500).json({ message: 'API key is not configured on the server.' });
    }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }]
    };

    // GoogleのAPIサーバーにリクエストを送信
    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API Error:', errorText);
      throw new Error(`Gemini API request failed: ${geminiResponse.statusText}`);
    }

    const data = await geminiResponse.json();

    // 結果をフロントエンドに返す
    res.status(200).json(data);

  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ message: error.message || 'An unknown error occurred.' });
  }
}