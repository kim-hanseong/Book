"use client";
import React, { useState, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";

export default function GeminiChat() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 1. 클라이언트 마운트 여부 확인 (Hydration 오류 완전 방지)
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse("");

    try {
      // 2. 호출 시점에 키를 검증하고 SDK 인스턴스 생성
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error(
          "API Key가 설정되지 않았습니다. .env.local을 확인해 주세요.",
        );
      }

      const ai = new GoogleGenAI({ apiKey });

      const result = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });
      setResponse(result.text);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setResponse(error.message || "응답을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 서버 사전 렌더링 시점과 브라우저 첫 렌더링 불일치 방지
  if (!mounted) return null;

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Gemini API 연동 테스트</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="질문을 입력하세요..."
          rows={4}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "8px 16px" }}
        >
          {loading ? "생성 중..." : "질문하기"}
        </button>
      </form>

      {response && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#f5f5f5",
            borderRadius: "5px",
          }}
        >
          <strong>답변:</strong>
          <p style={{ color: "black", whiteSpace: "pre-wrap" }}>{response}</p>
        </div>
      )}
    </div>
  );
}
