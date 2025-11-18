"use client";
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Calendar, MapPin, Clock, Users, X } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getUserReservations, type Reservation } from "@/lib/api"

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [selectedReservation, setSelectedReservation] = useState<number | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Usuario hardcodeado (en producción vendría de autenticación)
  const userId = 1

  useEffect(() => {
    async function fetchReservations() {
      try {
        setLoading(true)
        setError(null)
        const data = await getUserReservations(userId)
        setReservations(data)
      } catch (err) {
        console.error('Error al obtener reservas:', err)
        setError('Error al conectar con el servidor')
      } finally {
        setLoading(false)
      }
    }
    fetchReservations()
  }, [])

  const isPastReservation = (fecha: string, hora_fin: string) => {
    const reservationDateTime = new Date(`${fecha}T${hora_fin}`)
    return reservationDateTime < new Date()
  }

  const handleCancelClick = (id: number) => {
    setSelectedReservation(id)
    setShowCancelDialog(true)
  }

  const handleCancelConfirm = () => {
    if (selectedReservation) {
      // TODO: Implementar endpoint DELETE /api/reservations/{id}
      setReservations(reservations.filter((r) => r.id !== selectedReservation))
      setShowCancelDialog(false)
      setSelectedReservation(null)
    }
  }

  const upcomingReservations = reservations.filter((r) => !isPastReservation(r.date, r.endTime))

  const pastReservations = reservations.filter((r) => isPastReservation(r.date, r.endTime))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">BiblioReservas</h1>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/search">
                <Button variant="ghost">Buscar Salas</Button>
              </Link>
              <Link href="/admin">
                <Button variant="ghost">Admin</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Mis Reservas</h2>
            <p className="mt-2 text-muted-foreground">Gestiona y visualiza todas tus reservas de salas de estudio</p>
          </div>
          <Link href="/search">
            <Button>Nueva Reserva</Button>
          </Link>
        </div>

        <div className="space-y-8">
          {/* Upcoming Reservations */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Próximas Reservas ({upcomingReservations.length})
            </h3>
            {loading ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <h4 className="text-lg font-semibold mb-2">Cargando reservas...</h4>
                </CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="h-16 w-16 text-destructive mx-auto mb-4">⚠️</div>
                  <h4 className="text-lg font-semibold mb-2">Error al cargar reservas</h4>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>Reintentar</Button>
                </CardContent>
              </Card>
            ) : upcomingReservations.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-semibold mb-2">No tienes reservas próximas</h4>
                  <p className="text-muted-foreground mb-4">Comienza buscando una sala disponible</p>
                  <Link href="/search">
                    <Button>Buscar Salas</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {upcomingReservations.map((reservation) => (
                  <Card key={reservation.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{reservation.room.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {reservation.room.libraryName}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">Activa</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(reservation.date).toLocaleDateString("es-ES", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {reservation.startTime} - {reservation.endTime}
                          </span>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full mt-4 gap-2"
                          onClick={() => handleCancelClick(reservation.id)}
                        >
                          <X className="h-4 w-4" />
                          Cancelar Reserva
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Past Reservations */}
          {!loading && pastReservations.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                Historial de Reservas ({pastReservations.length})
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {pastReservations.map((reservation) => (
                  <Card key={reservation.id} className="opacity-60">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{reservation.room.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {reservation.room.libraryName}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">Completada</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(reservation.date).toLocaleDateString("es-ES", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {reservation.startTime} - {reservation.endTime}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La reserva será eliminada y la sala quedará disponible para otros
              usuarios.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancelar Reserva
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
