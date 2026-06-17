import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import logoBpg from "../assets/logo-bpg.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <div className="w-full max-w-md space-y-6">
        {/* Logo / Title */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <img
              src={logoBpg}
              alt="Logo BPG"
              className="w-auto h-20 drop-shadow-lg"
            />
          </div>
          <h1 className="text-3xl font-bold text-white">Monitoring Payment</h1>
          <p className="mt-1 text-blue-200">
            Sistem Pengajuan Pembayaran Digital
          </p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Masuk ke Akun</CardTitle>
            <CardDescription>
              Gunakan email dan password yang diberikan oleh Admin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
                  <AlertCircle className="flex-shrink-0 w-4 h-4" />
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@barokahperkasagroup.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute text-gray-400 right-3 top-2 hover:text-gray-600"
                  >
                    {showPass ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Memproses..." : "Masuk"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-blue-300">
          Lupa password? Hubungi Admin Sistem
        </p>
      </div>
    </div>
  );
}
