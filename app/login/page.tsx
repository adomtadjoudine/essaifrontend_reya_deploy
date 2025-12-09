"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

/**
 * Validation en temps réel des champs
 */
interface ValidationState {
  email: {
    isValid: boolean
    message: string
  }
  password: {
    isValid: boolean
    message: string
  }
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [touched, setTouched] = useState({ email: false, password: false })

  const router = useRouter()
  const { login, isAuthenticated } = useAuth()

  // État de validation en temps réel
  const [validation, setValidation] = useState<ValidationState>({
    email: { isValid: false, message: "" },
    password: { isValid: false, message: "" },
  })

  /**
   * Validation de l'email en temps réel
   */
  useEffect(() => {
    if (!touched.email) return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email) {
      setValidation((prev) => ({
        ...prev,
        email: { isValid: false, message: "L'email est requis" },
      }))
    } else if (!emailRegex.test(email)) {
      setValidation((prev) => ({
        ...prev,
        email: { isValid: false, message: "Format d'email invalide" },
      }))
    } else {
      setValidation((prev) => ({
        ...prev,
        email: { isValid: true, message: "Email valide" },
      }))
    }
  }, [email, touched.email])

  /**
   * Validation du mot de passe en temps réel
   */
  useEffect(() => {
    if (!touched.password) return

    if (!password) {
      setValidation((prev) => ({
        ...prev,
        password: { isValid: false, message: "Le mot de passe est requis" },
      }))
    } else if (password.length < 8) {
      setValidation((prev) => ({
        ...prev,
        password: { isValid: false, message: "Le mot de passe doit contenir au moins 8 caractères" },
      }))
    } else {
      setValidation((prev) => ({
        ...prev,
        password: { isValid: true, message: "Mot de passe valide" },
      }))
    }
  }, [password, touched.password])

  /**
   * Redirection si déjà authentifié
   */
  useEffect(() => {
    if (isAuthenticated) {
      console.log("[v0] Utilisateur déjà authentifié, redirection vers le dashboard")
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  /**
   * Gestion de la soumission du formulaire
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Marquer tous les champs comme touchés
    setTouched({ email: true, password: true })

    // Vérifier que tous les champs sont valides
    if (!validation.email.isValid || !validation.password.isValid) {
      setError("Veuillez corriger les erreurs avant de continuer")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      console.log("[v0] Soumission du formulaire de connexion")
      await login(email, password)
      console.log("[v0] Connexion réussie, redirection vers le dashboard")
      router.push("/dashboard")
    } catch (error: any) {
      console.error("[v0] Erreur de connexion:", error)
      setError(error.message || "Identifiants incorrects. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Gestion du blur (perte de focus) pour marquer le champ comme touché
   */
  const handleBlur = (field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  /**
   * Vérifie si le formulaire est valide
   */
  const isFormValid = validation.email.isValid && validation.password.isValid

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-6">
            <Link
              href="/landing"
              className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Link>

            <div className="flex justify-center mb-6">
              <div className="relative">
                <Image
                  src="/images/ereya-logo.png"
                  alt="EREYA PRESSING"
                  width={100}
                  height={100}
                  className="h-20 w-auto drop-shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-primary tracking-tight">EREYA PRESSING</h1>
            </div>
          </div>

          {/* Login Form */}
          <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-sm">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-2xl text-center font-semibold">Se connecter</CardTitle>
              <CardDescription className="text-center text-base">
                Accédez à votre tableau de bord administrateur
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Erreur globale */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Champ Email */}
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => handleBlur("email")}
                      className={`h-12 text-base pr-10 ${
                        touched.email
                          ? validation.email.isValid
                            ? "border-green-500 focus-visible:ring-green-500"
                            : "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                      required
                    />
                    {/* Icône de validation */}
                    {touched.email && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {validation.email.isValid ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {/* Message de validation */}
                  {touched.email && validation.email.message && (
                    <p
                      className={`text-sm ${validation.email.isValid ? "text-green-600" : "text-red-600"}`}
                      role="alert"
                    >
                      {validation.email.message}
                    </p>
                  )}
                </div>

                {/* Champ Mot de passe */}
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Votre mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => handleBlur("password")}
                      className={`h-12 text-base pr-20 ${
                        touched.password
                          ? validation.password.isValid
                            ? "border-green-500 focus-visible:ring-green-500"
                            : "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                      required
                    />
                    {/* Icône de validation */}
                    {touched.password && (
                      <div className="absolute right-12 top-1/2 -translate-y-1/2">
                        {validation.password.isValid ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    )}
                    {/* Bouton toggle password */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {/* Message de validation */}
                  {touched.password && validation.password.message && (
                    <p
                      className={`text-sm ${validation.password.isValid ? "text-green-600" : "text-red-600"}`}
                      role="alert"
                    >
                      {validation.password.message}
                    </p>
                  )}
                </div>

                {/* Bouton de connexion */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || !isFormValid}
                >
                  {isLoading ? "Connexion en cours..." : "Se connecter"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">© 2025 EREYA PRESSING. Tous droits réservés.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
