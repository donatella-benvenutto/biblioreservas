"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Users,
  Building,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

// --- Mock data ---
const mockLibraries = [
  { id: 1, nombre: "Biblioteca Central", direccion: "Campus Norte, Edificio A" },
  { id: 2, nombre: "Biblioteca de Ciencias", direccion: "Campus Norte, Edificio C" },
  { id: 3, nombre: "Biblioteca de Humanidades", direccion: "Campus Sur, Edificio H" },
];

const mockRooms = [
  { id: 1, id_biblioteca: 1, nombre: "Sala 101", capacidad: 4, biblioteca_nombre: "Biblioteca Central" },
  { id: 2, id_biblioteca: 1, nombre: "Sala 102", capacidad: 2, biblioteca_nombre: "Biblioteca Central" },
  { id: 3, id_biblioteca: 2, nombre: "Sala A1", capacidad: 5, biblioteca_nombre: "Biblioteca de Ciencias" },
  { id: 4, id_biblioteca: 2, nombre: "Sala A2", capacidad: 3, biblioteca_nombre: "Biblioteca de Ciencias" },
  { id: 5, id_biblioteca: 3, nombre: "Sala H1", capacidad: 4, biblioteca_nombre: "Biblioteca de Humanidades" },
];

type Tab = "rooms" | "libraries";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("rooms");
  const [libraries, setLibraries] = useState(mockLibraries);
  const [rooms, setRooms] = useState(mockRooms);
  const [showRoomDialog, setShowRoomDialog] = useState(false);
  const [showLibraryDialog, setShowLibraryDialog] = useState(false);
  const [newRoom, setNewRoom] = useState({ nombre: "", id_biblioteca: "", capacidad: "" });
  const [newLibrary, setNewLibrary] = useState({ nombre: "", direccion: "" });

  const handleAddRoom = () => {
    const bibliotecaNombre =
      libraries.find((lib) => lib.id === Number.parseInt(newRoom.id_biblioteca))?.nombre || "";
    const room = {
      id: rooms.length + 1,
      nombre: newRoom.nombre,
      id_biblioteca: Number.parseInt(newRoom.id_biblioteca),
      capacidad: Number.parseInt(newRoom.capacidad),
      biblioteca_nombre: bibliotecaNombre,
    };
    setRooms([...rooms, room]);
    setShowRoomDialog(false);
    setNewRoom({ nombre: "", id_biblioteca: "", capacidad: "" });
  };

  const handleAddLibrary = () => {
    const library = {
      id: libraries.length + 1,
      nombre: newLibrary.nombre,
      direccion: newLibrary.direccion,
    };
    setLibraries([...libraries, library]);
    setShowLibraryDialog(false);
    setNewLibrary({ nombre: "", direccion: "" });
  };

  const handleDeleteRoom = (id: number) => {
    setRooms(rooms.filter((room) => room.id !== id));
  };

  const handleDeleteLibrary = (id: number) => {
    setLibraries(libraries.filter((lib) => lib.id !== id));
    setRooms(rooms.filter((room) => room.id_biblioteca !== id));
  };

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
              <Link href="/reservations">
                <Button variant="ghost">Mis Reservas</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Panel de Administración</h2>
          <p className="mt-2 text-muted-foreground">
            Gestiona bibliotecas, salas y visualiza ocupación
          </p>
        </div>

        {/* Pestañas manuales */}
        <div className="space-y-6">
          <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
            <button
              type="button"
              onClick={() => setActiveTab("rooms")}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1 text-sm font-medium transition-all ${
                activeTab === "rooms"
                  ? "bg-background text-foreground shadow-sm"
                  : ""
              }`}
            >
              <Users className="h-4 w-4" />
              Salas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("libraries")}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1 text-sm font-medium transition-all ${
                activeTab === "libraries"
                  ? "bg-background text-foreground shadow-sm"
                  : ""
              }`}
            >
              <Building className="h-4 w-4" />
              Bibliotecas
            </button>
          </div>

          {/* Rooms Tab */}
          {activeTab === "rooms" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Gestión de Salas</h3>
                  <p className="text-sm text-muted-foreground">
                    {rooms.length} sala{rooms.length !== 1 ? "s" : ""} registrada
                    {rooms.length !== 1 ? "s" : ""}.
                  </p>
                </div>
                <Button onClick={() => setShowRoomDialog(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nueva Sala
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rooms.map((room) => (
                  <Card key={room.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{room.nombre}</CardTitle>
                          <CardDescription className="mt-1">
                            {room.biblioteca_nombre}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">
                          <Users className="h-3 w-3 mr-1" />
                          {room.capacidad}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2 bg-transparent"
                        >
                          <Pencil className="h-3 w-3" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => handleDeleteRoom(room.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                          Eliminar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Libraries Tab */}
          {activeTab === "libraries" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Gestión de Bibliotecas</h3>
                  <p className="text-sm text-muted-foreground">
                    {libraries.length} biblioteca
                    {libraries.length !== 1 ? "s" : ""} registrada
                    {libraries.length !== 1 ? "s" : ""}.
                  </p>
                </div>
                <Button onClick={() => setShowLibraryDialog(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nueva Biblioteca
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {libraries.map((library) => {
                  const roomCount = rooms.filter(
                    (r) => r.id_biblioteca === library.id
                  ).length;
                return (
                  <Card key={library.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {library.nombre}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {library.direccion}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">
                          {roomCount} sala{roomCount !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2 bg-transparent"
                        >
                          <Pencil className="h-3 w-3" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => handleDeleteLibrary(library.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                          Eliminar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Room Dialog */}
      <Dialog open={showRoomDialog} onOpenChange={setShowRoomDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nueva Sala</DialogTitle>
            <DialogDescription>
              Completa los datos de la nueva sala de estudio
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="room-name">Nombre de la Sala</Label>
              <Input
                id="room-name"
                placeholder="Ej: Sala 101"
                value={newRoom.nombre}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, nombre: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room-library">Biblioteca</Label>
              <Select
                value={newRoom.id_biblioteca}
                onValueChange={(value) =>
                  setNewRoom({ ...newRoom, id_biblioteca: value })
                }
              >
                <SelectTrigger id="room-library">
                  <SelectValue placeholder="Selecciona una biblioteca" />
                </SelectTrigger>
                <SelectContent>
                  {libraries.map((library) => (
                    <SelectItem key={library.id} value={library.id.toString()}>
                      {library.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="room-capacity">Capacidad</Label>
              <Select
                value={newRoom.capacidad}
                onValueChange={(value) =>
                  setNewRoom({ ...newRoom, capacidad: value })
                }
              >
                <SelectTrigger id="room-capacity">
                  <SelectValue placeholder="Selecciona capacidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 persona</SelectItem>
                  <SelectItem value="2">2 personas</SelectItem>
                  <SelectItem value="3">3 personas</SelectItem>
                  <SelectItem value="4">4 personas</SelectItem>
                  <SelectItem value="5">5 personas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoomDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddRoom}
              disabled={
                !newRoom.nombre || !newRoom.id_biblioteca || !newRoom.capacidad
              }
            >
              Agregar Sala
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Library Dialog */}
      <Dialog open={showLibraryDialog} onOpenChange={setShowLibraryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nueva Biblioteca</DialogTitle>
            <DialogDescription>
              Completa los datos de la nueva biblioteca
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="library-name">Nombre de la Biblioteca</Label>
              <Input
                id="library-name"
                placeholder="Ej: Biblioteca Central"
                value={newLibrary.nombre}
                onChange={(e) =>
                  setNewLibrary({ ...newLibrary, nombre: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="library-address">Dirección</Label>
              <Input
                id="library-address"
                placeholder="Ej: Campus Norte, Edificio A"
                value={newLibrary.direccion}
                onChange={(e) =>
                  setNewLibrary({ ...newLibrary, direccion: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLibraryDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddLibrary}
              disabled={!newLibrary.nombre || !newLibrary.direccion}
            >
              Agregar Biblioteca
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
