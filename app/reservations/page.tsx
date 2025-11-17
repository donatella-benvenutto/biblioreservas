"use client";
import { useState } from "react"
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

// Mock data - En producción vendría de la API
const mockReservations = [
  {
    id: 1,
    id_sala: 1,
    sala_nombre: "Sala 101",
    biblioteca: "Biblioteca Central",
    fecha: "2025-01-15",
    hora_inicio: "10:00",
    hora_fin: "12:00",
    capacidad: 4,
    usuario: "Juan Pérez",
  },
  {
    id: 2,
    id_sala: 3,
    sala_nombre: "Sala A1",
    biblioteca: "Biblioteca de Ciencias",
    fecha: "2025-01-16",
    hora_inicio: "14:00",
    hora_fin: "16:00",
    capacidad: 5,
    usuario: "Juan Pérez",
  },
  {
    id: 3,
    id_sala: 2,
    sala_nombre: "Sala 102",
    biblioteca: "Biblioteca Central",
    fecha: "2025-01-10",
    hora_inicio: "16:00",
    hora_fin: "18:00",
    capacidad: 2,
    usuario: "Juan Pérez",
  },
]

export default function ReservationsPage() {
  const [reservations, setReservations] = useState(mockReservations)
  const [selectedReservation, setSelectedReservation] = useState<number | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

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
      // En producción, esto haría una llamada a la API
      setReservations(reservations.filter((r) => r.id !== selectedReservation))
      setShowCancelDialog(false)
      setSelectedReservation(null)
    }
  }

  const upcomingReservations = reservations.filter((r) => !isPastReservation(r.fecha, r.hora_fin))

  const pastReservations = reservations.filter((r) => isPastReservation(r.fecha, r.hora_fin))

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
            {upcomingReservations.length === 0 ? (
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
                          <CardTitle className="text-lg">{reservation.sala_nombre}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {reservation.biblioteca}
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
                            {new Date(reservation.fecha).toLocaleDateString("es-ES", {
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
                            {reservation.hora_inicio} - {reservation.hora_fin}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>Capacidad: {reservation.capacidad} personas</span>
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
          {pastReservations.length > 0 && (
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
                          <CardTitle className="text-lg">{reservation.sala_nombre}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {reservation.biblioteca}
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
                            {new Date(reservation.fecha).toLocaleDateString("es-ES", {
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
                            {reservation.hora_inicio} - {reservation.hora_fin}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>Capacidad: {reservation.capacidad} personas</span>
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
