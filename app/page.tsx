import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Calendar, Users, MapPin } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-balance">BiblioReservas</h1>
            </div>
            <nav className="flex items-center gap-4">
              <Link href="/reservations">
                <Button variant="ghost">Mis Reservas</Button>
              </Link>
              <Link href="/admin">
                <Button variant="ghost">Admin</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-border bg-accent/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              Reserva tu Sala de Estudio
            </h2>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              Sistema de reservas para salas de estudio en bibliotecas universitarias. Busca disponibilidad, reserva tu
              espacio y gestiona tus reservas fácilmente.
            </p>
            <div className="mt-8">
              <Link href="/search">
                <Button size="lg" className="gap-2">
                  <Calendar className="h-5 w-5" />
                  Buscar Disponibilidad
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <Calendar className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Búsqueda Flexible</CardTitle>
                <CardDescription>Filtra por fecha, horario y capacidad (1-5 personas)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Encuentra la sala perfecta para tu sesión de estudio individual o en grupo.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Gestión Simple</CardTitle>
                <CardDescription>Crea y cancela reservas en tiempo real</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Sistema de validación que previene conflictos de horarios automáticamente.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MapPin className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Múltiples Bibliotecas</CardTitle>
                <CardDescription>Acceso a salas en todas las bibliotecas del campus</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Elige la ubicación más conveniente para ti y tu grupo de estudio.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-muted/50 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-balance">¿Listo para reservar tu espacio?</h3>
          <p className="mt-4 text-lg text-muted-foreground">Comienza ahora y asegura tu sala de estudio ideal</p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/search">
              <Button size="lg" className="w-full sm:w-auto">
                Buscar Salas Disponibles
              </Button>
            </Link>
            <Link href="/reservations">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                Ver Mis Reservas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 BiblioReservas. Sistema de Reservas de Salas de Biblioteca
          </p>
        </div>
      </footer>
    </div>
  )
}
