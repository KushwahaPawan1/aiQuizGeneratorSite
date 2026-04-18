
import React, { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState({}); // ✅ store selected answers
  const [showAnswers, setShowAnswers] = useState({}); // ✅ track revealed answers

  const handleUpload = async () => {
    console.log("📤 Upload button clicked");
    if (!file) return alert("Please upload an image first!");
    setLoading(true);

    const formData = new FormData();
    formData.append("image", file);
    console.log("🖼️ File to upload:", file.name);

    try {
      const res = await axios.post("https://quize-server-u0uq.onrender.com/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("✅ Response from backend:", res.data);
      setQuiz(res.data);
      setUserAnswers({});
      setShowAnswers({});
    } catch (err) {
      console.error("❌ Upload error:", err);
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ handle answer click
  const handleAnswerClick = (qIndex, option) => {
    setUserAnswers((prev) => ({ ...prev, [qIndex]: option }));
    setShowAnswers((prev) => ({ ...prev, [qIndex]: true }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-gray-900 text-white flex flex-col items-center py-10 px-4">
      <h1 className="text-4xl font-extrabold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-lg">
        🧠 AI Image Quiz Generator
      </h1>
      <p className="text-gray-300 mb-8 text-center max-w-xl">
        Upload any image containing educational or textual content. The AI will
        analyze it and generate intelligent quiz questions for you.
      </p>

      <div className="bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-md flex flex-col items-center gap-4 border border-gray-700">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full border border-gray-600 bg-gray-900 rounded-xl text-gray-300 p-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold text-lg transition-all duration-300 ${
            loading
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-cyan-400 hover:scale-[1.03] hover:shadow-lg"
          }`}
        >
          {loading ? (
            <div className="flex justify-center items-center gap-3">
              <div className="w-5 h-5 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
              Generating Quiz...
            </div>
          ) : (
            "Generate Quiz"
          )}
        </button>
      </div>

      {/* Quiz Section */}
      {quiz.length > 0 && (
        <div className="mt-12 w-full max-w-4xl">
          <h2 className="text-3xl font-bold mb-6 text-cyan-400 text-center">
            🎯 Generated Quiz
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {quiz.map((q, index) => (
              <div
                key={index}
                className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-cyan-500/30 transition-all duration-300"
              >
                <h3 className="text-lg font-semibold mb-3">
                  {index + 1}. {q.question}
                </h3>
                <ul className="space-y-2">
                  {q.options.map((opt, i) => {
                    const isSelected = userAnswers[index] === opt;
                    const isCorrect = q.answer === opt;
                    const show = showAnswers[index];

                    return (
                      <li
                        key={i}
                        onClick={() => handleAnswerClick(index, opt)}
                        className={`cursor-pointer p-2 rounded-lg transition text-sm md:text-base ${
                          isSelected
                            ? isCorrect
                              ? "bg-green-600 text-white"
                              : "bg-red-600 text-white"
                            : "bg-gray-900 hover:bg-gray-700"
                        }`}
                      >
                        {opt}
                      </li>
                    );
                  })}
                </ul>

                {/* ✅ Show answer only after user selects */}
                {showAnswers[index] && (
                  <p className="mt-4 text-cyan-400 font-semibold">
                    ✅ Correct Answer:{" "}
                    <span className="text-white">{q.answer}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <footer className="mt-16 text-sm text-gray-400">
        Made with 💙 by{" "}
        <span className="text-cyan-400 font-semibold">Pawan Kushwaha and other team members</span>
      </footer>
    </div>
  );
}

export default App;

