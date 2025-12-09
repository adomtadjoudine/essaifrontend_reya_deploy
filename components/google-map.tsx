"use client"

import { useEffect, useRef, useState } from "react"
import { Loader } from "@googlemaps/js-api-loader"

declare global {
  interface Window {
    google: typeof window.google
  }
}

interface GoogleMapProps {
  center?: { lat: number; lng: number }
  zoom?: number
  markers?: Array<{
    position: { lat: number; lng: number }
    title?: string
    label?: string
  }>
  className?: string
}

export function GoogleMap({
  center = { lat: 14.6928, lng: -17.4467 },
  zoom = 12,
  markers = [],
  className = "",
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<window.google.maps.Map | null>(null)
  const [error, setError] = useState<string | null>(null)
  const markersRef = useRef<window.google.maps.Marker[]>([])

  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
          version: "weekly",
        })

        await loader.load()

        if (mapRef.current && !map && window.google) {
          const newMap = new window.google.maps.Map(mapRef.current, {
            center,
            zoom,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
          })

          setMap(newMap)
        }
      } catch (err) {
        console.error("Error loading Google Maps:", err)
        setError("Erreur lors du chargement de la carte")
      }
    }

    initMap()
  }, [center, zoom, map])

  useEffect(() => {
    if (map && markers.length > 0 && window.google) {
      markersRef.current.forEach((marker) => marker.setMap(null))
      markersRef.current = []

      markers.forEach((marker) => {
        const newMarker = new window.google.maps.Marker({
          position: marker.position,
          map,
          title: marker.title,
          label: marker.label,
        })
        markersRef.current.push(newMarker)
      })
    }
  }, [map, markers])

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg ${className}`}>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  return <div ref={mapRef} className={`rounded-lg ${className}`} style={{ minHeight: "400px" }} />
}