"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Clock, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createReservation } from "@/lib/api";

interface RoomCardProps {
  room: {
    id: number;
    name?: string;
    nombre?: string;
    capacity?: number;
    capacidad?: number;
    libraryName?: string;
    biblioteca?: string;
  };
  selectedDate: Date;
  selectedTimeSlot: string;
}

export function RoomCard({ room, selectedDate, selectedTimeSlot }: RoomCardProps) {
  const [showReserveDialog, setShowReserveDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [userName, setUserName] = useState("");
  const [timeSlot, setTimeSlot] = useState(selectedTimeSlot || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservationId, setReservationId] = useState<number | null>(null);

  // Compatibilidad con ambos formatos de datos (API y mock)
  const roomName = room.name || room.nombre || "";
  const roomCapacity = room.capacity || room.capacidad || 0;
  const libraryName = room.libraryName || room.biblioteca || "";

  const handleReserve = async () => {
    if (!timeSlot) {
      setError("Por favor selecciona un horario");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Parsear el horario seleccionado
      const [startTime, endTime] = timeSlot.split('-').map(t => t.trim());
      
      // Formatear la fecha como YYYY-MM-DD
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      // Crear la reserva en el backend
      const reservation = await createReservation({
        userId: 1, // Usuario demo hardcodeado
        roomId: room.id,
        date: dateStr,
        startTime,
        endTime,
      });

      setReservationId(reservation.id);
      setShowReserveDialog(false);
      setShowSuccessDialog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la reserva');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{roomName}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {libraryName}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3 w-3" />
              {roomCapacity}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Disponible todo el día</span>
            </div>
            <Button onClick={() => setShowReserveDialog(true)} className="w-full">
              Reservar Sala
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reserve Dialog */}
      <Dialog open={showReserveDialog} onOpenChange={setShowReserveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Reserva</DialogTitle>
            <DialogDescription>Completa los datos para reservar {room.nombre}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Sala</Label>
              <div className="text-sm font-medium">
                {roomName} - {libraryName}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fecha</Label>
              <div className="text-sm">
                {selectedDate.toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time-slot">Horario</Label>
              <Select value={timeSlot} onValueChange={setTimeSlot}>
                <SelectTrigger id="time-slot">
                  <SelectValue placeholder="Selecciona un horario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="08:00-10:00">08:00 - 10:00</SelectItem>
                  <SelectItem value="10:00-12:00">10:00 - 12:00</SelectItem>
                  <SelectItem value="12:00-14:00">12:00 - 14:00</SelectItem>
                  <SelectItem value="14:00-16:00">14:00 - 16:00</SelectItem>
                  <SelectItem value="16:00-18:00">16:00 - 18:00</SelectItem>
                  <SelectItem value="18:00-20:00">18:00 - 20:00</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReserveDialog(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleReserve} disabled={!timeSlot || loading}>
              {loading ? "Reservando..." : "Confirmar Reserva"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-3">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-center">¡Reserva Confirmada!</DialogTitle>
            <DialogDescription className="text-center">
              Tu sala ha sido reservada exitosamente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4 text-sm">
            {reservationId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID Reserva:</span>
                <span className="font-medium">#{reservationId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sala:</span>
              <span className="font-medium">{roomName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Biblioteca:</span>
              <span className="font-medium">{libraryName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha:</span>
              <span className="font-medium">
                {selectedDate.toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Horario:</span>
              <span className="font-medium">{timeSlot}</span>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSuccessDialog(false)} className="w-full">
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
