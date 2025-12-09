import { LandingNavbar } from "@/components/landing-navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shirt, Clock, Truck, Star, Shield, Smartphone } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background w-full">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 w-full">
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Service de pressing premium</Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-balance">
                  Votre pressing à <span className="text-primary">domicile</span>
                </h1>
                <p className="text-xl text-muted-foreground text-pretty">
                  EREYA PRESSING révolutionne le nettoyage de vos vêtements avec un service de collecte et livraison à
                  domicile, rapide et professionnel.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Smartphone className="mr-2 h-5 w-5" />
                  Télécharger l'app
                </Button>
                <Link href="/login">
                  <Button size="lg" variant="outline">
                    Espace Admin
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-primary/5 rounded-3xl p-8 flex items-center justify-center">
                <Image
                  src="/images/ereya-logo.png"
                  alt="EREYA PRESSING"
                  width={300}
                  height={300}
                  className="w-full h-auto max-w-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-muted/30 w-full">
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Nos services premium</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Une gamme complète de services de nettoyage professionnel pour tous vos besoins
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shirt,
                title: "Pressing à sec",
                description: "Nettoyage professionnel de vos vêtements délicats avec les meilleures techniques",
              },
              {
                icon: Clock,
                title: "Service express",
                description: "Collecte et livraison en 24h pour vos besoins urgents",
              },
              {
                icon: Truck,
                title: "Livraison gratuite",
                description: "Collecte et livraison à domicile incluses dans nos tarifs",
              },
              {
                icon: Star,
                title: "Qualité premium",
                description: "Équipements professionnels et produits écologiques de haute qualité",
              },
              {
                icon: Shield,
                title: "Assurance incluse",
                description: "Vos vêtements sont assurés pendant tout le processus de nettoyage",
              },
              {
                icon: Smartphone,
                title: "App mobile",
                description: "Gérez vos commandes facilement depuis votre smartphone",
              },
            ].map((service, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{service.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 w-full">
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-3xl p-8 lg:p-16 text-center text-primary-foreground">
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-balance">Prêt à révolutionner votre pressing ?</h2>
              <p className="text-xl opacity-90 text-pretty">
                Rejoignez des milliers de clients satisfaits qui font confiance à EREYA PRESSING pour l'entretien de
                leurs vêtements.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary">
                  <Smartphone className="mr-2 h-5 w-5" />
                  Télécharger maintenant
                </Button>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
                  >
                    Accès administrateur
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 w-full">
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Image src="/images/ereya-logo.png" alt="EREYA PRESSING" width={32} height={32} className="h-8 w-auto" />
              <span className="text-lg font-bold text-primary">EREYA PRESSING</span>
            </div>
            <p className="text-muted-foreground">© 2024 EREYA PRESSING. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
