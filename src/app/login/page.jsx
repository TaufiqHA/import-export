"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/auth/me");
      const data = await res.json();

      if (data.user) {
        router.push("/");
      }
    };

    fetch("/api/csrf")
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken));

    fetchUser();
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    // The secret and token are sent with the request by default, so no extra
    // configuration is needed in the request.
    const response = await fetch("/api/protected", {
      method: "post",
    });

    if (response.ok) {
      console.log("protected response ok");
    }

    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, csrfToken }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      setMessage("Login successful!");
      window.location.reload()
    } catch (error) {
      let errorMessage = "Internal Server Error";

      if (error instanceof Error) {
        errorMessage = error.message;
      }
  
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-500">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200 bg-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-500">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200 bg-white"
            />
          </div>
          {message && <p className="text-red-500 text-sm mb-4">{message}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <p className="mt-5">
          Don&apos;t have an account yet?
          <a href="/signup" className="text-blue-500 underline ml-2">
            Click Here
          </a>
        </p>
        </form>
        
      </div>
    </div>
  );
}
