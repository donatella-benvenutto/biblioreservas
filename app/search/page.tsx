"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Search, Users, MapPin, Clock } from "lucide-react"
import { AvailabilityCalendar } from "@/components/availability-calendar"
import { RoomCard } from "@/components/room-card"

// Mock data - En producción vendría de la API
const mockLibraries = [
  { id: 1, nombre: "Biblioteca Central", direccion: "Campus Norte" },
  { id: 2, nombre: "Biblioteca de Ciencias", direccion: "Edificio C" },
  { id: 3, nombre: "Biblioteca de Humanidades", direccion: "Campus Sur" },
]

const mockRooms = [
  { id: 1, id_biblioteca: 1, nombre: "Sala 101", capacidad: 4, biblioteca: "Biblioteca Central" },
  { id: 2, id_biblioteca: 1, nombre: "Sala 102", capacidad: 2, biblioteca: "Biblioteca Central" },
  { id: 3, id_biblioteca: 2, nombre: "Sala A1", capacidad: 5, biblioteca: "Biblioteca de Ciencias" },
  { id: 4, id_biblioteca: 2, nombre: "Sala A2", capacidad: 3, biblioteca: "Biblioteca de Ciencias" },
]

export default function SearchPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedLibrary, setSelectedLibrary] = useState<string>("0")
  const [selectedCapacity, setSelectedCapacity] = useState<string>("0")
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("0")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = () => {
    // En producción, esto haría una llamada a la API
    // Filtrar por criterios seleccionados
    let results = mockRooms

    if (selectedLibrary !== "0") {
      results = results.filter((room) => room.id_biblioteca === Number.parseInt(selectedLibrary))
    }

    if (selectedCapacity !== "0") {
      results = results.filter((room) => room.capacidad >= Number.parseInt(selectedCapacity))
    }

    setSearchResults(results)
    setHasSearched(true)
  }

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

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Buscar Salas Disponibles</h2>
          <p className="mt-2 text-muted-foreground">
            Filtra por fecha, biblioteca, capacidad y horario para encontrar tu sala ideal
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Search Filters */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Filtros de Búsqueda
                </CardTitle>
                <CardDescription>Personaliza tu búsqueda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date Selection */}
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <AvailabilityCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
                </div>

                {/* Library Selection */}
                <div className="space-y-2">
                  <Label htmlFor="library" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Biblioteca
                  </Label>
                  <Select value={selectedLibrary} onValueChange={setSelectedLibrary}>
                    <SelectTrigger id="library">
                      <SelectValue placeholder="Selecciona una biblioteca" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Todas las bibliotecas</SelectItem>
                      {mockLibraries.map((library) => (
                        <SelectItem key={library.id} value={library.id.toString()}>
                          {library.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Capacity Selection */}
                <div className="space-y-2">
                  <Label htmlFor="capacity" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Capacidad Mínima
                  </Label>
                  <Select value={selectedCapacity} onValueChange={setSelectedCapacity}>
                    <SelectTrigger id="capacity">
                      <SelectValue placeholder="Selecciona capacidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Cualquier capacidad</SelectItem>
                      <SelectItem value="1">1 persona</SelectItem>
                      <SelectItem value="2">2 personas</SelectItem>
                      <SelectItem value="3">3 personas</SelectItem>
                      <SelectItem value="4">4 personas</SelectItem>
                      <SelectItem value="5">5 personas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Time Slot Selection */}
                <div className="space-y-2">
                  <Label htmlFor="time" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Franja Horaria
                  </Label>
                  <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                    <SelectTrigger id="time">
                      <SelectValue placeholder="Selecciona horario" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Cualquier horario</SelectItem>
                      <SelectItem value="08:00-10:00">08:00 - 10:00</SelectItem>
                      <SelectItem value="10:00-12:00">10:00 - 12:00</SelectItem>
                      <SelectItem value="12:00-14:00">12:00 - 14:00</SelectItem>
                      <SelectItem value="14:00-16:00">14:00 - 16:00</SelectItem>
                      <SelectItem value="16:00-18:00">16:00 - 18:00</SelectItem>
                      <SelectItem value="18:00-20:00">18:00 - 20:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSearch} className="w-full gap-2">
                  <Search className="h-4 w-4" />
                  Buscar Disponibilidad
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Search Results */}
          <div className="lg:col-span-2">
            {!hasSearched ? (
              <Card className="flex items-center justify-center h-full min-h-[400px]">
                <CardContent className="text-center py-12">
                  <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Comienza tu búsqueda</h3>
                  <p className="text-muted-foreground">Selecciona tus filtros y haz clic en "Buscar Disponibilidad"</p>
                </CardContent>
              </Card>
            ) : searchResults.length === 0 ? (
              <Card className="flex items-center justify-center h-full min-h-[400px]">
                <CardContent className="text-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No se encontraron salas</h3>
                  <p className="text-muted-foreground">Intenta ajustar tus filtros de búsqueda</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-1">Resultados de Búsqueda</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchResults.length} sala{searchResults.length !== 1 ? "s" : ""} disponible
                    {searchResults.length !== 1 ? "s" : ""} para{" "}
                    {selectedDate.toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="space-y-4">
                  {searchResults.map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      selectedDate={selectedDate}
                      selectedTimeSlot={selectedTimeSlot}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
